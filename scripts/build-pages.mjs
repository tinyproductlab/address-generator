#!/usr/bin/env node
/* 从 index.html 生成国家页与旧路径跳转页，避免多份 HTML 手工同步时漂移。
 * 用法：node scripts/build-pages.mjs        （写入文件）
 *       node scripts/build-pages.mjs --check（只校验是否与模板一致，CI 用） */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://addressgen.tinylabpro.com';
const check = process.argv.includes('--check');

// slug 即目录名；V9 §15.1 的 *-address-generator 为主路由，旧的 *-address 保留为同内容页并指向新 canonical。
const COUNTRIES = [
  { code: 'JP', slug: 'jp-address-generator', legacy: ['jp-address', 'japan-address-generator'], zh: '日本', en: 'Japan', hint: '东京、大阪、京都、札幌、福冈' },
  { code: 'US', slug: 'us-address-generator', legacy: ['us-address', 'united-states-address-generator'], zh: '美国', en: 'United States', hint: '加州、纽约、德州、佛州' },
  { code: 'GB', slug: 'uk-address-generator', legacy: ['uk-address'], zh: '英国', en: 'United Kingdom', hint: '伦敦、曼彻斯特、爱丁堡' },
  { code: 'DE', slug: 'de-address-generator', legacy: ['de-address'], zh: '德国', en: 'Germany', hint: '柏林、慕尼黑、汉堡' },
  { code: 'CA', slug: 'ca-address-generator', legacy: ['ca-address'], zh: '加拿大', en: 'Canada', hint: '多伦多、温哥华、蒙特利尔' },
  { code: 'AU', slug: 'au-address-generator', legacy: ['au-address'], zh: '澳大利亚', en: 'Australia', hint: '悉尼、墨尔本、布里斯班' },
  { code: 'CN', slug: 'cn-address-generator', legacy: ['cn-address'], zh: '中国', en: 'China', hint: '北京、上海、深圳、杭州' },
  { code: 'KR', slug: 'kr-address-generator', legacy: ['kr-address'], zh: '韩国', en: 'South Korea', hint: '首尔、釜山、仁川' },
  { code: 'SG', slug: 'sg-address-generator', legacy: ['sg-address'], zh: '新加坡', en: 'Singapore', hint: 'Downtown Core、Jurong East' },
  { code: 'FR', slug: 'fr-address-generator', legacy: ['fr-address'], zh: '法国', en: 'France', hint: '巴黎、里昂、马赛' },
  { code: 'IT', slug: 'it-address-generator', legacy: ['it-address'], zh: '意大利', en: 'Italy', hint: '罗马、米兰、那不勒斯' },
  { code: 'ES', slug: 'es-address-generator', legacy: ['es-address'], zh: '西班牙', en: 'Spain', hint: '马德里、巴塞罗那' },
  { code: 'NL', slug: 'nl-address-generator', legacy: ['nl-address'], zh: '荷兰', en: 'Netherlands', hint: '阿姆斯特丹、鹿特丹' },
  { code: 'BR', slug: 'br-address-generator', legacy: ['br-address'], zh: '巴西', en: 'Brazil', hint: '圣保罗、里约热内卢' },
  { code: 'TW', slug: 'tw-address-generator', legacy: ['tw-address'], zh: '中国台湾', en: 'Taiwan', hint: '台北、台中、高雄' },
  { code: 'HK', slug: 'hk-address-generator', legacy: ['hk-address'], zh: '中国香港', en: 'Hong Kong', hint: '中环、旺角、沙田' },
  { code: 'MY', slug: 'my-address-generator', legacy: ['my-address'], zh: '马来西亚', en: 'Malaysia', hint: '吉隆坡、槟城' },
  { code: 'RU', slug: 'ru-address-generator', legacy: ['ru-address'], zh: '俄罗斯', en: 'Russia', hint: '莫斯科、圣彼得堡' },
  { code: 'TH', slug: 'th-address-generator', legacy: ['th-address'], zh: '泰国', en: 'Thailand', hint: '曼谷、清迈、普吉' },
  { code: 'PH', slug: 'ph-address-generator', legacy: ['ph-address'], zh: '菲律宾', en: 'Philippines', hint: '马尼拉、宿务' },
  { code: 'AR', slug: 'ar-address-generator', legacy: ['ar-address'], zh: '阿根廷', en: 'Argentina', hint: '布宜诺斯艾利斯、科尔多瓦' },
  { code: 'TR', slug: 'tr-address-generator', legacy: ['tr-address'], zh: '土耳其', en: 'Türkiye', hint: '伊斯坦布尔、安卡拉' }
];

const template = readFileSync(join(root, 'index.html'), 'utf8');

function countryPage(c) {
  const title = `${c.zh}地址与人物资料生成器 - 随机${c.zh}地址｜小产品实验室`;
  const desc = `${c.zh}地址与人物资料生成器：${c.hint}等真实地名与${c.zh}地址格式，加上随机姓名、电话、邮箱、银行卡外观与账号资料，浏览器本地生成，可批量导出 CSV/JSON/JSONL/TXT。`;
  const url = `${ORIGIN}/${c.slug}/`;
  let html = template;
  // 资源改为上一级相对路径
  html = html.replace(/(href|src)="(styles\.css|app\.js|i18n\.js|favicon\.ico|assets\/[^"]+)"/g, '$1="../$2"');
  html = html.replace(/(href)="(privacy|terms|about|sources)\.html"/g, '$1="../$2.html"');
  html = html.replace(/href="\.\/#batch"/g, 'href="#batch"');
  html = html.replace(/href="\.\/"/g, 'href="../"');
  // head 元信息
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${desc}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
  html = html.replace(/"url":"[^"]*"/, `"url":"${url}"`);
  // 当前国家 + H1
  html = html.replace('<body>', `<body data-country="${c.code}">`);
  html = html.replace(/<h1 id="pageTitle">[^<]*<\/h1>/, `<h1 id="pageTitle">${c.zh}地址与人物资料生成器</h1>`);
  return html;
}

function legacyPage(c, slug) {
  const url = `${ORIGIN}/${c.slug}/`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="${url}">
<meta http-equiv="refresh" content="0; url=${url}">
<title>页面已迁移到 ${c.zh}地址与人物资料生成器</title>
<link rel="stylesheet" href="../styles.css">
</head>
<body>
<main class="wrap"><section class="section">
<h1>页面已迁移</h1>
<p>${c.zh}地址与人物资料生成器已移动到新地址，正在跳转…</p>
<p><a class="btn primary" href="${url}">前往 ${c.zh}地址与人物资料生成器</a></p>
</section></main>
</body>
</html>
`;
}

const files = [];
COUNTRIES.forEach((c) => {
  files.push([join(c.slug, 'index.html'), countryPage(c)]);
  (c.legacy || []).forEach((slug) => files.push([join(slug, 'index.html'), legacyPage(c, slug)]));
});

// sitemap：首页 + 国家页 + 法务/批量页
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${ORIGIN}/`, freq: 'daily', pri: '1.0' },
  ...COUNTRIES.map((c) => ({ loc: `${ORIGIN}/${c.slug}/`, freq: 'weekly', pri: '0.9' })),
  { loc: `${ORIGIN}/sources.html`, freq: 'monthly', pri: '0.4' },
  { loc: `${ORIGIN}/privacy.html`, freq: 'monthly', pri: '0.3' },
  { loc: `${ORIGIN}/terms.html`, freq: 'monthly', pri: '0.3' },
  { loc: `${ORIGIN}/about.html`, freq: 'monthly', pri: '0.3' }
];
files.push(['sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>
`]);

let diff = 0;
for (const [rel, content] of files) {
  const abs = join(root, rel);
  const current = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
  if (current === content) continue;
  diff += 1;
  if (check) { console.error(`out of date: ${rel}`); continue; }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  console.log(`wrote ${rel}`);
}
if (check && diff) {
  console.error(`\n${diff} generated file(s) out of date — run: node scripts/build-pages.mjs`);
  process.exit(1);
}
console.log(check ? 'generated pages up to date' : `done: ${files.length} file(s) checked, ${diff} written`);
