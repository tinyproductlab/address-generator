#!/usr/bin/env node
/* 上线前检查（CI 用）：占位符、资源、法务页面、生成页一致性、遗留文案。
 * V9 §20.2 / §27 要求：反馈邮箱或公众号二维码仍为占位时必须 fail build。 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const read = (rel) => readFileSync(join(root, rel), 'utf8');
const fail = (msg) => errors.push(msg);

// 1) 反馈邮箱不能是占位符
const app = read('app.js');
const mail = app.match(/feedbackEmail:\s*'([^']*)'/);
if (!mail) fail('app.js 里找不到 SITE.feedbackEmail');
else if (/待填写|placeholder|example/i.test(mail[1]) || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(mail[1])) {
  fail(`反馈邮箱仍是占位或格式不对：${mail[1]}`);
}

// 2) 公众号二维码必须是真实图片（不是空文件 / 占位）
const qr = 'assets/wechat-official-account-qr.png';
if (!existsSync(join(root, qr))) fail(`缺少公众号二维码：${qr}`);
else if (statSync(join(root, qr)).size < 3000) fail(`${qr} 体积过小，疑似占位图`);

// 3) 生成器页面不得残留 V8 的测试化文案；法务/说明页可以在正文里解释这些词，只查占位符。
const forbidden = ['测试身份', '测试邮箱', '测试卡号', 'Sandbox', 'Test Only', 'example.test', 'test.example', '【待填写反馈邮箱】'];
const proseOnly = new Set(['privacy.html', 'terms.html', 'sources.html', 'about.html', 'u/index.html', '404.html']);
const htmlFiles = readdirSync(root, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_')
    ? readdirSync(join(root, e.name)).filter((f) => f.endsWith('.html')).map((f) => join(e.name, f))
    : (e.isFile() && e.name.endsWith('.html') ? [e.name] : [])));
for (const f of htmlFiles) {
  const html = read(f);
  const words = proseOnly.has(f) ? ['【待填写反馈邮箱】'] : forbidden;
  words.forEach((w) => { if (html.includes(w)) fail(`${f} 仍包含「${w}」`); });
  if (!/<meta name="viewport"/.test(html)) fail(`${f} 缺少 viewport`);
  // noindex 页面（404、/u/ 说明页）不需要 canonical
  const noindex = /<meta name="robots" content="noindex/.test(html);
  if (!noindex && !/<link rel="canonical"/.test(html)) fail(`${f} 缺少 canonical`);
}
['i18n.js', 'app.js'].forEach((f) => {
  const s = read(f);
  ['example.test', 'test.example'].forEach((w) => { if (s.includes(w)) fail(`${f} 仍包含 ${w}`); });
});

// 4) 法务与说明页必须存在
['privacy.html', 'terms.html', 'sources.html', 'about.html', 'u/index.html', 'robots.txt', 'sitemap.xml']
  .forEach((f) => { if (!existsSync(join(root, f))) fail(`缺少 ${f}`); });

// 5) 卡组织规则文件与 manifest 必须齐全
const manifest = JSON.parse(read('data/card-brands/source-manifest.json'));
manifest.brands.forEach((b) => {
  if (!existsSync(join(root, 'data/card-brands', b.file))) fail(`缺少卡组织规则文件 ${b.file}`);
  if (!b.sourceUrl || !b.verifiedAt) fail(`${b.id} 缺少来源 URL 或核验日期`);
});

// 6) 数据版本要在 sources 页同步
const version = app.match(/DATA_VERSION\s*=\s*'([^']+)'/);
if (version && !read('sources.html').includes(version[1])) {
  fail(`sources.html 未同步数据版本 ${version[1]}`);
}

// 7) sitemap 里的国家页必须真实存在
const sitemap = read('sitemap.xml');
[...sitemap.matchAll(/<loc>https:\/\/addressgen\.tinylabpro\.com\/([^<]*)<\/loc>/g)].forEach(([, path]) => {
  if (!path) return;
  // sitemap 写的是 Cloudflare 重定向后的无扩展名地址（/privacy），
  // 对应的文件是 privacy.html
  const target = path.endsWith('/') ? join(path, 'index.html')
    : existsSync(join(root, path)) ? path : `${path}.html`;
  if (!existsSync(join(root, target))) fail(`sitemap 指向不存在的页面：${path}`);
});

// 8) PWA：manifest 必须可解析、图标齐全，Service Worker 必须存在且不缓存地图瓦片
const manifestFile = 'manifest.webmanifest';
if (!existsSync(join(root, manifestFile))) fail(`缺少 ${manifestFile}`);
else {
  const mf = JSON.parse(read(manifestFile));
  ['name', 'short_name', 'start_url', 'scope', 'display', 'icons'].forEach((k) => {
    if (!mf[k]) fail(`manifest 缺少 ${k}`);
  });
  const sizes = (mf.icons || []).map((i) => i.sizes);
  ['192x192', '512x512'].forEach((s) => { if (!sizes.includes(s)) fail(`manifest 缺少 ${s} 图标（可安装性要求）`); });
  if (!(mf.icons || []).some((i) => (i.purpose || '').includes('maskable'))) fail('manifest 缺少 maskable 图标');
  (mf.icons || []).forEach((i) => {
    const rel = i.src.replace(/^\//, '');
    if (!existsSync(join(root, rel))) fail(`manifest 图标文件不存在：${i.src}`);
  });
  (mf.shortcuts || []).forEach((sc) => {
    const path = sc.url.split(/[?#]/)[0].replace(/^\//, '');
    const target = path.endsWith('/') || path === '' ? join(path, 'index.html') : path;
    if (!existsSync(join(root, target))) fail(`manifest shortcut 指向不存在的页面：${sc.url}`);
  });
}
if (!existsSync(join(root, 'service-worker.js'))) fail('缺少 service-worker.js');
else {
  const sw = read('service-worker.js');
  if (!/tile\.openstreetmap\.org/.test(sw) || !/NEVER_CACHE_HOSTS/.test(sw)) {
    fail('Service Worker 必须显式排除 OpenStreetMap 瓦片（禁止离线囤积瓦片）');
  }
  if (!/self\.addEventListener\('fetch'/.test(sw)) fail('Service Worker 缺少 fetch 处理，无法安装为 PWA');
  if (!/const VERSION = '[\d.]+'/.test(sw)) fail('Service Worker 缺少 VERSION 常量（缓存版本）');
}
// 每个页面都要能被安装为 PWA：manifest 与主题色声明齐全
for (const f of htmlFiles) {
  const html = read(f);
  if (/redirect|页面已迁移/.test(html)) continue; // 旧路径跳转页不需要
  if (!/rel="manifest"/.test(html)) fail(`${f} 缺少 manifest 声明`);
  if (!/name="theme-color"/.test(html)) fail(`${f} 缺少 theme-color`);
}

if (errors.length) {
  console.error('上线前检查未通过：');
  errors.forEach((e) => console.error(` - ${e}`));
  process.exit(1);
}
console.log(`上线前检查通过（${htmlFiles.length} 个页面）`);
