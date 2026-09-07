/* 法律/参考页文案（隐私政策 · 使用条款 · 数据来源），16 种语言。
 *
 * 单独成文件而不塞进 page-copy.js：关于页 / u/ / 404 用不到这些键，
 * 没必要让它们多下载一份法律文本。
 *
 * 重要：译文仅为方便阅读，中文版为准据原文（legalZhAuthoritative 键会在
 * 非中文界面下显示这句说明）。表格里的品牌名、号段、许可证名（CC BY 4.0、
 * Apache 2.0 等）与核验 URL 属于专有标识，不翻译，直接写在 HTML 里。 */
(function (root) {
  'use strict';
  const L = {};

  L['zh-CN'] = {
    updLabel: '最后更新：',
    legalZhAuthoritative: '',

    privTitleTag: '隐私政策 - 小产品实验室',
    privIntro: '“小产品实验室 · 全球地址生成器”在您的浏览器本地生成随机资料。我们不要求注册账号，也不会因为使用生成器而要求您提交真实姓名、真实住址、真实银行卡或身份证件信息。',
    privHData: '我们处理什么数据',
    privPData: '页面显示的姓名、地址、电话、邮箱、银行卡、工作与账号资料都是随机生成的合成内容，生成过程在浏览器本地完成，不经过我们的服务器。若您使用“保存”“最近生成”等功能，相应内容保存在当前浏览器的 LocalStorage 中，不会自动上传。',
    privHEmail: '邮箱字段',
    privPEmail: '为了让邮箱能通过常见表单校验，生成结果使用主流邮箱服务商的域名形式（例如 gmail.com、outlook.com、qq.com、163.com 等），但本地部分完全随机生成。我们<b>不验证账号是否存在</b>、不做 MX / SMTP 探测，也不会用这些地址注册账号、发送或接收邮件。请不要把随机生成的邮箱当作某个真实用户的联系方式。',
    privHCard: '银行卡字段',
    privPCard: '银行卡字段只按卡组织公开的账号编号结构（前缀区间、长度、安全码位数、显示分组）生成“外观型”卡号。我们<b>不读取也不内置任何真实 BIN / 发卡行数据库</b>，不显示真实发卡银行、账户或余额，也不提供卡号校验、余额查询或支付验证功能。生成器在最后一位主动使用与正确校验位不同的数字，因此所有输出都<b>无法通过常规银行卡号（Luhn）校验</b>，不可用于任何真实或测试环境的实际扣款。',
    privHHome: '个人主页字段',
    privPHome: '“个人主页”字段固定使用本站 <code>/u/</code> 路径下的随机展示地址，避免随机命中现实中真实存在的第三方个人网站。这些链接不对应任何真实页面，我们也不会为它们创建或保存内容，详见 <a href="u/">关于 /u/ 地址</a>。',
    privHCookie: 'Cookie 与统计',
    privPCookie: '本站默认不使用营销 Cookie。若站点启用基础访问统计，不会将生成的姓名、地址、卡号、邮箱等内容作为统计参数上传。',
    privHLocal: '本地数据',
    privPLocal: '您可以通过站内“清空本地数据”功能删除已保存资料、最近生成记录、最近使用国家与界面语言偏好；清除浏览器网站数据同样会删除这些内容（包括收藏与历史）。',
    privHThird: '第三方数据来源',
    privPThird: '国家、行政区、城市和地址格式参考公开数据源；卡组织编号规则来自各卡组织公开资料。具体来源、许可证和核验时间见<a href="sources.html">数据来源</a>页面。',
    privHMap: '地图服务',
    privPMap: '当地图区域需要显示时，您的浏览器会直接向 OpenStreetMap（或站点配置的其他瓦片服务）请求当前视口所需的地图图片，此类请求可能包含普通网络连接信息（IP、User-Agent、Referer）。本站<b>不会</b>把生成的姓名、街道门牌、电话、邮箱或银行卡资料作为地图请求参数发送。地图只展示城市 / 行政区的区域位置，不对合成门牌做地理编码。',
    privHExt: '外部链接',
    privPExt: '本站可能提供公开数据源链接。离开本站后的隐私规则由对应第三方负责。',
    privPNote: '我们可能随着功能、数据源或法规要求更新本政策，更新后会修改页面的“最后更新”日期。',

    termsTitleTag: '使用条款 - 小产品实验室',
    termsHAllow: '允许的用途',
    termsPAllow: '本工具用于软件开发、QA、表单验证、UI / UX 示例与截图、国际化测试、教学演示等合法用途，也可用于在不便填写真实资料的界面演示场景中临时占位。',
    termsHNature: '数据性质',
    termsPNature: '生成的数据是随机合成内容，<b>不代表真实个人</b>，也不保证对应真实住宅或可投递地址。国家、行政区与城市使用公开地名；街道、门牌、姓名、电话、邮箱、公司、账号等为随机生成值。邮箱使用主流服务商域名形式，但不做存在性验证；银行卡只按卡组织公开编号结构生成外观数据，且刻意无法通过 Luhn 校验。',
    termsHForbid: '禁止的用途',
    termsForbid1: '身份冒用、诈骗、骚扰、伪造文件或伪造证明材料；',
    termsForbid2: '用于真实支付、试图完成扣款，或绕过支付风控、反欺诈与实名验证；',
    termsForbid3: '规避第三方平台规则、税务义务或地区限制；',
    termsForbid4: '把随机生成的邮箱、主页、公司当作真实主体对外宣称；',
    termsForbid5: '任何违反适用法律法规的用途。',
    termsHCard: '银行卡字段的明确限制',
    termsPCard: '银行卡资料仅为“外观型”随机数据：不来自任何真实持卡人或真实 BIN 数据库，不对应任何真实账户，且所有卡号都无法通过常规银行卡号校验。本站不提供卡号有效性校验、余额查询、支付验证，也不接受用户输入真实卡号进行补全、推导或识别。',
    termsHNoField: '不提供的字段',
    termsPNoField: '本站不生成身份证号、护照号、社保号 / SSN、税号、银行账户、IBAN、routing number、实名验证答案或生物识别信息。我们不以“字段越多越好”为目标。',
    termsHSrc: '数据来源与许可',
    termsPSrc: '公开数据源按其许可证使用，详见<a href="sources.html">数据来源</a>页面。',
    termsHDisc: '免责声明',
    termsPDisc: '网站按“现状”提供，不承诺所有国家字段对所有业务系统 100% 兼容，也不对因使用生成数据产生的后果承担责任。您需要自行确保用途合法。',

    srcTitleTag: '数据来源 - 小产品实验室',
    srcIntro: '本页说明生成器使用的数据类别、来源与许可。',
    srcHCat: '数据类别',
    thCat: '类别', thSrc: '来源', thUse: '用途', thLic: '许可 / 性质',
    srcR1Cat: '国家 / 行政区 / 城市名与中心坐标', srcR1Src: '公开地名数据（参考 GeoNames 等）', srcR1Use: '真实地名与区域地图中心点',
    srcR2Cat: '地址格式规则', srcR2Src: '各国通行书写格式（参考 libaddressinput metadata）', srcR2Use: '地址字段顺序与格式',
    srcR3Cat: '人名 / 电话 / 公司 / 职业', srcR3Src: '本站自建随机规则库', srcR3Use: '与国家语言匹配的随机人物资料', srcR3Lic: '合成数据',
    srcR4Cat: '邮箱域名池', srcR4Src: '主流邮箱服务商公开域名', srcR4Use: '邮箱字段外观（本地部分随机，不验证账号）', srcR4Lic: '仅使用域名形式',
    srcR5Cat: '卡组织编号规则', srcR5Src: '各卡组织公开资料（见下）', srcR5Use: '银行卡号外观结构（前缀 / 长度 / 分组 / 安全码位数）', srcR5Lic: '官方公开资料',
    srcR6Cat: '地图', srcR6Src: 'Leaflet（前端库）+ OpenStreetMap 瓦片', srcR6Use: '区域位置概览（仅城市 / 行政区 / 国家中心）',
    srcHCardRules: '卡组织规则来源（Card Brand Rule Registry）',
    srcPCardFiles: '规则文件与核验记录保存在仓库的 <code>data/card-brands/</code> 目录，<code>source-manifest.json</code> 记录来源 URL、核验日期与规则版本。规则版本：<b>2026.09.04</b>。',
    thBrand: '卡组织', thStruct: '公开编号结构', thLen: '长度', thVerify: '核验来源',
    srcVisaPrefix: '以 4 开头',
    srcAmexPrefix: '34 / 37 开头，安全码 4 位',
    srcUnionPrefix: '以 62 开头',
    srcPCardNote: '规则只描述“号码长什么样”，<b>不包含任何真实发卡行 BIN 数据</b>。生成器在最后一位主动选择与正确校验位不同的数字，所有输出都无法通过 Luhn 校验；这一点由单元测试逐卡组织抽样验证。不同国家通过 <code>cardBrandWeights</code> 控制卡组织出现权重（例如中国以 UnionPay 为主、日本包含 JCB、美国包含 Discover）。',
    srcHVer: '数据版本',
    srcVerDb: '数据库版本：', srcVerUpd: '最近更新：', srcVerStatus: '状态：',
    srcVerStatusText: '已通过自动校验（Schema、卡组织规则、Luhn-invalid 抽样、身高体重联动、邮箱域名池）',
    srcHCov: '国家覆盖级别（Coverage Level）',
    srcPCov: '国家选择器覆盖 ISO 3166-1 全部 249 个国家 / 地区。每个国家按数据完备程度分为三级：',
    srcCov1: '<b>localized-full</b>（22 个国家 / 地区）：本地化地址、行政区 / 城市、人名、电话、邮编、货币 / 时区完整，并配置本国卡组织权重；',
    srcCov2: '<b>localized-address</b>：地址与人物资料完整本地化，卡组织使用通用权重；',
    srcCov3: '<b>generic-safe</b>（其余国家 / 地区）：真实国家 / 首都 / 主要城市数据 + 通用安全生成规则；无邮编规则时不显示邮编字段，不伪造行政层级或邮编。',
    srcHLang: '界面语言',
    srcPLang: '界面支持 16 种语言（简体中文、繁體中文、English、日本語、한국어、Deutsch、Français、Español、Português、Italiano、Русский、العربية、हिन्दी、Bahasa Indonesia、ไทย、Tiếng Việt）。界面语言与“资料本地化”分开管理：无论界面用哪种语言，本地地址与本地姓名始终按所选国家的本地语言输出。',
    srcHMap: '地图说明',
    srcPMap: '地图仅展示<b>城市 / 行政区 / 国家中心坐标</b>（精度标注为城市中心 / 区域中心 / 国家中心）。生成的合成街道与门牌<b>不做地理编码</b>，也不会把姓名、电话、邮箱、银行卡资料发送给地图服务。地图瓦片 © OpenStreetMap contributors，瓦片服务可在 <code>MAP_CONFIG</code> 中替换。',
    srcHBound: '数据边界',
    srcB1: '国家、行政区、城市为公开地名数据；',
    srcB2: '街道、门牌、姓名、电话、邮箱、公司、账号等为随机合成数据；',
    srcB3: '邮编优先与地区关联，无法可靠映射时按该国格式规则生成，不声称可真实投递；',
    srcB4: '邮箱使用主流服务商域名形式，但不验证账号存在性、不发信；',
    srcB5: '银行卡只按公开编号结构生成外观数据，全部 Luhn-invalid；',
    srcB6: '不生成身份证、护照、社保号、银行账户、IBAN 等敏感字段；',
    srcB7: '“格式合规”不代表地址真实存在或可投递。'
  };

  root.ADDRGEN_LEGAL_COPY = L;
})(typeof globalThis !== 'undefined' ? globalThis : window);
