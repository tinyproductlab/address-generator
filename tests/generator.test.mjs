/* V9 生成器单元测试（node --test tests/）
 * 覆盖验收清单里的硬约束：卡组织规则、PAN 全部 Luhn-invalid、女性身高上限、
 * 身高体重联动、邮箱域名池与不含 .test、个人主页路径、Seed 可复现、16 种语言键完整。 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// app.js 是浏览器 IIFE：在 Node 下不会碰 DOM，只把纯逻辑挂到 globalThis.ADDRGEN。
await import(join(root, 'i18n.js'));
await import(join(root, 'app.js'));
const G = globalThis.ADDRGEN;
const I18N = globalThis.ADDRGEN_I18N;

const rng = (seed) => new G.SeededRandom(seed);
const brands = Object.keys(G.CARD_BRANDS);

test('内置卡组织规则与 data/card-brands/*.json 一致', () => {
  const manifest = JSON.parse(readFileSync(join(root, 'data/card-brands/source-manifest.json'), 'utf8'));
  assert.equal(manifest.brands.length, brands.length);
  for (const entry of manifest.brands) {
    const file = JSON.parse(readFileSync(join(root, 'data/card-brands', entry.file), 'utf8'));
    const inline = G.CARD_BRANDS[entry.id];
    assert.ok(inline, `内置规则缺少 ${entry.id}`);
    assert.equal(inline.name, file.name);
    assert.equal(inline.cvvLength, file.cvvLength);
    assert.deepEqual(inline.iinRanges, file.iinRanges);
    assert.deepEqual(
      Object.fromEntries(Object.entries(inline.grouping).map(([k, v]) => [String(k), v])),
      Object.fromEntries(Object.entries(file.grouping).map(([k, v]) => [String(k), v]))
    );
    assert.ok(/^https:\/\//.test(entry.sourceUrl));
    assert.ok(entry.verifiedAt);
  }
  const files = readdirSync(join(root, 'data/card-brands')).filter((f) => f.endsWith('.json'));
  assert.equal(files.length, brands.length + 1, '规则文件数量应与卡组织数量 + manifest 一致');
});

test('Luhn 工具函数本身正确', () => {
  assert.equal(G.luhnCheckDigit('411111111111111'), 1);
  assert.ok(G.luhnValid('4111111111111111'));
  assert.ok(!G.luhnValid('4111111111111112'));
});

test('每个卡组织：前缀、长度、安全码位数、分组均符合公开规则', () => {
  for (const id of brands) {
    const brand = G.CARD_BRANDS[id];
    for (let i = 0; i < 400; i += 1) {
      const r = rng(`${id}-shape-${i}`);
      const pan = G.generatePan(r, brand);
      const range = brand.iinRanges.find((rr) => {
        if (rr.length !== pan.length) return false;
        if (rr.prefix !== undefined) return pan.startsWith(rr.prefix);
        const head = pan.slice(0, String(rr.rangeFrom).length);
        return Number(head) >= Number(rr.rangeFrom) && Number(head) <= Number(rr.rangeTo);
      });
      assert.ok(range, `${id} 生成的 ${pan} 不落在任何公开 IIN 区间`);
      assert.ok(/^\d+$/.test(pan));
      const grouped = G.groupPan(pan, brand);
      assert.equal(grouped.replace(/ /g, ''), pan);
      if (id === 'amex') assert.deepEqual(grouped.split(' ').map((s) => s.length), [4, 6, 5]);
    }
    assert.equal(brand.cvvLength, id === 'amex' ? 4 : 3);
  }
});

test('所有生成的 PAN 都无法通过 Luhn 校验', () => {
  for (const id of brands) {
    for (let i = 0; i < 500; i += 1) {
      const pan = G.generatePan(rng(`${id}-luhn-${i}`), G.CARD_BRANDS[id]);
      assert.ok(!G.luhnValid(pan), `${id} 生成了可通过 Luhn 的卡号：${pan}`);
    }
  }
});

test('PAN 中间数字有高随机度，不出现固定模板', () => {
  const seen = new Set();
  for (let i = 0; i < 300; i += 1) {
    const pan = G.generatePan(rng(`entropy-${i}`), G.CARD_BRANDS.visa);
    seen.add(pan);
    assert.ok(!/(\d)\1{5,}/.test(pan), `出现重复模板：${pan}`);
  }
  assert.ok(seen.size >= 295, `300 次生成只得到 ${seen.size} 个不同卡号`);
});

test('卡组织权重按国家生效：中国以 UnionPay 为主，日本含 JCB，美国含 Discover', () => {
  const sample = (code, n = 600) => {
    const counts = {};
    for (let i = 0; i < n; i += 1) {
      const card = G.generateCard(rng(`${code}-brand-${i}`), G.PROFILES[code], 'Test Holder', 'billing');
      counts[card.brandId] = (counts[card.brandId] || 0) + 1;
    }
    return counts;
  };
  const cn = sample('CN');
  const top = Object.keys(cn).sort((a, b) => cn[b] - cn[a])[0];
  assert.equal(top, 'unionpay');
  assert.ok(sample('JP').jcb > 0);
  assert.ok(sample('US').discover > 0);
  // 未配置权重的 generic-safe 国家退回通用 Visa / Mastercard 池
  const generic = sample('IS', 200);
  assert.deepEqual(Object.keys(generic).sort(), ['amex', 'mastercard', 'visa']);
});

test('有效期在当前月之后 1~5 年内，安全码位数与卡组织一致', () => {
  const now = new Date();
  for (let i = 0; i < 300; i += 1) {
    const card = G.generateCard(rng(`exp-${i}`), G.PROFILES.US, 'Test Holder', 'billing');
    const [mm, yy] = card.expiry.split('/');
    assert.match(card.expiry, /^\d{2}\/\d{2}$/);
    const months = (2000 + Number(yy) - now.getFullYear()) * 12 + (Number(mm) - 1 - now.getMonth());
    assert.ok(months >= 12 && months <= 60, `有效期偏移 ${months} 个月不在 12~60 之间`);
    assert.equal(card.cvv.length, G.CARD_BRANDS[card.brandId].cvvLength);
  }
});

test('女性身高绝不到 180cm，各性别身高落在规定区间', () => {
  for (const gender of ['male', 'female', 'x']) {
    const rule = G.HEIGHT_RULES[gender];
    for (let i = 0; i < 3000; i += 1) {
      const { heightCm } = G.bodyMetrics(rng(`${gender}-h-${i}`), gender);
      assert.ok(heightCm >= rule.min && heightCm <= rule.max, `${gender} 身高 ${heightCm} 越界`);
      if (gender === 'female') assert.ok(heightCm < 180);
    }
  }
});

test('体重由身高与 BMI 联动计算，且 BMI 分布集中在健康区间', () => {
  let inCore = 0;
  const total = 4000;
  for (let i = 0; i < total; i += 1) {
    const m = G.bodyMetrics(rng(`bmi-${i}`), i % 2 ? 'female' : 'male');
    const bmi = m.weightKg / ((m.heightCm / 100) ** 2);
    assert.ok(bmi >= 17.0 && bmi <= 27.6, `BMI ${bmi} 超出允许范围`);
    if (bmi >= 18.5 && bmi <= 24.9) inCore += 1;
  }
  assert.ok(inCore / total > 0.85, `只有 ${(inCore / total * 100).toFixed(1)}% 落在 18.5~24.9`);
});

test('162cm 女性体重主要落在 49~65kg', () => {
  const weights = [];
  for (let i = 0; weights.length < 400 && i < 60000; i += 1) {
    const m = G.bodyMetrics(rng(`w162-${i}`), 'female');
    if (m.heightCm === 162) weights.push(m.weightKg);
  }
  assert.ok(weights.length > 200, '样本不足');
  const inBand = weights.filter((w) => w >= 49 && w <= 65).length / weights.length;
  assert.ok(inBand > 0.85, `162cm 女性只有 ${(inBand * 100).toFixed(1)}% 落在 49~65kg`);
  assert.ok(weights.filter((w) => w >= 70).length / weights.length < 0.05, '70kg+ 出现过于频繁');
});

test('邮箱使用主流域名池，且不出现 .test / example', () => {
  assert.ok(G.EMAIL_DOMAINS.includes('gmail.com'));
  ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'foxmail.com', 'qq.com', '163.com', '126.com', 'zohomail.com', 'protonmail.com']
    .forEach((d) => assert.ok(G.EMAIL_DOMAINS.includes(d), `域名池缺少 ${d}`));
  for (const code of ['JP', 'US', 'CN', 'DE', 'RU', 'IS']) {
    for (let i = 0; i < 200; i += 1) {
      const r = rng(`${code}-mail-${i}`);
      const email = G.buildEmail(r, G.PROFILES[code], 'Haruka', 'Satō', 1994);
      assert.match(email, /^[a-z0-9][a-z0-9._]*@[a-z0-9.]+$/, `邮箱格式异常：${email}`);
      assert.ok(!/\.test$|example/.test(email), `邮箱使用了保留域名：${email}`);
      assert.ok(G.EMAIL_DOMAINS.includes(email.split('@')[1]));
    }
  }
});

test('中国邮箱以本地服务商为主', () => {
  const counts = {};
  for (let i = 0; i < 600; i += 1) {
    const d = G.buildEmail(rng(`cn-mail-${i}`), G.PROFILES.CN, 'Wei', 'Zhang', 1990).split('@')[1];
    counts[d] = (counts[d] || 0) + 1;
  }
  const local = ['qq.com', '163.com', '126.com', 'foxmail.com'].reduce((s, d) => s + (counts[d] || 0), 0);
  assert.ok(local / 600 > 0.6, `本地域名占比仅 ${(local / 600 * 100).toFixed(0)}%`);
});

test('个人主页固定落在本站 /u/ 路径', () => {
  for (let i = 0; i < 200; i += 1) {
    const url = G.buildHomepage(rng(`home-${i}`), 'María', 'Núñez');
    assert.match(url, /^https:\/\/addressgen\.tinylabpro\.com\/u\/[a-z0-9-]+$/, url);
    assert.ok(!/example|\.test/.test(url));
  }
});

test('同一 Seed + 同一筛选条件生成同一份资料', () => {
  G.state.country = 'JP';
  G.state.filter = { admin: null, city: null };
  const a = G.generateIdentity('seed:checkout-japan-001#0');
  const b = G.generateIdentity('seed:checkout-japan-001#0');
  assert.deepEqual(a, b);
  const c = G.generateIdentity('seed:checkout-japan-002#0');
  assert.notDeepEqual(a.card.numberRaw, c.card.numberRaw);
});

test('城市筛选被保留：重新生成仍落在所选城市', () => {
  G.state.country = 'JP';
  G.state.filter = { admin: '東京都', city: '渋谷区' };
  for (let i = 0; i < 30; i += 1) {
    const id = G.generateIdentity(`v9-${i}`);
    assert.equal(id.address.city, '渋谷区');
    assert.equal(id.address.region, '東京都');
  }
  G.state.filter = { admin: null, city: null };
});

test('生成结果不包含身份证 / 护照 / SSN / 银行账户等高风险字段', () => {
  G.state.country = 'US';
  const id = G.generateIdentity('v9-0');
  const flat = JSON.stringify(id).toLowerCase();
  ['ssn', 'passport', 'iban', 'routing', 'nationalid', 'taxid', 'socialsecurity']
    .forEach((k) => assert.ok(!flat.includes(k), `输出里出现了 ${k}`));
  assert.ok(id.age >= 18 && id.age <= 68);
});

test('年龄与出生日期始终一致', () => {
  G.state.country = 'DE';
  for (let i = 0; i < 500; i += 1) {
    const id = G.generateIdentity(`age-${i}`);
    const dob = new Date(id.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
    assert.equal(age, id.age, `dob ${id.dob} 与年龄 ${id.age} 不一致`);
  }
});

test('249 个 ISO 国家 / 地区全部进入 Country Profile', () => {
  const codes = Object.keys(G.PROFILES);
  assert.equal(codes.length, 249, `当前只有 ${codes.length} 个国家 / 地区`);
  codes.forEach((code) => {
    const p = G.PROFILES[code];
    assert.match(code, /^[A-Z]{2}$/);
    assert.ok(p.admins.length && p.admins[0].cities.length, `${code} 缺少城市数据`);
    assert.ok(p.currency && p.tz && p.locale, `${code} 缺少货币 / 时区 / locale`);
    assert.ok(p.cardBrandWeights && Object.keys(p.cardBrandWeights).length, `${code} 缺少卡组织权重`);
    assert.ok(['localized-full', 'localized-address', 'generic-safe'].includes(p.coverage));
  });
});

test('每个国家都能直接生成完整资料', () => {
  for (const code of Object.keys(G.PROFILES)) {
    G.state.country = code;
    G.state.filter = { admin: null, city: null };
    const id = G.generateIdentity('smoke-1');
    assert.ok(id.nameLocal && id.nameRoman, `${code} 姓名为空`);
    assert.ok(id.address.local && id.address.international, `${code} 地址为空`);
    assert.ok(id.phone && id.email, `${code} 联系方式为空`);
    assert.ok(!G.luhnValid(id.card.numberRaw), `${code} 卡号可通过 Luhn`);
    assert.ok(id.account.website.startsWith('https://addressgen.tinylabpro.com/u/'));
  }
  G.state.country = 'JP';
});

test('16 种界面语言键完整且互相对齐', () => {
  assert.equal(I18N.locales.length, 16);
  const base = Object.keys(I18N.table['zh-CN']);
  assert.ok(base.length > 150);
  for (const { code } of I18N.locales) {
    const table = I18N.table[code];
    assert.ok(table, `缺少语言包 ${code}`);
    assert.deepEqual(Object.keys(table).sort(), base.slice().sort(), `${code} 语言键不一致`);
    base.forEach((k) => assert.ok(String(table[k]).length > 0, `${code}.${k} 为空`));
  }
  assert.deepEqual(I18N.rtl, ['ar']);
  ['pageTitleTpl', 'descTpl'].forEach((k) => {
    I18N.locales.forEach(({ code }) => assert.ok(I18N.table[code][k].includes('{c}'), `${code}.${k} 缺少 {c} 占位符`));
  });
});

test('界面语言切换后档案枚举随之本地化，但本地地址不变', () => {
  G.state.country = 'JP';
  G.state.filter = { admin: null, city: null };
  const id = G.generateIdentity('lang-check');
  G.setLocaleForTest('ja');
  assert.equal(I18N.table.ja[id.work.industryKey].length > 0, true);
  G.setLocaleForTest('zh-CN');
  const again = G.generateIdentity('lang-check');
  assert.equal(again.address.local, id.address.local, '本地地址不应随界面语言变化');
});

test('页面文案不再出现测试身份 / Sandbox / Test Only 等标签', () => {
  const forbidden = ['测试身份', '测试邮箱', '测试卡号', 'Sandbox', 'Test Only', 'example.test', 'test.example'];
  const pages = ['index.html', 'jp-address-generator/index.html', 'us-address-generator/index.html'];
  for (const page of pages) {
    const html = readFileSync(join(root, page), 'utf8');
    forbidden.forEach((word) => assert.ok(!html.includes(word), `${page} 仍包含「${word}」`));
  }
  const app = readFileSync(join(root, 'app.js'), 'utf8');
  ['example.test', 'test.example'].forEach((w) => assert.ok(!app.includes(w), `app.js 仍包含 ${w}`));
});

test('发布前占位符已替换：反馈邮箱与公众号二维码', () => {
  assert.ok(!/【待填写反馈邮箱】/.test(readFileSync(join(root, 'index.html'), 'utf8')));
  assert.match(G.SITE.feedbackEmail, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  assert.equal(G.SITE.origin, 'https://addressgen.tinylabpro.com');
});

test('邮编与所选城市关联：同一城市的邮编前缀稳定', () => {
  const cases = [
    ['JP', '東京都', '新宿区', /^160-\d{4}$/],
    ['JP', '大阪府', '大阪市', /^530-\d{4}$/],
    ['US', 'California', 'San Francisco', /^941\d{2}$/],
    ['US', 'Texas', 'Houston', /^770\d{2}$/],
    ['CN', '广东省', '深圳市', /^518\d{3}$/],
    ['DE', 'Bayern', 'München', /^80\d{3}$/],
    ['FR', 'Île-de-France', 'Paris', /^75\d{3}$/],
    ['GB', 'England', 'Manchester', /^M1 \d[A-Z]{2}$/],
    ['TW', '臺北市', '大安區', /^106\d{2}$/],
    ['BR', 'São Paulo', 'Santos', /^110\d{2}-\d{3}$/]
  ];
  for (const [code, admin, city, re] of cases) {
    G.state.country = code;
    G.state.filter = { admin, city };
    for (let i = 0; i < 40; i += 1) {
      const id = G.generateIdentity(`postal-${code}-${i}`);
      assert.match(id.address.postal, re, `${code}/${city} 邮编 ${id.address.postal} 与城市不匹配`);
    }
  }
  G.state.filter = { admin: null, city: null };
  G.state.country = 'JP';
});

test('街道与区县按城市绑定，不跨城市错配', () => {
  const tokyo = new Set(['西新宿', '歌舞伎町', '新宿', '北新宿']);
  G.state.country = 'JP';
  G.state.filter = { admin: '東京都', city: '新宿区' };
  for (let i = 0; i < 60; i += 1) {
    const id = G.generateIdentity(`street-${i}`);
    assert.ok(tokyo.has(id.address.street), `新宿区出现了外地街道名 ${id.address.street}`);
    assert.equal(id.address.district, '', '新宿区不应再套一层区');
  }
  G.state.filter = { admin: '大阪府', city: '大阪市' };
  for (let i = 0; i < 60; i += 1) {
    const id = G.generateIdentity(`street-osaka-${i}`);
    assert.ok(['梅田', '心斎橋', '難波', '本町'].includes(id.address.street));
    assert.ok(['北区', '中央区', '浪速区'].includes(id.address.district));
    assert.ok(id.address.local.includes(`大阪市${id.address.district}${id.address.street}`));
  }
  G.state.country = 'US';
  G.state.filter = { admin: 'California', city: 'San Diego' };
  for (let i = 0; i < 30; i += 1) {
    assert.equal(G.generateIdentity(`county-${i}`).address.district, 'San Diego County');
  }
  G.state.filter = { admin: null, city: null };
  G.state.country = 'JP';
});

test('操作系统、User-Agent、屏幕与设备类别互相一致', () => {
  G.state.country = 'US';
  for (let i = 0; i < 400; i += 1) {
    const { os, ua, screen, deviceKey } = G.generateIdentity(`ua-${i}`).account;
    const mobile = /iPhone|Android/.test(ua);
    if (/macOS/.test(os)) assert.match(ua, /Macintosh/, `${os} 配了 ${ua}`);
    if (/Windows/.test(os)) assert.match(ua, /Windows NT/, `${os} 配了 ${ua}`);
    if (/Ubuntu/.test(os)) assert.match(ua, /X11; Linux/, `${os} 配了 ${ua}`);
    if (/iOS/.test(os)) assert.match(ua, /iPhone/, `${os} 配了 ${ua}`);
    if (/Android/.test(os)) assert.match(ua, /Android/, `${os} 配了 ${ua}`);
    assert.equal(mobile, ['dev3', 'dev4'].includes(deviceKey), `${os} 与设备类别 ${deviceKey} 不一致`);
    assert.equal(mobile, Number(screen.split('×')[0]) < 500, `${os} 与分辨率 ${screen} 不一致`);
  }
  G.state.country = 'JP';
});

test('批量字段扁平化：银行卡展开为多列，snake_case 命名可切换', () => {
  G.state.country = 'US';
  G.state.filter = { admin: null, city: null };
  G.state.batchCase = 'camel';
  const id = G.generateIdentity('batch-1');
  const camel = G.flatten(id, ['name', 'gender', 'address', 'city', 'postal', 'phone', 'email', 'card', 'uuid']);
  assert.deepEqual(Object.keys(camel), [
    'name', 'nameRoman', 'gender', 'address', 'city', 'postalCode', 'phone', 'email',
    'cardBrand', 'cardNumber', 'cardExpiry', 'cardCvv', 'uuid'
  ]);
  assert.ok(!G.luhnValid(camel.cardNumber.replace(/ /g, '')));
  G.state.batchCase = 'snake';
  const snake = G.flatten(id, ['name', 'postal', 'card']);
  assert.deepEqual(Object.keys(snake), ['name', 'name_roman', 'postal_code', 'card_brand', 'card_number', 'card_expiry', 'card_cvv']);
  G.state.batchCase = 'camel';
});
