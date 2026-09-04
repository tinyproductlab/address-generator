/* 小产品实验室 · 全球地址与人物资料生成器 — V9 最终上线版
 * 纯静态、浏览器本地生成、无 Math.random（全程 SeededRandom）、除地图瓦片外无网络请求。
 * 银行卡只按卡组织公开编号结构生成"外观型"卡号，末位主动破坏 Luhn 校验，
 * 规则来源见 data/card-brands/source-manifest.json。 */
(() => {
  'use strict';

  const DATA_VERSION = '2026.09.05.1';
  const SITE = {
    origin: 'https://addressgen.tinylabpro.com',
    name: '小产品实验室 · 全球地址生成器',
    wechat: '小产品实验室',
    wechatQr: 'assets/wechat-official-account-qr.png',
    feedbackEmail: 'userfeedback@zohomail.com'
  };

  // -----------------------------
  // i18n：16 种界面语言（语言包见 i18n.js）
  // 界面语言只影响 UI 文案与档案枚举描述；地址与本地姓名始终按所选国家的本地语言输出。
  // -----------------------------
  const BUNDLE = (typeof globalThis !== 'undefined' && globalThis.ADDRGEN_I18N)
    || { locales: [{ code: 'en', label: 'English' }], rtl: [], table: { en: {} }, fallback: 'en' };
  const I18N = BUNDLE.table;
  const LOCALES = BUNDLE.locales;
  const RTL_LOCALES = BUNDLE.rtl || [];
  const DEFAULT_LOCALE = 'zh-CN';

  function normalizeLocale(value) {
    if (!value) return '';
    const raw = String(value).replace(/_/g, '-');
    const lower = raw.toLowerCase();
    const exact = LOCALES.find((l) => l.code.toLowerCase() === lower);
    if (exact) return exact.code;
    if (lower.startsWith('zh')) return /hant|tw|hk|mo/.test(lower) ? 'zh-TW' : 'zh-CN';
    const base = lower.split('-')[0];
    const byBase = LOCALES.find((l) => l.code.toLowerCase() === base);
    return byBase ? byBase.code : '';
  }
  function detectLocale() {
    try {
      const fromUrl = normalizeLocale(new URLSearchParams(location.search).get('lang'));
      if (fromUrl) return fromUrl;
    } catch { /* ignore */ }
    let stored = '';
    try { stored = localStorage.getItem('tlb-lang') || ''; } catch { /* ignore */ }
    if (stored === 'zh') stored = 'zh-CN';
    const fromStore = normalizeLocale(stored);
    if (fromStore) return fromStore;
    const navLangs = (typeof navigator !== 'undefined' && (navigator.languages || (navigator.language ? [navigator.language] : []))) || [];
    for (let i = 0; i < navLangs.length; i += 1) { const hit = normalizeLocale(navLangs[i]); if (hit) return hit; }
    return DEFAULT_LOCALE;
  }
  let lang = DEFAULT_LOCALE;
  try { lang = detectLocale(); } catch { lang = DEFAULT_LOCALE; }
  const isZh = () => lang === 'zh-CN' || lang === 'zh-TW';
  const t = (k) => {
    const table = I18N[lang] || {};
    if (table[k] !== undefined) return table[k];
    const fb = I18N[BUNDLE.fallback] || {};
    return fb[k] !== undefined ? fb[k] : k;
  };
  const tpl = (k, vars) => String(t(k)).replace(/\{(\w+)\}/g, (m, name) => (vars && vars[name] !== undefined ? vars[name] : m));

  // 国家/地区名称本地化：zh-CN 使用内置中文名，其余语言用 Intl.DisplayNames 覆盖全部 249 个地区
  const displayNames = {};
  function localizedRegion(code) {
    if (lang === 'zh-CN') return '';
    if (!(lang in displayNames)) {
      try { displayNames[lang] = new Intl.DisplayNames([lang], { type: 'region' }); } catch { displayNames[lang] = null; }
    }
    const dn = displayNames[lang];
    if (!dn) return '';
    try { const v = dn.of(code); return v && v !== code ? v : ''; } catch { return ''; }
  }
  function countryName(p) {
    if (lang === 'zh-CN') return p.nameZh;
    return localizedRegion(p.code) || (isZh() ? p.nameZh : p.nameEn);
  }

  // -----------------------------
  // Card Brand Rule Registry
  // 只按卡组织公开的账号编号结构（前缀区间 / 长度 / 安全码位数 / 显示分组）生成"外观型"卡号。
  // 不接入任何真实 BIN / IIN 发行人数据库；末位主动选择与正确 Luhn 校验位不同的数字，
  // 因此所有输出都无法通过常规银行卡号校验。规则与来源见 data/card-brands/*.json。
  // -----------------------------
  const CARD_BRANDS = {
    visa: {
      id: 'visa', name: 'Visa', cvvLength: 3,
      iinRanges: [{ prefix: '4', length: 16, weight: 9 }, { prefix: '4', length: 19, weight: 1 }],
      grouping: { 16: [4, 4, 4, 4], 19: [4, 4, 4, 4, 3] }
    },
    mastercard: {
      id: 'mastercard', name: 'Mastercard', cvvLength: 3,
      iinRanges: [{ rangeFrom: '51', rangeTo: '55', length: 16 }, { rangeFrom: '2221', rangeTo: '2720', length: 16 }],
      grouping: { 16: [4, 4, 4, 4] }
    },
    amex: {
      id: 'amex', name: 'American Express', cvvLength: 4,
      iinRanges: [{ prefix: '34', length: 15 }, { prefix: '37', length: 15 }],
      grouping: { 15: [4, 6, 5] }
    },
    unionpay: {
      id: 'unionpay', name: 'UnionPay', cvvLength: 3,
      iinRanges: [{ prefix: '62', length: 16, weight: 8 }, { prefix: '62', length: 19, weight: 2 }],
      grouping: { 16: [4, 4, 4, 4], 19: [6, 13] }
    },
    jcb: {
      id: 'jcb', name: 'JCB', cvvLength: 3,
      iinRanges: [{ rangeFrom: '3528', rangeTo: '3589', length: 16 }],
      grouping: { 16: [4, 4, 4, 4] }
    },
    discover: {
      id: 'discover', name: 'Discover', cvvLength: 3,
      iinRanges: [
        { prefix: '6011', length: 16 },
        { rangeFrom: '644', rangeTo: '649', length: 16 },
        { prefix: '65', length: 16 },
        { rangeFrom: '622126', rangeTo: '622925', length: 16 }
      ],
      grouping: { 16: [4, 4, 4, 4] }
    }
  };
  // §18 降级：规则集异常时至少保留 Visa / Mastercard 最小规则，且仍必须 Luhn-invalid。
  const CARD_BRANDS_MINIMAL = { visa: CARD_BRANDS.visa, mastercard: CARD_BRANDS.mastercard };
  const CARD_WEIGHTS_DEFAULT = { visa: 5, mastercard: 4, amex: 1 };
  const CARD_WEIGHTS = {
    CN: { unionpay: 6, visa: 2, mastercard: 2, jcb: 1 },
    JP: { jcb: 4, visa: 4, mastercard: 3, amex: 2 },
    US: { visa: 5, mastercard: 4, amex: 2, discover: 2 },
    CA: { visa: 5, mastercard: 4, amex: 2 },
    KR: { visa: 4, mastercard: 3, jcb: 1, unionpay: 1, amex: 1 },
    TW: { visa: 4, mastercard: 3, jcb: 2, unionpay: 1 },
    HK: { visa: 4, mastercard: 3, unionpay: 2, amex: 1 },
    SG: { visa: 5, mastercard: 4, amex: 2, unionpay: 1 },
    MY: { visa: 5, mastercard: 4, unionpay: 1, amex: 1 },
    TH: { visa: 5, mastercard: 4, jcb: 2, unionpay: 1 },
    PH: { visa: 5, mastercard: 4, jcb: 1, amex: 1 },
    AU: { visa: 5, mastercard: 4, amex: 2 },
    GB: { visa: 5, mastercard: 4, amex: 1 },
    RU: { visa: 4, mastercard: 4 },
    BR: { visa: 5, mastercard: 4, amex: 1 },
    AR: { visa: 5, mastercard: 4, amex: 1 },
    TR: { visa: 5, mastercard: 4 }
  };

  // 主流邮箱服务商域名池：只随机生成本地部分，不做 MX / SMTP / 存在性验证，也不发信。
  const EMAIL_WEIGHTS = {
    _default: { 'gmail.com': 6, 'outlook.com': 4, 'hotmail.com': 3, 'yahoo.com': 3, 'icloud.com': 3, 'protonmail.com': 2, 'zohomail.com': 1 },
    CN: { 'qq.com': 5, '163.com': 4, 'foxmail.com': 3, '126.com': 2, 'gmail.com': 2, 'outlook.com': 2, 'icloud.com': 1 },
    HK: { 'gmail.com': 5, 'yahoo.com': 3, 'outlook.com': 3, 'icloud.com': 2, 'qq.com': 2, 'hotmail.com': 2 },
    TW: { 'gmail.com': 6, 'yahoo.com': 3, 'hotmail.com': 2, 'outlook.com': 2, 'icloud.com': 2 },
    JP: { 'gmail.com': 5, 'yahoo.com': 3, 'icloud.com': 3, 'outlook.com': 2, 'hotmail.com': 2 },
    KR: { 'gmail.com': 5, 'outlook.com': 3, 'icloud.com': 2, 'hotmail.com': 2, 'yahoo.com': 1 }
  };
  const EMAIL_DOMAINS = Object.keys(EMAIL_WEIGHTS).reduce((all, key) => {
    Object.keys(EMAIL_WEIGHTS[key]).forEach((d) => { if (!all.includes(d)) all.push(d); });
    return all;
  }, []);

  function luhnCheckDigit(body) {
    let sum = 0;
    let double = true;
    for (let i = body.length - 1; i >= 0; i -= 1) {
      let d = Number(body[i]);
      if (double) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      double = !double;
    }
    return (10 - (sum % 10)) % 10;
  }
  function luhnValid(pan) {
    const digits = String(pan).replace(/\D/g, '');
    if (digits.length < 2) return false;
    return luhnCheckDigit(digits.slice(0, -1)) === Number(digits.slice(-1));
  }
  // 避免出现 4242…、5555…、连续递增等一眼假的模板
  function looksTemplated(digits) {
    if (/(\d)\1{3,}/.test(digits)) return true;
    if (new Set(digits).size <= 2) return true;
    for (let i = 0; i + 3 < digits.length; i += 1) {
      const step = Number(digits[i + 1]) - Number(digits[i]);
      if (step !== 1 && step !== -1) continue;
      if (Number(digits[i + 2]) - Number(digits[i + 1]) === step && Number(digits[i + 3]) - Number(digits[i + 2]) === step) return true;
    }
    return false;
  }
  function groupPan(pan, brand) {
    const pattern = (brand.grouping && brand.grouping[pan.length]) || null;
    if (!pattern) return pan.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    const out = [];
    let at = 0;
    pattern.forEach((size) => { out.push(pan.slice(at, at + size)); at += size; });
    if (at < pan.length) out.push(pan.slice(at));
    return out.filter(Boolean).join(' ');
  }
  function brandFor(rng, profile) {
    const weights = profile.cardBrandWeights || CARD_WEIGHTS_DEFAULT;
    const available = {};
    Object.keys(weights).forEach((id) => { if (CARD_BRANDS[id]) available[id] = weights[id]; });
    const pool = Object.keys(available).length ? available : { visa: 5, mastercard: 4 };
    return CARD_BRANDS[rng.weighted(pool)] || CARD_BRANDS_MINIMAL.visa;
  }
  function generatePan(rng, brand) {
    const weights = {};
    brand.iinRanges.forEach((r, i) => { weights[i] = r.weight === undefined ? 1 : r.weight; });
    const range = brand.iinRanges[Number(rng.weighted(weights))];
    const bodyLength = range.length - 1;
    let body = '';
    for (let attempt = 0; attempt < 16; attempt += 1) {
      const prefix = range.prefix !== undefined
        ? range.prefix
        : String(rng.int(Number(range.rangeFrom), Number(range.rangeTo)));
      let mid = '';
      for (let i = prefix.length; i < bodyLength; i += 1) mid += String(rng.int(0, 9));
      body = prefix + mid;
      if (!looksTemplated(mid)) break;
    }
    // 故意破坏 Luhn：末位取一个与正确校验位不同的数字
    const correct = luhnCheckDigit(body);
    const last = (correct + rng.int(1, 9)) % 10;
    return body + String(last);
  }
  function generateCard(rng, profile, holder, billing) {
    const brand = brandFor(rng, profile);
    const pan = generatePan(rng, brand);
    const months = rng.int(12, 60);
    const base = new Date();
    const exp = new Date(base.getFullYear(), base.getMonth() + months, 1);
    return {
      brand: brand.name,
      brandId: brand.id,
      productKey: rng.weighted({ prod1: 5, prod2: 4, prod3: 1 }),
      number: groupPan(pan, brand),
      numberRaw: pan,
      expiry: `${String(exp.getMonth() + 1).padStart(2, '0')}/${String(exp.getFullYear()).slice(2)}`,
      cvv: rng.digits(brand.cvvLength),
      holder,
      currency: profile.currency,
      billing
    };
  }

  // -----------------------------
  // Country Profiles（真实地名 + 合成规则；14 国）
  // -----------------------------
  const PROFILES = {
    JP: {
      code: 'JP', alpha3: 'JPN', slug: 'jp-address', flag: '🇯🇵', nameZh: '日本', nameEn: 'Japan', nativeName: '日本',
      continent: '亚洲', locale: 'ja-JP', currency: 'JPY', tz: 'Asia/Tokyo', langCode: 'ja', salary: [3000000, 9000000],
      searchHint: '東京、大阪',
      admins: [
        { name: '東京都', cities: ['新宿区', '渋谷区', '千代田区', '世田谷区', '八王子市'], districts: ['神南', '西新宿', '丸の内', '北沢'] },
        { name: '大阪府', cities: ['大阪市', '堺市', '豊中市'], districts: ['北区', '浪速区', '中町'] },
        { name: '京都府', cities: ['京都市', '宇治市'], districts: ['中京区', '下京区', '上京区'] },
        { name: '北海道', cities: ['札幌市', '函館市', '旭川市'], districts: ['中央区', '豊平区', '北区'] },
        { name: '福岡県', cities: ['福岡市', '北九州市'], districts: ['博多区', '中央区', '小倉北区'] },
        { name: '神奈川県', cities: ['横浜市', '川崎市'], districts: ['鶴見区', '港北区', '関内'] }
      ],
      streets: ['神南', '代々木', '梅田', '心斎橋', '五条', '表参道'],
      house: (r) => `${r.int(1, 8)}丁目${r.int(1, 30)}-${r.int(1, 20)}`,
      postal: (r, admin, pre) => `${pre || r.pick(['150', '160', '530', '600', '060', '810', '220'])}-${r.digits(4)}`,
      phone: (r) => `090-${r.digits(4)}-${r.digits(4)}`,
      localFormat: (p) => [`〒${p.postal}`, `${p.admin}${p.city}${p.district}${p.street}${p.house}`],
      intlFormat: (p) => [`${p.house}, ${p.street}, ${[p.district, p.city].filter(Boolean).join(', ')}, ${p.admin}, ${p.postal}, Japan`],
      last: [['山田', 'Yamada'], ['佐藤', 'Sato'], ['鈴木', 'Suzuki'], ['高橋', 'Takahashi'], ['田中', 'Tanaka'], ['伊藤', 'Ito'], ['渡辺', 'Watanabe']],
      male: [['太郎', 'Taro'], ['翔', 'Sho'], ['蓮', 'Ren'], ['大輔', 'Daisuke'], ['健太', 'Kenta'], ['悠真', 'Yuma']],
      female: [['美咲', 'Misaki'], ['葵', 'Aoi'], ['結菜', 'Yuna'], ['陽菜', 'Hina'], ['さくら', 'Sakura'], ['凛', 'Rin']],
      jobs: ['エンジニア', 'デザイナー', '営業', '経理', 'プロダクトマネージャー', '教師'],
      companies: ['青空テクノロジー株式会社', '未来デザイン合同会社', 'テスト商事株式会社', '光技研株式会社']
    },
    US: {
      code: 'US', alpha3: 'USA', slug: 'us-address', flag: '🇺🇸', nameZh: '美国', nameEn: 'United States', nativeName: 'United States',
      continent: '北美洲', locale: 'en-US', currency: 'USD', tz: 'America/New_York', langCode: 'en', salary: [45000, 180000],
      searchHint: 'California、New York',
      admins: [
        { name: 'California', code: 'CA', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'], districts: ['LA County', 'San Francisco County', 'Sacramento County'] },
        { name: 'New York', code: 'NY', cities: ['New York', 'Buffalo', 'Albany'], districts: ['New York County', 'Erie County', 'Albany County'] },
        { name: 'Texas', code: 'TX', cities: ['Austin', 'Dallas', 'Houston'], districts: ['Travis County', 'Dallas County', 'Harris County'] },
        { name: 'Florida', code: 'FL', cities: ['Miami', 'Orlando', 'Tampa'], districts: ['Miami-Dade County', 'Orange County', 'Hillsborough County'] },
        { name: 'Washington', code: 'WA', cities: ['Seattle', 'Tacoma'], districts: ['King County', 'Pierce County'] },
        { name: 'Illinois', code: 'IL', cities: ['Chicago', 'Springfield'], districts: ['Cook County', 'Sangamon County'] }
      ],
      streets: ['Oakwood Ave', 'Market St', 'Sunset Blvd', 'Maple Drive', 'Harbor Road', 'Cedar Lane'],
      house: (r) => String(r.int(100, 9899)),
      postal: (r, admin, pre) => `${pre ? pre + r.digits(2) : r.digits(5)}`,
      phone: (r) => `+1 (${r.pick(['415', '212', '312', '305', '206'])}) 555-${r.digits(4)}`,
      localFormat: (p) => [`${p.house} ${p.street}`, `${p.city}, ${p.adminCode} ${p.postal}`, 'United States'],
      intlFormat: (p) => [`${p.house} ${p.street}, ${p.city}, ${p.adminCode} ${p.postal}, United States`],
      last: ['Miller', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson'],
      male: ['James', 'Ethan', 'Noah', 'Liam', 'Mason', 'Logan'],
      female: ['Olivia', 'Emma', 'Ava', 'Sophia', 'Mia', 'Harper'],
      jobs: ['Software Engineer', 'Product Designer', 'Marketing Specialist', 'Accountant', 'Teacher', 'Data Analyst'],
      companies: ['Northstar Labs LLC', 'Harborline Studio Inc.', 'Blue River Systems', 'Example Commerce Inc.']
    },
    GB: {
      code: 'GB', alpha3: 'GBR', slug: 'uk-address', flag: '🇬🇧', nameZh: '英国', nameEn: 'United Kingdom', nativeName: 'United Kingdom',
      continent: '欧洲', locale: 'en-GB', currency: 'GBP', tz: 'Europe/London', langCode: 'en', salary: [26000, 110000],
      searchHint: 'London、Manchester',
      admins: [
        { name: 'England', code: 'ENG', cities: ['London', 'Manchester', 'Birmingham', 'Leeds'], districts: ['Westminster', 'Camden', 'Northern Quarter', 'Digbeth'] },
        { name: 'Scotland', code: 'SCT', cities: ['Edinburgh', 'Glasgow'], districts: ['Old Town', 'New Town', 'West End'] },
        { name: 'Wales', code: 'WLS', cities: ['Cardiff', 'Swansea'], districts: ['Cathays', 'Marina'] }
      ],
      streets: ['King Street', 'Queen Street', 'High Street', 'Church Road', 'Station Road', 'Victoria Road'],
      house: (r) => String(r.int(1, 220)),
      postal: (r, admin, pre) => `${pre || r.pick(['SW1A', 'E1', 'N1', 'M1', 'B3', 'EH1', 'CF10'])} ${r.int(0, 9)}${r.pick(['AA', 'AB', 'BB', 'BX', 'JQ', 'NF'])}`,
      phone: (r) => `+44 20 ${r.digits(4)} ${r.digits(4)}`,
      localFormat: (p) => [`${p.house} ${p.street}`, `${p.city} ${p.postal}`, 'United Kingdom'],
      intlFormat: (p) => [`${p.house} ${p.street}, ${p.city} ${p.postal}, United Kingdom`],
      last: ['Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies'],
      male: ['Oliver', 'Harry', 'George', 'Noah', 'Jack'],
      female: ['Amelia', 'Isla', 'Emily', 'Poppy', 'Ava'],
      jobs: ['Software Engineer', 'Nurse', 'Teacher', 'Account Manager', 'Civil Servant'],
      companies: ['Thames Digital Ltd', 'Northgate Systems', 'Example Retail UK', 'Kingsway Studio Ltd']
    },
    DE: {
      code: 'DE', alpha3: 'DEU', slug: 'de-address', flag: '🇩🇪', nameZh: '德国', nameEn: 'Germany', nativeName: 'Deutschland',
      continent: '欧洲', locale: 'de-DE', currency: 'EUR', tz: 'Europe/Berlin', langCode: 'de', salary: [40000, 120000],
      searchHint: 'Berlin、Bayern',
      admins: [
        { name: 'Berlin', code: 'BE', cities: ['Berlin'], districts: ['Mitte', 'Kreuzberg', 'Charlottenburg'] },
        { name: 'Bayern', code: 'BY', cities: ['München', 'Nürnberg', 'Augsburg'], districts: ['Schwabing', 'Maxvorstadt', 'Altstadt'] },
        { name: 'Hamburg', code: 'HH', cities: ['Hamburg'], districts: ['Altona', 'Eimsbüttel', 'Harburg'] },
        { name: 'Hessen', code: 'HE', cities: ['Frankfurt', 'Wiesbaden'], districts: ['Innenstadt', 'Nordend', 'Sachsenhausen'] },
        { name: 'Nordrhein-Westfalen', code: 'NW', cities: ['Köln', 'Düsseldorf'], districts: ['Ehrenfeld', 'Bilk', 'Lindenthal'] }
      ],
      streets: ['Schillerstraße', 'Goetheallee', 'Bahnhofstraße', 'Gartenweg', 'Bergstraße'],
      house: (r) => `${r.int(1, 180)}${r.bool() ? 'a' : ''}`,
      postal: (r, admin, pre) => `${pre ? pre + r.digits(3) : r.digits(5)}`,
      phone: (r) => `+49 ${r.pick(['30', '89', '40', '69', '221'])} ${r.digits(7)}`,
      localFormat: (p) => [`${p.street} ${p.house}`, `${p.postal} ${p.city}`, 'Deutschland'],
      intlFormat: (p) => [`${p.street} ${p.house}, ${p.postal} ${p.city}, Germany`],
      last: ['Müller', 'Schneider', 'Fischer', 'Weber', 'Wagner', 'Becker'],
      male: ['Lukas', 'Jonas', 'Felix', 'Maximilian', 'Paul'],
      female: ['Anna', 'Mia', 'Lea', 'Emma', 'Hanna'],
      jobs: ['Softwareentwickler', 'Ingenieur', 'Lehrer', 'Buchhalter', 'Designer'],
      companies: ['Beispielwerk GmbH', 'Rheinland Systems', 'Muster Digital GmbH', 'Nordlicht Software AG']
    },
    CA: {
      code: 'CA', alpha3: 'CAN', slug: 'ca-address', flag: '🇨🇦', nameZh: '加拿大', nameEn: 'Canada', nativeName: 'Canada',
      continent: '北美洲', locale: 'en-CA', currency: 'CAD', tz: 'America/Toronto', langCode: 'en', salary: [45000, 150000],
      searchHint: 'Ontario、British Columbia',
      admins: [
        { name: 'Ontario', code: 'ON', cities: ['Toronto', 'Ottawa'], districts: ['Downtown Toronto', 'Centretown', 'Scarborough'] },
        { name: 'British Columbia', code: 'BC', cities: ['Vancouver', 'Victoria'], districts: ['Downtown Vancouver', 'Fairview', 'Oak Bay'] },
        { name: 'Quebec', code: 'QC', cities: ['Montreal', 'Quebec City'], districts: ['Le Plateau', 'Vieux-Québec'] },
        { name: 'Alberta', code: 'AB', cities: ['Calgary', 'Edmonton'], districts: ['Beltline', 'Downtown Edmonton'] }
      ],
      streets: ['King St W', 'Queen St W', 'Yonge Street', 'Granville Street', 'Bank Street'],
      house: (r) => String(r.int(10, 9900)),
      postal: (r, admin, pre) => `${pre || r.pick(['M5V', 'K1A', 'V6B', 'H2Z', 'T2P'])} ${r.int(0, 9)}${r.pick(['A', 'B', 'C', 'E', 'J', 'K'])}${r.int(0, 9)}`,
      phone: (r) => `+1 (${r.pick(['416', '613', '604', '514', '403'])}) 555-${r.digits(4)}`,
      localFormat: (p) => [`${p.house} ${p.street}`, `${p.city}, ${p.adminCode} ${p.postal}`, 'Canada'],
      intlFormat: (p) => [`${p.house} ${p.street}, ${p.city}, ${p.adminCode} ${p.postal}, Canada`],
      last: ['Martin', 'White', 'Clark', 'Lewis', 'Hall', 'Young'],
      male: ['Liam', 'William', 'Owen', 'Nathan', 'Adam'],
      female: ['Olivia', 'Emma', 'Chloe', 'Grace', 'Zoe'],
      jobs: ['Software Developer', 'Registered Nurse', 'Teacher', 'Financial Analyst', 'Electrician'],
      companies: ['Maple Test Labs', 'Northern Fixtures Inc.', 'Bay Street Systems', 'Great Lakes Studio']
    },
    AU: {
      code: 'AU', alpha3: 'AUS', slug: 'au-address', flag: '🇦🇺', nameZh: '澳大利亚', nameEn: 'Australia', nativeName: 'Australia',
      continent: '大洋洲', locale: 'en-AU', currency: 'AUD', tz: 'Australia/Sydney', langCode: 'en', salary: [55000, 160000],
      searchHint: 'New South Wales、Victoria',
      admins: [
        { name: 'New South Wales', code: 'NSW', cities: ['Sydney', 'Newcastle'], districts: ['CBD', 'Surry Hills', 'Newcastle CBD'] },
        { name: 'Victoria', code: 'VIC', cities: ['Melbourne', 'Geelong'], districts: ['Carlton', 'Fitzroy', 'Geelong West'] },
        { name: 'Queensland', code: 'QLD', cities: ['Brisbane', 'Gold Coast'], districts: ['Fortitude Valley', 'South Bank', 'Surfers Paradise'] },
        { name: 'Western Australia', code: 'WA', cities: ['Perth'], districts: ['Perth CBD', 'Fremantle'] }
      ],
      streets: ['George Street', 'Collins Street', 'Queen Street', 'Bourke Street', 'Elizabeth Street'],
      house: (r) => String(r.int(1, 250)),
      postal: (r, admin, pre) => (pre ? `${pre}${r.digits(2)}` : String(r.int(2000, 7999))),
      phone: (r) => `+61 2 ${r.digits(4)} ${r.digits(4)}`,
      localFormat: (p) => [`${p.house} ${p.street}`, `${p.city} ${p.adminCode} ${p.postal}`, 'Australia'],
      intlFormat: (p) => [`${p.house} ${p.street}, ${p.city} ${p.adminCode} ${p.postal}, Australia`],
      last: ['Wilson', 'Taylor', 'Walker', 'Robinson', 'White', 'Brown'],
      male: ['Jack', 'Thomas', 'Henry', 'Oliver', 'Leo'],
      female: ['Chloe', 'Grace', 'Mia', 'Ava', 'Ivy'],
      jobs: ['Software Engineer', 'Tradie', 'Teacher', 'Accountant', 'Marketing Coordinator'],
      companies: ['Southern Cross Labs', 'Harbour Systems Pty Ltd', 'Example Retail AU', 'Kookaburra Studio']
    },
    CN: {
      code: 'CN', alpha3: 'CHN', slug: 'cn-address', flag: '🇨🇳', nameZh: '中国', nameEn: 'China', nativeName: '中国',
      continent: '亚洲', locale: 'zh-CN', currency: 'CNY', tz: 'Asia/Shanghai', langCode: 'zh', salary: [100000, 600000],
      searchHint: '北京市、广东省',
      admins: [
        { name: '北京市', cities: ['朝阳区', '海淀区', '东城区', '西城区'], districts: ['建外街道', '中关村街道', '东华门街道', '望京街道'] },
        { name: '上海市', cities: ['浦东新区', '徐汇区', '静安区', '黄浦区'], districts: ['陆家嘴街道', '徐家汇街道', '南京西路街道'] },
        { name: '广东省', cities: ['深圳市', '广州市', '珠海市', '佛山市'], districts: ['粤海街道', '天河南街道', '香洲街道'] },
        { name: '浙江省', cities: ['杭州市', '宁波市'], districts: ['文新街道', '中山路街道', '钱江街道'] },
        { name: '江苏省', cities: ['南京市', '苏州市'], districts: ['玄武门街道', '平江街道', '鼓楼街道'] }
      ],
      streets: ['建国门外大街', '中关村大街', '南京西路', '深南大道', '文三路', '中山路'],
      house: (r) => `${r.int(1, 300)}号`,
      postal: (r, admin, pre) => `${pre ? pre + r.digits(3) : r.digits(6)}`,
      phone: (r) => `${r.pick(['138', '186', '150', '176', '189'])}-${r.digits(4)}-${r.digits(4)}`,
      localFormat: (p) => [`${p.admin}${p.city}${p.district}${p.street}${p.house}`, `邮编 ${p.postal}`],
      intlFormat: (p) => [`${p.house}, ${p.street}, ${p.district}, ${p.city}, ${p.admin}, ${p.postal}, China`],
      last: ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴'],
      male: ['伟', '强', '军', '磊', '宇航', '子轩', '浩然'],
      female: ['芳', '娜', '敏', '静', '雨婷', '欣怡', '梦琪'],
      romanLast: { '王': 'Wang', '李': 'Li', '张': 'Zhang', '刘': 'Liu', '陈': 'Chen', '杨': 'Yang', '黄': 'Huang', '赵': 'Zhao', '周': 'Zhou', '吴': 'Wu' },
      romanMale: { '伟': 'Wei', '强': 'Qiang', '军': 'Jun', '磊': 'Lei', '宇航': 'Yuhang', '子轩': 'Zixuan', '浩然': 'Haoran' },
      romanFemale: { '芳': 'Fang', '娜': 'Na', '敏': 'Min', '静': 'Jing', '雨婷': 'Yuting', '欣怡': 'Xinyi', '梦琪': 'Mengqi' },
      jobs: ['软件工程师', '产品经理', '设计师', '会计', '教师', '运营专员'],
      companies: ['星河科技有限公司', '微光创意工作室', '测试信息技术有限公司', '南方智造股份有限公司']
    },
    KR: {
      code: 'KR', alpha3: 'KOR', slug: 'kr-address', flag: '🇰🇷', nameZh: '韩国', nameEn: 'South Korea', nativeName: '대한민국',
      continent: '亚洲', locale: 'ko-KR', currency: 'KRW', tz: 'Asia/Seoul', langCode: 'ko', salary: [30000000, 120000000],
      searchHint: '서울、부산',
      admins: [
        { name: '서울특별시', cities: ['마포구', '강남구', '종로구', '성동구'], districts: ['서교동', '역삼동', '견지동', '성수동'] },
        { name: '부산광역시', cities: ['해운대구', '중구'], districts: ['우동', '광복동'] },
        { name: '인천광역시', cities: ['연수구', '부평구'], districts: ['송도동', '부평동'] }
      ],
      streets: ['와우산로', '테헤란로', '종로', '송도과학로'],
      house: (r) => `${r.int(1, 40)}길 ${r.int(1, 60)}`,
      postal: (r, admin, pre) => `${pre ? pre + r.digits(3) : r.digits(5)}`,
      phone: (r) => `010-${r.digits(4)}-${r.digits(4)}`,
      localFormat: (p) => [`${p.admin} ${p.city} ${p.district}`, `${p.street} ${p.house}`, `(${p.postal})`],
      intlFormat: (p) => [`${p.house}, ${p.street}, ${p.district}, ${p.city}, ${p.admin}, ${p.postal}, Republic of Korea`],
      last: [['김', 'Kim'], ['이', 'Lee'], ['박', 'Park'], ['최', 'Choi'], ['정', 'Jung']],
      male: [['민준', 'Minjun'], ['도윤', 'Doyun'], ['지호', 'Jiho'], ['서준', 'Seojun']],
      female: [['서연', 'Seoyeon'], ['지우', 'Jiwoo'], ['하윤', 'Hayun'], ['소율', 'Soyul']],
      jobs: ['엔지니어', '디자이너', '마케터', '회계사', '교사'],
      companies: ['한강테스트 주식회사', '예시시스템', '한빛소프트', '미래디자인']
    },
    SG: {
      code: 'SG', alpha3: 'SGP', slug: 'sg-address', flag: '🇸🇬', nameZh: '新加坡', nameEn: 'Singapore', nativeName: 'Singapore',
      continent: '亚洲', locale: 'en-SG', currency: 'SGD', tz: 'Asia/Singapore', langCode: 'en', salary: [40000, 180000],
      searchHint: 'Central、Jurong',
      admins: [
        { name: 'Central Region', cities: ['Downtown Core', 'River Valley', 'Orchard'], districts: ['Downtown Core', 'Orchard Road', 'River Valley'] },
        { name: 'East Region', cities: ['Tampines', 'Bedok'], districts: ['Tampines Central', 'Bedok North'] },
        { name: 'West Region', cities: ['Jurong East', 'Clementi'], districts: ['Jurong Gateway', 'Clementi Central'] },
        { name: 'North Region', cities: ['Woodlands', 'Yishun'], districts: ['Woodlands Central', 'Yishun Central'] }
      ],
      streets: ['River Valley Road', 'Orchard Road', 'Marina Boulevard', 'Tampines Central', 'Jurong East Street'],
      house: (r) => `${r.pick(['Blk ', ''])}${r.int(1, 88)}`,
      postal: (r, admin, pre) => `${pre ? pre + r.digits(4) : r.digits(6)}`,
      phone: (r) => `+65 ${r.digits(4)} ${r.digits(4)}`,
      localFormat: (p) => [`${p.house} ${p.street}`, `Singapore ${p.postal}`],
      intlFormat: (p) => [`${p.house} ${p.street}, Singapore ${p.postal}`],
      last: ['Tan', 'Lee', 'Lim', 'Wong', 'Goh', 'Chan'],
      male: ['Wei Ming', 'Jun Kai', 'Kai Peng', 'Jia Hao'],
      female: ['Hui Ling', 'Xin Yi', 'Jia Hui', 'Mei Ling'],
      jobs: ['Software Engineer', 'Financial Analyst', 'Marketing Executive', 'Teacher', 'Logistics Coordinator'],
      companies: ['Lion City Labs', 'Marina Systems', 'Example Trading SG', 'Merlion Studio']
    },
    FR: {
      code: 'FR', alpha3: 'FRA', slug: 'fr-address', flag: '🇫🇷', nameZh: '法国', nameEn: 'France', nativeName: 'France',
      continent: '欧洲', locale: 'fr-FR', currency: 'EUR', tz: 'Europe/Paris', langCode: 'fr', salary: [28000, 110000],
      searchHint: 'Paris、Occitanie',
      admins: [
        { name: 'Île-de-France', cities: ['Paris', 'Versailles', 'Boulogne-Billancourt'], districts: ['1er arrondissement', 'Quartier Latin', 'Montmartre'] },
        { name: 'Provence-Alpes-Côte d’Azur', cities: ['Marseille', 'Nice', 'Cannes'], districts: ['Vieux-Port', 'Cannes Centre', 'Nice Étoile'] },
        { name: 'Auvergne-Rhône-Alpes', cities: ['Lyon', 'Grenoble', 'Annecy'], districts: ['Presqu’île', 'Croix-Rousse', 'Centre-ville'] },
        { name: 'Occitanie', cities: ['Toulouse', 'Montpellier'], districts: ['Capitole', 'Écusson'] }
      ],
      streets: ['Rue de la Paix', 'Avenue Victor Hugo', 'Boulevard Saint-Germain', 'Rue du Faubourg', 'Rue des Fleurs'],
      house: (r) => `${r.int(1, 120)}`,
      postal: (r, admin, pre) => `${pre || r.pick(['75', '69', '13', '31', '06'])}${r.digits(3)}`,
      phone: (r) => `+33 ${r.pick(['6', '7'])} ${r.digits(2)} ${r.digits(2)} ${r.digits(2)} ${r.digits(2)}`,
      localFormat: (p) => [`${p.house} ${p.street}`, `${p.postal} ${p.city}`, 'France'],
      intlFormat: (p) => [`${p.house} ${p.street}, ${p.postal} ${p.city}, France`],
      last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit'],
      male: ['Lucas', 'Hugo', 'Léo', 'Louis', 'Antoine'],
      female: ['Emma', 'Jade', 'Louise', 'Chloé', 'Manon'],
      jobs: ['Ingénieur', 'Designer', 'Comptable', 'Enseignant', 'Chargé de projet'],
      companies: ['Exemple SAS', 'Lumière Digital', 'Seine Studio SARL', 'Atelier Test & Co']
    },
    IT: {
      code: 'IT', alpha3: 'ITA', slug: 'it-address', flag: '🇮🇹', nameZh: '意大利', nameEn: 'Italy', nativeName: 'Italia',
      continent: '欧洲', locale: 'it-IT', currency: 'EUR', tz: 'Europe/Rome', langCode: 'it', salary: [25000, 95000],
      searchHint: 'Lombardia、Lazio',
      admins: [
        { name: 'Lombardia', cities: ['Milano', 'Bergamo'], districts: ['Brera', 'Navigli', 'Città Alta'] },
        { name: 'Lazio', cities: ['Roma'], districts: ['Trastevere', 'Monti', 'Prati'] },
        { name: 'Veneto', cities: ['Venezia', 'Verona'], districts: ['San Marco', 'Veronetta'] },
        { name: 'Campania', cities: ['Napoli'], districts: ['Chiaia', 'Vomero'] }
      ],
      streets: ['Via Roma', 'Corso Vittorio Emanuele II', 'Via Dante', 'Via Milano', 'Via Garibaldi'],
      house: (r) => String(r.int(1, 140)),
      postal: (r, admin, pre) => `${pre ? pre + r.digits(2) : r.digits(5)}`,
      phone: (r) => `+39 3${r.digits(2)} ${r.digits(7)}`,
      localFormat: (p) => [`Via ${p.street.replace(/^Via |^Corso |^Via /, '')} ${p.house}`, `${p.postal} ${p.city} (${p.adminCode || p.admin})`, 'Italia'],
      intlFormat: (p) => [`${p.street} ${p.house}, ${p.postal} ${p.city}, Italy`],
      last: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano'],
      male: ['Marco', 'Luca', 'Alessandro', 'Davide', 'Francesco'],
      female: ['Giulia', 'Sofia', 'Martina', 'Chiara', 'Alessia'],
      jobs: ['Ingegnere', 'Designer', 'Ragioniere', 'Insegnante', 'Project Manager'],
      companies: ['Esempio S.r.l.', 'Adriatico Software', 'Via Testa Studio', 'Lombardia Digital S.p.A.']
    },
    ES: {
      code: 'ES', alpha3: 'ESP', slug: 'es-address', flag: '🇪🇸', nameZh: '西班牙', nameEn: 'Spain', nativeName: 'España',
      continent: '欧洲', locale: 'es-ES', currency: 'EUR', tz: 'Europe/Madrid', langCode: 'es', salary: [22000, 90000],
      searchHint: 'Madrid、Cataluña',
      admins: [
        { name: 'Comunidad de Madrid', cities: ['Madrid', 'Alcalá de Henares'], districts: ['Sol', 'Salamanca', 'Lavapiés'] },
        { name: 'Cataluña', cities: ['Barcelona', 'Girona'], districts: ['Eixample', 'Gràcia', 'Barri Gòtic'] },
        { name: 'Andalucía', cities: ['Sevilla', 'Málaga'], districts: ['Triana', 'Centro Histórico'] }
      ],
      streets: ['Calle Mayor', 'Paseo de Gracia', 'Avenida de la Constitución', 'Calle de Alcalá', 'Calle de las Flores'],
      house: (r) => `${r.int(1, 120)}${r.bool() ? `, ${r.int(1, 8)}º ${r.pick(['A', 'B', 'C', 'D'])}` : ''}`,
      postal: (r, admin, pre) => `${pre ? pre + r.digits(2) : r.digits(5)}`,
      phone: (r) => `+34 6${r.digits(2)} ${r.digits(3)} ${r.digits(3)}`,
      localFormat: (p) => [`${p.street}, ${p.house}`, `${p.postal} ${p.city}`, 'España'],
      intlFormat: (p) => [`${p.street} ${p.house}, ${p.postal} ${p.city}, Spain`],
      last: ['García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'Gómez'],
      male: ['Pablo', 'Alejandro', 'Carlos', 'Javier', 'Diego'],
      female: ['Lucía', 'María', 'Carmen', 'Sara', 'Elena'],
      jobs: ['Ingeniero', 'Diseñador', 'Contable', 'Profesor', 'Comercial'],
      companies: ['Ejemplo S.L.', 'Mediterráneo Digital', 'Prado Studio', 'Iberia Test Systems']
    },
    NL: {
      code: 'NL', alpha3: 'NLD', slug: 'nl-address', flag: '🇳🇱', nameZh: '荷兰', nameEn: 'Netherlands', nativeName: 'Nederland',
      continent: '欧洲', locale: 'nl-NL', currency: 'EUR', tz: 'Europe/Amsterdam', langCode: 'nl', salary: [32000, 120000],
      searchHint: 'Noord-Holland、Utrecht',
      admins: [
        { name: 'Noord-Holland', cities: ['Amsterdam', 'Haarlem'], districts: ['Centrum', 'De Pijp', 'Haarlem Noord'] },
        { name: 'Zuid-Holland', cities: ['Rotterdam', 'Den Haag'], districts: ['Kop van Zuid', 'Centrum', 'Scheveningen'] },
        { name: 'Utrecht', cities: ['Utrecht', 'Amersfoort'], districts: ['Binnenstad', 'Lombok'] }
      ],
      streets: ['Keizersgracht', 'Kalverstraat', 'Damrak', 'Lange Voorhout', 'Oude Gracht'],
      house: (r) => `${r.int(1, 320)}${r.bool() ? '-' + r.int(1, 3) : ''}`,
      postal: (r, admin, pre) => `${pre ? pre + r.digits(2) : r.digits(4)} ${r.pick(['AA', 'AB', 'BC', 'CD', 'XY'])}`,
      phone: (r) => `+31 6 ${r.digits(4)} ${r.digits(4)}`,
      localFormat: (p) => [`${p.street} ${p.house}`, `${p.postal} ${p.city}`, 'Nederland'],
      intlFormat: (p) => [`${p.street} ${p.house}, ${p.postal} ${p.city}, Netherlands`],
      last: ['De Vries', 'Jansen', 'Bakker', 'Visser', 'Smit', 'Meijer'],
      male: ['Daan', 'Sem', 'Lars', 'Bram', 'Jesse'],
      female: ['Emma', 'Julia', 'Sophie', 'Lotte', 'Anna'],
      jobs: ['Softwareontwikkelaar', 'Ontwerper', 'Boekhouder', 'Leraar', 'Projectmanager'],
      companies: ['Voorbeeld B.V.', 'Gracht Digital', 'Tulip Systems', 'Polder Studio']
    },
    BR: {
      code: 'BR', alpha3: 'BRA', slug: 'br-address', flag: '🇧🇷', nameZh: '巴西', nameEn: 'Brazil', nativeName: 'Brasil',
      continent: '南美洲', locale: 'pt-BR', currency: 'BRL', tz: 'America/Sao_Paulo', langCode: 'pt', salary: [30000, 250000],
      searchHint: 'São Paulo、Rio de Janeiro',
      admins: [
        { name: 'São Paulo', code: 'SP', cities: ['São Paulo', 'Campinas', 'Santos'], districts: ['Jardins', 'Pinheiros', 'Vila Madalena'] },
        { name: 'Rio de Janeiro', code: 'RJ', cities: ['Rio de Janeiro', 'Niterói'], districts: ['Copacabana', 'Ipanema', 'Centro'] },
        { name: 'Minas Gerais', code: 'MG', cities: ['Belo Horizonte'], districts: ['Savassi', 'Centro'] }
      ],
      streets: ['Rua das Flores', 'Avenida Paulista', 'Rua Augusta', 'Avenida Atlântica', 'Rua da Consolação'],
      house: (r) => `${r.int(10, 1999)}${r.bool() ? ' - Apto ' + r.int(10, 902) : ''}`,
      postal: (r, admin, pre) => `${pre ? pre + r.digits(2) : r.digits(5)}-${r.digits(3)}`,
      phone: (r) => `+55 ${r.pick(['11', '21', '31'])} 9${r.digits(4)}-${r.digits(4)}`,
      localFormat: (p) => [`${p.street}, ${p.house}`, `${p.district}, ${p.city} - ${p.adminCode}, ${p.postal}`, 'Brasil'],
      intlFormat: (p) => [`${p.street} ${p.house}, ${p.city}, ${p.adminCode} ${p.postal}, Brazil`],
      last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira'],
      male: ['Miguel', 'Arthur', 'Gabriel', 'Pedro', 'Lucas'],
      female: ['Helena', 'Alice', 'Laura', 'Maria', 'Sophia'],
      jobs: ['Engenheiro de Software', 'Designer', 'Contador', 'Professor', 'Analista de Marketing'],
      companies: ['Exemplo Ltda', 'Copa Studio', 'Ipiranga Systems', 'Verde Digital']
    },
    TW: {
      code: 'TW', alpha3: 'TWN', slug: 'tw-address', flag: '🇹🇼', nameZh: '台湾', nameEn: 'Taiwan', nativeName: '臺灣',
      continent: '亚洲', locale: 'zh-TW', currency: 'TWD', tz: 'Asia/Taipei', langCode: 'zh', salary: [400000, 2200000],
      searchHint: '臺北市、新北市',
      admins: [
        { name: '臺北市', cities: ['大安區', '信義區', '中山區', '士林區'], districts: ['龍圖里', '興雅里', '晴光里', '蘭雅里'] },
        { name: '新北市', cities: ['板橋區', '新莊區', '中和區'], districts: ['幸福里', '榮和里'] },
        { name: '高雄市', cities: ['前鎮區', '鼓山區', '左營區'], districts: ['三多里', '龍水里'] },
        { name: '臺中市', cities: ['西屯區', '南屯區'], districts: ['惠來里', '豐樂里'] }
      ],
      streets: ['忠孝東路', '復興南路', '仁愛路', '民生東路', '敦化南路'],
      house: (r) => `${r.int(1, 300)}號${r.bool() ? r.int(1, 12) + '樓' : ''}`,
      postal: (r, admin, pre) => `${pre || r.pick(['106', '110', '104', '111', '220', '806', '407'])}${r.digits(2)}`,
      phone: (r) => `09${r.digits(2)}-${r.digits(3)}-${r.digits(3)}`,
      localFormat: (p) => [`${p.postal}`, `${p.admin}${p.city}${p.street}${p.house}`],
      intlFormat: (p) => [`${p.house}, ${p.street}, ${p.city}, ${p.admin} ${p.postal}, Taiwan`],
      last: [['陳', 'Chen'], ['林', 'Lin'], ['黃', 'Huang'], ['張', 'Chang'], ['李', 'Lee'], ['王', 'Wang']],
      male: [['家豪', 'Jia-Hao'], ['志明', 'Chih-Ming'], ['冠廷', 'Guan-Ting'], ['建宏', 'Chien-Hung']],
      female: [['淑芬', 'Shu-Fen'], ['雅婷', 'Ya-Ting'], ['怡君', 'Yi-Chun'], ['佳穎', 'Chia-Ying']],
      jobs: ['軟體工程師', '產品經理', '設計師', '會計', '行銷企劃'],
      companies: ['測試科技股份有限公司', '藍海數位有限公司', '範例工作室', '光點資訊股份有限公司']
    },
    HK: {
      code: 'HK', alpha3: 'HKG', slug: 'hk-address', flag: '🇭🇰', nameZh: '香港', nameEn: 'Hong Kong', nativeName: '香港',
      continent: '亚洲', locale: 'zh-HK', currency: 'HKD', tz: 'Asia/Hong_Kong', langCode: 'zh', salary: [180000, 900000],
      searchHint: '九龍、香港島',
      admins: [
        { name: '香港島', cities: ['中環', '銅鑼灣', '灣仔'], districts: ['半山', '天后', '跑馬地'] },
        { name: '九龍', cities: ['旺角', '尖沙咀', '觀塘'], districts: ['油麻地', '佐敦', '牛頭角'] },
        { name: '新界', cities: ['荃灣', '沙田', '元朗'], districts: ['荃灣市中心', '沙田圍', '天水圍'] }
      ],
      streets: ['皇后大道中', '彌敦道', '軒尼詩道', '德輔道中', '加拿分道'],
      house: (r) => `${r.int(1, 99)}號${r.int(1, 30)}樓`,
      postal: () => '',
      phone: (r) => `+852 ${r.digits(4)} ${r.digits(4)}`,
      localFormat: (p) => [`${p.admin} ${p.city}`, `${p.street} ${p.house}`],
      intlFormat: (p) => [`${p.house}, ${p.street}, ${p.city}, ${p.admin}, Hong Kong`],
      last: [['陳', 'Chan'], ['李', 'Lee'], ['黃', 'Wong'], ['何', 'Ho'], ['鄭', 'Cheng']],
      male: [['家俊', 'Ka Chun'], ['志強', 'Chi Keung'], ['偉業', 'Wai Yip']],
      female: [['美玲', 'Mei Ling'], ['嘉欣', 'Ka Yan'], ['淑儀', 'Shuk Yi']],
      jobs: ['軟體工程師', '金融分析師', '設計師', '教師', '市場主任'],
      companies: ['維港科技有限公司', '測試金融有限公司', '獅子山工作室', '港灣貿易有限公司']
    },
    MY: {
      code: 'MY', alpha3: 'MYS', slug: 'my-address', flag: '🇲🇾', nameZh: '马来西亚', nameEn: 'Malaysia', nativeName: 'Malaysia',
      continent: '亚洲', locale: 'ms-MY', currency: 'MYR', tz: 'Asia/Kuala_Lumpur', langCode: 'ms', salary: [36000, 240000],
      searchHint: 'Kuala Lumpur、Selangor',
      admins: [
        { name: 'Kuala Lumpur', cities: ['Kuala Lumpur'], districts: ['KLCC', 'Bukit Bintang', 'Bangsar'] },
        { name: 'Selangor', cities: ['Shah Alam', 'Petaling Jaya', 'Subang Jaya'], districts: ['Section 7', 'Damansara', 'SS15'] },
        { name: 'Penang', cities: ['George Town', 'Butterworth'], districts: ['Georgetown Heritage', 'Seberang Jaya'] },
        { name: 'Johor', cities: ['Johor Bahru'], districts: ['Sentosa', 'Taman Molek'] }
      ],
      streets: ['Jalan Bukit Bintang', 'Jalan Ampang', 'Lebuh Pantai', 'Jalan Sultan Ismail'],
      house: (r) => `${r.int(1, 88)}${r.bool() ? '-' + r.int(1, 12) : ''}`,
      postal: (r, admin, pre) => `${pre || r.pick(['50', '40', '10', '80'])}${r.digits(3)}`,
      phone: (r) => `+60 ${r.pick(['12', '13', '19', '16'])}-${r.digits(3)} ${r.digits(4)}`,
      localFormat: (p) => [`No. ${p.house}, ${p.street}`, `${p.postal} ${p.city}`, `${p.admin}`, 'Malaysia'],
      intlFormat: (p) => [`No. ${p.house}, ${p.street}, ${p.postal} ${p.city}, ${p.admin}, Malaysia`],
      last: ['bin Abdullah', 'Tan', 'Lim', 'Lee', 'bin Hassan', 'Wong'],
      male: ['Ahmad', 'Wei Jian', 'Daniel', 'Hafiz', 'Kah Hoe'],
      female: ['Nurul', 'Mei Ling', 'Siti', 'Xin Yi', 'Priya'],
      jobs: ['Software Engineer', 'Account Executive', 'Teacher', 'Marketing Officer', 'QA Engineer'],
      companies: ['Contoh Sdn Bhd', 'KL Digital Labs', 'Penang Systems', 'Testa Tech Sdn Bhd']
    },
    RU: {
      code: 'RU', alpha3: 'RUS', slug: 'ru-address', flag: '🇷🇺', nameZh: '俄罗斯', nameEn: 'Russia', nativeName: 'Россия',
      continent: '欧洲', locale: 'ru-RU', currency: 'RUB', tz: 'Europe/Moscow', langCode: 'ru', salary: [600000, 4200000],
      searchHint: 'Москва、Санкт-Петербург',
      admins: [
        { name: 'Москва', cities: ['Москва'], districts: ['Арбат', 'Сокольники', 'Хамовники'] },
        { name: 'Санкт-Петербург', cities: ['Санкт-Петербург'], districts: ['Невский район', 'Центральный район'] },
        { name: 'Московская область', cities: ['Химки', 'Балашиха'], districts: ['мкр. Сходня', 'мкр. Изумрудный'] }
      ],
      streets: ['ул. Тверская', 'Ленинский проспект', 'ул. Арбат', 'Садовая улица'],
      house: (r) => `${r.int(1, 90)}${r.bool() ? ', кв. ' + r.int(1, 220) : ''}`,
      postal: (r, admin, pre) => { const head = pre || r.pick(['10', '19']); return `${head}${r.digits(6 - head.length)}`; },
      phone: (r) => `+7 (${r.pick(['903', '916', '925', '812'])}) ${r.digits(3)}-${r.digits(2)}-${r.digits(2)}`,
      localFormat: (p) => [`${p.street}, д. ${p.house}`, `${p.city}, ${p.admin}`, `${p.postal}`],
      intlFormat: (p) => [`${p.street} ${p.house}, ${p.city}, ${p.postal}, Russia`],
      last: [['Иванов', 'Ivanov'], ['Смирнов', 'Smirnov'], ['Кузнецов', 'Kuznetsov'], ['Соколов', 'Sokolov'], ['Попов', 'Popov']],
      male: [['Алексей', 'Alexey'], ['Дмитрий', 'Dmitry'], ['Сергей', 'Sergey'], ['Иван', 'Ivan']],
      female: [['Анна', 'Anna'], ['Елена', 'Elena'], ['Мария', 'Maria'], ['Ольга', 'Olga']],
      jobs: ['Инженер-программист', 'Дизайнер', 'Бухгалтер', 'Учитель', 'Менеджер проекта'],
      companies: ['ООО «Пример»', 'Северный Софт', 'Тест-Системы', 'Технолоджи Плюс']
    },
    TH: {
      code: 'TH', alpha3: 'THA', slug: 'th-address', flag: '🇹🇭', nameZh: '泰国', nameEn: 'Thailand', nativeName: 'ไทย',
      continent: '亚洲', locale: 'th-TH', currency: 'THB', tz: 'Asia/Bangkok', langCode: 'th', salary: [240000, 1800000],
      searchHint: 'Bangkok、Chiang Mai',
      admins: [
        { name: 'Bangkok', cities: ['Bangkok'], districts: ['Sukhumvit', 'Silom', 'Thonglor'] },
        { name: 'Chiang Mai', cities: ['Chiang Mai'], districts: ['Nimmanhaemin', 'Old City'] },
        { name: 'Phuket', cities: ['Phuket'], districts: ['Patong', 'Kata'] },
        { name: 'Chonburi', cities: ['Pattaya'], districts: ['Beach Road', 'Jomtien'] }
      ],
      streets: ['Sukhumvit Rd', 'Silom Rd', 'Ratchadamri Rd', 'Nimmanhaemin Rd'],
      house: (r) => `${r.int(1, 199)}/${r.int(1, 30)}`,
      postal: (r, admin, pre) => `${pre || r.pick(['10', '20', '50', '83'])}${r.digits(3)}`,
      phone: (r) => `+66 ${r.pick(['81', '85', '89', '92'])}-${r.digits(3)}-${r.digits(4)}`,
      localFormat: (p) => [`${p.house} ${p.street}`, `${p.district}, ${p.city} ${p.postal}`],
      intlFormat: (p) => [`${p.house} ${p.street}, ${p.district}, ${p.city} ${p.postal}, Thailand`],
      last: ['Jaidee', 'Pramual', 'Rakkan', 'Sukjai', 'Chaiyarit'],
      male: ['Somchai', 'Anan', 'Nattapong', 'Krit'],
      female: ['Suda', 'Malee', 'Ploy', 'Nicha'],
      jobs: ['Software Developer', 'Tour Guide', 'Accountant', 'Teacher', 'Marketing Specialist'],
      companies: ['Siam Test Co., Ltd.', 'Chao Phraya Digital', 'Lanna Studio', 'Bangkok Systems Co., Ltd.']
    },
    PH: {
      code: 'PH', alpha3: 'PHL', slug: 'ph-address', flag: '🇵🇭', nameZh: '菲律宾', nameEn: 'Philippines', nativeName: 'Pilipinas',
      continent: '亚洲', locale: 'en-PH', currency: 'PHP', tz: 'Asia/Manila', langCode: 'en', salary: [200000, 1600000],
      searchHint: 'Metro Manila、Cebu',
      admins: [
        { name: 'Metro Manila', cities: ['Makati', 'Quezon City', 'Taguig'], districts: ['San Antonio Village', 'Barangay Poblacion', 'BGC'] },
        { name: 'Central Visayas', cities: ['Cebu City'], districts: ['Lahug', 'Mandaue'] },
        { name: 'Davao Region', cities: ['Davao City'], districts: ['Matina', 'Bajada'] }
      ],
      streets: ['Rizal Street', 'Bonifacio Drive', 'Mabini Street', 'Delaware Street'],
      house: (r) => `${r.int(1, 250)}`,
      postal: (r, admin, pre) => `${pre || r.pick(['12', '16', '11', '60'])}${r.digits(2)}`,
      phone: (r) => `+63 9${r.digits(2)} ${r.digits(3)} ${r.digits(4)}`,
      localFormat: (p) => [`${p.house} ${p.street}, ${p.district}`, `${p.city}, ${p.admin} ${p.postal}`],
      intlFormat: (p) => [`${p.house} ${p.street}, ${p.district}, ${p.city}, ${p.admin} ${p.postal}, Philippines`],
      last: ['Dela Cruz', 'Santos', 'Reyes', 'Bautista', 'Ocampo'],
      male: ['Juan', 'Jose', 'Miguel', 'Rafael'],
      female: ['Maria', 'Ana', 'Jasmine', 'Katrina'],
      jobs: ['Software Developer', 'Customer Support Specialist', 'Accountant', 'Teacher', 'Virtual Assistant'],
      companies: ['Halimbawa Corp', 'Manila Tech Hub', 'Test Systems PH', 'Bayanihan Studio']
    },
    AR: {
      code: 'AR', alpha3: 'ARG', slug: 'ar-address', flag: '🇦🇷', nameZh: '阿根廷', nameEn: 'Argentina', nativeName: 'Argentina',
      continent: '南美洲', locale: 'es-AR', currency: 'ARS', tz: 'America/Argentina/Buenos_Aires', langCode: 'es', salary: [2400000, 18000000],
      searchHint: 'Buenos Aires、Córdoba',
      admins: [
        { name: 'Buenos Aires', cities: ['Buenos Aires'], districts: ['Palermo', 'Recoleta', 'Belgrano'] },
        { name: 'Córdoba', cities: ['Córdoba'], districts: ['Nueva Córdoba', 'Centro'] },
        { name: 'Santa Fe', cities: ['Rosario'], districts: ['Centro', 'Pichincha'] }
      ],
      streets: ['Av. Santa Fe', 'Calle Corrientes', 'Av. de Mayo', 'Calle Defensa'],
      house: (r) => `${r.int(100, 5900)}`,
      postal: (r, admin, pre) => `${pre || r.pick(['C1', 'X5', 'S2'])}${r.digits(3)}${r.pick(['A', 'B', 'C', 'D'])}${r.pick(['A', 'B', 'C', 'D'])}${r.pick(['A', 'B', 'C'])}`,
      phone: (r) => `+54 11 ${r.digits(4)}-${r.digits(4)}`,
      localFormat: (p) => [`${p.street} ${p.house}`, `${p.postal} ${p.city}`, 'Argentina'],
      intlFormat: (p) => [`${p.street} ${p.house}, ${p.postal} ${p.city}, Argentina`],
      last: ['González', 'Rodríguez', 'Fernández', 'López', 'García'],
      male: ['Mateo', 'Santiago', 'Joaquín', 'Tomás'],
      female: ['Valentina', 'Camila', 'Sofía', 'Isabella'],
      jobs: ['Desarrollador', 'Diseñador', 'Contador', 'Profesor', 'Analista'],
      companies: ['Ejemplo S.A.', 'Pampa Digital', 'Río de Plata Studio', 'Austral Systems']
    },
    TR: {
      code: 'TR', alpha3: 'TUR', slug: 'tr-address', flag: '🇹🇷', nameZh: '土耳其', nameEn: 'Türkiye', nativeName: 'Türkiye',
      continent: '亚洲', locale: 'tr-TR', currency: 'TRY', tz: 'Europe/Istanbul', langCode: 'tr', salary: [180000, 1200000],
      searchHint: 'İstanbul、Ankara',
      admins: [
        { name: 'İstanbul', cities: ['İstanbul'], districts: ['Kadıköy', 'Beşiktaş', 'Şişli'], zp: '34' },
        { name: 'Ankara', cities: ['Ankara'], districts: ['Çankaya', 'Kızılay'], zp: '06' },
        { name: 'İzmir', cities: ['İzmir'], districts: ['Konak', 'Bornova'], zp: '35' }
      ],
      streets: ['Bağdat Caddesi', 'İstiklal Caddesi', 'Atatürk Bulvarı', 'Sahil Yolu'],
      house: (r) => `No:${r.int(1, 180)}${r.bool() ? '/' + r.int(1, 20) : ''}`,
      postal: (r, admin, pre) => `${pre || (admin && admin.zp) || '34'}${r.digits(3)}`,
      phone: (r) => `+90 5${r.digits(2)} ${r.digits(3)} ${r.digits(2)} ${r.digits(2)}`,
      localFormat: (p) => [`${p.street} ${p.house}`, `${p.district}, ${p.city} ${p.postal}`, 'Türkiye'],
      intlFormat: (p) => [`${p.street} ${p.house}, ${p.district}, ${p.city} ${p.postal}, Türkiye`],
      last: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik'],
      male: ['Emre', 'Mehmet', 'Burak', 'Can'],
      female: ['Elif', 'Zeynep', 'Merve', 'Selin'],
      jobs: ['Yazılım Mühendisi', 'Tasarımcı', 'Muhasebeci', 'Öğretmen', 'Proje Yöneticisi'],
      companies: ['Örnek A.Ş.', 'Boğaz Yazılım', 'Test Sistemleri Ltd.', 'Anadolu Dijital']
    }
  };
  // -----------------------------
  // 城市级数据：街道/街区名与区县按城市绑定，避免出现"东京都里的梅田"这类跨城市错配。
  // 缺失的城市回退到国家级街道池；没有可靠区县时不显示区县字段（不伪造行政层级）。
  // -----------------------------
  const CITY_DATA = {
    JP: {
      '新宿区': { streets: ['西新宿', '歌舞伎町', '新宿', '北新宿'] },
      '渋谷区': { streets: ['神南', '道玄坂', '恵比寿', '代々木'] },
      '千代田区': { streets: ['丸の内', '大手町', '神田神保町', '永田町'] },
      '世田谷区': { streets: ['北沢', '三軒茶屋', '駒沢', '用賀'] },
      '八王子市': { streets: ['旭町', '横山町', '子安町', '明神町'] },
      '大阪市': { streets: ['梅田', '心斎橋', '難波', '本町'], districts: ['北区', '中央区', '浪速区'] },
      '堺市': { streets: ['戎島町', '北瓦町', '中之町'], districts: ['堺区', '中区'] },
      '豊中市': { streets: ['蛍池中町', '岡町', '新千里東町'] },
      '京都市': { streets: ['五条', '四条', '河原町', '烏丸'], districts: ['中京区', '下京区', '上京区'] },
      '宇治市': { streets: ['宇治蓮華', '小倉町', '大久保町'] },
      '札幌市': { streets: ['大通西', '北一条西', '南三条西'], districts: ['中央区', '豊平区', '北区'] },
      '函館市': { streets: ['本町', '末広町', '湯川町'] },
      '旭川市': { streets: ['一条通', '五条通', '緑町'] },
      '福岡市': { streets: ['天神', '博多駅前', '大濠公園'], districts: ['博多区', '中央区'] },
      '北九州市': { streets: ['魚町', '浅野', '黒崎'], districts: ['小倉北区', '八幡東区'] },
      '横浜市': { streets: ['関内', 'みなとみらい', '元町', '新横浜'], districts: ['中区', '西区', '港北区'] },
      '川崎市': { streets: ['駅前本町', '溝口', '小杉町'], districts: ['川崎区', '高津区'] }
    },
    US: {
      'Los Angeles': { districts: ['Los Angeles County'] },
      'San Francisco': { districts: ['San Francisco County'] },
      'San Diego': { districts: ['San Diego County'] },
      'Sacramento': { districts: ['Sacramento County'] },
      'New York': { districts: ['New York County'] },
      'Buffalo': { districts: ['Erie County'] },
      'Albany': { districts: ['Albany County'] },
      'Austin': { districts: ['Travis County'] },
      'Dallas': { districts: ['Dallas County'] },
      'Houston': { districts: ['Harris County'] },
      'Miami': { districts: ['Miami-Dade County'] },
      'Orlando': { districts: ['Orange County'] },
      'Tampa': { districts: ['Hillsborough County'] },
      'Seattle': { districts: ['King County'] },
      'Tacoma': { districts: ['Pierce County'] },
      'Chicago': { districts: ['Cook County'] },
      'Springfield': { districts: ['Sangamon County'] }
    },
    GB: {
      London: { districts: ['Westminster', 'Camden', 'Islington'] },
      Manchester: { districts: ['Northern Quarter', 'Ancoats'] },
      Birmingham: { districts: ['Digbeth', 'Jewellery Quarter'] },
      Leeds: { districts: ['Headingley', 'City Centre'] },
      Edinburgh: { districts: ['Old Town', 'New Town'] },
      Glasgow: { districts: ['West End', 'Merchant City'] },
      Cardiff: { districts: ['Cathays', 'City Centre'] },
      Swansea: { districts: ['Marina', 'Uplands'] }
    },
    DE: {
      Berlin: { districts: ['Mitte', 'Kreuzberg', 'Charlottenburg'] },
      'München': { districts: ['Schwabing', 'Maxvorstadt', 'Altstadt'] },
      'Nürnberg': { districts: ['Altstadt', 'Gostenhof'] },
      Augsburg: { districts: ['Innenstadt', 'Lechhausen'] },
      Hamburg: { districts: ['Altona', 'Eimsbüttel', 'Harburg'] },
      Frankfurt: { districts: ['Innenstadt', 'Nordend', 'Sachsenhausen'] },
      Wiesbaden: { districts: ['Innenstadt', 'Biebrich'] },
      'Köln': { districts: ['Ehrenfeld', 'Lindenthal'] },
      'Düsseldorf': { districts: ['Bilk', 'Pempelfort'] }
    },
    CA: {
      Toronto: { streets: ['Yonge Street', 'King St W', 'Queen St W'], districts: ['Downtown Toronto', 'Scarborough'] },
      Ottawa: { streets: ['Bank Street', 'Elgin Street', 'Rideau Street'], districts: ['Centretown', 'Kanata'] },
      Vancouver: { streets: ['Granville Street', 'Robson Street', 'West Broadway'], districts: ['Downtown Vancouver', 'Fairview'] },
      Victoria: { streets: ['Douglas Street', 'Government Street'], districts: ['Oak Bay', 'James Bay'] },
      Montreal: { streets: ['Rue Sainte-Catherine', 'Boulevard Saint-Laurent'], districts: ['Le Plateau', 'Ville-Marie'] },
      'Quebec City': { streets: ['Rue Saint-Jean', 'Grande Allée'], districts: ['Vieux-Québec', 'Sainte-Foy'] },
      Calgary: { streets: ['17 Avenue SW', 'Stephen Avenue'], districts: ['Beltline', 'Kensington'] },
      Edmonton: { streets: ['Jasper Avenue', 'Whyte Avenue'], districts: ['Downtown Edmonton', 'Oliver'] }
    },
    AU: {
      Sydney: { streets: ['George Street', 'Elizabeth Street', 'Crown Street'], districts: ['CBD', 'Surry Hills'] },
      Newcastle: { streets: ['Hunter Street', 'Beaumont Street'], districts: ['Newcastle CBD', 'Hamilton'] },
      Melbourne: { streets: ['Collins Street', 'Bourke Street', 'Lygon Street'], districts: ['Carlton', 'Fitzroy'] },
      Geelong: { streets: ['Moorabool Street', 'Pakington Street'], districts: ['Geelong West', 'Newtown'] },
      Brisbane: { streets: ['Queen Street', 'Adelaide Street', 'Grey Street'], districts: ['Fortitude Valley', 'South Bank'] },
      'Gold Coast': { streets: ['Surfers Paradise Boulevard', 'Gold Coast Highway'], districts: ['Surfers Paradise', 'Broadbeach'] },
      Perth: { streets: ['St Georges Terrace', 'Hay Street', 'South Terrace'], districts: ['Perth CBD', 'Fremantle'] }
    },
    CN: {
      '朝阳区': { streets: ['建国路', '朝阳门外大街', '望京东路'] },
      '海淀区': { streets: ['中关村大街', '知春路', '学院路'] },
      '东城区': { streets: ['王府井大街', '东单北大街', '朝阳门内大街'] },
      '西城区': { streets: ['金融大街', '西直门外大街', '复兴门内大街'] },
      '浦东新区': { streets: ['世纪大道', '张杨路', '陆家嘴环路'] },
      '徐汇区': { streets: ['淮海中路', '漕溪北路', '衡山路'] },
      '静安区': { streets: ['南京西路', '延安中路', '常德路'] },
      '黄浦区': { streets: ['南京东路', '西藏中路', '中山东一路'] },
      '深圳市': { streets: ['科技南十二路', '深南大道', '华强北路'], districts: ['南山区', '福田区', '罗湖区'] },
      '广州市': { streets: ['天河路', '中山大道', '珠江新城'], districts: ['天河区', '越秀区', '海珠区'] },
      '珠海市': { streets: ['情侣中路', '九洲大道'], districts: ['香洲区', '金湾区'] },
      '佛山市': { streets: ['季华五路', '魁奇路'], districts: ['禅城区', '南海区'] },
      '杭州市': { streets: ['文三路', '延安路', '江南大道'], districts: ['西湖区', '上城区', '滨江区'] },
      '宁波市': { streets: ['中山东路', '百丈路'], districts: ['海曙区', '鄞州区'] },
      '南京市': { streets: ['中山东路', '珠江路'], districts: ['玄武区', '鼓楼区'] },
      '苏州市': { streets: ['干将东路', '星海街'], districts: ['姑苏区', '工业园区'] }
    },
    KR: {
      '마포구': { streets: ['양화로', '월드컵북로', '독막로'], districts: ['서교동', '합정동', '공덕동'] },
      '강남구': { streets: ['테헤란로', '봉은사로', '도산대로'], districts: ['역삼동', '삼성동', '청담동'] },
      '종로구': { streets: ['종로', '사직로', '율곡로'], districts: ['사직동', '삼청동', '견지동'] },
      '성동구': { streets: ['왕십리로', '성수이로'], districts: ['성수동', '왕십리동'] },
      '해운대구': { streets: ['해운대해변로', '센텀중앙로'], districts: ['우동', '중동'] },
      '중구': { streets: ['중앙대로', '광복로'], districts: ['광복동', '남포동'] },
      '연수구': { streets: ['송도과학로', '컨벤시아대로'], districts: ['송도동', '연수동'] },
      '부평구': { streets: ['부평대로', '경인로'], districts: ['부평동', '십정동'] }
    },
    TW: {
      '大安區': { streets: ['復興南路', '信義路四段', '敦化南路'] },
      '信義區': { streets: ['松高路', '信義路五段', '基隆路'] },
      '中山區': { streets: ['南京東路', '民生東路', '中山北路'] },
      '士林區': { streets: ['中正路', '文林路'] },
      '板橋區': { streets: ['文化路', '縣民大道'] },
      '新莊區': { streets: ['中正路', '思源路'] },
      '中和區': { streets: ['中山路', '景平路'] },
      '前鎮區': { streets: ['三多三路', '中山二路'] },
      '鼓山區': { streets: ['明誠三路', '裕誠路'] },
      '左營區': { streets: ['博愛二路', '民族一路'] },
      '西屯區': { streets: ['台灣大道', '市政路'] },
      '南屯區': { streets: ['五權西路', '黎明路'] }
    },
    HK: {
      '中環': { streets: ['皇后大道中', '德輔道中', '雲咸街'] },
      '銅鑼灣': { streets: ['軒尼詩道', '怡和街', '禮頓道'] },
      '灣仔': { streets: ['莊士敦道', '皇后大道東', '告士打道'] },
      '旺角': { streets: ['彌敦道', '亞皆老街', '西洋菜南街'] },
      '尖沙咀': { streets: ['彌敦道', '廣東道', '梳士巴利道'] },
      '觀塘': { streets: ['觀塘道', '鴻圖道', '偉業街'] },
      '荃灣': { streets: ['青山公路', '大河道', '沙咀道'] },
      '沙田': { streets: ['沙田正街', '大涌橋路', '沙田鄉事會路'] },
      '元朗': { streets: ['青山公路', '元朗大馬路', '教育路'] }
    },
    BR: {
      'São Paulo': { streets: ['Avenida Paulista', 'Rua Augusta', 'Rua da Consolação'], districts: ['Jardins', 'Pinheiros', 'Vila Madalena'] },
      Campinas: { streets: ['Avenida Norte-Sul', 'Rua Barão de Jaguara'], districts: ['Cambuí', 'Centro'] },
      Santos: { streets: ['Avenida Ana Costa', 'Avenida Presidente Wilson'], districts: ['Gonzaga', 'Boqueirão'] },
      'Rio de Janeiro': { streets: ['Avenida Atlântica', 'Rua Visconde de Pirajá', 'Avenida Rio Branco'], districts: ['Copacabana', 'Ipanema', 'Centro'] },
      'Niterói': { streets: ['Rua Moreira César', 'Avenida Amaral Peixoto'], districts: ['Icaraí', 'Centro'] },
      'Belo Horizonte': { streets: ['Avenida Afonso Pena', 'Rua Pernambuco'], districts: ['Savassi', 'Centro'] }
    },
    TH: {
      Bangkok: { streets: ['Sukhumvit Rd', 'Silom Rd', 'Ratchadamri Rd'], districts: ['Sukhumvit', 'Silom', 'Thonglor'] },
      'Chiang Mai': { streets: ['Nimmanhaemin Rd', 'Huay Kaew Rd'], districts: ['Nimmanhaemin', 'Old City'] },
      Phuket: { streets: ['Thaweewong Rd', 'Kata Rd'], districts: ['Patong', 'Kata'] },
      Pattaya: { streets: ['Pattaya Beach Rd', 'Thappraya Rd'], districts: ['Beach Road', 'Jomtien'] }
    },
    PH: {
      Makati: { streets: ['Ayala Avenue', 'Makati Avenue'], districts: ['San Antonio Village', 'Poblacion'] },
      'Quezon City': { streets: ['Katipunan Avenue', 'Timog Avenue'], districts: ['Diliman', 'Cubao'] },
      Taguig: { streets: ['32nd Street', 'McKinley Parkway'], districts: ['Bonifacio Global City', 'Bagumbayan'] },
      'Cebu City': { streets: ['Osmeña Boulevard', 'Salinas Drive'], districts: ['Lahug', 'Capitol Site'] },
      'Davao City': { streets: ['J.P. Laurel Avenue', 'Quimpo Boulevard'], districts: ['Matina', 'Bajada'] }
    },
    TR: {
      'İstanbul': { streets: ['Bağdat Caddesi', 'İstiklal Caddesi', 'Barbaros Bulvarı'], districts: ['Kadıköy', 'Beşiktaş', 'Şişli'] },
      Ankara: { streets: ['Atatürk Bulvarı', 'Tunalı Hilmi Caddesi'], districts: ['Çankaya', 'Kızılay'] },
      'İzmir': { streets: ['Kordon Boyu', 'Gazi Bulvarı'], districts: ['Konak', 'Bornova'] }
    },
    AR: {
      'Buenos Aires': { streets: ['Av. Santa Fe', 'Calle Corrientes', 'Av. de Mayo'], districts: ['Palermo', 'Recoleta', 'Belgrano'] },
      'Córdoba': { streets: ['Av. Colón', 'Calle San Martín'], districts: ['Nueva Córdoba', 'Centro'] },
      Rosario: { streets: ['Calle Córdoba', 'Bv. Oroño'], districts: ['Centro', 'Pichincha'] }
    },
    FR: {
      Paris: { districts: ['1er arrondissement', 'Quartier Latin', 'Montmartre'] },
      Versailles: { districts: ['Notre-Dame', 'Saint-Louis'] },
      'Boulogne-Billancourt': { districts: ['Centre-ville', 'Les Princes'] },
      Marseille: { districts: ['Vieux-Port', 'Le Panier'] },
      Nice: { districts: ['Nice Étoile', 'Vieux-Nice'] },
      Cannes: { districts: ['Cannes Centre', 'La Croisette'] },
      Lyon: { districts: ['Presqu’île', 'Croix-Rousse'] },
      Grenoble: { districts: ['Centre-ville', 'Île Verte'] },
      Annecy: { districts: ['Vieille Ville', 'Bonlieu'] },
      Toulouse: { districts: ['Capitole', 'Saint-Cyprien'] },
      Montpellier: { districts: ['Écusson', 'Antigone'] }
    },
    IT: {
      Milano: { streets: ['Corso Buenos Aires', 'Via Dante', 'Corso Como'], districts: ['Brera', 'Navigli'] },
      Bergamo: { streets: ['Via XX Settembre', 'Via Colleoni'], districts: ['Città Alta', 'Centro'] },
      Roma: { streets: ['Via del Corso', 'Via Nazionale', 'Via Cola di Rienzo'], districts: ['Trastevere', 'Monti', 'Prati'] },
      Venezia: { streets: ['Strada Nova', 'Calle Larga XXII Marzo'], districts: ['San Marco', 'Cannaregio'] },
      Verona: { streets: ['Via Mazzini', 'Corso Porta Borsari'], districts: ['Veronetta', 'Centro Storico'] },
      Napoli: { streets: ['Via Toledo', 'Via dei Mille', 'Via Scarlatti'], districts: ['Chiaia', 'Vomero'] }
    },
    ES: {
      Madrid: { streets: ['Calle de Alcalá', 'Calle Mayor', 'Gran Vía'], districts: ['Sol', 'Salamanca', 'Lavapiés'] },
      'Alcalá de Henares': { streets: ['Calle Mayor', 'Vía Complutense'], districts: ['Centro', 'El Val'] },
      Barcelona: { streets: ['Paseo de Gracia', 'Carrer de Balmes', 'La Rambla'], districts: ['Eixample', 'Gràcia', 'Barri Gòtic'] },
      Girona: { streets: ['Carrer Nou', 'Rambla de la Llibertat'], districts: ['Barri Vell', 'Eixample'] },
      Sevilla: { streets: ['Avenida de la Constitución', 'Calle Betis'], districts: ['Triana', 'Centro Histórico'] },
      'Málaga': { streets: ['Calle Larios', 'Paseo de Reding'], districts: ['Centro Histórico', 'La Malagueta'] }
    },
    NL: {
      Amsterdam: { streets: ['Keizersgracht', 'Kalverstraat', 'Damrak'], districts: ['Centrum', 'De Pijp'] },
      Haarlem: { streets: ['Grote Houtstraat', 'Zijlstraat'], districts: ['Centrum', 'Haarlem-Noord'] },
      Rotterdam: { streets: ['Coolsingel', 'Witte de Withstraat'], districts: ['Centrum', 'Kop van Zuid'] },
      'Den Haag': { streets: ['Lange Voorhout', 'Spuistraat'], districts: ['Centrum', 'Scheveningen'] },
      Utrecht: { streets: ['Oude Gracht', 'Vredenburg'], districts: ['Binnenstad', 'Lombok'] },
      Amersfoort: { streets: ['Langestraat', 'Utrechtseweg'], districts: ['Binnenstad', 'Vathorst'] }
    },
    MY: {
      'Kuala Lumpur': { streets: ['Jalan Bukit Bintang', 'Jalan Ampang', 'Jalan Sultan Ismail'], districts: ['KLCC', 'Bukit Bintang', 'Bangsar'] },
      'Shah Alam': { streets: ['Persiaran Kayangan', 'Jalan Plumbum'], districts: ['Section 7', 'Section 13'] },
      'Petaling Jaya': { streets: ['Jalan Templer', 'Jalan SS2/24'], districts: ['Damansara', 'SS2'] },
      'Subang Jaya': { streets: ['Jalan SS15/4', 'Persiaran Tujuan'], districts: ['SS15', 'USJ'] },
      'George Town': { streets: ['Lebuh Pantai', 'Jalan Penang'], districts: ['Georgetown Heritage', 'Pulau Tikus'] },
      Butterworth: { streets: ['Jalan Bagan Luar', 'Jalan Raja Uda'], districts: ['Seberang Jaya', 'Bagan'] },
      'Johor Bahru': { streets: ['Jalan Wong Ah Fook', 'Jalan Molek 1/1'], districts: ['Taman Molek', 'Bukit Indah'] }
    },
    SG: {
      'Downtown Core': { streets: ['Marina Boulevard', 'Robinson Road'], districts: ['Raffles Place', 'Marina Bay'] },
      'River Valley': { streets: ['River Valley Road', 'Kim Yam Road'], districts: ['River Valley'] },
      Orchard: { streets: ['Orchard Road', 'Scotts Road'], districts: ['Orchard Road'] },
      Tampines: { streets: ['Tampines Central 1', 'Tampines Street 21'], districts: ['Tampines Central'] },
      Bedok: { streets: ['Bedok North Avenue 4', 'Bedok Reservoir Road'], districts: ['Bedok North'] },
      'Jurong East': { streets: ['Jurong East Street 13', 'Jurong Gateway Road'], districts: ['Jurong Gateway'] },
      Clementi: { streets: ['Clementi Avenue 3', 'Commonwealth Avenue West'], districts: ['Clementi Central'] },
      Woodlands: { streets: ['Woodlands Avenue 6', 'Woodlands Drive 16'], districts: ['Woodlands Central'] },
      Yishun: { streets: ['Yishun Ring Road', 'Yishun Avenue 2'], districts: ['Yishun Central'] }
    },
    RU: {
      'Москва': { streets: ['ул. Тверская', 'ул. Арбат', 'Ленинский проспект'], districts: ['Арбат', 'Сокольники', 'Хамовники'] },
      'Санкт-Петербург': { streets: ['Невский проспект', 'ул. Рубинштейна', 'Садовая улица'], districts: ['Центральный район', 'Невский район'] },
      'Химки': { streets: ['ул. Молодёжная', 'Юбилейный проспект'], districts: ['мкр. Сходня'] },
      'Балашиха': { streets: ['Советская ул.', 'проспект Ленина'], districts: ['мкр. Изумрудный'] }
    }
  };

  // 邮编前缀：优先按城市，其次按一级行政区；没有可靠映射时留空，由各国 postal 规则只按格式生成。
  const POSTAL_PREFIX = {
    JP: { '新宿区': '160', '渋谷区': '150', '千代田区': '100', '世田谷区': '154', '八王子市': '192', '大阪市': '530', '堺市': '590', '豊中市': '560', '京都市': '600', '宇治市': '611', '札幌市': '060', '函館市': '040', '旭川市': '070', '福岡市': '810', '北九州市': '802', '横浜市': '220', '川崎市': '210' },
    US: { 'Los Angeles': '900', 'San Francisco': '941', 'San Diego': '921', Sacramento: '958', 'New York': '100', Buffalo: '142', Albany: '122', Austin: '787', Dallas: '752', Houston: '770', Miami: '331', Orlando: '328', Tampa: '336', Seattle: '981', Tacoma: '984', Chicago: '606', Springfield: '627' },
    GB: { London: 'SW1A', Manchester: 'M1', Birmingham: 'B3', Leeds: 'LS1', Edinburgh: 'EH1', Glasgow: 'G1', Cardiff: 'CF10', Swansea: 'SA1' },
    DE: { Berlin: '10', 'München': '80', 'Nürnberg': '90', Augsburg: '86', Hamburg: '20', Frankfurt: '60', Wiesbaden: '65', 'Köln': '50', 'Düsseldorf': '40' },
    CA: { Toronto: 'M5V', Ottawa: 'K1A', Vancouver: 'V6B', Victoria: 'V8W', Montreal: 'H2Z', 'Quebec City': 'G1R', Calgary: 'T2P', Edmonton: 'T5J' },
    AU: { Sydney: '20', Newcastle: '23', Melbourne: '30', Geelong: '32', Brisbane: '40', 'Gold Coast': '42', Perth: '60' },
    CN: { '朝阳区': '100', '海淀区': '100', '东城区': '100', '西城区': '100', '浦东新区': '200', '徐汇区': '200', '静安区': '200', '黄浦区': '200', '深圳市': '518', '广州市': '510', '珠海市': '519', '佛山市': '528', '杭州市': '310', '宁波市': '315', '南京市': '210', '苏州市': '215' },
    KR: { '마포구': '04', '강남구': '06', '종로구': '03', '성동구': '04', '해운대구': '48', '중구': '48', '연수구': '21', '부평구': '21' },
    SG: { 'Downtown Core': '04', 'River Valley': '23', Orchard: '23', Tampines: '52', Bedok: '46', 'Jurong East': '60', Clementi: '12', Woodlands: '73', Yishun: '76' },
    FR: { Paris: '75', Versailles: '78', 'Boulogne-Billancourt': '92', Marseille: '13', Nice: '06', Cannes: '06', Lyon: '69', Grenoble: '38', Annecy: '74', Toulouse: '31', Montpellier: '34' },
    IT: { Milano: '201', Bergamo: '241', Roma: '001', Venezia: '301', Verona: '371', Napoli: '801' },
    ES: { Madrid: '280', 'Alcalá de Henares': '288', Barcelona: '080', Girona: '170', Sevilla: '410', 'Málaga': '290' },
    NL: { Amsterdam: '10', Haarlem: '20', Rotterdam: '30', 'Den Haag': '25', Utrecht: '35', Amersfoort: '38' },
    BR: { 'São Paulo': '010', Campinas: '130', Santos: '110', 'Rio de Janeiro': '200', 'Niterói': '240', 'Belo Horizonte': '300' },
    TW: { '大安區': '106', '信義區': '110', '中山區': '104', '士林區': '111', '板橋區': '220', '新莊區': '242', '中和區': '235', '前鎮區': '806', '鼓山區': '804', '左營區': '813', '西屯區': '407', '南屯區': '408' },
    MY: { 'Kuala Lumpur': '50', 'Shah Alam': '40', 'Petaling Jaya': '46', 'Subang Jaya': '47', 'George Town': '10', Butterworth: '13', 'Johor Bahru': '80' },
    RU: { 'Москва': '10', 'Санкт-Петербург': '19', 'Химки': '141', 'Балашиха': '143' },
    TH: { Bangkok: '10', 'Chiang Mai': '50', Phuket: '83', Pattaya: '20' },
    PH: { Makati: '12', 'Quezon City': '11', Taguig: '16', 'Cebu City': '60', 'Davao City': '80' },
    AR: { 'Buenos Aires': 'C1', 'Córdoba': 'X5', Rosario: 'S2' },
    TR: { 'İstanbul': '34', Ankara: '06', 'İzmir': '35' }
  };
  function postalPrefix(code, city, admin) {
    const map = POSTAL_PREFIX[code];
    if (!map) return '';
    return map[city] || map[admin] || '';
  }

  const QUICK = ['US', 'JP', 'GB', 'DE', 'CA', 'AU', 'CN', 'KR', 'SG', 'FR'];
  const CONTINENTS = ['亚洲', '欧洲', '北美洲', '南美洲', '大洋洲', '非洲', '其他地区'];

  // ---- 国家中心坐标（localized 国家的地图 fallback）----
  const CC = {
    US: [38.90, -77.04], JP: [35.68, 139.69], GB: [51.51, -0.13], DE: [52.52, 13.40],
    CA: [45.42, -75.70], AU: [-35.28, 149.13], CN: [39.90, 116.41], KR: [37.57, 126.98],
    SG: [1.29, 103.85], FR: [48.86, 2.35], IT: [41.90, 12.50], ES: [40.42, -3.70],
    NL: [52.37, 4.90], BR: [-15.79, -47.88], TW: [25.03, 121.57], HK: [22.32, 114.17],
    MY: [3.14, 101.69], RU: [55.76, 37.62], TH: [13.76, 100.50], PH: [14.60, 120.98],
    AR: [-34.60, -58.38], TR: [39.93, 32.86]
  };

  // ---- 城市中心坐标（city-center 精度；缺失则 fallback 国家中心）----
  const CITY_COORDS = {
    US: { 'New York': [40.71, -74.01], 'Los Angeles': [34.05, -118.24], 'San Francisco': [37.77, -122.42], 'San Diego': [32.72, -117.16], 'Sacramento': [38.58, -121.49], 'Chicago': [41.88, -87.63], 'Austin': [30.27, -97.74], 'Dallas': [32.78, -96.80], 'Houston': [29.76, -95.37], 'Miami': [25.76, -80.19], 'Orlando': [28.54, -81.38], 'Tampa': [27.95, -82.46], 'Seattle': [47.61, -122.33], 'Tacoma': [47.25, -122.44], 'Buffalo': [42.89, -78.88], 'Albany': [42.65, -73.75], 'Springfield': [39.80, -89.65] },
    JP: { '新宿区': [35.69, 139.70], '渋谷区': [35.66, 139.70], '千代田区': [35.69, 139.75], '世田谷区': [35.65, 139.65], '八王子市': [35.66, 139.34], '大阪市': [34.69, 135.50], '堺市': [34.58, 135.48], '豊中市': [34.78, 135.44], '京都市': [35.01, 135.77], '宇治市': [34.89, 135.80], '札幌市': [43.06, 141.35], '函館市': [41.77, 140.73], '旭川市': [43.76, 142.35], '福岡市': [33.59, 130.40], '北九州市': [33.88, 130.88], '横浜市': [35.44, 139.64], '川崎市': [35.53, 139.70] },
    GB: { 'London': [51.51, -0.13], 'Manchester': [53.48, -2.24], 'Birmingham': [52.48, -1.90], 'Leeds': [53.80, -1.55], 'Edinburgh': [55.95, -3.19], 'Glasgow': [55.86, -4.25], 'Cardiff': [51.48, -3.18], 'Swansea': [51.62, -3.94] },
    DE: { 'Berlin': [52.52, 13.40], 'München': [48.14, 11.58], 'Nürnberg': [49.45, 11.08], 'Augsburg': [48.37, 10.90], 'Hamburg': [53.55, 9.99], 'Frankfurt': [50.11, 8.68], 'Wiesbaden': [50.08, 8.24], 'Köln': [50.94, 6.96], 'Düsseldorf': [51.23, 6.78] },
    CA: { 'Toronto': [43.65, -79.38], 'Ottawa': [45.42, -75.70], 'Vancouver': [49.28, -123.12], 'Victoria': [48.43, -123.37], 'Montreal': [45.50, -73.57], 'Quebec City': [46.81, -71.21], 'Calgary': [51.05, -114.07], 'Edmonton': [53.55, -113.49] },
    AU: { 'Sydney': [-33.87, 151.21], 'Newcastle': [-32.93, 151.78], 'Melbourne': [-37.81, 144.96], 'Geelong': [-38.15, 144.36], 'Brisbane': [-27.47, 153.03], 'Gold Coast': [-28.00, 153.43], 'Perth': [-31.95, 115.86] },
    CN: { '朝阳区': [39.92, 116.44], '海淀区': [39.96, 116.31], '东城区': [39.93, 116.41], '西城区': [39.91, 116.37], '浦东新区': [31.22, 121.54], '徐汇区': [31.19, 121.44], '静安区': [31.23, 121.45], '黄浦区': [31.23, 121.48], '深圳市': [22.54, 114.06], '广州市': [23.13, 113.26], '珠海市': [22.27, 113.58], '佛山市': [23.02, 113.12], '杭州市': [30.27, 120.16], '宁波市': [29.87, 121.55], '南京市': [32.06, 118.80], '苏州市': [31.30, 120.58] },
    KR: { '마포구': [37.55, 126.91], '강남구': [37.52, 127.05], '종로구': [37.58, 126.99], '성동구': [37.56, 127.04], '해운대구': [35.16, 129.16], '중구': [35.11, 129.03], '연수구': [37.41, 126.68], '부평구': [37.49, 126.72] },
    SG: { 'Downtown Core': [1.28, 103.85], 'River Valley': [1.29, 103.84], 'Orchard': [1.30, 103.83], 'Tampines': [1.35, 103.94], 'Bedok': [1.32, 103.93], 'Jurong East': [1.33, 103.74], 'Clementi': [1.32, 103.77], 'Woodlands': [1.44, 103.79], 'Yishun': [1.43, 103.84] },
    FR: { 'Paris': [48.86, 2.35], 'Versailles': [48.80, 2.13], 'Boulogne-Billancourt': [48.84, 2.24], 'Marseille': [43.30, 5.37], 'Nice': [43.70, 7.27], 'Cannes': [43.55, 7.01], 'Lyon': [45.76, 4.84], 'Grenoble': [45.19, 5.72], 'Annecy': [45.90, 6.13], 'Toulouse': [43.60, 1.44], 'Montpellier': [43.61, 3.88] },
    IT: { 'Milano': [45.46, 9.19], 'Bergamo': [45.70, 9.67], 'Roma': [41.90, 12.50], 'Venezia': [45.44, 12.32], 'Verona': [45.44, 10.99], 'Napoli': [40.85, 14.27] },
    ES: { 'Madrid': [40.42, -3.70], 'Alcalá de Henares': [40.48, -3.36], 'Barcelona': [41.39, 2.17], 'Girona': [41.98, 2.82], 'Sevilla': [37.39, -5.98], 'Málaga': [36.72, -4.42] },
    NL: { 'Amsterdam': [52.37, 4.90], 'Haarlem': [52.38, 4.64], 'Rotterdam': [51.92, 4.48], 'Den Haag': [52.08, 4.31], 'Utrecht': [52.09, 5.12], 'Amersfoort': [52.16, 5.39] },
    BR: { 'São Paulo': [-23.55, -46.63], 'Campinas': [-22.91, -47.06], 'Santos': [-23.96, -46.33], 'Rio de Janeiro': [-22.91, -43.17], 'Niterói': [-22.88, -43.10], 'Belo Horizonte': [-19.92, -43.94] },
    TW: { '大安區': [25.03, 121.54], '信義區': [25.03, 121.57], '中山區': [25.06, 121.52], '士林區': [25.10, 121.52], '板橋區': [25.01, 121.46], '新莊區': [25.04, 121.45], '中和區': [25.00, 121.50], '前鎮區': [22.59, 120.32], '鼓山區': [22.66, 120.28], '左營區': [22.68, 120.29], '西屯區': [24.18, 120.61], '南屯區': [24.15, 120.64] },
    HK: { '中環': [22.28, 114.16], '銅鑼灣': [22.28, 114.18], '灣仔': [22.28, 114.17], '旺角': [22.32, 114.17], '尖沙咀': [22.30, 114.17], '觀塘': [22.31, 114.23], '荃灣': [22.37, 114.12], '沙田': [22.38, 114.19], '元朗': [22.44, 114.03] },
    MY: { 'Kuala Lumpur': [3.14, 101.69], 'Shah Alam': [3.07, 101.52], 'Petaling Jaya': [3.11, 101.65], 'Subang Jaya': [3.04, 101.59], 'George Town': [5.41, 100.33], 'Butterworth': [5.40, 100.37], 'Johor Bahru': [1.49, 103.74] },
    RU: { 'Москва': [55.76, 37.62], 'Санкт-Петербург': [59.93, 30.34], 'Химки': [55.90, 37.43], 'Балашиха': [55.80, 37.96] },
    TH: { 'Bangkok': [13.76, 100.50], 'Chiang Mai': [18.79, 98.98], 'Phuket': [7.88, 98.39], 'Pattaya': [12.93, 100.88] },
    PH: { 'Makati': [14.56, 121.02], 'Quezon City': [14.68, 121.03], 'Taguig': [14.52, 121.05], 'Cebu City': [10.32, 123.90], 'Davao City': [7.19, 125.46] },
    AR: { 'Buenos Aires': [-34.60, -58.38], 'Córdoba': [-31.42, -64.18], 'Rosario': [-32.95, -60.64] },
    TR: { 'İstanbul': [41.01, 28.98], 'Ankara': [39.93, 32.86], 'İzmir': [38.42, 27.14] }
  };

  // ---- ISO 3166-1 全量清单（除上述 22 个 localized 国家外的 227 个，generic-safe 覆盖）----
  // 格式: code|中文名|英文名|洲|货币|locale|时区|电话区号|首都|纬度|经度|其他主要城市(分号分隔)
  const ISO_ROWS = [
    'AD|安道尔|Andorra|欧洲|EUR|ca|Europe/Andorra|376|Andorra la Vella|42.51|1.52|',
    'AL|阿尔巴尼亚|Albania|欧洲|ALL|sq|Europe/Tirane|355|Tirana|41.33|19.82|Durrës',
    'AT|奥地利|Austria|欧洲|EUR|de-AT|Europe/Vienna|43|Vienna|48.21|16.37|Graz;Salzburg;Linz;Innsbruck',
    'AX|奥兰群岛|Åland Islands|欧洲|EUR|sv-FI|Europe/Mariehamn|358|Mariehamn|60.10|19.94|',
    'BA|波斯尼亚和黑塞哥维那|Bosnia and Herzegovina|欧洲|BAM|bs|Europe/Sarajevo|387|Sarajevo|43.86|18.41|Mostar',
    'BE|比利时|Belgium|欧洲|EUR|nl-BE|Europe/Brussels|32|Brussels|50.85|4.35|Antwerp;Ghent;Bruges;Liège',
    'BG|保加利亚|Bulgaria|欧洲|BGN|bg|Europe/Sofia|359|Sofia|42.70|23.32|Plovdiv;Varna',
    'BY|白俄罗斯|Belarus|欧洲|BYN|be|Europe/Minsk|375|Minsk|53.90|27.57|Brest;Gomel',
    'CH|瑞士|Switzerland|欧洲|CHF|de-CH|Europe/Zurich|41|Bern|46.95|7.45|Zurich;Geneva;Basel;Lausanne',
    'CY|塞浦路斯|Cyprus|欧洲|EUR|el-CY|Asia/Nicosia|357|Nicosia|35.17|33.36|Limassol',
    'CZ|捷克|Czechia|欧洲|CZK|cs|Europe/Prague|420|Prague|50.08|14.44|Brno;Ostrava',
    'DK|丹麦|Denmark|欧洲|DKK|da-DK|Europe/Copenhagen|45|Copenhagen|55.68|12.57|Aarhus;Odense;Aalborg',
    'EE|爱沙尼亚|Estonia|欧洲|EUR|et|Europe/Tallinn|372|Tallinn|59.44|24.75|Tartu',
    'FI|芬兰|Finland|欧洲|EUR|fi-FI|Europe/Helsinki|358|Helsinki|60.17|24.94|Espoo;Tampere;Turku',
    'FO|法罗群岛|Faroe Islands|欧洲|DKK|fo|Atlantic/Faroe|298|Tórshavn|62.01|-6.77|',
    'GG|根西岛|Guernsey|欧洲|GBP|en-GG|Europe/Guernsey|44|St. Peter Port|49.46|-2.54|',
    'GI|直布罗陀|Gibraltar|欧洲|GIP|en-GI|Europe/Gibraltar|350|Gibraltar|36.14|-5.35|',
    'GR|希腊|Greece|欧洲|EUR|el-GR|Europe/Athens|30|Athens|37.98|23.73|Thessaloniki;Patras',
    'HR|克罗地亚|Croatia|欧洲|EUR|hr|Europe/Zagreb|385|Zagreb|45.81|15.98|Split;Rijeka',
    'HU|匈牙利|Hungary|欧洲|HUF|hu|Europe/Budapest|36|Budapest|47.50|19.04|Debrecen;Szeged',
    'IE|爱尔兰|Ireland|欧洲|EUR|en-IE|Europe/Dublin|353|Dublin|53.35|-6.26|Cork;Galway',
    'IM|马恩岛|Isle of Man|欧洲|GBP|en-IM|Europe/Isle_of_Man|44|Douglas|54.15|-4.48|',
    'IS|冰岛|Iceland|欧洲|ISK|is|Atlantic/Reykjavik|354|Reykjavik|64.15|-21.94|Akureyri',
    'JE|泽西岛|Jersey|欧洲|GBP|en-JE|Europe/Jersey|44|Saint Helier|49.19|-2.11|',
    'LI|列支敦士登|Liechtenstein|欧洲|CHF|de-LI|Europe/Vaduz|423|Vaduz|47.14|9.52|',
    'LT|立陶宛|Lithuania|欧洲|EUR|lt|Europe/Vilnius|370|Vilnius|54.69|25.28|Kaunas',
    'LU|卢森堡|Luxembourg|欧洲|EUR|lb-LU|Europe/Luxembourg|352|Luxembourg|49.61|6.13|',
    'LV|拉脱维亚|Latvia|欧洲|EUR|lv|Europe/Riga|371|Riga|56.95|24.11|Daugavpils',
    'MC|摩纳哥|Monaco|欧洲|EUR|fr-MC|Europe/Monaco|377|Monaco|43.73|7.42|',
    'MD|摩尔多瓦|Moldova|欧洲|MDL|ro-MD|Europe/Chisinau|373|Chișinău|47.01|28.86|',
    'ME|黑山|Montenegro|欧洲|EUR|sr-ME|Europe/Podgorica|382|Podgorica|42.44|19.26|',
    'MK|北马其顿|North Macedonia|欧洲|MKD|mk|Europe/Skopje|389|Skopje|41.99|21.43|',
    'MT|马耳他|Malta|欧洲|EUR|mt|Europe/Malta|356|Valletta|35.90|14.51|',
    'NO|挪威|Norway|欧洲|NOK|nb-NO|Europe/Oslo|47|Oslo|59.91|10.75|Bergen;Trondheim',
    'PL|波兰|Poland|欧洲|PLN|pl|Europe/Warsaw|48|Warsaw|52.23|21.01|Kraków;Gdańsk;Wrocław',
    'PT|葡萄牙|Portugal|欧洲|EUR|pt-PT|Europe/Lisbon|351|Lisbon|38.72|-9.14|Porto;Faro',
    'RO|罗马尼亚|Romania|欧洲|RON|ro|Europe/Bucharest|40|Bucharest|44.43|26.10|Cluj-Napoca;Timișoara',
    'RS|塞尔维亚|Serbia|欧洲|RSD|sr|Europe/Belgrade|381|Belgrade|44.79|20.45|Novi Sad',
    'SE|瑞典|Sweden|欧洲|SEK|sv-SE|Europe/Stockholm|46|Stockholm|59.33|18.07|Gothenburg;Malmö',
    'SI|斯洛文尼亚|Slovenia|欧洲|EUR|sl|Europe/Ljubljana|386|Ljubljana|46.06|14.51|',
    'SJ|斯瓦尔巴和扬马延|Svalbard and Jan Mayen|欧洲|NOK|nb-SJ|Arctic/Longyearbyen|47|Longyearbyen|78.22|15.65|',
    'SK|斯洛伐克|Slovakia|欧洲|EUR|sk|Europe/Bratislava|421|Bratislava|48.15|17.11|Košice',
    'SM|圣马力诺|San Marino|欧洲|EUR|it-SM|Europe/San_Marino|378|San Marino|43.94|12.45|',
    'UA|乌克兰|Ukraine|欧洲|UAH|uk|Europe/Kyiv|380|Kyiv|50.45|30.52|Lviv;Odesa;Kharkiv',
    'VA|梵蒂冈|Holy See|欧洲|EUR|it-VA|Europe/Vatican|379|Vatican City|41.90|12.45|',
    'AE|阿拉伯联合酋长国|United Arab Emirates|亚洲|AED|ar-AE|Asia/Dubai|971|Abu Dhabi|24.47|54.37|Dubai;Sharjah;Ajman',
    'AF|阿富汗|Afghanistan|亚洲|AFN|fa-AF|Asia/Kabul|93|Kabul|34.53|69.17|Kandahar;Herat',
    'AM|亚美尼亚|Armenia|亚洲|AMD|hy|Asia/Yerevan|374|Yerevan|40.18|44.51|',
    'AZ|阿塞拜疆|Azerbaijan|亚洲|AZN|az|Asia/Baku|994|Baku|40.41|49.87|',
    'BD|孟加拉国|Bangladesh|亚洲|BDT|bn|Asia/Dhaka|880|Dhaka|23.81|90.41|Chittagong;Khulna',
    'BH|巴林|Bahrain|亚洲|BHD|ar-BH|Asia/Bahrain|973|Manama|26.23|50.59|',
    'BN|文莱|Brunei|亚洲|BND|ms-BN|Asia/Brunei|673|Bandar Seri Begawan|4.90|114.94|',
    'BT|不丹|Bhutan|亚洲|BTN|dz|Asia/Thimphu|975|Thimphu|27.47|89.64|',
    'GE|格鲁吉亚|Georgia|亚洲|GEL|ka|Asia/Tbilisi|995|Tbilisi|41.72|44.78|Batumi',
    'IL|以色列|Israel|亚洲|ILS|he|Asia/Jerusalem|972|Jerusalem|31.77|35.21|Tel Aviv;Haifa',
    'IN|印度|India|亚洲|INR|hi-IN|Asia/Kolkata|91|New Delhi|28.61|77.21|Mumbai;Delhi;Bengaluru;Chennai;Kolkata;Hyderabad',
    'IQ|伊拉克|Iraq|亚洲|IQD|ar-IQ|Asia/Baghdad|964|Baghdad|33.31|44.36|Basra;Mosul',
    'IR|伊朗|Iran|亚洲|IRR|fa-IR|Asia/Tehran|98|Tehran|35.69|51.39|Mashhad;Isfahan',
    'JO|约旦|Jordan|亚洲|JOD|ar-JO|Asia/Amman|962|Amman|31.95|35.93|',
    'KG|吉尔吉斯斯坦|Kyrgyzstan|亚洲|KGS|ky|Asia/Bishkek|996|Bishkek|42.87|74.59|',
    'KH|柬埔寨|Cambodia|亚洲|KHR|km|Asia/Phnom_Penh|855|Phnom Penh|11.56|104.92|Siem Reap',
    'KP|朝鲜|North Korea|亚洲|KPW|ko-KP|Asia/Pyongyang|850|Pyongyang|39.02|125.75|',
    'KW|科威特|Kuwait|亚洲|KWD|ar-KW|Asia/Kuwait|965|Kuwait City|29.38|47.98|',
    'KZ|哈萨克斯坦|Kazakhstan|亚洲|KZT|kk|Asia/Almaty|7|Astana|51.17|71.43|Almaty;Shymkent',
    'LA|老挝|Laos|亚洲|LAK|lo|Asia/Vientiane|856|Vientiane|17.98|102.63|',
    'LB|黎巴嫩|Lebanon|亚洲|LBP|ar-LB|Asia/Beirut|961|Beirut|33.89|35.50|',
    'LK|斯里兰卡|Sri Lanka|亚洲|LKR|si|Asia/Colombo|94|Colombo|6.90|79.90|Kandy',
    'MM|缅甸|Myanmar|亚洲|MMK|my|Asia/Yangon|95|Naypyidaw|19.76|96.08|Yangon;Mandalay',
    'MN|蒙古|Mongolia|亚洲|MNT|mn|Asia/Ulaanbaatar|976|Ulaanbaatar|47.89|106.91|',
    'MV|马尔代夫|Maldives|亚洲|MVR|dv|Indian/Maldives|960|Malé|4.17|73.51|',
    'NP|尼泊尔|Nepal|亚洲|NPR|ne|Asia/Kathmandu|977|Kathmandu|27.72|85.32|',
    'OM|阿曼|Oman|亚洲|OMR|ar-OM|Asia/Muscat|968|Muscat|23.59|58.41|',
    'PK|巴基斯坦|Pakistan|亚洲|PKR|ur-PK|Asia/Karachi|92|Islamabad|33.68|73.05|Karachi;Lahore;Faisalabad',
    'PS|巴勒斯坦领土|Palestine|亚洲|ILS|ar-PS|Asia/Hebron|970|Ramallah|31.90|35.20|Gaza',
    'QA|卡塔尔|Qatar|亚洲|QAR|ar-QA|Asia/Qatar|974|Doha|25.29|51.53|',
    'SA|沙特阿拉伯|Saudi Arabia|亚洲|SAR|ar-SA|Asia/Riyadh|966|Riyadh|24.71|46.68|Jeddah;Dammam;Mecca',
    'SY|叙利亚|Syria|亚洲|SYP|ar-SY|Asia/Damascus|963|Damascus|33.51|36.29|Aleppo',
    'TJ|塔吉克斯坦|Tajikistan|亚洲|TJS|tg|Asia/Dushanbe|992|Dushanbe|38.56|68.78|',
    'TL|东帝汶|Timor-Leste|亚洲|USD|pt-TL|Asia/Dili|670|Dili|-8.56|125.57|',
    'TM|土库曼斯坦|Turkmenistan|亚洲|TMT|tk|Asia/Ashgabat|993|Ashgabat|37.96|58.33|',
    'UZ|乌兹别克斯坦|Uzbekistan|亚洲|UZS|uz|Asia/Tashkent|998|Tashkent|41.30|69.24|Samarkand',
    'VN|越南|Vietnam|亚洲|VND|vi|Asia/Ho_Chi_Minh|84|Hanoi|21.03|105.85|Ho Chi Minh City;Da Nang;Hue',
    'YE|也门|Yemen|亚洲|YER|ar-YE|Asia/Aden|967|Sanaa|15.37|44.19|Aden',
    'MO|中国澳门特别行政区|Macao|亚洲|MOP|zh-MO|Asia/Macau|853|Macau|22.20|113.55|',
    'AO|安哥拉|Angola|非洲|AOA|pt-AO|Africa/Luanda|244|Luanda|-8.84|13.23|',
    'BF|布基纳法索|Burkina Faso|非洲|XOF|fr-BF|Africa/Ouagadougou|226|Ouagadougou|12.37|-1.53|',
    'BI|布隆迪|Burundi|非洲|BIF|rn|Africa/Bujumbura|257|Gitega|-3.43|29.93|',
    'BJ|贝宁|Benin|非洲|XOF|fr-BJ|Africa/Porto-Novo|229|Porto-Novo|6.50|2.62|Cotonou',
    'DJ|吉布提|Djibouti|非洲|DJF|fr-DJ|Africa/Djibouti|253|Djibouti|11.59|43.15|',
    'DZ|阿尔及利亚|Algeria|非洲|DZD|ar-DZ|Africa/Algiers|213|Algiers|36.75|3.06|Oran;Constantine',
    'EG|埃及|Egypt|非洲|EGP|ar-EG|Africa/Cairo|20|Cairo|30.04|31.24|Alexandria;Giza',
    'EH|西撒哈拉|Western Sahara|非洲|MAD|ar-EH|Africa/El_Aaiun|212|Laayoune|27.15|-13.20|',
    'ER|厄立特里亚|Eritrea|非洲|ERN|ti|Africa/Asmara|291|Asmara|15.34|38.93|',
    'ET|埃塞俄比亚|Ethiopia|非洲|ETB|am|Africa/Addis_Ababa|251|Addis Ababa|9.02|38.75|',
    'GA|加蓬|Gabon|非洲|XAF|fr-GA|Africa/Libreville|241|Libreville|0.42|9.47|',
    'GM|冈比亚|Gambia|非洲|GMD|en-GM|Africa/Banjul|220|Banjul|13.45|-16.58|',
    'GN|几内亚|Guinea|非洲|GNF|fr-GN|Africa/Conakry|224|Conakry|9.51|-13.71|',
    'GQ|赤道几内亚|Equatorial Guinea|非洲|XAF|es-GQ|Africa/Malabo|240|Malabo|3.75|8.78|',
    'KE|肯尼亚|Kenya|非洲|KES|sw-KE|Africa/Nairobi|254|Nairobi|-1.29|36.82|Mombasa',
    'KM|科摩罗|Comoros|非洲|KMF|ar-KM|Indian/Comoro|269|Moroni|-11.70|43.24|',
    'LR|利比里亚|Liberia|非洲|LRD|en-LR|Africa/Monrovia|231|Monrovia|6.30|-10.80|',
    'LY|利比亚|Libya|非洲|LYD|ar-LY|Africa/Tripoli|218|Tripoli|32.89|13.19|Benghazi',
    'MA|摩洛哥|Morocco|非洲|MAD|ar-MA|Africa/Casablanca|212|Rabat|34.02|-6.84|Casablanca;Marrakesh;Fez',
    'MG|马达加斯加|Madagascar|非洲|MGA|mg|Indian/Antananarivo|261|Antananarivo|-18.88|47.51|',
    'ML|马里|Mali|非洲|XOF|fr-ML|Africa/Bamako|223|Bamako|12.64|-8.00|',
    'MR|毛里塔尼亚|Mauritania|非洲|MRU|ar-MR|Africa/Nouakchott|222|Nouakchott|18.08|-15.98|',
    'MU|毛里求斯|Mauritius|非洲|MUR|en-MU|Indian/Mauritius|230|Port Louis|-20.16|57.50|',
    'MW|马拉维|Malawi|非洲|MWK|en-MW|Africa/Blantyre|265|Lilongwe|-13.96|33.79|Blantyre',
    'MZ|莫桑比克|Mozambique|非洲|MZN|pt-MZ|Africa/Maputo|258|Maputo|-25.97|32.57|',
    'NA|纳米比亚|Namibia|非洲|NAD|en-NA|Africa/Windhoek|264|Windhoek|-22.56|17.08|',
    'NE|尼日尔|Niger|非洲|XOF|fr-NE|Africa/Niamey|227|Niamey|13.51|2.11|',
    'NG|尼日利亚|Nigeria|非洲|NGN|en-NG|Africa/Lagos|234|Abuja|9.06|7.49|Lagos;Kano;Ibadan',
    'RW|卢旺达|Rwanda|非洲|RWF|rw|Africa/Kigali|250|Kigali|-1.94|30.06|',
    'SC|塞舌尔|Seychelles|非洲|SCR|fr-SC|Indian/Mahe|248|Victoria|-4.62|55.45|',
    'SD|苏丹|Sudan|非洲|SDG|ar-SD|Africa/Khartoum|249|Khartoum|15.50|32.56|',
    'SO|索马里|Somalia|非洲|SOS|so|Africa/Mogadishu|252|Mogadishu|2.05|45.32|',
    'SS|南苏丹|South Sudan|非洲|SSP|en-SS|Africa/Juba|211|Juba|4.85|31.58|',
    'ST|圣多美和普林西比|Sao Tome and Principe|非洲|STN|pt-ST|Africa/Sao_Tome|239|São Tomé|0.34|6.73|',
    'SN|塞内加尔|Senegal|非洲|XOF|fr-SN|Africa/Dakar|221|Dakar|14.72|-17.47|',
    'SH|圣赫勒拿|Saint Helena|非洲|SHP|en-SH|Atlantic/St_Helena|290|Jamestown|-15.93|-5.72|',
    'SZ|斯威士兰|Eswatini|非洲|SZL|en-SZ|Africa/Mbabane|268|Mbabane|-26.32|31.14|',
    'TD|乍得|Chad|非洲|XAF|fr-TD|Africa/Ndjamena|235|N\'Djamena|12.13|15.06|',
    'TG|多哥|Togo|非洲|XOF|fr-TG|Africa/Lome|228|Lomé|6.13|1.22|',
    'TN|突尼斯|Tunisia|非洲|TND|ar-TN|Africa/Tunis|216|Tunis|36.81|10.17|Sfax',
    'TZ|坦桑尼亚|Tanzania|非洲|TZS|sw-TZ|Africa/Dar_es_Salaam|255|Dodoma|-6.16|35.75|Dar es Salaam;Arusha',
    'UG|乌干达|Uganda|非洲|UGX|en-UG|Africa/Kampala|256|Kampala|0.35|32.58|',
    'YT|马约特|Mayotte|非洲|EUR|fr-YT|Indian/Mayotte|262|Mamoudzou|-12.78|45.23|',
    'ZA|南非|South Africa|非洲|ZAR|en-ZA|Africa/Johannesburg|27|Pretoria|-25.75|28.19|Johannesburg;Cape Town;Durban',
    'ZM|赞比亚|Zambia|非洲|ZMW|en-ZM|Africa/Lusaka|260|Lusaka|-15.39|28.32|',
    'ZW|津巴布韦|Zimbabwe|非洲|ZWG|en-ZW|Africa/Harare|263|Harare|-17.83|31.05|Bulawayo',
    'AG|安提瓜和巴布达|Antigua and Barbuda|北美洲|XCD|en-AG|America/Antigua|1-268|St. John\'s|17.12|-61.85|',
    'AI|安圭拉|Anguilla|北美洲|XCD|en-AI|America/Anguilla|1-264|The Valley|18.22|-63.06|',
    'AW|阿鲁巴|Aruba|北美洲|AWG|nl-AW|America/Aruba|297|Oranjestad|12.52|-70.03|',
    'BB|巴巴多斯|Barbados|北美洲|BBD|en-BB|America/Barbados|1-246|Bridgetown|13.10|-59.61|',
    'BL|圣巴泰勒米|Saint Barthélemy|北美洲|EUR|fr-BL|America/St_Barthelemy|590|Gustavia|17.88|-62.85|',
    'BM|百慕大|Bermuda|北美洲|BMD|en-BM|Atlantic/Bermuda|1-441|Hamilton|32.29|-64.78|',
    'BQ|荷属加勒比区|Caribbean Netherlands|北美洲|USD|nl-BQ|America/Kralendijk|599|Kralendijk|12.15|-68.27|',
    'BS|巴哈马|Bahamas|北美洲|BSD|en-BS|America/Nassau|1-242|Nassau|25.06|-77.35|Freeport',
    'BZ|伯利兹|Belize|北美洲|BZD|en-BZ|America/Belize|501|Belmopan|17.25|-88.77|Belize City',
    'CR|哥斯达黎加|Costa Rica|北美洲|CRC|es-CR|America/Costa_Rica|506|San José|9.93|-84.08|',
    'CU|古巴|Cuba|北美洲|CUP|es-CU|America/Havana|53|Havana|23.11|-82.37|Santiago de Cuba',
    'CW|库拉索|Curaçao|北美洲|ANG|nl-CW|America/Curacao|599|Willemstad|12.11|-68.93|',
    'DM|多米尼克|Dominica|北美洲|XCD|en-DM|America/Dominica|1-767|Roseau|15.30|-61.39|',
    'DO|多米尼加共和国|Dominican Republic|北美洲|DOP|es-DO|America/Santo_Domingo|1-809|Santo Domingo|18.49|-69.93|Santiago de los Caballeros',
    'GD|格林纳达|Grenada|北美洲|XCD|en-GD|America/Grenada|1-473|St. George\'s|12.05|-61.75|',
    'GL|格陵兰|Greenland|北美洲|DKK|kl-GL|America/Nuuk|299|Nuuk|64.18|-51.72|',
    'GP|瓜德罗普|Guadeloupe|北美洲|EUR|fr-GP|America/Guadeloupe|590|Basse-Terre|16.00|-61.73|',
    'GT|危地马拉|Guatemala|北美洲|GTQ|es-GT|America/Guatemala|502|Guatemala City|14.63|-90.51|',
    'HN|洪都拉斯|Honduras|北美洲|HNL|es-HN|America/Tegucigalpa|504|Tegucigalpa|14.07|-87.19|',
    'HT|海地|Haiti|北美洲|HTG|fr-HT|America/Port-au-Prince|509|Port-au-Prince|18.54|-72.34|',
    'JM|牙买加|Jamaica|北美洲|JMD|en-JM|America/Jamaica|1-876|Kingston|17.97|-76.79|',
    'MQ|马提尼克|Martinique|北美洲|EUR|fr-MQ|America/Martinique|596|Fort-de-France|14.60|-61.07|',
    'MX|墨西哥|Mexico|北美洲|MXN|es-MX|America/Mexico_City|52|Mexico City|19.43|-99.13|Guadalajara;Monterrey;Cancún',
    'MS|蒙特塞拉特|Montserrat|北美洲|XCD|en-MS|America/Montserrat|1-664|Brades|16.79|-62.21|',
    'NI|尼加拉瓜|Nicaragua|北美洲|NIO|es-NI|America/Managua|505|Managua|12.13|-86.25|',
    'PA|巴拿马|Panama|北美洲|PAB|es-PA|America/Panama|507|Panama City|8.98|-79.52|',
    'PM|圣皮埃尔和密克隆群岛|Saint Pierre and Miquelon|北美洲|EUR|fr-PM|America/Miquelon|508|Saint-Pierre|46.78|-56.17|',
    'PR|波多黎各|Puerto Rico|北美洲|USD|es-PR|America/Puerto_Rico|1-787|San Juan|18.47|-66.11|',
    'KN|圣基茨和尼维斯|Saint Kitts and Nevis|北美洲|XCD|en-KN|America/St_Kitts|1-869|Basseterre|17.30|-62.72|',
    'LC|圣卢西亚|Saint Lucia|北美洲|XCD|en-LC|America/St_Lucia|1-758|Castries|14.01|-60.99|',
    'MF|法属圣马丁|Saint Martin|北美洲|EUR|fr-MF|America/Marigot|590|Marigot|18.07|-63.08|',
    'SX|荷属圣马丁|Sint Maarten|北美洲|ANG|nl-SX|America/Lower_Princes|1-721|Philipsburg|18.03|-63.05|',
    'VC|圣文森特和格林纳达|Saint Vincent and the Grenadines|北美洲|XCD|en-VC|America/St_Vincent|1-784|Kingstown|13.16|-61.22|',
    'TT|特立尼达和多巴哥|Trinidad and Tobago|北美洲|TTD|en-TT|America/Port_of_Spain|1-868|Port of Spain|10.65|-61.51|',
    'TC|特克斯和凯科斯群岛|Turks and Caicos Islands|北美洲|USD|en-TC|America/Grand_Turk|1-649|Cockburn Town|21.46|-71.14|',
    'VG|英属维尔京群岛|British Virgin Islands|北美洲|USD|en-VG|America/Tortola|1-284|Road Town|18.43|-64.62|',
    'VI|美属维尔京群岛|U.S. Virgin Islands|北美洲|USD|en-VI|America/St_Thomas|1-340|Charlotte Amalie|18.34|-64.93|',
    'BO|玻利维亚|Bolivia|南美洲|BOB|es-BO|America/La_Paz|591|La Paz|-16.50|-68.15|Santa Cruz',
    'CL|智利|Chile|南美洲|CLP|es-CL|America/Santiago|56|Santiago|-33.45|-70.67|Valparaíso;Concepción',
    'CO|哥伦比亚|Colombia|南美洲|COP|es-CO|America/Bogota|57|Bogotá|4.71|-74.07|Medellín;Cali',
    'EC|厄瓜多尔|Ecuador|南美洲|USD|es-EC|America/Guayaquil|593|Quito|-0.18|-78.47|Guayaquil',
    'FK|福克兰群岛|Falkland Islands|南美洲|FKP|en-FK|Atlantic/Stanley|500|Stanley|-51.70|-57.85|',
    'GF|法属圭亚那|French Guiana|南美洲|EUR|fr-GF|America/Cayenne|594|Cayenne|4.94|-52.33|',
    'GY|圭亚那|Guyana|南美洲|GYD|en-GY|America/Guyana|592|Georgetown|6.80|-58.16|',
    'PY|巴拉圭|Paraguay|南美洲|PYG|es-PY|America/Asuncion|595|Asunción|-25.28|-57.63|',
    'PE|秘鲁|Peru|南美洲|PEN|es-PE|America/Lima|51|Lima|-12.05|-77.04|Arequipa',
    'SR|苏里南|Suriname|南美洲|SRD|nl-SR|America/Paramaribo|597|Paramaribo|5.85|-55.20|',
    'UY|乌拉圭|Uruguay|南美洲|UYU|es-UY|America/Montevideo|598|Montevideo|-34.90|-56.16|',
    'VE|委内瑞拉|Venezuela|南美洲|VES|es-VE|America/Caracas|58|Caracas|10.48|-66.90|Maracaibo',
    'CK|库克群岛|Cook Islands|大洋洲|NZD|en-CK|Pacific/Rarotonga|682|Avarua|-21.21|-159.78|',
    'FJ|斐济|Fiji|大洋洲|FJD|en-FJ|Pacific/Fiji|679|Suva|-18.14|178.44|',
    'PF|法属波利尼西亚|French Polynesia|大洋洲|XPF|fr-PF|Pacific/Tahiti|689|Papeete|-17.55|-149.57|',
    'GU|关岛|Guam|大洋洲|USD|en-GU|Pacific/Guam|1-671|Hagåtña|13.48|144.75|',
    'KI|基里巴斯|Kiribati|大洋洲|AUD|en-KI|Pacific/Tarawa|686|Tarawa|1.45|173.03|',
    'MH|马绍尔群岛|Marshall Islands|大洋洲|USD|en-MH|Pacific/Majuro|692|Majuro|7.09|171.38|',
    'FM|密克罗尼西亚|Micronesia|大洋洲|USD|en-FM|Pacific/Pohnpei|691|Palikir|6.92|158.16|',
    'NR|瑙鲁|Nauru|大洋洲|AUD|en-NR|Pacific/Nauru|674|Yaren|-0.55|166.92|',
    'NC|新喀里多尼亚|New Caledonia|大洋洲|XPF|fr-NC|Pacific/Noumea|687|Nouméa|-22.28|166.46|',
    'NZ|新西兰|New Zealand|大洋洲|NZD|en-NZ|Pacific/Auckland|64|Wellington|-41.29|174.78|Auckland;Christchurch',
    'NU|纽埃|Niue|大洋洲|NZD|en-NU|Pacific/Niue|683|Alofi|-19.06|-169.92|',
    'NF|诺福克岛|Norfolk Island|大洋洲|AUD|en-NF|Pacific/Norfolk|672|Kingston|-29.05|167.97|',
    'PW|帕劳|Palau|大洋洲|USD|en-PW|Pacific/Palau|680|Ngerulmud|7.50|134.62|',
    'PG|巴布亚新几内亚|Papua New Guinea|大洋洲|PGK|en-PG|Pacific/Port_Moresby|675|Port Moresby|-9.44|147.18|',
    'PN|皮特凯恩群岛|Pitcairn|大洋洲|NZD|en-PN|Pacific/Pitcairn|64|Adamstown|-24.37|-128.32|',
    'SB|所罗门群岛|Solomon Islands|大洋洲|SBD|en-SB|Pacific/Guadalcanal|677|Honiara|-9.43|159.95|',
    'TK|托克劳|Tokelau|大洋洲|NZD|en-TK|Pacific/Fakaofo|690|Nukunonu|-8.78|-171.21|',
    'TO|汤加|Tonga|大洋洲|TOP|en-TO|Pacific/Tongatapu|676|Nuku\'alofa|-21.14|-175.20|',
    'TV|图瓦卢|Tuvalu|大洋洲|AUD|en-TV|Pacific/Funafuti|688|Funafuti|-8.52|179.20|',
    'VU|瓦努阿图|Vanuatu|大洋洲|VUV|bi|Pacific/Efate|678|Port Vila|-17.73|168.32|',
    'WF|瓦利斯和富图纳|Wallis and Futuna|大洋洲|XPF|fr-WF|Pacific/Wallis|681|Mata-Utu|-13.28|-176.18|',
    'WS|萨摩亚|Samoa|大洋洲|WST|en-WS|Pacific/Apia|685|Apia|-13.83|-171.77|',
    'AQ|南极洲|Antarctica|其他地区|USD|en-AQ|Antarctica/McMurdo|672|McMurdo Station|-77.85|166.67|Amundsen-Scott South Pole Station;Rothera Research Station;Palmer Station;Casey Station',
    'BV|布韦岛|Bouvet Island|其他地区|NOK|nb-BV|Atlantic/Bouvet|47|Bouvetøya|-54.42|3.38|',
    'HM|赫德岛和麦克唐纳群岛|Heard & McDonald Islands|其他地区|AUD|en-HM|Indian/Kerguelen|672|Heard Island|-53.11|72.51|McDonald Islands',
    'IO|英属印度洋领地|British Indian Ocean Territory|其他地区|USD|en-IO|Indian/Chagos|246|Diego Garcia|-7.31|72.41|',
    'CC|科科斯（基林）群岛|Cocos (Keeling) Islands|其他地区|AUD|en-CC|Indian/Cocos|61|West Island|-12.16|96.83|',
    'CX|圣诞岛|Christmas Island|其他地区|AUD|en-CX|Indian/Christmas|61|Flying Fish Cove|-10.42|105.68|',
    'TF|法属南部领地|French Southern Territories|其他地区|EUR|fr-TF|Indian/Kerguelen|262|Port-aux-Français|-49.35|70.22|',
    'UM|美国本土外小岛屿|U.S. Outlying Islands|其他地区|USD|en-UM|Pacific/Midway|1|Midway Atoll|28.21|-177.38|Wake Island;Johnston Atoll;Palmyra Atoll;Baker Island;Howland Island;Jarvis Island',
    'AS|美属萨摩亚|American Samoa|大洋洲|USD|en-AS|Pacific/Pago_Pago|1-684|Pago Pago|-14.28|-170.70|',
    'BW|博茨瓦纳|Botswana|非洲|BWP|en-BW|Africa/Gaborone|267|Gaborone|-24.63|25.92|Francistown',
    'CD|刚果（金）|DR Congo|非洲|CDF|fr-CD|Africa/Kinshasa|243|Kinshasa|-4.32|15.31|Lubumbashi',
    'CF|中非共和国|Central African Republic|非洲|XAF|fr-CF|Africa/Bangui|236|Bangui|4.36|18.56|',
    'CG|刚果（布）|Congo|非洲|XAF|fr-CG|Africa/Brazzaville|242|Brazzaville|-4.26|15.28|Pointe-Noire',
    'CI|科特迪瓦|Côte d\'Ivoire|非洲|XOF|fr-CI|Africa/Abidjan|225|Yamoussoukro|6.83|-5.29|Abidjan',
    'CM|喀麦隆|Cameroon|非洲|XAF|fr-CM|Africa/Douala|237|Yaoundé|3.87|11.52|Douala',
    'CV|佛得角|Cabo Verde|非洲|CVE|pt-CV|Atlantic/Cape_Verde|238|Praia|14.93|-23.51|',
    'GH|加纳|Ghana|非洲|GHS|en-GH|Africa/Accra|233|Accra|5.60|-0.19|Kumasi',
    'GS|南乔治亚和南桑威奇群岛|South Georgia and the South Sandwich Islands|其他地区|GBP|en-GS|Atlantic/South_Georgia|500|King Edward Point|-54.28|-36.49|',
    'GW|几内亚比绍|Guinea-Bissau|非洲|XOF|pt-GW|Africa/Bissau|245|Bissau|11.86|-15.60|',
    'ID|印度尼西亚|Indonesia|亚洲|IDR|id-ID|Asia/Jakarta|62|Jakarta|-6.21|106.85|Surabaya;Bandung;Medan;Denpasar',
    'KY|开曼群岛|Cayman Islands|北美洲|KYD|en-KY|America/Cayman|1-345|George Town|19.29|-81.37|',
    'LS|莱索托|Lesotho|非洲|LSL|en-LS|Africa/Maseru|266|Maseru|-29.31|27.48|',
    'MP|北马里亚纳群岛|Northern Mariana Islands|大洋洲|USD|en-MP|Pacific/Saipan|1-670|Saipan|15.19|145.75|',
    'RE|留尼汪|Réunion|非洲|EUR|fr-RE|Indian/Reunion|262|Saint-Denis|-20.88|55.45|',
    'SL|塞拉利昂|Sierra Leone|非洲|SLE|en-SL|Africa/Freetown|232|Freetown|8.48|-13.23|',
    'SV|萨尔瓦多|El Salvador|北美洲|USD|es-SV|America/El_Salvador|503|San Salvador|13.69|-89.19|',
  ];

  function flagEmoji(code2) {
    return code2.length === 2 ? String.fromCodePoint(...[...code2].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : '🏳️';
  }

  const GENERIC_STREETS = ['Main Street', 'High Street', 'Park Lane', 'Station Road', 'Church Street', 'Harbor Avenue'];
  const GEN_LAST = ['Morgan', 'Lee', 'Casey', 'Quinn', 'Avery', 'Rowe', 'Hayes'];
  const GEN_MALE = ['Alex', 'Taylor', 'Jordan', 'Riley', 'Sam', 'Noah'];
  const GEN_FEMALE = ['Morgan', 'Taylor', 'Riley', 'Quinn', 'Sage', 'Emma'];

  function genericProfile(row) {
    const [code, nameZh, nameEn, continent, currency, locale, tz, cc, capital, lat, lng, extras] = row.split('|');
    const cities = [capital, ...extras.split(';').filter(Boolean)].filter(Boolean);
    return {
      code, alpha3: code, slug: `${code.toLowerCase()}-address`, flag: flagEmoji(code),
      nameZh, nameEn, nativeName: nameEn, continent, locale: locale || 'en', currency: currency || 'USD',
      tz: tz || 'UTC', langCode: (locale || 'en').split('-')[0], salary: [10000, 120000],
      coverage: 'generic-safe', cc: [Number(lat), Number(lng)], hasMap: Number(lat) !== 0,
      searchHint: capital || nameEn,
      admins: [{ name: nameZh, cities }],
      streets: GENERIC_STREETS,
      house: (r) => String(r.int(1, 350)),
      postal: () => '',
      phone: (r) => `+${(cc || '1').split('-')[0]} 555 ${r.digits(4)}`,
      localFormat: (p) => [`${p.house} ${p.street}`, `${p.city}`, nameEn],
      intlFormat: (p) => [`${p.house} ${p.street}, ${p.city}, ${nameEn}`],
      last: GEN_LAST, male: GEN_MALE, female: GEN_FEMALE,
      jobs: ['Software Engineer', 'Teacher', 'Accountant', 'Designer', 'Analyst'],
      companies: ['Example Labs', 'Northfield Studio', 'Test Systems Ltd', 'Blue Harbor Co.']
    };
  }
  ISO_ROWS.forEach((row) => { const p = genericProfile(row); if (!PROFILES[p.code]) PROFILES[p.code] = p; });
  Object.values(PROFILES).forEach((p) => {
    if (!p.coverage) p.coverage = 'localized-full';
    if (!p.cc) p.cc = CC[p.code] || null;
    if (p.hasMap === undefined) p.hasMap = !!p.cc;
    if (!p.cardBrandWeights) p.cardBrandWeights = CARD_WEIGHTS[p.code] || CARD_WEIGHTS_DEFAULT;
    if (!p.emailDomainWeights) p.emailDomainWeights = EMAIL_WEIGHTS[p.code] || EMAIL_WEIGHTS._default;
  });
  const profileBySlug = {};
  Object.values(PROFILES).forEach((p) => {
    p.pageSlug = `${p.slug}-generator`;
    profileBySlug[p.pageSlug] = p;
    profileBySlug[p.slug] = p; // 兼容旧链接
  });

  // -----------------------------
  // Seeded engine（无 Math.random）
  // -----------------------------
  function hashSeed(value) {
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    const s = String(value);
    for (let i = 0; i < s.length; i += 1) {
      const c = s.charCodeAt(i);
      h1 ^= c; h1 = Math.imul(h1, 16777619);
      h2 ^= c + i; h2 = Math.imul(h2, 2246822519);
    }
    return (h1 ^ h2) >>> 0;
  }
  class SeededRandom {
    constructor(seed) { this.state = hashSeed(seed) || 0x9e3779b9; }
    next() { let x = this.state; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; this.state = x >>> 0; return this.state / 4294967296; }
    int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; }
    pick(items) { return items[this.int(0, items.length - 1)]; }
    bool() { return this.next() >= 0.5; }
    digits(length) { let out = ''; for (let i = 0; i < length; i += 1) out += String(this.int(0, 9)); return out; }
    hex(length) { const chars = '0123456789abcdef'; let out = ''; for (let i = 0; i < length; i += 1) out += chars[this.int(0, 15)]; return out; }
    base36(length) { const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'; let out = ''; for (let i = 0; i < length; i += 1) out += chars[this.int(0, chars.length - 1)]; return out; }
    weighted(map) {
      const keys = Object.keys(map).filter((k) => Number(map[k]) > 0);
      if (!keys.length) return undefined;
      const total = keys.reduce((sum, k) => sum + Number(map[k]), 0);
      let ticket = this.next() * total;
      for (let i = 0; i < keys.length; i += 1) {
        ticket -= Number(map[keys[i]]);
        if (ticket <= 0) return keys[i];
      }
      return keys[keys.length - 1];
    }
    // 截断正态（Box–Muller），用于身高等需要集中趋势的字段
    normal(mean, sd, min, max) {
      for (let i = 0; i < 16; i += 1) {
        let u = this.next(); const v = this.next();
        if (u <= 0) u = 1e-9;
        const x = mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        if (x >= min && x <= max) return x;
      }
      return Math.min(max, Math.max(min, mean));
    }
    triangular(min, mode, max) {
      const u = this.next();
      const f = (mode - min) / (max - min);
      return u < f
        ? min + Math.sqrt(u * (max - min) * (mode - min))
        : max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  // -----------------------------
  // State + storage
  // -----------------------------
  const state = {
    country: 'JP', filter: { admin: null, city: null }, refresh: 0, seed: '',
    identity: null, batch: [], batchCount: 10, batchSeed: '', batchCase: 'camel',
    saved: [], recent: [], recentCountries: []
  };
  const $ = (id) => document.getElementById(id);
  const safe = (v) => String(v ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  const LS = {
    get(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } }
  };
  function loadStore() {
    state.saved = LS.get('tlb-saved', []);
    state.recent = LS.get('tlb-recent', []);
    state.recentCountries = LS.get('tlb-recent-countries', []);
  }
  let toastTimer;
  function toast(message) { const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 1500); }
  function copyText(text, message = t('copied')) {
    const done = () => toast(message);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch { toast('Copy failed'); } finally { ta.remove(); }
  }

  // -----------------------------
  // 人物规则：邮箱域名池、身高体重联动、个人主页
  // -----------------------------
  function asciiSlug(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }
  function emailLocalPart(rng, first, last, birthYear) {
    const f = asciiSlug(first) || 'user';
    const l = asciiSlug(last) || 'profile';
    const base = rng.weighted({ dot: 4, joined: 3, initial: 2, reversed: 2, underscore: 1 });
    let localPart;
    if (base === 'dot') localPart = `${f}.${l}`;
    else if (base === 'joined') localPart = `${f}${l}`;
    else if (base === 'initial') localPart = `${f.charAt(0)}.${l}`;
    else if (base === 'reversed') localPart = `${l}.${f}`;
    else localPart = `${f}_${l}`;
    const suffixStyle = rng.weighted({ digits: 5, year: 2, shortYear: 2 });
    const suffix = suffixStyle === 'year' ? String(birthYear)
      : suffixStyle === 'shortYear' ? String(birthYear).slice(2)
        : rng.digits(rng.int(2, 6));
    return `${localPart}${suffix}`.replace(/^[._]+/, '').slice(0, 40);
  }
  function buildEmail(rng, profile, first, last, birthYear) {
    const domain = rng.weighted(profile.emailDomainWeights || EMAIL_WEIGHTS._default) || 'gmail.com';
    return `${emailLocalPart(rng, first, last, birthYear)}@${domain}`;
  }
  // 个人主页固定落在本站 /u/ 展示路径，避免随机命中真实第三方个人网站。
  function buildHomepage(rng, first, last) {
    const slug = [asciiSlug(first), asciiSlug(last)].filter(Boolean).join('-') || 'profile';
    return `${SITE.origin}/u/${slug}-${rng.base36(6)}`;
  }

  // 身高按性别使用截断正态；体重不独立随机，必须由身高 + BMI 计算得到。
  const HEIGHT_RULES = {
    male: { mean: 175, sd: 7, min: 158, max: 198 },
    female: { mean: 162, sd: 6.2, min: 148, max: 179 },
    x: { mean: 170, sd: 8, min: 150, max: 190 }
  };
  function bodyMetrics(rng, genderKey) {
    const rule = HEIGHT_RULES[genderKey] || HEIGHT_RULES.x;
    const heightCm = Math.round(rng.normal(rule.mean, rule.sd, rule.min, rule.max));
    // 90% 样本落在 BMI 18.5–24.9，其余落在 17.5–27.0 的合理尾部，避免所有人物过度一致。
    const bmi = rng.next() < 0.9 ? rng.triangular(18.5, 21.7, 24.9) : rng.triangular(17.5, 22.0, 27.0);
    const metres = heightCm / 100;
    return { heightCm, weightKg: Math.round(bmi * metres * metres), bmi: Math.round(bmi * 10) / 10 };
  }

  // -----------------------------
  // Generators
  // -----------------------------
  function romanOf(part, map) { return Array.isArray(part) ? part[1] : (map ? (map[part] || part) : part); }
  function localOf(part) { return Array.isArray(part) ? part[0] : part; }

  function pickPlace(profile, rng) {
    let admins = profile.admins;
    const f = state.filter;
    if (f.city) {
      admins = profile.admins.filter((a) => a.cities.includes(f.city));
    } else if (f.admin) {
      admins = profile.admins.filter((a) => a.name === f.admin);
    }
    if (!admins.length) admins = profile.admins;
    const admin = rng.pick(admins);
    let cityPool = admin.cities;
    if (f.city && admin.cities.includes(f.city)) cityPool = [f.city];
    else if (f.admin) cityPool = admin.cities;
    const city = rng.pick(cityPool);
    const cityInfo = (CITY_DATA[profile.code] || {})[city] || {};
    const districts = (cityInfo.districts && cityInfo.districts.length) ? cityInfo.districts : null;
    const streets = (cityInfo.streets && cityInfo.streets.length) ? cityInfo.streets : profile.streets;
    return { admin, city, streets, district: districts ? rng.pick(districts) : '' };
  }

  function generateIdentity(seedKey) {
    const p = PROFILES[state.country];
    const rng = new SeededRandom(`${seedKey}|${state.country}|${state.filter.admin || ''}|${state.filter.city || ''}`);
    const place = pickPlace(p, rng);

    // 性别与姓名池、称谓联动；Unspecified 从两个姓名池中随机取用。
    const genderKey = rng.weighted({ male: 48, female: 48, x: 4 });
    const namePoolKey = genderKey === 'x' ? (rng.bool() ? 'male' : 'female') : genderKey;
    const last = rng.pick(p.last);
    const first = rng.pick(p[namePoolKey]);
    const rLast = romanOf(last, p.romanLast);
    const rFirst = romanOf(first, namePoolKey === 'male' ? p.romanMale : p.romanFemale);
    const cjk = ['CN', 'JP', 'KR', 'TW', 'HK'].includes(p.code);
    const nameLocal = !cjk ? `${rFirst} ${rLast}`
      : (p.code === 'JP' || p.code === 'KR' ? `${localOf(last)} ${localOf(first)}` : `${localOf(last)}${localOf(first)}`);
    const nameRoman = `${rFirst} ${rLast}`;

    // 年龄 18~68，生日由年龄反推，保证两个字段始终一致。
    const ageYears = rng.int(18, 68);
    const today = new Date();
    const birth = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    birth.setDate(birth.getDate() - rng.int(0, 364));
    birth.setFullYear(birth.getFullYear() - ageYears);
    const dob = `${birth.getFullYear()}-${String(birth.getMonth() + 1).padStart(2, '0')}-${String(birth.getDate()).padStart(2, '0')}`;
    const body = bodyMetrics(rng, genderKey);

    const parts = {
      house: p.house(rng), street: rng.pick(place.streets || p.streets), district: place.district, city: place.city,
      admin: place.admin.name, adminCode: place.admin.code || '',
      postal: p.postal(rng, place.admin, postalPrefix(p.code, place.city, place.admin.name))
    };
    const localLines = p.localFormat(parts);
    const intlLines = p.intlFormat(parts);
    const email = buildEmail(rng, p, rFirst, rLast, birth.getFullYear());
    const phone = p.phone(rng);
    const billing = intlLines.join(', ');
    const card = generateCard(rng, p, nameRoman, billing);
    const salary = rng.int(p.salary[0], p.salary[1]);

    const username = `${asciiSlug(rFirst) || 'user'}_${rng.digits(4)}`;
    const pwChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
    const password = Array.from({ length: 16 }, () => pwChars[rng.int(0, pwChars.length - 1)]).join('');
    const uuid = `${rng.hex(8)}-${rng.hex(4)}-4${rng.hex(3)}-${rng.pick(['8', '9', 'a', 'b'])}${rng.hex(3)}-${rng.hex(12)}`;
    const platform = rng.pick([
      {
        os: 'macOS 15 · Safari 18',
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
      },
      {
        os: 'macOS 14 · Chrome 128',
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      {
        os: 'Windows 11 · Chrome 128',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      {
        os: 'Windows 11 · Edge 128',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0'
      },
      {
        os: 'Ubuntu 24.04 · Firefox 128',
        ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0'
      },
      {
        os: 'iOS 17 · Safari',
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
        mobile: true
      },
      {
        os: 'Android 15 · Chrome',
        ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
        mobile: true
      }
    ]);
    const os = platform.os;
    const ua = platform.ua;
    // 屏幕与设备类别跟随平台，移动端不会报 2560×1440
    const screen = platform.mobile
      ? rng.pick(['390×844', '414×896', '360×800'])
      : rng.pick(['1920×1080', '2560×1440', '1440×900', '1366×768']);
    const deviceKey = platform.mobile ? rng.pick(['dev3', 'dev4']) : rng.pick(['dev1', 'dev2']);
    const interestKeys = [];
    while (interestKeys.length < 3) {
      const key = `int${rng.int(1, 6)}`;
      if (!interestKeys.includes(key)) interestKeys.push(key);
    }

    return {
      seedKey,
      genderKey, titleKey: genderKey === 'male' ? 'tMr' : genderKey === 'female' ? 'tMs' : 'tMx',
      nameLocal, nameRoman, dob, age: ageYears,
      address: {
        local: localLines.join('\n'), international: intlLines.join(' '),
        street: parts.street, house: parts.house, district: parts.district, city: parts.city,
        region: parts.admin, regionCode: parts.adminCode, postal: parts.postal,
        countryCode: p.code, countryNative: p.nativeName
      },
      phone, email,
      card,
      work: {
        job: rng.pick(p.jobs), company: rng.pick(p.companies),
        industryKey: `ind${rng.int(1, 6)}`,
        companySize: rng.pick(['1-10', '11-50', '51-200', '201-500', '500+']),
        employmentKey: rng.weighted({ emp1: 6, emp2: 2, emp3: 2, emp4: 2 }),
        salary: salary.toLocaleString('en-US'), currency: p.currency,
        educationKey: rng.weighted({ edu1: 2, edu2: 2, edu3: 4, edu4: 2 })
      },
      account: {
        username, password, uuid,
        website: buildHomepage(rng, rFirst, rLast), os, ua,
        locale: p.locale, timezone: p.tz, language: p.langCode,
        screen, deviceKey
      },
      extra: {
        heightCm: body.heightCm, weightKg: body.weightKg, bmi: body.bmi,
        blood: rng.pick(['A', 'B', 'AB', 'O']),
        hairKey: `hair${rng.int(1, 5)}`,
        secQKey: `secQ${rng.int(1, 3)}`,
        secA: rng.pick(['maple', 'quartz', 'harbor', 'cedar', 'lumen', 'aster', 'willow', 'onyx']),
        interestKeys,
        bioKey: `bio${rng.int(1, 3)}`,
        avatar: nameRoman.charAt(0).toUpperCase()
      }
    };
  }

  // 把生成结果里的枚举 key 转成当前界面语言的展示文案
  function view(id) {
    const p = PROFILES[state.country];
    return {
      gender: t(id.genderKey === 'male' ? 'gMale' : id.genderKey === 'female' ? 'gFemale' : 'gX'),
      title: t(id.titleKey),
      height: `${id.extra.heightCm} cm`,
      weight: `${id.extra.weightKg} kg`,
      hair: t(id.extra.hairKey),
      secQ: t(id.extra.secQKey),
      bio: t(id.extra.bioKey),
      interests: id.extra.interestKeys.map((k) => t(k)).join(' / '),
      industry: t(id.work.industryKey),
      employment: t(id.work.employmentKey),
      education: t(id.work.educationKey),
      device: t(id.account.deviceKey),
      cardProduct: t(id.card.productKey),
      country: `${countryName(p)} / ${id.address.countryNative} (${id.address.countryCode})`
    };
  }

  // -----------------------------
  // Seed / URL（同一 Seed + 同一筛选条件 → 同一结果，便于 QA 复现）
  // -----------------------------
  function identitySeed() {
    return state.seed ? `seed:${state.seed}#${state.refresh}` : `v9-${state.refresh}`;
  }
  function syncUrl() {
    const p = PROFILES[state.country];
    const qs = new URLSearchParams();
    qs.set('country', p.pageSlug);
    if (lang !== DEFAULT_LOCALE) qs.set('lang', lang);
    if (state.seed) qs.set('seed', state.seed);
    if (state.filter.city) qs.set('city', state.filter.city);
    else if (state.filter.admin) qs.set('region', state.filter.admin);
    try { history.replaceState(null, '', `${location.pathname}?${qs.toString()}`); } catch { /* ignore */ }
  }

  // -----------------------------
  // Row rendering (字段名 | 值 | 复制)
  // -----------------------------
  function row(label, value, opts = {}) {
    const v = Array.isArray(value) ? value.join('\n') : String(value);
    const cls = opts.big ? ' big' : '';
    return `<div class="row"><div class="k">${safe(label)}</div><div class="v${cls}">${safe(v)}</div><button type="button" class="copy" data-copy="${safe(v)}" aria-label="${safe(label)} ${safe(t('copy'))}">${safe(t('copy'))}</button></div>`;
  }
  function cardRows(id, rowsHtml) { $(id).innerHTML = rowsHtml; }

  function renderIdentity() {
    state.identity = generateIdentity(identitySeed());
    const id = state.identity;
    const v = view(id);
    const p = PROFILES[state.country];
    const cn = countryName(p);

    const titleText = tpl('pageTitleTpl', { c: cn });
    $('pageTitle').textContent = titleText;
    document.title = `${titleText} - ${t('siteName')}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', tpl('descTpl', { c: cn }));

    cardRows('basic', [
      row(t('fNameLocal'), id.nameLocal),
      row(t('fNameRoman'), id.nameRoman),
      row(t('fGender'), v.gender),
      row(t('fTitle'), v.title),
      row(t('fDob'), id.dob),
      row(t('fAge'), id.age),
      row(t('fHeight'), v.height),
      row(t('fWeight'), v.weight),
      row(t('fBlood'), id.extra.blood),
      row(t('fHair'), v.hair),
      row(t('fEducation'), v.education)
    ].join(''));
    cardRows('address', [
      row(t('fAddrLocal'), id.address.local, { big: true }),
      row(t('fAddrIntl'), id.address.international),
      row(t('fStreet'), id.address.street),
      row(t('fHouse'), id.address.house),
      id.address.district ? row(t('fDistrict'), id.address.district) : '',
      row(t('fCity'), id.address.city),
      id.address.region ? row(t('fRegion'), id.address.region + (id.address.regionCode ? ` (${id.address.regionCode})` : '')) : '',
      id.address.postal ? row(t('fPostal'), id.address.postal) : '',
      row(t('fCountry'), v.country),
      row(t('fTimezone'), id.account.timezone),
      row(t('fPhone'), id.phone),
      row(t('fEmail'), id.email)
    ].join(''));
    cardRows('cardData', [
      row(t('fBrand'), id.card.brand),
      row(t('fCardProduct'), v.cardProduct),
      row(t('fCardNumber'), id.card.number),
      row(t('fExpiry'), id.card.expiry),
      row(t('fCvv'), id.card.cvv),
      row(t('fHolder'), id.card.holder),
      row(t('fCurrency'), id.card.currency),
      row(t('fBilling'), id.card.billing)
    ].join(''));
    cardRows('work', [
      row(t('fJob'), id.work.job),
      row(t('fCompany'), id.work.company),
      row(t('fIndustry'), v.industry),
      row(t('fCompanySize'), id.work.companySize),
      row(t('fEmployment'), v.employment),
      row(t('fSalary'), `${id.work.salary} ${id.work.currency}`)
    ].join(''));
    cardRows('account', [
      row(t('fUsername'), id.account.username),
      row(t('fPassword'), id.account.password),
      row(t('fUuid'), id.account.uuid),
      row(t('fWebsite'), id.account.website),
      row(t('fOs'), id.account.os),
      row(t('fUa'), id.account.ua),
      row(t('fLocale'), id.account.locale),
      row(t('fTimezone'), id.account.timezone),
      row(t('fLanguage'), id.account.language),
      row(t('fScreen'), id.account.screen),
      row(t('fDevice'), v.device)
    ].join(''));
    cardRows('extraProfile', [
      `<div class="row"><div class="k">${safe(t('fAvatar'))}</div><div class="v"><span class="avatar-chip">${safe(id.extra.avatar)}</span></div><button type="button" class="copy" data-copy="${safe(id.extra.avatar)}" aria-label="${safe(t('fAvatar'))} ${safe(t('copy'))}">${safe(t('copy'))}</button></div>`,
      row(t('fSecQ'), v.secQ),
      row(t('fSecA'), id.extra.secA),
      row(t('fInterests'), v.interests),
      row(t('fBio'), v.bio)
    ].join(''));

    renderCitySidebar();
    renderQuickNav();
    updateMap();
    pushRecent(id);
  }

  function pushRecent(id) {
    state.recent.unshift({ ts: Date.now(), country: state.country, name: id.nameLocal, address: id.address.local });
    state.recent = state.recent.slice(0, 20);
    LS.set('tlb-recent', state.recent);
    renderDataSection();
  }

  // -----------------------------
  // Quick nav + mega dropdown
  // -----------------------------
  const CONTINENT_LABELS = {
    '亚洲': { 'zh-TW': '亞洲', en: 'Asia', ja: 'アジア', ko: '아시아', de: 'Asien', fr: 'Asie', es: 'Asia', pt: 'Ásia', it: 'Asia', ru: 'Азия', ar: 'آسيا', hi: 'एशिया', id: 'Asia', th: 'เอเชีย', vi: 'Châu Á' },
    '欧洲': { 'zh-TW': '歐洲', en: 'Europe', ja: 'ヨーロッパ', ko: '유럽', de: 'Europa', fr: 'Europe', es: 'Europa', pt: 'Europa', it: 'Europa', ru: 'Европа', ar: 'أوروبا', hi: 'यूरोप', id: 'Eropa', th: 'ยุโรป', vi: 'Châu Âu' },
    '北美洲': { 'zh-TW': '北美洲', en: 'North America', ja: '北アメリカ', ko: '북아메리카', de: 'Nordamerika', fr: 'Amérique du Nord', es: 'América del Norte', pt: 'América do Norte', it: 'America del Nord', ru: 'Северная Америка', ar: 'أمريكا الشمالية', hi: 'उत्तर अमेरिका', id: 'Amerika Utara', th: 'อเมริกาเหนือ', vi: 'Bắc Mỹ' },
    '南美洲': { 'zh-TW': '南美洲', en: 'South America', ja: '南アメリカ', ko: '남아메리카', de: 'Südamerika', fr: 'Amérique du Sud', es: 'América del Sur', pt: 'América do Sul', it: 'America del Sud', ru: 'Южная Америка', ar: 'أمريكا الجنوبية', hi: 'दक्षिण अमेरिका', id: 'Amerika Selatan', th: 'อเมริกาใต้', vi: 'Nam Mỹ' },
    '大洋洲': { 'zh-TW': '大洋洲', en: 'Oceania', ja: 'オセアニア', ko: '오세아니아', de: 'Ozeanien', fr: 'Océanie', es: 'Oceanía', pt: 'Oceania', it: 'Oceania', ru: 'Океания', ar: 'أوقيانوسيا', hi: 'ओशिनिया', id: 'Oseania', th: 'โอเชียเนีย', vi: 'Châu Đại Dương' },
    '非洲': { 'zh-TW': '非洲', en: 'Africa', ja: 'アフリカ', ko: '아프리카', de: 'Afrika', fr: 'Afrique', es: 'África', pt: 'África', it: 'Africa', ru: 'Африка', ar: 'أفريقيا', hi: 'अफ़्रीका', id: 'Afrika', th: 'แอฟริกา', vi: 'Châu Phi' },
    '其他地区': { 'zh-TW': '其他地區', en: 'Other regions', ja: 'その他の地域', ko: '기타 지역', de: 'Andere Regionen', fr: 'Autres régions', es: 'Otras regiones', pt: 'Outras regiões', it: 'Altre regioni', ru: 'Другие регионы', ar: 'مناطق أخرى', hi: 'अन्य क्षेत्र', id: 'Wilayah lain', th: 'ภูมิภาคอื่น', vi: 'Khu vực khác' }
  };
  function continentLabel(cont) {
    if (lang === 'zh-CN') return cont;
    const row = CONTINENT_LABELS[cont];
    return (row && row[lang]) || cont;
  }
  function renderQuickNav() {
    $('quickNav').innerHTML = QUICK.map((c) => {
      const p = PROFILES[c];
      const current = c === state.country;
      return `<button type="button" class="country${current ? ' active' : ''}" data-country-btn="${c}" ${current ? 'aria-current="true"' : ''}>${p.flag} ${safe(countryName(p))}</button>`;
    }).join('');
    $('megaBtn').textContent = `${t('allCountries')} · ${Object.keys(PROFILES).length} ⌄`;
    $('megaBtn').setAttribute('title', `${Object.keys(PROFILES).length} ${t('countryCount')}`);
  }
  function renderMega() {
    const q = ($('megaSearch').value || '').trim().toLowerCase();
    const recentHtml = (!q && state.recentCountries.length)
      ? `<div class="mega-group-title">${t('recentUsed')}</div><div class="mega-grid">${state.recentCountries.filter((c) => PROFILES[c]).map((c) => megaItem(PROFILES[c])).join('')}</div>` : '';
    const groups = CONTINENTS.map((cont) => {
      const items = Object.values(PROFILES)
        .filter((p) => p.continent === cont)
        .filter((p) => !q || `${p.nameZh} ${p.nameEn} ${p.nativeName} ${countryName(p)} ${p.code} ${p.alpha3} ${p.slug}`.toLowerCase().includes(q));
      if (!items.length) return '';
      return `<div class="mega-group-title">${safe(continentLabel(cont))}</div><div class="mega-grid">${items.map((p) => megaItem(p)).join('')}</div>`;
    }).join('');
    $('megaGroups').innerHTML = recentHtml + (groups || `<div class="mega-empty">${safe(t('noMatch'))}</div>`);
    function megaItem(p) {
      const active = p.code === state.country;
      const primary = countryName(p);
      const secondary = primary === p.nameEn ? p.code : `${p.nameEn} · ${p.code}`;
      return `<button type="button" class="copt${active ? ' active' : ''}" data-country-btn="${p.code}" ${active ? 'aria-selected="true"' : ''}><span>${p.flag}</span><span class="cname">${safe(primary)}<span class="cmeta">${safe(secondary)}</span></span></button>`;
    }
  }
  function openMega() { $('megaPanel').classList.add('open'); $('megaBtn').setAttribute('aria-expanded', 'true'); $('megaSearch').value = ''; renderMega(); setTimeout(() => $('megaSearch').focus(), 30); }
  function closeMega() { $('megaPanel').classList.remove('open'); $('megaBtn').setAttribute('aria-expanded', 'false'); }

  function setCountry(code) {
    if (!PROFILES[code]) return;
    state.country = code;
    state.filter = { admin: null, city: null };
    state.refresh = 0;
    closeMega();
    state.recentCountries = [code, ...state.recentCountries.filter((c) => c !== code)].slice(0, 8);
    LS.set('tlb-recent-countries', state.recentCountries);
    syncUrl();
    renderIdentity();
  }

  // -----------------------------
  // City sidebar
  // -----------------------------
  // 城市是当前国家的唯一入口：可搜索、按一级行政区分组、完整可访问。
  // 列表很大时按块追加渲染（滚动到底自动接着渲染），不使用“查看更多”隐藏数据。
  const CITY_CHUNK = 300;
  const cityView = { entries: [], rendered: 0 };

  function cityEntries(profile, q) {
    const entries = [];
    profile.admins.forEach((a) => {
      const adminHit = a.name.toLowerCase().includes(q);
      const cities = a.cities.filter((c) => !q || adminHit || `${a.name} ${c}`.toLowerCase().includes(q));
      if (!cities.length && !adminHit) return;
      entries.push({ type: 'group', admin: a.name });
      (cities.length ? cities : a.cities).forEach((c) => entries.push({ type: 'city', admin: a.name, city: c }));
    });
    return entries;
  }
  function cityEntryHtml(entry) {
    if (entry.type === 'group') {
      const active = state.filter.admin === entry.admin && !state.filter.city;
      return `<button type="button" class="citygroup${active ? ' active' : ''}" data-city-btn="${safe(entry.admin)}|" ${active ? 'aria-selected="true"' : ''}>${safe(entry.admin)}</button>`;
    }
    const active = state.filter.city === entry.city;
    return `<button type="button" class="city${active ? ' active' : ''}" data-city-btn="${safe(entry.admin)}|${safe(entry.city)}" ${active ? 'aria-selected="true"' : ''}>${safe(entry.city)}</button>`;
  }
  function appendCityChunk() {
    if (cityView.rendered >= cityView.entries.length) return;
    const slice = cityView.entries.slice(cityView.rendered, cityView.rendered + CITY_CHUNK);
    $('cityList').insertAdjacentHTML('beforeend', slice.map(cityEntryHtml).join(''));
    cityView.rendered += slice.length;
  }
  function renderCitySidebar() {
    const p = PROFILES[state.country];
    const q = ($('citySearch').value || '').trim().toLowerCase();
    const list = $('cityList');
    const anyFilter = !state.filter.admin && !state.filter.city;
    cityView.entries = cityEntries(p, q);
    cityView.rendered = 0;
    list.innerHTML = `<button type="button" class="city all${anyFilter ? ' active' : ''}" data-city-btn="|" ${anyFilter ? 'aria-selected="true"' : ''}>${safe(t('randomAll'))}</button>`;
    appendCityChunk();
    const cityCount = cityView.entries.filter((e) => e.type === 'city').length + 1;
    $('cityCount').textContent = `${cityCount} ${t('cityUnit')}`;
  }

  // -----------------------------
  // Batch
  // -----------------------------
  function batchFields() {
    return Array.from(document.querySelectorAll('.batch-field:checked')).map((el) => el.value);
  }
  function flatten(id, fields) {
    const v = view(id);
    const out = {};
    if (fields.includes('name')) { out.name = id.nameLocal; out.nameRoman = id.nameRoman; }
    if (fields.includes('gender')) out.gender = v.gender;
    if (fields.includes('dob')) out.dob = id.dob;
    if (fields.includes('address')) out.address = id.address.international;
    if (fields.includes('city')) out.city = id.address.city;
    if (fields.includes('postal')) out.postalCode = id.address.postal;
    if (fields.includes('phone')) out.phone = id.phone;
    if (fields.includes('email')) out.email = id.email;
    if (fields.includes('company')) out.company = id.work.company;
    if (fields.includes('job')) out.job = id.work.job;
    if (fields.includes('card')) {
      out.cardBrand = id.card.brand;
      out.cardNumber = id.card.number;
      out.cardExpiry = id.card.expiry;
      out.cardCvv = id.card.cvv;
    }
    if (fields.includes('username')) out.username = id.account.username;
    if (fields.includes('uuid')) out.uuid = id.account.uuid;
    if (state.batchCase === 'snake') {
      const snaked = {};
      Object.entries(out).forEach(([k, val]) => { snaked[k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())] = val; });
      return snaked;
    }
    return out;
  }

  function runBatch() {
    const count = Math.min(500, Math.max(1, state.batchCount));
    const seed = ($('batchSeed').value || '').trim() || `batch-${Date.now()}`;
    state.batchSeed = seed;
    const fields = batchFields();
    state.batch = Array.from({ length: count }, (_, i) => flatten(generateIdentity(`${seed}-${i}`), fields));
    renderBatchTable();
    toast(`${t('batchDone')} ${count} ${t('batchRows')}`);
  }
  function renderBatchTable() {
    const wrap = $('batchTableWrap');
    if (!state.batch.length) { wrap.innerHTML = `<div class="batch-empty">${t('batchEmpty')}</div>`; return; }
    const keys = Object.keys(state.batch[0]);
    const head = `<tr><th>#</th>${keys.map((k) => `<th>${safe(k)}</th>`).join('')}</tr>`;
    const body = state.batch.map((r, i) => `<tr><td>${i + 1}</td>${keys.map((k) => `<td>${safe(r[k])}</td>`).join('')}</tr>`).join('');
    wrap.innerHTML = `<div class="batch-meta">${state.batch.length} ${t('batchRows')} · Seed: ${safe(state.batchSeed)}</div><div class="batch-scroll"><table class="batch-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
  }
  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 800);
  }
  function exportBatch(format) {
    if (!state.batch.length) { runBatch(); }
    const keys = Object.keys(state.batch[0]);
    const slug = PROFILES[state.country].slug;
    if (format === 'csv') {
      const esc = (v) => {
        let s = String(v ?? '');
        if (/^[=+@-]/.test(s)) s = `'${s}`;
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csv = ['\ufeff' + keys.join(','), ...state.batch.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
      download(`${slug}-batch.csv`, csv, 'text/csv;charset=utf-8');
    } else if (format === 'json') {
      download(`${slug}-batch.json`, JSON.stringify(state.batch, null, 2), 'application/json');
    } else if (format === 'jsonl') {
      download(`${slug}-batch.jsonl`, state.batch.map((r) => JSON.stringify(r)).join('\n'), 'application/x-ndjson');
    } else {
      const txt = state.batch.map((r, i) => `#${i + 1}\n${keys.map((k) => `${k}: ${r[k]}`).join('\n')}`).join('\n\n');
      download(`${slug}-batch.txt`, txt, 'text/plain');
    }
  }

  // -----------------------------
  // Data section (saved / recent / clear)
  // -----------------------------
  function renderDataSection() {
    const saved = state.saved;
    $('savedList').innerHTML = saved.length
      ? saved.map((it, i) => `<div class="data-item"><div class="data-main"><b>${safe(it.name)}</b><span>${safe(it.address)}</span></div><button type="button" class="mini" data-del-saved="${i}">${t('del')}</button></div>`).join('')
      : `<div class="data-empty">${t('emptySaved')}</div>`;
    $('recentList').innerHTML = state.recent.length
      ? state.recent.map((it, i) => `<div class="data-item"><div class="data-main"><b>${safe(it.name)}</b><span>${safe(it.address)}</span><span class="data-meta">${PROFILES[it.country] ? PROFILES[it.country].flag : ''} ${new Date(it.ts).toLocaleString(lang)}</span></div><button type="button" class="mini" data-del-recent="${i}">${t('del')}</button></div>`).join('')
      : `<div class="data-empty">${t('emptyRecent')}</div>`;
    updateDataToggles();
  }

  function updateDataToggles() {
    const savedOpen = !$('savedList').classList.contains('collapsed');
    const recentOpen = !$('recentList').classList.contains('collapsed');
    $('savedToggle').setAttribute('aria-expanded', String(savedOpen));
    $('recentToggle').setAttribute('aria-expanded', String(recentOpen));
    $('savedToggle').textContent = `${savedOpen ? t('collapse') : t('expand')} (${state.saved.length})`;
    $('recentToggle').textContent = `${recentOpen ? t('collapse') : t('expand')} (${state.recent.length})`;
  }

  function copyAllIdentity() {
    const id = state.identity;
    const v = view(id);
    const lines = [
      `${t('fNameLocal')}: ${id.nameLocal}`,
      `${t('fNameRoman')}: ${id.nameRoman}`,
      `${t('fGender')}: ${v.gender}`,
      `${t('fDob')}: ${id.dob} (${t('fAge')}: ${id.age})`,
      `${t('fTitle')}: ${v.title}`,
      `${t('fHeight')}: ${v.height}`,
      `${t('fWeight')}: ${v.weight}`,
      `${t('fAddrLocal')}: ${id.address.local.replace(/\n/g, ' / ')}`,
      `${t('fAddrIntl')}: ${id.address.international}`,
      `${t('fCity')}: ${id.address.city}`,
      `${t('fRegion')}: ${id.address.region}`,
      `${t('fPostal')}: ${id.address.postal}`,
      `${t('fCountry')}: ${v.country}`,
      `${t('fPhone')}: ${id.phone}`,
      `${t('fEmail')}: ${id.email}`,
      `${t('fBrand')}: ${id.card.brand} (${v.cardProduct})`,
      `${t('fCardNumber')}: ${id.card.number}`,
      `${t('fExpiry')}: ${id.card.expiry}`,
      `${t('fCvv')}: ${id.card.cvv}`,
      `${t('fHolder')}: ${id.card.holder}`,
      `${t('fJob')}: ${id.work.job}`,
      `${t('fCompany')}: ${id.work.company}`,
      `${t('fSalary')}: ${id.work.salary} ${id.work.currency}`,
      `${t('fUsername')}: ${id.account.username}`,
      `${t('fPassword')}: ${id.account.password}`,
      `${t('fUuid')}: ${id.account.uuid}`,
      `${t('fWebsite')}: ${id.account.website}`
    ];
    copyText(lines.join('\n'), t('copiedAll'));
  }

  function clearLocalData() {
    ['tlb-saved', 'tlb-recent', 'tlb-recent-countries'].forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
    state.saved = []; state.recent = []; state.recentCountries = [];
    renderDataSection();
    toast(t('cleared'));
  }

  // -----------------------------
  // 区域地图（Leaflet + 可配置 OSM 瓦片；只使用城市/行政区/国家中心坐标，不做门牌地理编码）
  // -----------------------------
  const MAP_CONFIG = {
    provider: 'openstreetmap',
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    defaultZoom: 10, maxZoom: 15
  };
  const mapState = { map: null, marker: null, observerStarted: false, pending: null, loadStarted: false, failed: false };
  function mapCenterFor(p) {
    const cities = CITY_COORDS[p.code] || {};
    const f = state.filter;
    const id = state.identity;
    if (f.city && cities[f.city]) return { latlng: cities[f.city], precision: 'city-center', label: f.city };
    if (id && cities[id.address.city]) return { latlng: cities[id.address.city], precision: 'city-center', label: id.address.city };
    if (p.cc && p.cc[0] !== 0) return { latlng: p.cc, precision: 'country-center', label: countryName(p) };
    return null;
  }
  function precisionLabel(precision) {
    const keys = { 'city-center': 'precCity', 'region-center': 'precRegion', 'country-center': 'precCountry' };
    return keys[precision] ? t(keys[precision]) : precision;
  }
  function updateMap() {
    const p = PROFILES[state.country];
    const center = mapCenterFor(p);
    const meta = $('mapMeta');
    if (!center) {
      meta.innerHTML = safe(t('mapNoCoord'));
      $('mapBox').innerHTML = '';
      return;
    }
    const [lat, lng] = center.latlng;
    const placeText = [countryName(p), state.identity ? state.identity.address.city : '', center.label].filter((v, i, a) => v && a.indexOf(v) === i).join(' / ');
    meta.innerHTML = `<b>${safe(placeText)}</b><br>${safe(t('mapTz'))}: ${safe(p.tz)}<br>${safe(t('mapCenter'))}: ${lat.toFixed(2)}, ${lng.toFixed(2)} · ${safe(precisionLabel(center.precision))}`;
    $('mapBox').setAttribute('aria-label', `${placeText} map`);
    if (mapState.map) {
      applyMap(lat, lng, p);
    } else {
      mapState.pending = { lat, lng, p };
      if (!mapState.observerStarted) startMapObserver();
    }
  }
  function startMapObserver() {
    mapState.observerStarted = true;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !mapState.map) loadLeaflet();
    }, { rootMargin: '200px' });
    io.observe($('mapCard'));
  }
  function loadLeaflet() {
    if (mapState.loadStarted) return;
    mapState.loadStarted = true;
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = initMap; js.onerror = mapFailed;
    document.head.appendChild(js);
    setTimeout(() => { if (!mapState.map && !mapState.failed) mapFailed(); }, 12000);
  }
  function initMap() {
    if (!window.L) return;
    const box = $('mapBox');
    box.innerHTML = '';
    mapState.map = L.map(box, { scrollWheelZoom: false, attributionControl: true });
    L.tileLayer(MAP_CONFIG.tileUrl, { attribution: MAP_CONFIG.attribution, maxZoom: MAP_CONFIG.maxZoom }).addTo(mapState.map);
    if (mapState.pending) { applyMap(mapState.pending.lat, mapState.pending.lng, mapState.pending.p); }
  }
  function applyMap(lat, lng, p) {
    if (!mapState.map) return;
    mapState.map.setView([lat, lng], MAP_CONFIG.defaultZoom);
    if (mapState.marker) mapState.marker.remove();
    mapState.marker = L.circleMarker([lat, lng], { radius: 12, color: '#2563eb', fillOpacity: 0.25 }).addTo(mapState.map)
      .bindTooltip(countryName(p), { permanent: false });
  }
  function mapFailed() {
    if (mapState.map || mapState.failed) return;
    mapState.failed = true;
    $('mapBox').innerHTML = `<div class="map-fallback">${safe(t('mapUnavailable'))}</div>`;
  }

  // -----------------------------
  // i18n apply to static DOM
  // -----------------------------
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LOCALES.includes(lang) ? 'rtl' : 'ltr';
    const picker = $('langSelect');
    if (picker) {
      if (!picker.options.length) {
        picker.innerHTML = LOCALES.map((l) => `<option value="${l.code}">${safe(l.label)}</option>`).join('');
      }
      picker.value = lang;
    }
  }
  function setLang(next) {
    const code = normalizeLocale(next) || DEFAULT_LOCALE;
    if (code === lang) return;
    lang = code;
    try { localStorage.setItem('tlb-lang', lang); } catch { /* ignore */ }
    applyI18n();
    syncUrl();
    renderIdentity();
    renderBatchTable();
    renderDataSection();
  }

  // -----------------------------
  // Init + events
  // -----------------------------
  function parseInitialState() {
    const qs = new URLSearchParams(location.search);
    const fromBody = document.body.dataset.country;
    const hash = location.hash.replace('#', '');
    const slug = qs.get('country');
    let country = 'JP';
    if (fromBody && PROFILES[fromBody]) country = fromBody;
    else if (profileBySlug[hash]) country = profileBySlug[hash].code;
    else if (slug && profileBySlug[slug]) country = profileBySlug[slug].code;

    const seed = (qs.get('seed') || '').trim().slice(0, 64);
    const p = PROFILES[country];
    const city = qs.get('city') || '';
    const region = qs.get('region') || '';
    const filter = { admin: null, city: null };
    if (city && p.admins.some((a) => a.cities.includes(city))) {
      filter.city = city;
      const owner = p.admins.find((a) => a.cities.includes(city));
      filter.admin = owner ? owner.name : null;
    } else if (region && p.admins.some((a) => a.name === region)) {
      filter.admin = region;
    }
    return { country, seed, filter };
  }

  function init() {
    loadStore();
    const initial = parseInitialState();
    state.country = initial.country;
    state.seed = initial.seed;
    state.filter = initial.filter;
    applyI18n();
    const seedInput = $('seedInput');
    if (seedInput) seedInput.value = state.seed;
    renderIdentity();
    renderBatchTable();
    renderDataSection();

    document.addEventListener('click', (e) => {
      const countryBtn = e.target.closest('[data-country-btn]');
      if (countryBtn) { setCountry(countryBtn.dataset.countryBtn); return; }
      const cityBtn = e.target.closest('[data-city-btn]');
      if (cityBtn) {
        const [admin, city] = cityBtn.dataset.cityBtn.split('|');
        state.filter = { admin: admin || null, city: city || null };
        state.refresh = 0;
        syncUrl();
        renderIdentity();
        return;
      }
      const copyBtn = e.target.closest('.copy');
      if (copyBtn) { copyText(copyBtn.dataset.copy || ''); return; }
      const delSaved = e.target.closest('[data-del-saved]');
      if (delSaved) { state.saved.splice(Number(delSaved.dataset.delSaved), 1); LS.set('tlb-saved', state.saved); renderDataSection(); return; }
      const delRecent = e.target.closest('[data-del-recent]');
      if (delRecent) { state.recent.splice(Number(delRecent.dataset.delRecent), 1); LS.set('tlb-recent', state.recent); renderDataSection(); return; }
      if (!e.target.closest('#megaPanel') && !e.target.closest('#megaBtn')) closeMega();
    });

    $('megaBtn').addEventListener('click', () => ($('megaPanel').classList.contains('open') ? closeMega() : openMega()));
    $('megaClose').addEventListener('click', closeMega);
    $('megaSearch').addEventListener('input', renderMega);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMega(); });
    $('citySearch').addEventListener('input', () => renderCitySidebar());
    $('cityList').addEventListener('scroll', (e) => {
      const el = e.currentTarget;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) appendCityChunk();
    });

    $('regenBtn').addEventListener('click', () => { state.refresh += 1; renderIdentity(); });
    $('copyAllBtn').addEventListener('click', copyAllIdentity);
    $('saveBtn').addEventListener('click', () => {
      const id = state.identity;
      state.saved.unshift({ ts: Date.now(), country: state.country, name: id.nameLocal, address: id.address.local });
      state.saved = state.saved.slice(0, 50);
      const ok = LS.set('tlb-saved', state.saved);
      renderDataSection();
      toast(ok ? t('savedOk') : t('saveFail'));
    });
    $('exportBtn').addEventListener('click', () => {
      const id = state.identity;
      download(`${PROFILES[state.country].slug}-identity.json`, JSON.stringify(id, null, 2), 'application/json');
      toast('JSON ✓');
    });
    $('clearDataBtn').addEventListener('click', clearLocalData);

    $('recentToggle').addEventListener('click', () => {
      const list = $('recentList');
      list.classList.toggle('collapsed');
      updateDataToggles();
    });
    $('savedToggle').addEventListener('click', () => {
      const list = $('savedList');
      list.classList.toggle('collapsed');
      updateDataToggles();
    });

    document.querySelectorAll('.batch-count-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.batch-count-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        $('batchCountCustom').value = '';
        state.batchCount = Number(btn.dataset.count);
      });
    });
    $('batchCountCustom').addEventListener('input', (e) => {
      const n = Math.min(500, Math.max(1, Number(e.target.value) || 1));
      document.querySelectorAll('.batch-count-btn').forEach((b) => b.classList.remove('active'));
      state.batchCount = n;
    });
    document.querySelectorAll('.batch-field').forEach((cb) => cb.addEventListener('change', () => { if (state.batch.length) runBatch(); }));
    $('caseCamel').addEventListener('change', () => { state.batchCase = 'camel'; if (state.batch.length) runBatch(); });
    $('caseSnake').addEventListener('change', () => { state.batchCase = 'snake'; if (state.batch.length) runBatch(); });
    $('batchRun').addEventListener('click', runBatch);
    $('batchCopy').addEventListener('click', () => {
      if (!state.batch.length) return;
      const keys = Object.keys(state.batch[0]);
      copyText([keys.join('\t'), ...state.batch.map((r) => keys.map((k) => r[k]).join('\t'))].join('\n'), t('copiedAll'));
    });
    $('exportCsv').addEventListener('click', () => exportBatch('csv'));
    $('exportJson').addEventListener('click', () => exportBatch('json'));
    $('exportJsonl').addEventListener('click', () => exportBatch('jsonl'));
    $('exportTxt').addEventListener('click', () => exportBatch('txt'));

    if ($('langSelect')) $('langSelect').addEventListener('change', (e) => setLang(e.target.value));

    if ($('seedInput')) {
      const applySeed = () => {
        const next = ($('seedInput').value || '').trim().slice(0, 64);
        if (next === state.seed) return;
        state.seed = next;
        state.refresh = 0;
        syncUrl();
        renderIdentity();
      };
      $('seedInput').addEventListener('change', applySeed);
      $('seedInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') applySeed(); });
    }

    $('dataVersion').textContent = `v${DATA_VERSION}`;
    $('year').textContent = String(new Date().getFullYear());
    const mail = $('feedbackMail');
    if (mail) { mail.href = `mailto:${SITE.feedbackEmail}`; mail.textContent = SITE.feedbackEmail; }
    syncUrl();
  }

  // 浏览器里启动 UI；在 Node 下（单元测试）只导出纯逻辑，不触碰 DOM。
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('DOMContentLoaded', init);
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.ADDRGEN = {
      DATA_VERSION, SITE, PROFILES, CARD_BRANDS, CARD_WEIGHTS, CARD_WEIGHTS_DEFAULT,
      EMAIL_DOMAINS, EMAIL_WEIGHTS, HEIGHT_RULES, SeededRandom,
      luhnCheckDigit, luhnValid, looksTemplated, groupPan, generatePan, generateCard,
      bodyMetrics, buildEmail, buildHomepage, emailLocalPart, asciiSlug,
      generateIdentity, flatten, state, setLocaleForTest(code) { lang = normalizeLocale(code) || DEFAULT_LOCALE; }
    };
  }
})();
