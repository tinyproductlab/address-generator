/* 小产品实验室 · 全球地址 / 测试身份生成器 — V6 最终上线版
 * 纯静态、浏览器本地生成、无 Math.random（全程 SeededRandom）、无网络请求。
 * 支付字段仅来自 Provider 官方公开 Sandbox 测试卡白名单。 */
(() => {
  'use strict';

  const DATA_VERSION = '2026.09.04.1';
  const SITE = {
    name: '小产品实验室 · 全球地址生成器',
    wechat: '小产品实验室',
    wechatQr: 'assets/wechat-official-account-qr.png',
    feedbackEmail: '【待填写反馈邮箱】'
  };

  // -----------------------------
  // i18n
  // -----------------------------
  const I18N = {
    zh: {
      allCountries: '全部国家', searchCountryPh: '搜索国家：日本 / Japan / JP / JPN', recentUsed: '最近使用', close: '关闭',
      regenerate: '↻ 重新生成全部', copyAll: '复制全部', save: '保存', exportJson: '导出 JSON',
      pageSub: '选择国家或城市后，人物、地址、联系方式、Sandbox 支付测试资料与账号资料同步生成。',
      notice: '生成内容为合成测试数据。城市 / 行政区为公开地名；支付资料仅为 Sandbox / Test Only，不可用于真实交易。',
      cityTitle: '城市 / 地区', randomAll: '全国随机', searchCityPh: '搜索当前国家城市 / 地区', cityUnit: '个入口',
      cardBasic: '基本资料', cardAddress: '地址与联系方式', cardPayment: 'Sandbox 支付测试资料', cardWork: '工作资料', cardAccount: '账号与技术资料',
      tagSynthetic: '合成测试', tagRealPlusSyn: '真实地名 + 合成资料', tagTestOnly: 'Test Only', tagSyntheticWide: '合成测试',
      fNameLocal: '本地姓名', fNameRoman: '英文 / 罗马字', fGender: '性别', fDob: '出生日期', fAge: '年龄', fTitle: '称谓',
      fAddrLocal: '本地完整地址', fAddrIntl: '国际英文地址', fStreet: '街道', fHouse: '门牌', fDistrict: '区县 / District', fCity: '城市 / City', fRegion: '州 / 省 / Region', fPostal: '邮编', fCountry: '国家 / Country', fPhone: '电话', fEmail: '测试邮箱',
      fProvider: '支付 Provider', fBrand: '卡组织', fCardNumber: '测试卡号', fExpiry: '有效期', fCvc: '测试 CVC', fHolder: '持卡人', fBilling: '账单地址', fScenario: '测试场景',
      fJob: '职业', fCompany: '公司', fIndustry: '行业', fEmployment: '就业状态', fSalary: '年收入（测试值）', fCurrency: '货币', fEducation: '教育程度',
      fUsername: '用户名', fPassword: '强密码（测试值）', fUuid: 'UUID v4', fWebsite: '个人主页', fOs: '操作系统', fUa: 'User-Agent', fLocale: 'Locale', fTimezone: '时区', fLanguage: '语言代码',
      genderM: '男', genderF: '女', titleM: '先生', titleF: '女士',
      emp1: '受雇', emp2: '自由职业', emp3: '合同工',
      batchTitle: '批量生成', batchCount: '数量', batchCustomPh: '自定义 1–500', batchSeed: 'Seed（可复现）', batchSeedPh: '例如 checkout-japan-001', batchFields: '字段', batchCase: '命名', caseCamel: 'camelCase', caseSnake: 'snake_case',
      batchRun: '生成批量数据', batchCopy: '复制全部', exportCsv: 'CSV', exportJsonB: 'JSON', exportJsonl: 'JSONL', exportTxt: 'TXT', batchEmpty: '尚未生成批量数据。选择数量后点击“生成批量数据”。', batchRows: '条',
      savedTitle: '已保存', recentTitle: '最近生成', clearData: '清空本地数据', emptySaved: '暂无保存记录。点击顶部“保存”收藏当前身份。', emptyRecent: '暂无最近生成记录。', del: '删除',
      copied: '已复制', copiedAll: '已复制全部字段', savedOk: '已保存到本地浏览器', cleared: '已清空本地数据', batchDone: '已生成', cvcNote: '任意测试值',
      expand: '展开', collapse: '收起',
      fBrandTitle: '产品', fProduct1: '全球地址生成器', fProduct2: '批量生成', fProduct3: '数据来源', fHelpTitle: '帮助与政策', fHelp1: '隐私政策', fHelp2: '使用条款', fHelp3: '关于与反馈',
      fContact: '联系我们', fWechat: '微信公众号', fEmail: '反馈邮箱', fMore: '更多产品，关注微信公众号', fLocalNote: '生成数据只保存在本机浏览器，不上传服务器。', fQrNote: '正式上线替换二维码图片', fCopyright: '合成测试数据 · 浏览器本地生成 · Sandbox Payment Only',
      countryCount: '个已支持国家 / 地区'
    },
    en: {
      allCountries: 'All countries', searchCountryPh: 'Search: Japan / JP / JPN', recentUsed: 'Recent', close: 'Close',
      regenerate: '↻ Regenerate all', copyAll: 'Copy all', save: 'Save', exportJson: 'Export JSON',
      pageSub: 'Pick a country or city — identity, address, contact, sandbox payment and account data update together.',
      notice: 'All output is synthetic test data. Cities / regions use public place names; payment data is Sandbox / Test Only and cannot be used for real transactions.',
      cityTitle: 'Cities / Regions', randomAll: 'Nationwide random', searchCityPh: 'Search cities in this country', cityUnit: 'entries',
      cardBasic: 'Basic profile', cardAddress: 'Address & contact', cardPayment: 'Sandbox payment (test)', cardWork: 'Work', cardAccount: 'Account & technical',
      tagSynthetic: 'Synthetic', tagRealPlusSyn: 'Real places + synthetic', tagTestOnly: 'Test Only', tagSyntheticWide: 'Synthetic',
      fNameLocal: 'Name (local)', fNameRoman: 'Name (romanized)', fGender: 'Gender', fDob: 'Date of birth', fAge: 'Age', fTitle: 'Title',
      fAddrLocal: 'Local address', fAddrIntl: 'International address', fStreet: 'Street', fHouse: 'House no.', fDistrict: 'District', fCity: 'City', fRegion: 'State / Region', fPostal: 'Postal code', fCountry: 'Country', fPhone: 'Phone', fEmail: 'Test email',
      fProvider: 'Provider', fBrand: 'Card brand', fCardNumber: 'Test card number', fExpiry: 'Expiry', fCvc: 'Test CVC', fHolder: 'Card holder', fBilling: 'Billing address', fScenario: 'Test scenario',
      fJob: 'Occupation', fCompany: 'Company', fIndustry: 'Industry', fEmployment: 'Employment', fSalary: 'Annual income (test)', fCurrency: 'Currency', fEducation: 'Education',
      fUsername: 'Username', fPassword: 'Strong password (test)', fUuid: 'UUID v4', fWebsite: 'Website', fOs: 'OS', fUa: 'User-Agent', fLocale: 'Locale', fTimezone: 'Timezone', fLanguage: 'Language',
      genderM: 'Male', genderF: 'Female', titleM: 'Mr.', titleF: 'Ms.',
      emp1: 'Employed', emp2: 'Self-employed', emp3: 'Contract',
      batchTitle: 'Batch generation', batchCount: 'Count', batchCustomPh: 'Custom 1–500', batchSeed: 'Seed (reproducible)', batchSeedPh: 'e.g. checkout-japan-001', batchFields: 'Fields', batchCase: 'Naming', caseCamel: 'camelCase', caseSnake: 'snake_case',
      batchRun: 'Generate batch', batchCopy: 'Copy all', exportCsv: 'CSV', exportJsonB: 'JSON', exportJsonl: 'JSONL', exportTxt: 'TXT', batchEmpty: 'No batch yet. Choose a count and press “Generate batch”.', batchRows: 'rows',
      savedTitle: 'Saved', recentTitle: 'Recent', clearData: 'Clear local data', emptySaved: 'Nothing saved yet. Press “Save” to keep the current identity.', emptyRecent: 'No recent identities.', del: 'Delete',
      copied: 'Copied', copiedAll: 'All fields copied', savedOk: 'Saved to this browser', cleared: 'Local data cleared', batchDone: 'Generated', cvcNote: 'any test value',
      expand: 'Show', collapse: 'Hide',
      fBrandTitle: 'Product', fProduct1: 'Global address generator', fProduct2: 'Batch generation', fProduct3: 'Data sources', fHelpTitle: 'Help & policy', fHelp1: 'Privacy policy', fHelp2: 'Terms of use', fHelp3: 'About & feedback',
      fContact: 'Contact', fWechat: 'WeChat Official Account', fEmail: 'Feedback email', fMore: 'More products — follow us on WeChat', fLocalNote: 'Generated data stays in your browser. Nothing is uploaded.', fQrNote: 'Replace QR image at launch', fCopyright: 'Synthetic test data · Generated locally · Sandbox Payment Only',
      countryCount: 'supported countries / regions'
    }
  };
  let lang = 'zh';
  try { lang = localStorage.getItem('tlb-lang') === 'en' ? 'en' : 'zh'; } catch { /* ignore */ }
  const t = (k) => (I18N[lang] && I18N[lang][k]) || I18N.zh[k] || k;

  // -----------------------------
  // Sandbox 支付测试白名单（仅 Provider 官方公开测试卡，绝不随机生成卡号）
  // -----------------------------
  const PAYMENT = {
    provider: 'Stripe Test Mode',
    source: 'https://docs.stripe.com/testing',
    cards: [
      { brand: 'Visa', number: '4242 4242 4242 4242', scenario: 'Success' },
      { brand: 'Visa', number: '4000 0000 0000 0002', scenario: 'Declined' },
      { brand: 'Visa', number: '4000 0027 6000 3184', scenario: '3D Secure' },
      { brand: 'Mastercard', number: '5555 5555 5555 4444', scenario: 'Success' },
      { brand: 'Amex', number: '3782 822463 10005', scenario: 'Success' },
      { brand: 'Visa', number: '4000 0000 0000 9995', scenario: 'Insufficient Funds' }
    ]
  };

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
      postal: (r) => `${r.pick(['150', '160', '530', '600', '060', '812', '220'])}-${r.digits(4)}`,
      phone: (r) => `090-${r.digits(4)}-${r.digits(4)}`,
      localFormat: (p) => [`〒${p.postal}`, `${p.admin}${p.city}${p.street}${p.house}`],
      intlFormat: (p) => [`${p.house}, ${p.street}, ${p.city}, ${p.admin}, ${p.postal}, Japan`],
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
      postal: (r) => r.digits(5),
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
      postal: (r) => `${r.pick(['SW1A', 'E1', 'N1', 'M1', 'B3', 'EH1', 'CF1'])} ${r.pick(['0AA', '1BB', '2AA', '4BX'])}`,
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
      postal: (r) => r.digits(5),
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
      postal: (r) => `${r.pick(['M5V', 'K1A', 'V6B', 'H2Z', 'T2P'])} ${r.pick(['1A1', '2B2', '3C3', '4X4'])}`,
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
      postal: (r) => String(r.int(200, 7999)),
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
      postal: (r) => r.digits(6),
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
      postal: (r) => r.digits(5),
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
      postal: (r) => r.digits(6),
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
      postal: (r) => `${r.pick(['75', '69', '13', '31', '06'])}${r.digits(3)}`,
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
      postal: (r) => r.digits(5),
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
      house: (r) => `${r.int(1, 120)}${r.bool() ? 'º ' + r.pick(['A', 'B', 'C']) : ''}`,
      postal: (r) => r.digits(5),
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
      postal: (r) => `${r.digits(4)} ${r.pick(['AA', 'AB', 'BC', 'CD', 'XY'])}`,
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
      postal: (r) => `${r.digits(5)}-${r.digits(3)}`,
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
      postal: (r) => `${r.pick(['106', '110', '104', '111', '220', '802', '407'])}${r.digits(2)}`,
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
      house: (r) => `${r.int(1, 88)}, Jalan ${r.int(1, 30)}/${r.int(1, 22)}`,
      postal: (r) => `${r.pick(['50', '40', '10', '80'])}${r.digits(3)}`,
      phone: (r) => `+60 ${r.pick(['12', '13', '19', '16'])}-${r.digits(3)} ${r.digits(4)}`,
      localFormat: (p) => [`${p.house}`, `${p.postal} ${p.city}`, `${p.admin}`, 'Malaysia'],
      intlFormat: (p) => [`${p.house}, ${p.postal} ${p.city}, ${p.admin}, Malaysia`],
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
      streets: ['ул. Тверская', 'Ленинский проспект', 'ул. Арбат', 'Невский проспект'],
      house: (r) => `${r.int(1, 90)}${r.bool() ? ', кв. ' + r.int(1, 220) : ''}`,
      postal: (r) => `${r.pick(['10', '11', '12', '19'])}${r.digits(4)}`,
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
      postal: (r) => `${r.pick(['10', '20', '83', '20'])}${r.digits(3)}`,
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
      postal: (r) => `${r.pick(['12', '16', '10', '80'])}${r.digits(2)}`,
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
      postal: (r) => `${r.pick(['C', 'B', 'S'])}${r.digits(4)}${r.pick(['A', 'B', 'C'])}${r.pick(['A', 'B', 'C'])}`,
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
      postal: (r, admin) => `${(admin && admin.zp) || '34'}${r.digits(3)}`,
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
  const QUICK = ['US', 'JP', 'GB', 'DE', 'CA', 'AU', 'CN', 'KR', 'SG', 'FR'];
  const CONTINENTS = ['亚洲', '欧洲', '北美洲', '南美洲', '大洋洲'];
  const profileBySlug = {};
  Object.values(PROFILES).forEach((p) => { profileBySlug[p.slug] = p; });

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
    digits(length) { return String(this.int(0, 10 ** length - 1)).padStart(length, '0'); }
  }

  // -----------------------------
  // State + storage
  // -----------------------------
  const state = {
    country: 'JP', filter: { admin: null, city: null }, refresh: 0,
    identity: null, batch: [], batchCount: 10, batchSeed: '', batchCase: 'camel',
    saved: [], recent: [], recentCountries: []
  };
  const $ = (id) => document.getElementById(id);
  const safe = (v) => String(v ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  const LS = {
    get(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }
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
    const districts = (admin.districts && admin.districts.length) ? admin.districts : [city];
    return { admin, city, district: rng.pick(districts) };
  }

  function generateIdentity(seedKey) {
    const p = PROFILES[state.country];
    const rng = new SeededRandom(`${seedKey}|${state.country}|${state.filter.admin || ''}|${state.filter.city || ''}`);
    const place = pickPlace(p, rng);
    const genderKey = rng.bool() ? 'male' : 'female';
    const last = rng.pick(p.last);
    const first = rng.pick(p[genderKey]);
    const rLast = romanOf(last, p.romanLast);
    const rFirst = romanOf(first, genderKey === 'male' ? p.romanMale : p.romanFemale);
    const cjk = ['CN', 'JP', 'KR', 'TW', 'HK'].includes(p.code);
    const nameLocal = !cjk ? `${rFirst} ${rLast}`
      : (p.code === 'JP' || p.code === 'KR' ? `${localOf(last)} ${localOf(first)}` : `${localOf(last)}${localOf(first)}`);
    const nameRoman = `${rFirst} ${rLast}`;

    const ageYears = rng.int(20, 55);
    const year = 2026 - ageYears;
    const month = rng.int(1, 12);
    const day = rng.int(1, 28);
    const dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const parts = {
      house: p.house(rng), street: rng.pick(p.streets), district: place.district, city: place.city,
      admin: place.admin.name, adminCode: place.admin.code || '', postal: p.postal(rng, place.admin)
    };
    const localLines = p.localFormat(parts);
    const intlLines = p.intlFormat(parts);
    const emailLocal = `${rFirst}.${rLast}${rng.digits(2)}`.toLowerCase().replace(/[^a-z0-9.]/g, '') || 'test.user';
    const email = `${emailLocal}@example.test`;
    const phone = p.phone(rng);

    const payCard = rng.pick(PAYMENT.cards);
    const expiry = `${String(rng.int(1, 12)).padStart(2, '0')}/${rng.int(27, 34)}`;
    const cvc = payCard.brand === 'Amex' ? rng.digits(4) : rng.digits(3);
    const salary = rng.int(p.salary[0], p.salary[1]);

    const uuidHex = () => rng.digits(8) + '-' + rng.digits(4) + '-4' + rng.digits(3) + '-' + rng.pick(['8', '9', 'a', 'b']) + rng.digits(3) + '-' + rng.digits(12);
    const uuid = uuidHex();
    const username = `${rFirst.toLowerCase().replace(/[^a-z0-9]/g, '')}_${rng.digits(4)}`;
    const pwChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
    const password = Array.from({ length: 16 }, () => pwChars[rng.int(0, pwChars.length - 1)]).join('');
    const os = rng.pick(['macOS 15 · Safari 18', 'Windows 11 · Chrome 128', 'macOS 14 · Chrome 127', 'iOS 17 · Safari', 'Android 15 · Chrome', 'Ubuntu 24.04 · Firefox 127']);
    const ua = rng.pick([
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
    ]);

    return {
      seedKey, gender: genderKey === 'male' ? t('genderM') : t('genderF'),
      nameLocal, nameRoman, dob, age: ageYears,
      title: genderKey === 'male' ? t('titleM') : t('titleF'),
      address: {
        local: localLines.join('\n'), international: intlLines.join(' '),
        street: parts.street, house: parts.house, district: parts.district, city: parts.city,
        region: parts.admin, regionCode: parts.adminCode, postal: parts.postal,
        country: `${p.nameZh} / ${p.nativeName} (${p.code})`
      },
      phone, email,
      payment: {
        provider: PAYMENT.provider, brand: payCard.brand, number: payCard.number,
        expiry, cvc, holder: nameRoman, billing: intlLines.join(', '), scenario: payCard.scenario
      },
      work: {
        job: rng.pick(p.jobs), company: rng.pick(p.companies),
        industry: t('tagSynthetic') === '合成测试' ? rng.pick(['互联网 / IT', '金融', '教育', '制造业', '零售']) : rng.pick(['Internet / IT', 'Finance', 'Education', 'Manufacturing', 'Retail']),
        employment: rng.pick([t('emp1'), t('emp2'), t('emp3')]),
        salary: salary.toLocaleString('en-US'), currency: p.currency,
        education: lang === 'zh' ? rng.pick(['学士', '硕士', '博士', '专科']) : rng.pick(['Bachelor', 'Master', 'PhD', 'Associate'])
      },
      account: {
        username, password, uuid,
        website: `https://${username}.example.test`, os, ua,
        locale: p.locale, timezone: p.tz, language: p.langCode
      }
    };
  }

  // -----------------------------
  // Row rendering (字段名 | 值 | 复制)
  // -----------------------------
  function row(label, value, opts = {}) {
    const v = Array.isArray(value) ? value.join('\n') : String(value);
    const cls = opts.big ? ' big' : '';
    return `<div class="row"><div class="k">${safe(label)}</div><div class="v${cls}">${safe(v)}</div><button type="button" class="copy" data-copy="${safe(v)}" aria-label="${safe(label)} copy">${lang === 'zh' ? '复制' : 'Copy'}</button></div>`;
  }
  function cardRows(id, rowsHtml) { $(id).innerHTML = rowsHtml; }

  function renderIdentity() {
    state.identity = generateIdentity(`v6-${state.refresh}`);
    const id = state.identity;
    const p = PROFILES[state.country];

    const titleText = lang === 'en' ? `${p.nameEn} Address / Test Identity Generator` : `${p.nameZh}地址 / 测试身份生成器`;
    $('pageTitle').textContent = titleText;
    document.title = lang === 'en' ? `${titleText} - TinyProductLab` : `${titleText} - 小产品实验室`;
    const desc = `${p.nameZh}测试身份与地址生成器：真实${p.nameZh}地名格式 + 合成测试人物、联系方式与 Sandbox 支付测试资料，浏览器本地生成。`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);

    cardRows('basic', [
      row(t('fNameLocal'), id.nameLocal),
      row(t('fNameRoman'), id.nameRoman),
      row(t('fGender'), id.gender),
      row(t('fDob'), id.dob),
      row(t('fAge'), id.age),
      row(t('fTitle'), id.title)
    ].join(''));
    cardRows('address', [
      row(t('fAddrLocal'), id.address.local, { big: true }),
      row(t('fAddrIntl'), id.address.international),
      row(t('fStreet'), id.address.street),
      row(t('fHouse'), id.address.house),
      row(t('fDistrict'), id.address.district),
      row(t('fCity'), id.address.city),
      row(t('fRegion'), id.address.region + (id.address.regionCode ? ` (${id.address.regionCode})` : '')),
      row(t('fPostal'), id.address.postal || (lang === 'zh' ? '（该地区无邮编）' : '(no postal code)')),
      row(t('fCountry'), id.address.country),
      row(t('fPhone'), id.phone),
      row(t('fEmail'), id.email)
    ].join(''));
    cardRows('payment', [
      row(t('fProvider'), id.payment.provider),
      row(t('fBrand'), id.payment.brand),
      row(t('fCardNumber'), id.payment.number),
      row(t('fExpiry'), id.payment.expiry),
      row(t('fCvc'), `${id.payment.cvc}（${t('cvcNote')}）`),
      row(t('fHolder'), id.payment.holder),
      row(t('fBilling'), id.payment.billing),
      row(t('fScenario'), id.payment.scenario)
    ].join(''));
    cardRows('work', [
      row(t('fJob'), id.work.job),
      row(t('fCompany'), id.work.company),
      row(t('fIndustry'), id.work.industry),
      row(t('fEmployment'), id.work.employment),
      row(t('fSalary'), `${id.work.salary} ${id.work.currency}`),
      row(t('fEducation'), id.work.education)
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
      row(t('fLanguage'), id.account.language)
    ].join(''));

    renderCitySidebar();
    renderQuickNav();
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
  function renderQuickNav() {
    $('quickNav').innerHTML = QUICK.map((c) => {
      const p = PROFILES[c];
      const current = c === state.country;
      return `<button type="button" class="country${current ? ' active' : ''}" data-country-btn="${c}" ${current ? 'aria-current="true"' : ''}>${p.flag} ${p.nameZh}</button>`;
    }).join('');
    $('megaBtn').textContent = `${t('allCountries')} · ${Object.keys(PROFILES).length} ⌄`;
  }
  function renderMega() {
    const q = ($('megaSearch').value || '').trim().toLowerCase();
    const recentHtml = (!q && state.recentCountries.length)
      ? `<div class="mega-group-title">${t('recentUsed')}</div><div class="mega-grid">${state.recentCountries.filter((c) => PROFILES[c]).map((c) => megaItem(PROFILES[c])).join('')}</div>` : '';
    const groups = CONTINENTS.map((cont) => {
      const items = Object.values(PROFILES)
        .filter((p) => p.continent === cont)
        .filter((p) => !q || `${p.nameZh} ${p.nameEn} ${p.nativeName} ${p.code} ${p.alpha3} ${p.slug}`.toLowerCase().includes(q));
      if (!items.length) return '';
      return `<div class="mega-group-title">${cont}</div><div class="mega-grid">${items.map((p) => megaItem(p)).join('')}</div>`;
    }).join('');
    $('megaGroups').innerHTML = recentHtml + (groups || `<div class="mega-empty">${lang === 'zh' ? '没有匹配的国家' : 'No matching country'}</div>`);
    function megaItem(p) {
      const active = p.code === state.country;
      return `<button type="button" class="copt${active ? ' active' : ''}" data-country-btn="${p.code}" ${active ? 'aria-selected="true"' : ''}><span>${p.flag}</span><span class="cname">${p.nameZh}<span class="cmeta">${p.nameEn} · ${p.code}</span></span></button>`;
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
    const url = `${location.pathname}?country=${PROFILES[code].slug}#${PROFILES[code].slug}`;
    history.replaceState(null, '', url);
    renderIdentity();
  }

  // -----------------------------
  // City sidebar
  // -----------------------------
  function renderCitySidebar() {
    const p = PROFILES[state.country];
    const q = ($('citySearch').value || '').trim().toLowerCase();
    const list = $('cityList');
    let html = `<button type="button" class="city${!state.filter.admin && !state.filter.city ? ' active' : ''}" data-city-btn="|">${t('randomAll')}</button>`;
    let count = 1;
    p.admins.forEach((a) => {
      const cities = a.cities.filter((c) => !q || `${a.name} ${c}`.toLowerCase().includes(q));
      if (q && !cities.length && !a.name.toLowerCase().includes(q)) return;
      html += `<div class="citygroup">${safe(a.name)}</div>`;
      cities.forEach((c) => {
        const active = state.filter.city === c;
        html += `<button type="button" class="city${active ? ' active' : ''}" data-city-btn="${safe(a.name)}|${safe(c)}">${safe(c)}</button>`;
        count += 1;
      });
    });
    list.innerHTML = html;
    $('cityCount').textContent = `${count} ${t('cityUnit')}`;
  }

  // -----------------------------
  // Batch
  // -----------------------------
  function batchFields() {
    return Array.from(document.querySelectorAll('.batch-field:checked')).map((el) => el.value);
  }
  function flatten(id, fields) {
    const out = {};
    if (fields.includes('name')) { out.name = id.nameLocal; out.nameRoman = id.nameRoman; }
    if (fields.includes('gender')) out.gender = id.gender;
    if (fields.includes('dob')) out.dob = id.dob;
    if (fields.includes('address')) out.address = id.address.international;
    if (fields.includes('phone')) out.phone = id.phone;
    if (fields.includes('email')) out.email = id.email;
    if (fields.includes('company')) out.company = id.work.company;
    if (fields.includes('job')) out.job = id.work.job;
    if (fields.includes('card')) out.testCard = id.payment.number;
    if (fields.includes('username')) out.username = id.account.username;
    if (fields.includes('uuid')) out.uuid = id.account.uuid;
    if (state.batchCase === 'snake') {
      const snaked = {};
      Object.entries(out).forEach(([k, v]) => { snaked[k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())] = v; });
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
      ? state.recent.map((it, i) => `<div class="data-item"><div class="data-main"><b>${safe(it.name)}</b><span>${safe(it.address)}</span><span class="data-meta">${PROFILES[it.country] ? PROFILES[it.country].flag : ''} ${new Date(it.ts).toLocaleString()}</span></div><button type="button" class="mini" data-del-recent="${i}">${t('del')}</button></div>`).join('')
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
    const lines = [
      `${t('fNameLocal')}: ${id.nameLocal}`, `${t('fNameRoman')}: ${id.nameRoman}`, `${t('fGender')}: ${id.gender}`,
      `${t('fDob')}: ${id.dob} (${t('fAge')}: ${id.age})`, `${t('fTitle')}: ${id.title}`,
      `${t('fAddrLocal')}: ${id.address.local}`, `${t('fAddrIntl')}: ${id.address.international}`,
      `${t('fCity')}: ${id.address.city}`, `${t('fRegion')}: ${id.address.region}`, `${t('fPostal')}: ${id.address.postal}`,
      `${t('fPhone')}: ${id.phone}`, `${t('fEmail')}: ${id.email}`,
      `${t('fProvider')}: ${id.payment.provider} (${t('tagTestOnly')})`, `${t('fCardNumber')}: ${id.payment.number}`,
      `${t('fScenario')}: ${id.payment.scenario}`,
      `${t('fJob')}: ${id.work.job}`, `${t('fCompany')}: ${id.work.company}`,
      `${t('fUsername')}: ${id.account.username}`, `${t('fUuid')}: ${id.account.uuid}`
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
  // i18n apply to static DOM
  // -----------------------------
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    $('langBtn').textContent = lang === 'zh' ? 'EN' : '中文';
  }

  // -----------------------------
  // Init + events
  // -----------------------------
  function parseInitialCountry() {
    const fromBody = document.body.dataset.country;
    if (fromBody && PROFILES[fromBody]) return fromBody;
    const hash = location.hash.replace('#', '');
    if (profileBySlug[hash]) return profileBySlug[hash].code;
    const qs = new URLSearchParams(location.search);
    const slug = qs.get('country');
    if (slug && profileBySlug[slug]) return profileBySlug[slug].code;
    return 'JP';
  }

  function init() {
    loadStore();
    state.country = parseInitialCountry();
    applyI18n();
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

    $('regenBtn').addEventListener('click', () => { state.refresh += 1; renderIdentity(); });
    $('copyAllBtn').addEventListener('click', copyAllIdentity);
    $('saveBtn').addEventListener('click', () => {
      const id = state.identity;
      state.saved.unshift({ ts: Date.now(), country: state.country, name: id.nameLocal, address: id.address.local });
      state.saved = state.saved.slice(0, 50);
      LS.set('tlb-saved', state.saved);
      renderDataSection();
      toast(t('savedOk'));
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

    $('langBtn').addEventListener('click', () => {
      lang = lang === 'zh' ? 'en' : 'zh';
      try { localStorage.setItem('tlb-lang', lang); } catch { /* ignore */ }
      applyI18n();
      renderIdentity();
      renderBatchTable();
    });

    $('dataVersion').textContent = DATA_VERSION;
    $('year').textContent = String(new Date().getFullYear());
  }

  document.addEventListener('DOMContentLoaded', init);
})();
