/* 小产品实验室 · 全球地址 / 测试身份生成器 — V6 最终上线版
 * 纯静态、浏览器本地生成、无 Math.random（全程 SeededRandom）、无网络请求。
 * 支付字段仅来自 Provider 官方公开 Sandbox 测试卡白名单。 */
(() => {
  'use strict';

  const DATA_VERSION = '2026.09.04.2';
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
      cardBasic: '基本资料', cardAddress: '地址与联系方式', cardPayment: 'Sandbox 支付测试资料', cardWork: '工作资料', cardAccount: '账号与技术资料', cardExtra: '其他人物档案', cardMap: '区域地图', mapTag: '区域位置 · 非精确住宅定位',
      tagSynthetic: '合成测试', tagRealPlusSyn: '真实地名 + 合成资料', tagTestOnly: 'Test Only', tagSyntheticWide: '合成测试',
      fNameLocal: '本地姓名', fNameRoman: '英文 / 罗马字', fGender: '性别', fDob: '出生日期', fAge: '年龄', fTitle: '称谓',
      fAddrLocal: '本地完整地址', fAddrIntl: '国际英文地址', fStreet: '街道', fHouse: '门牌', fDistrict: '区县 / District', fCity: '城市 / City', fRegion: '州 / 省 / Region', fPostal: '邮编', fCountry: '国家 / Country', fPhone: '电话', fEmail: '测试邮箱',
      fProvider: '支付 Provider', fBrand: '卡组织', fCardNumber: '测试卡号', fExpiry: '有效期', fCvc: '测试 CVC', fHolder: '持卡人', fBilling: '账单地址', fScenario: '测试场景',
      fJob: '职业', fCompany: '公司', fIndustry: '行业', fEmployment: '就业状态', fSalary: '年收入（测试值）', fCurrency: '货币', fEducation: '教育程度',
      fUsername: '用户名', fPassword: '强密码（测试值）', fUuid: 'UUID v4', fWebsite: '个人主页', fOs: '操作系统', fUa: 'User-Agent', fLocale: 'Locale', fTimezone: '时区', fLanguage: '语言代码', fScreen: '屏幕分辨率', fDevice: '设备类别',
      fHeight: '身高', fWeight: '体重', fBlood: '血型', fHair: '发色', fSecQ: '安全问题', fSecA: '安全答案（合成）', fInterests: '兴趣标签', fBio: '个人简介', fAvatar: '头像首字母',
      fCompanySize: '公司规模', fIssuingCountry: '发卡国家', fAvs: 'AVS 测试',
      genderM: '男', genderF: '女', titleM: '先生', titleF: '女士',
      emp1: '受雇', emp2: '自由职业', emp3: '合同工',
      batchTitle: '批量生成', batchCount: '数量', batchCustomPh: '自定义 1–500', batchSeed: 'Seed（可复现）', batchSeedPh: '例如 checkout-japan-001', batchFields: '字段', batchCase: '命名', caseCamel: 'camelCase', caseSnake: 'snake_case',
      batchRun: '生成批量数据', batchCopy: '复制全部', exportCsv: 'CSV', exportJsonB: 'JSON', exportJsonl: 'JSONL', exportTxt: 'TXT', batchEmpty: '尚未生成批量数据。选择数量后点击“生成批量数据”。', batchRows: '条',
      savedTitle: '已保存', recentTitle: '最近生成', clearData: '清空本地数据', emptySaved: '暂无保存记录。点击顶部“保存”收藏当前身份。', emptyRecent: '暂无最近生成记录。', del: '删除',
      copied: '已复制', copiedAll: '已复制全部字段', savedOk: '已保存到本地浏览器', cleared: '已清空本地数据', batchDone: '已生成', cvcNote: '任意测试值',
      expand: '展开', collapse: '收起',
      fBrandTitle: '产品', fProduct1: '全球地址生成器', fProduct2: '批量生成', fProduct3: '数据来源', fHelpTitle: '帮助与政策', fHelp1: '隐私政策', fHelp2: '使用条款', fHelp3: '关于与反馈',
      fContact: '联系我们', fWechat: '微信公众号', fMore: '更多产品，关注微信公众号', fLocalNote: '生成数据只保存在本机浏览器，不上传服务器。', fQrNote: '正式上线替换二维码图片', fCopyright: '合成测试数据 · 浏览器本地生成 · Sandbox Payment Only',
      countryCount: '个已支持国家 / 地区'
    },
    en: {
      allCountries: 'All countries', searchCountryPh: 'Search: Japan / JP / JPN', recentUsed: 'Recent', close: 'Close',
      regenerate: '↻ Regenerate all', copyAll: 'Copy all', save: 'Save', exportJson: 'Export JSON',
      pageSub: 'Pick a country or city — identity, address, contact, sandbox payment and account data update together.',
      notice: 'All output is synthetic test data. Cities / regions use public place names; payment data is Sandbox / Test Only and cannot be used for real transactions.',
      cityTitle: 'Cities / Regions', randomAll: 'Nationwide random', searchCityPh: 'Search cities in this country', cityUnit: 'entries',
      cardBasic: 'Basic profile', cardAddress: 'Address & contact', cardPayment: 'Sandbox payment (test)', cardWork: 'Work', cardAccount: 'Account & technical', cardExtra: 'Other profile fields', cardMap: 'Region map', mapTag: 'Region only · not a precise address',
      tagSynthetic: 'Synthetic', tagRealPlusSyn: 'Real places + synthetic', tagTestOnly: 'Test Only', tagSyntheticWide: 'Synthetic',
      fNameLocal: 'Name (local)', fNameRoman: 'Name (romanized)', fGender: 'Gender', fDob: 'Date of birth', fAge: 'Age', fTitle: 'Title',
      fAddrLocal: 'Local address', fAddrIntl: 'International address', fStreet: 'Street', fHouse: 'House no.', fDistrict: 'District', fCity: 'City', fRegion: 'State / Region', fPostal: 'Postal code', fCountry: 'Country', fPhone: 'Phone', fEmail: 'Test email',
      fProvider: 'Provider', fBrand: 'Card brand', fCardNumber: 'Test card number', fExpiry: 'Expiry', fCvc: 'Test CVC', fHolder: 'Card holder', fBilling: 'Billing address', fScenario: 'Test scenario',
      fJob: 'Occupation', fCompany: 'Company', fIndustry: 'Industry', fEmployment: 'Employment', fSalary: 'Annual income (test)', fCurrency: 'Currency', fEducation: 'Education',
      fUsername: 'Username', fPassword: 'Strong password (test)', fUuid: 'UUID v4', fWebsite: 'Website', fOs: 'OS', fUa: 'User-Agent', fLocale: 'Locale', fTimezone: 'Timezone', fLanguage: 'Language', fScreen: 'Screen', fDevice: 'Device',
      fHeight: 'Height', fWeight: 'Weight', fBlood: 'Blood type', fHair: 'Hair color', fSecQ: 'Security question', fSecA: 'Security answer (synthetic)', fInterests: 'Interests', fBio: 'Bio', fAvatar: 'Avatar initial',
      fCompanySize: 'Company size', fIssuingCountry: 'Issuing country', fAvs: 'AVS test',
      genderM: 'Male', genderF: 'Female', titleM: 'Mr.', titleF: 'Ms.',
      emp1: 'Employed', emp2: 'Self-employed', emp3: 'Contract',
      batchTitle: 'Batch generation', batchCount: 'Count', batchCustomPh: 'Custom 1–500', batchSeed: 'Seed (reproducible)', batchSeedPh: 'e.g. checkout-japan-001', batchFields: 'Fields', batchCase: 'Naming', caseCamel: 'camelCase', caseSnake: 'snake_case',
      batchRun: 'Generate batch', batchCopy: 'Copy all', exportCsv: 'CSV', exportJsonB: 'JSON', exportJsonl: 'JSONL', exportTxt: 'TXT', batchEmpty: 'No batch yet. Choose a count and press “Generate batch”.', batchRows: 'rows',
      savedTitle: 'Saved', recentTitle: 'Recent', clearData: 'Clear local data', emptySaved: 'Nothing saved yet. Press “Save” to keep the current identity.', emptyRecent: 'No recent identities.', del: 'Delete',
      copied: 'Copied', copiedAll: 'All fields copied', savedOk: 'Saved to this browser', cleared: 'Local data cleared', batchDone: 'Generated', cvcNote: 'any test value',
      expand: 'Show', collapse: 'Hide',
      fBrandTitle: 'Product', fProduct1: 'Global address generator', fProduct2: 'Batch generation', fProduct3: 'Data sources', fHelpTitle: 'Help & policy', fHelp1: 'Privacy policy', fHelp2: 'Terms of use', fHelp3: 'About & feedback',
      fContact: 'Contact', fWechat: 'WeChat Official Account', fMore: 'More products — follow us on WeChat', fLocalNote: 'Generated data stays in your browser. Nothing is uploaded.', fQrNote: 'Replace QR image at launch', fCopyright: 'Synthetic test data · Generated locally · Sandbox Payment Only',
      countryCount: 'supported countries / regions'
    }
  };
  let lang = 'zh';
  try { lang = localStorage.getItem('tlb-lang') === 'en' ? 'en' : 'zh'; } catch { /* ignore */ }
  const t = (k) => (I18N[lang] && I18N[lang][k]) || I18N.zh[k] || k;

  // -----------------------------
  // Sandbox Payment Registry（仅 Provider 官方公开测试卡；多 Provider / 品牌 / 场景轮换；绝不随机生成卡号）
  // -----------------------------
  const PAY_PROVIDERS = [
    {
      id: 'stripe', name: 'Stripe', catalog: 'Stripe Testing 官方测试目录', url: 'https://docs.stripe.com/testing',
      cards: [
        { brand: 'Visa', number: '4242424242424242', scenario: 'Success（成功扣款）' },
        { brand: 'Visa', number: '4000000000000002', scenario: 'Declined（拒付）' },
        { brand: 'Visa', number: '4000002760003184', scenario: '3D Secure 验证（Authentication Required）' },
        { brand: 'Visa', number: '4000000000009995', scenario: 'Insufficient Funds（余额不足）' },
        { brand: 'Mastercard', number: '5555555555554444', scenario: 'Success（成功扣款）' },
        { brand: 'Amex', number: '378282246310005', scenario: 'Success（成功扣款）' },
        { brand: 'JCB', number: '3566002020360505', scenario: 'Success（成功扣款）', country: 'JP' },
        { brand: 'UnionPay', number: '6200000000000005', scenario: 'Success（成功扣款）', country: 'CN' },
        { brand: 'Discover', number: '6011111111111117', scenario: 'Success（成功扣款）' },
        { brand: 'Diners Club', number: '30569309025904', scenario: 'Success（成功扣款）' }
      ]
    },
    {
      id: 'adyen', name: 'Adyen', catalog: 'Adyen Test Cards 官方测试目录', url: 'https://www.adyen.com/',
      cards: [
        { brand: 'Visa', number: '4111111145551142', scenario: '3D Secure 2 认证（Authentication Required）' },
        { brand: 'Mastercard', number: '5577000055770004', scenario: '3D Secure 认证（Authentication Required）' },
        { brand: 'Visa', number: '4166666666666666', scenario: 'Success（成功扣款）' }
      ]
    },
    {
      id: 'braintree', name: 'Braintree', catalog: 'Braintree Sandbox Testing 官方测试目录', url: 'https://developer.paypal.com/braintree/docs/reference/general/testing/',
      cards: [
        { brand: 'Visa', number: '4111111111111111', scenario: 'Success（成功扣款）' },
        { brand: 'Visa', number: '4000111111111115', scenario: 'Declined（拒付）' },
        { brand: 'Mastercard', number: '5105105105105100', scenario: 'Success（成功扣款）' },
        { brand: 'Amex', number: '371449635398431', scenario: 'Success（成功扣款）' }
      ]
    }
  ];
  function groupCardNumber(num, brand) {
    if (brand === 'Amex' || brand === 'Diners Club') return num.replace(/^(\d{4})(\d{6})(\d+)$/, '$1 $2 $3');
    return num.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }
  function pickSandboxCard(rng, profile) {
    const provider = rng.pick(PAY_PROVIDERS);
    const localCards = provider.cards.filter((c) => c.country === profile.code);
    let card;
    if (localCards.length && rng.bool()) card = rng.pick(localCards);
    else card = rng.pick(provider.cards.filter((c) => !c.country || c.country === profile.code));
    return { provider, card };
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
    'AQ|南极洲|Antarctica|其他地区|USD|en-AQ|Antarctica/McMurdo|672||0|0|',
    'BV|布韦岛|Bouvet Island|其他地区|NOK|nb-BV|Atlantic/Bouvet|47||-54.42|3.38|',
    'HM|赫德岛和麦克唐纳群岛|Heard & McDonald Islands|其他地区|AUD|en-HM|Indian/Kerguelen|672||-53.11|72.51|',
    'IO|英属印度洋领地|British Indian Ocean Territory|其他地区|USD|en-IO|Indian/Chagos|246|Diego Garcia|-7.31|72.41|',
    'CC|科科斯（基林）群岛|Cocos (Keeling) Islands|其他地区|AUD|en-CC|Indian/Cocos|61|West Island|-12.16|96.83|',
    'CX|圣诞岛|Christmas Island|其他地区|AUD|en-CX|Indian/Christmas|61|Flying Fish Cove|-10.42|105.68|',
    'TF|法属南部领地|French Southern Territories|其他地区|EUR|fr-TF|Indian/Kerguelen|262|Port-aux-Français|-49.35|70.22|',
    'UM|美国本土外小岛屿|U.S. Outlying Islands|其他地区|USD|en-UM|Pacific/Midway|1||0|0|',
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
  });
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
    const districts = (admin.districts && admin.districts.length) ? admin.districts : null;
    return { admin, city, district: districts ? rng.pick(districts) : '' };
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

    const pay = pickSandboxCard(rng, p);
    const payCard = pay.card;
    const expiry = `${String(rng.int(1, 12)).padStart(2, '0')}/${rng.int(27, 34)}`;
    const cvc = payCard.brand === 'Amex' ? rng.digits(4) : rng.digits(3);
    const salary = rng.int(p.salary[0], p.salary[1]);
    const avs = rng.pick(lang === 'zh' ? ['Match（一致）', 'Partial（部分匹配）', 'Fail（不匹配）'] : ['Match', 'Partial', 'Fail']);
    const secQuestions = lang === 'zh'
      ? ['你第一只宠物的名字是什么？', '你小学老师的名字是什么？', '你第一次旅行去的城市？']
      : ['What was your first pet\'s name?', 'What was your primary school teacher\'s name?', 'Which city did you first travel to?'];
    const secAnswers = ['maple', 'quartz', 'harbor', 'cedar', 'lumen', 'aster'];
    const interests = lang === 'zh'
      ? ['摄影', '徒步', '阅读', '烹食', '羽毛球', '电子游戏']
      : ['Photography', 'Hiking', 'Reading', 'Cooking', 'Badminton', 'Gaming'];
    const bios = lang === 'zh'
      ? ['喜欢安静的周末和一杯咖啡。', '周末喜欢去市集闲逛。', '正在学一门新语言。', '喜欢老电影和长散步。']
      : ['Enjoys quiet weekends and a good coffee.', 'Browses local markets on weekends.', 'Learning a new language.', 'Loves old movies and long walks.'];
    const hairColors = lang === 'zh' ? ['黑色', '深棕色', '棕色', '金色', '栗色'] : ['Black', 'Dark Brown', 'Brown', 'Blond', 'Chestnut'];

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
        provider: pay.provider.name, catalog: pay.provider.catalog, catalogUrl: pay.provider.url,
        brand: payCard.brand, number: groupCardNumber(payCard.number, payCard.brand),
        issuingCountry: payCard.country ? (PROFILES[payCard.country] ? PROFILES[payCard.country].nameZh : payCard.country)
          : (lang === 'zh' ? 'Generic Sandbox（官方通用测试卡）' : 'Generic Sandbox (official generic test card)'),
        currency: p.currency, expiry, cvc, holder: nameRoman, billing: intlLines.join(', '),
        scenario: payCard.scenario, avs
      },
      work: {
        job: rng.pick(p.jobs), company: rng.pick(p.companies),
        industry: t('tagSynthetic') === '合成测试' ? rng.pick(['互联网 / IT', '金融', '教育', '制造业', '零售']) : rng.pick(['Internet / IT', 'Finance', 'Education', 'Manufacturing', 'Retail']),
        companySize: rng.pick(lang === 'zh' ? ['1-10 人', '11-50 人', '51-200 人', '201-500 人', '500 人以上'] : ['1-10', '11-50', '51-200', '201-500', '500+']),
        employment: rng.pick([t('emp1'), t('emp2'), t('emp3')]),
        salary: salary.toLocaleString('en-US'), currency: p.currency,
        education: lang === 'zh' ? rng.pick(['学士', '硕士', '博士', '专科']) : rng.pick(['Bachelor', 'Master', 'PhD', 'Associate'])
      },
      account: {
        username, password, uuid,
        website: `https://${username}.example.test`, os, ua,
        locale: p.locale, timezone: p.tz, language: p.langCode,
        screen: rng.pick(['1920×1080', '2560×1440', '1440×900', '1366×768', '390×844']),
        device: rng.pick(lang === 'zh' ? ['桌面端', '笔记本', '手机', '平板'] : ['Desktop', 'Laptop', 'Mobile', 'Tablet'])
      },
      extra: {
        height: `${rng.int(150, 195)} cm`, weight: `${rng.int(45, 95)} kg`,
        blood: rng.pick(['A', 'B', 'AB', 'O']), hair: rng.pick(hairColors),
        secQ: rng.pick(secQuestions), secA: rng.pick(secAnswers),
        interests: [rng.pick(interests), rng.pick(interests), rng.pick(interests)].filter((v, i, a) => a.indexOf(v) === i).join(' / '),
        bio: rng.pick(bios),
        avatar: nameRoman.charAt(0).toUpperCase()
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
      row(t('fTitle'), id.title),
      row(t('fHeight'), id.extra.height),
      row(t('fWeight'), id.extra.weight),
      row(t('fBlood'), id.extra.blood),
      row(t('fHair'), id.extra.hair)
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
      row(t('fCountry'), id.address.country),
      row(t('fTimezone'), id.account.timezone),
      row(t('fPhone'), id.phone),
      row(t('fEmail'), id.email)
    ].join(''));
    cardRows('payment', [
      row(t('fProvider'), id.payment.provider),
      row(t('fBrand'), id.payment.brand),
      row(t('fCardNumber'), id.payment.number),
      row(t('fIssuingCountry'), id.payment.issuingCountry),
      row(t('fCurrency'), id.payment.currency),
      row(t('fExpiry'), id.payment.expiry),
      row(t('fCvc'), `${id.payment.cvc}（${t('cvcNote')}）`),
      row(t('fHolder'), id.payment.holder),
      row(t('fBilling'), id.payment.billing),
      row(t('fAvs'), id.payment.avs),
      row(t('fScenario'), id.payment.scenario)
    ].join('') + `<div class="card-source">${lang === 'zh' ? '来源' : 'Source'}: <a href="${id.payment.catalogUrl}" target="_blank" rel="noopener">${safe(id.payment.provider)} · ${safe(id.payment.catalog)}</a> · Sandbox / Test Only</div>`);
    cardRows('work', [
      row(t('fJob'), id.work.job),
      row(t('fCompany'), id.work.company),
      row(t('fIndustry'), id.work.industry),
      row(t('fCompanySize'), id.work.companySize),
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
      row(t('fLanguage'), id.account.language),
      row(t('fScreen'), id.account.screen),
      row(t('fDevice'), id.account.device)
    ].join(''));
    cardRows('extraProfile', [
      `<div class="row"><div class="k">${safe(t('fAvatar'))}</div><div class="v"><span class="avatar-chip">${safe(id.extra.avatar)}</span></div><button type="button" class="copy" data-copy="${safe(id.extra.avatar)}" aria-label="copy avatar">${lang === 'zh' ? '复制' : 'Copy'}</button></div>`,
      row(t('fSecQ'), id.extra.secQ),
      row(t('fSecA'), id.extra.secA),
      row(t('fInterests'), id.extra.interests),
      row(t('fBio'), id.extra.bio)
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
    if (p.cc && p.cc[0] !== 0) return { latlng: p.cc, precision: 'country-center', label: p.nameZh };
    return null;
  }
  function precisionLabel(precision) {
    const zh = { 'city-center': '城市中心', 'region-center': '区域中心', 'country-center': '国家中心' };
    const en = { 'city-center': 'city center', 'region-center': 'region center', 'country-center': 'country center' };
    return (lang === 'zh' ? zh[precision] : en[precision]) || precision;
  }
  function updateMap() {
    const p = PROFILES[state.country];
    const center = mapCenterFor(p);
    const meta = $('mapMeta');
    if (!center) {
      meta.innerHTML = safe(lang === 'zh' ? '该地区暂无可靠中心坐标，仅显示文字位置。' : 'No reliable center coordinate for this area; text location only.');
      $('mapBox').innerHTML = '';
      return;
    }
    const [lat, lng] = center.latlng;
    const placeText = [p.nameZh, state.identity ? state.identity.address.city : '', center.label].filter((v, i, a) => v && a.indexOf(v) === i).join(' / ');
    meta.innerHTML = `<b>${safe(placeText)}</b><br>${safe(t('fTimezone'))}: ${safe(p.tz)}<br>${lang === 'zh' ? '区域中心' : 'Center'}: ${lat.toFixed(2)}, ${lng.toFixed(2)} · ${safe(precisionLabel(center.precision))}`;
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
      .bindTooltip(p.nameZh, { permanent: false });
  }
  function mapFailed() {
    if (mapState.map || mapState.failed) return;
    mapState.failed = true;
    $('mapBox').innerHTML = `<div class="map-fallback">${safe(lang === 'zh' ? '地图暂时不可用，可使用上方文字位置与中心坐标。' : 'Map unavailable. Use the text location and center coordinates above.')}</div>`;
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
