# 小产品实验室 · 全球地址 / 测试身份生成器
## 最终上线版完整开发规格 V8（全球完整覆盖 + 区域地图 + 零后端架构）

> **产品原则：打开即生成，选择即更新，全部字段直出，一眼看完。**  
> 本文档为最终上线范围，不再拆分“第一期 / 第二期 / 后续版本”。除需要站长提供的微信公众号二维码图片和反馈邮箱真实地址外，其余功能均按正式上线标准一次实现。

---

## V8 本次强化重点

1. 页面继续坚持“打开即看到完整结果”，所有字段默认展开，不做折叠。
2. 不仅生成地址，还生成与国家/地区匹配的姓名、联系方式、职业、公司、收入、账号、设备、教育等完整测试身份资料。
3. 支付模块采用 **Sandbox Payment Profile**：按国家、卡组织、卡产品类型、币种和测试场景，从支付平台官方 Sandbox 测试资料中选择，避免所有结果千篇一律。
4. 支付测试卡号不得自行随机生成生产网络可接受 PAN；只允许使用 Stripe、Adyen、Braintree 等官方公开/授权 Sandbox 测试资料。
5. 所有 ISO 3166-1 的 249 个国家/地区全部进入 Country Profile 设计与国家选择器，不允许只开发“热门国家”。
6. 每个国家至少提供：国家信息、行政区/城市、地址格式、姓名规则、电话格式、货币/时区/语言、完整测试身份字段；数据缺失时必须按统一 fallback 规则降级，不得伪造不存在的邮编或行政层级。
7. 正式加入 **区域地图**：使用 Leaflet + OpenStreetMap 瓦片 + GeoNames 城市/行政区中心坐标，不对合成门牌做精确地理编码，不把生成的姓名、街道、门牌或支付资料发送给地图服务。
8. 正式架构保持 **零业务后端**：Cloudflare Pages 托管静态站点，GitHub Actions 负责数据定时同步；不需要 VPS、数据库、Node/Python 常驻服务或地图中转服务器。
9. 地图只是“位置概览”，不是地址真实性验证工具；地图不可用时不影响地址、人物、批量生成与导出等核心功能。

## 0. 项目最终结论

### 0.1 产品名称
- 中文品牌：**小产品实验室 · 全球地址生成器**
- 产品副标题：**全球测试身份生成器 / Global Test Identity Generator**
- 建议主域名：`address.tinylabpro.com`

### 0.2 核心体验
1. 用户打开任意国家页，**无需点击“生成”就已经看到一整套测试身份资料**。
2. 顶部点击常用国家，右侧资料立即切换；点击 **“全部国家”** 展开完整全球国家选择器。
3. 左侧只承担**当前国家全部城市 / 地区导航**，可搜索、分组、滚动；正文底部不重复城市。
4. 右侧一次性展示：**人物、地址与联系方式、支付 Sandbox 测试资料、工作资料、账号与技术资料、区域地图**。
5. 不使用 Accordion、折叠面板、“查看更多”“高级资料”等隐藏交互。
6. 页面支持重新生成、逐字段复制、复制全部、保存、本地历史、批量生成、CSV/JSON/JSONL/TXT 导出。
7. 核心生成在浏览器本地完成，不需要用户登录，不上传用户输入，不依赖实时付费地址 API。
8. 地图使用城市/区域中心坐标，页面只加载用户当前查看区域所需地图瓦片，不对合成门牌执行地理编码。

### 0.3 数据安全边界
- 国家、行政区、城市：公开地名数据；
- 街道、门牌、姓名、电话、邮箱、公司、账号等：合成测试数据；
- 邮编：优先使用与地区关联的数据；无法可靠映射时，生成**格式合规且明确标记为测试值**的邮编；
- 支付卡：**只使用支付服务商公开 Sandbox/Test 卡号与测试场景**，不生成可能进入真实支付网络的随机银行卡号；
- 不生成真实身份证、护照、社保号、银行账户、可收款账户、真实验证码、真实个人住址。
- 地图不把合成街道、门牌、姓名、电话、邮箱、支付资料等发送给第三方地图服务；只使用当前城市/行政区中心坐标呈现区域位置。

### 0.4 部署架构：零业务后端

正式上线版默认架构：

```text
用户浏览器
  ├─ Astro 静态页面 / React Islands
  ├─ 本地测试身份生成器
  ├─ 按国家懒加载 JSON 数据
  └─ Leaflet 地图
        ↓
  OpenStreetMap 地图瓦片（仅当前视口）

GitHub Actions
  ├─ 定期同步 GeoNames / 地址规则 / Sandbox 测试目录
  ├─ 清洗、校验、构建
  └─ 通过后触发 Cloudflare Pages 部署

Cloudflare Pages
  └─ 托管静态站点和静态 JSON 数据
```

**本次开发不需要：**
- VPS / 云服务器；
- MySQL / PostgreSQL / MongoDB / D1；
- Node.js / Python 常驻后端；
- 自建 REST API；
- 地图代理服务器；
- 用户账户系统。

GitHub Actions 属于构建/数据维护流程，不是面向终端用户的业务后端。若未来加入账号、云收藏、公开 API、付费额度或自托管地图瓦片，再独立评估后端，不进入本次开发范围。

---

# 1. 信息架构

```text
首页 /
├─ 国家页 /jp-address /us-address /de-address ...
│  ├─ 城市页 /jp-address/tokyo
│  └─ 城市页 /us-address/california/los-angeles
├─ 批量生成 /batch
├─ 数据来源 /sources
├─ 隐私政策 /privacy
├─ 使用条款 /terms
└─ 关于与反馈 /about
```

国家页和城市页是主流量入口。首页不做复杂控制台，而是默认进入一个高频国家示例，并提供完整国家切换。

---

# 2. 桌面端最终页面结构

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Logo / 品牌     美国 日本 英国 德国 加拿大 澳大利亚 中国 韩国 ... [全部国家⌄] │
├──────────────────────────────────────────────────────────────────────────────┤
│ 日本地址 / 测试身份生成器                        [重新生成] [复制全部] [导出] │
│ 真实地名 + 合成测试资料 · 数据仅用于开发/QA/表单验证                         │
├──────────────────────┬───────────────────────────────────────────────────────┤
│ 城市 / 地区          │ ① 基本资料                  ② 地址与联系方式          │
│ [搜索城市/地区]      │ 姓名 / 罗马字 / 性别        完整地址 / 国际地址         │
│                      │ 生日 / 年龄 / 称谓           街道 / 城市 / 州省 / 邮编   │
│ 全国随机             │                              电话 / 测试邮箱              │
│ ─────────────        │                                                       │
│ 东京都               │ ③ Sandbox 支付测试资料      ④ 工作资料                  │
│   东京23区           │ Provider / 卡组织            职业 / 公司 / 就业状态      │
│   八王子市           │ 测试卡号 / 有效期 / CVC      收入测试值 / 货币            │
│   町田市             │ 持卡人 / 账单地址 / 场景                                 │
│ ...                  │                                                       │
│ 大阪府               │ ⑤ 账号与技术资料                                       │
│ ...                  │ 用户名 / 强密码 / UUID / 网站 / OS / User-Agent        │
│                      │                                                       │
│                      │ ⑥ 区域地图                                             │
│                      │ 城市/行政区中心位置 + 时区 + 区域中心坐标              │
├──────────────────────┴───────────────────────────────────────────────────────┤
│ 数据说明 / 隐私政策 / 使用条款 / 数据来源 / 反馈邮箱                         │
│ 微信公众号：小产品实验室   [公众号二维码]                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**正文结束后直接进入 Footer，不再放城市推荐、热门城市、重复国家列表。**

---

# 3. 顶部国家导航

## 3.1 常用国家快捷入口
默认展示 8~12 个高频国家，桌面宽度不足时横向滚动：
- 美国、日本、英国、德国、加拿大、澳大利亚、中国、韩国、新加坡、法国。

要求：
- 当前国家高亮；
- 单击后不整页闪白；
- 地址、姓名、电话、货币、支付测试资料、城市列表同步切换；
- URL 与 SEO metadata 同步变化。

## 3.2 “全部国家” Mega Dropdown
点击 `全部国家⌄`，在顶栏下方展开大型国家面板，不跳到底部、不进入单独国家列表页。

必须包含：
- ISO 3166-1 覆盖范围内全部已支持国家/地区；
- 搜索：中文名、英文名、本地名、Alpha-2、Alpha-3；
- 最近使用；
- 按洲分组：亚洲、欧洲、北美/中美/加勒比、南美、非洲、大洋洲、其他地区；
- 国旗 Emoji + 中文名 + 英文名 + ISO；
- 当前国家选中标识；
- 大列表内部滚动，搜索栏固定。

关闭规则：
- 再点“全部国家”；
- 点击面板外部；
- `Esc`；
- 点击任一国家后自动关闭。

移动端：Mega Dropdown 变为全屏国家选择器，顶部固定搜索与关闭按钮。

---

# 4. 左侧完整城市 / 地区导航

## 4.1 唯一城市入口
城市只出现在左侧（移动端为全屏城市选择器），**正文和 Footer 均不得重复城市清单**。

## 4.2 完整访问
- 标题：`城市 / 地区`；
- 顶部搜索框；
- 第一项：`全国随机`；
- 一级行政区分组；
- 具体城市/区县列表；
- 数量很大时使用虚拟列表；
- 允许数千条城市数据完整访问，不用“查看更多”。

## 4.3 选择逻辑
- 全国随机：从当前国家支持范围随机；
- 一级行政区：限定到州/省/都道府县；
- 城市：锁定该城市；
- 点击“重新生成”：保持当前城市筛选，只刷新身份资料。

---

# 5. 右侧结果区：所有字段默认展开

## 5.1 A. 人物基本资料
| 字段 | 规则 |
|---|---|
| 本地姓名 | 与 locale 文化/语言匹配的合成姓名 |
| 英文 / 罗马字姓名 | 中日韩、阿拉伯语、西里尔字母等提供可选转写 |
| 性别 | 合成测试枚举值 |
| 出生日期 | 与年龄一致 |
| 年龄 | 自动计算 |
| 称谓 | Mr/Ms/Mx 或本地对应值 |
| 教育程度 | 与国家教育表达方式适配的测试值 |
| 身高 / 体重 | 可选的合成人物属性 |
| 血型 | 可选合成属性 |
| 发色 | 可选合成属性，按地区数据池随机，不暗示真实人口统计结论 |

## 5.2 B. 地址与联系方式
| 字段 | 规则 |
|---|---|
| 本地完整地址 | 按当地书写顺序输出 |
| 国际英文地址 | 适合国际化表单 / 物流 UI 测试 |
| 街道 / 门牌 | 合成测试值；若国家无街道制则按当地规则生成 |
| 区县 / 次级行政区 | 真实行政区优先；该国不存在则不显示 |
| 城市 | 真实地名 |
| 州 / 省 / 都道府县 / 地区 | 按本国行政层级显示 |
| 邮编 | 地区关联优先；无邮编国家不强行生成 |
| 国家 | 中文 + 本地/英文 + ISO |
| 电话 | 当地格式的测试号码；优先使用官方保留/示例号段，不能保证可达 |
| 邮箱 | 默认使用 `.test` 域名，例如 `taro.yamada@example.test` |
| 时区 | 根据国家/城市匹配 |
| 地图 | 默认显示城市或区域级位置，不声称具体门牌真实存在 |

## 5.3 C. Sandbox Payment Profile（核心模块）

目标：**视觉上丰富、国家联动明显，但始终是官方测试环境数据。** 不采用“一张固定 4242 卡重复到底”的做法。

### 5.3.1 展示字段

| 字段 | 规则 |
|---|---|
| 支付 Provider | Stripe / Adyen / Braintree 等已配置测试来源 |
| 卡组织 / Payment Brand | Visa / Mastercard / Amex / JCB / UnionPay / Discover / Diners / Cartes Bancaires / eftpos 等，按官方测试目录与国家适配 |
| 卡产品 | Credit / Debit / Prepaid；仅在官方测试资料能确认时展示 |
| 发卡国家 / Issuing Country | 优先匹配当前国家；无本地测试卡时明确标记 Generic Sandbox，不伪造 |
| 币种 | 默认当前国家主流币种；可由测试卡/场景覆盖 |
| 测试卡号 | 只来自 Provider 官方公开或授权的 Sandbox 测试卡目录 |
| 卡号显示格式 | 按卡组织真实分组规则显示，例如 Amex 4-6-5；不统一强制 4-4-4-4 |
| 有效期 | Provider 允许的测试有效期；可在合法测试范围内变化 |
| CVC/CVV/CID | 按 Provider 和卡组织测试规则展示 |
| 持卡人 | 与当前合成姓名一致 |
| 账单地址 | 默认与生成地址一致，可单独重新生成 |
| AVS 测试 | 支持 Match / Partial / Fail 等 Provider 可测试场景时显示 |
| 3DS | 支持 3DS Success / Challenge / Fail 等官方测试场景 |
| 交易预期 | Success / Declined / Insufficient Funds / Authentication Required 等官方 Sandbox 场景 |
| 数据来源 | 在区块底部显示 Provider + Test catalog，不在每个字段重复大红色“测试” |

### 5.3.2 真实感策略

1. **国家优先**：用户选择日本时，优先选官方目录里能明确模拟日本发卡国家/JPY 的测试资料；德国、法国、阿联酋等同理。
2. **品牌轮换**：同一国家连续重新生成时，若官方目录支持多个品牌，应随机轮换品牌与产品类型。
3. **Provider 轮换**：可配置 Stripe / Adyen / Braintree 数据池；默认只展示一个结果，但重新生成时可切换来源。
4. **格式真实**：卡号长度、分组、CVV 位数、品牌名称、币种、账单地址格式全部联动。
5. **场景真实**：测试卡不仅“成功”，还可以通过显式场景选择生成 3DS、拒付、余额不足等官方 Sandbox 场景。
6. **标签克制**：支付卡片标题显示 `Sandbox Payment`，区块底部说明“仅测试环境有效”；无需在每一行都重复“TEST”，避免视觉上显得过于假。

### 5.3.3 安全硬限制

- 不实现随机 Luhn + BIN 组合来批量制造看似生产可用的 PAN；
- 不抓取真实卡 BIN / 发行人数据库来生成生产卡；
- 不生成真实银行账户、IBAN、routing number、网银凭据等可用于资金流转的数据；
- 不声称测试卡可用于真实付款、平台注册或规避支付验证；
- Provider 官方测试卡发生变化时，通过自动更新数据源维护测试目录；
- 如某国家没有官方“按发卡国家”测试卡，使用 Generic Sandbox，并明确显示来源，不伪造本地银行名称。

### 5.3.4 支付测试资料来源

优先级：
1. Stripe Testing 官方文档；
2. Adyen Test card numbers / test cards 官方文档；
3. Braintree Sandbox Testing 官方文档；
4. 以后新增 Provider 必须在 `data/payment-providers/` 中单独配置来源、更新时间、适用范围和许可证/使用说明。

## 5.4 D. 工作与经济资料

| 字段 | 规则 |
|---|---|
| 职业 | 与 locale 语言适配的合成职业 |
| 公司名称 | 合成公司名，不冒用真实企业 |
| 行业 | 软件、物流、教育、零售、医疗等测试分类 |
| 公司规模 | 1-10 / 11-50 / 51-200 / 201-500 / 500+ 等 |
| 就业状态 | Full-time / Part-time / Contract / Self-employed 等本地化展示 |
| 年收入 / 月收入 | 合成测试值，与当地货币联动；明确非统计数据 |
| 货币 | ISO 4217 |
| 教育程度 | 可与人物资料联动 |

## 5.5 E. 账号、设备与网络资料

- 用户名；
- 强密码测试值；
- UUID v4；
- 个人主页：`example.test`；
- 操作系统；
- Browser User-Agent；
- Locale；
- 时区；
- 语言代码；
- 可选：屏幕分辨率、设备类别、浏览器语言，全部为合成测试字段。

## 5.6 F. 其他人物档案字段

可默认展示或由“精简/完整”显示密度控制，但**不是折叠面板**：
- 安全问题：从虚构问题库选择；
- 安全答案：纯合成词库，禁止与用户真实资料有关；
- 兴趣标签：可选；
- 个人简介：短句合成，可选；
- 头像：只使用首字母 / 几何头像，不自动生成真人照片。

## 5.7 G. 区域地图与位置概览

地图是完整测试身份的辅助信息区，位于右侧结果区最下方，**默认展开且不折叠**。其目标是帮助用户快速理解“这个城市/地区位于哪里”，而不是验证合成门牌是否真实存在。

展示内容：
- 国家；
- 一级行政区；
- 城市 / 区县；
- 时区；
- 城市/行政区中心纬度、经度；
- Leaflet 交互式地图；
- 明确标签：`区域位置 · 非精确住宅定位`。

地图规则：
1. 坐标优先取 GeoNames 或已审核开放数据中的城市/行政区中心点。
2. 生成的合成街道和门牌**不进行 Nominatim / Google / 高德等地址地理编码**。
3. 地图中心点使用城市/行政区中心，不声称是生成地址真实坐标。
4. 建议使用圆形区域标记或“区域中心”标记，避免使用暗示精确住宅位置的针形 Pin。
5. 切换国家/城市时，地图与位置文字同步更新。
6. 地图加载失败时，仍显示国家、城市、时区与中心坐标，核心生成器继续正常工作。
7. 地图数据/瓦片来源和 attribution 必须在地图内持续可见。

## 5.8 明确不提供的高风险字段

默认不生成：
- 身份证号；
- 护照号；
- 社保号 / SSN；
- 税务识别号；
- 银行账户 / IBAN / routing number；
- 真实银行名称 + 可用账户组合；
- 实名验证答案；
- 生物识别信息。

说明：其他随机身份站点可能会展示 SSN 等字段，但本项目不以“字段越多越好”为目标；优先保证测试价值、国家本地化和安全边界。

---

# 6. 结果区视觉与交互规范

- 桌面端 2 列卡片；移动端单列；
- 所有卡片常驻展开；
- 字段布局统一：`字段名 | 字段值 | 复制`；
- 长地址允许换行；
- 卡号按 Payment Brand 的真实显示分组展示（例如 Visa/Mastercard 常见 4-4-4-4，Amex 4-6-5）；
- 测试值用轻量标签标识，不用警告色堆满页面；
- 顶部显示一次醒目的“合成测试数据 / Sandbox”说明即可。
- 地图区固定为结果区最后一个常驻卡片，桌面建议高度 300~360px，移动端 240~300px；地图卡片本身可在接近视口时再初始化瓦片，以降低首屏请求。
- 地图区域必须显示“区域位置 · 非精确住宅定位”，避免用户把合成地址误认为可验证真实地址。

主操作：
- `重新生成全部`；
- `复制全部`；
- `保存`；
- `导出`。

字段级操作：每一行均有复制按钮。

---

# 7. 保存、历史和收藏

无需登录，使用浏览器 LocalStorage：
- 最近使用国家：最多 8 个；
- 最近生成：最多 20 条；
- 收藏：用户主动保存；
- 显示偏好：语言、结果密度、最近城市。

隐私要求：
- 不上传 LocalStorage 内容；
- 提供“一键清空本地数据”；
- 隐私政策明确说明清空浏览器数据会删除收藏与历史。

---

# 8. 批量生成（正式上线必须实现）

入口：顶部导出旁边或 `/batch`。

功能：
- 数量：5 / 10 / 20 / 50 / 100 / 自定义（建议上限 500）；
- 沿用当前国家 / 行政区 / 城市；
- 字段勾选：默认全选常用字段；
- 支持固定 Seed，便于 QA 重现；
- 结果表格可横向查看，但移动端采用字段卡片或关键列；
- 支持重新生成整批；
- 支持复制当前行；
- 支持导出。

导出格式：
- CSV UTF-8 BOM；
- JSON；
- JSONL；
- TXT。

导出字段命名支持：
- `camelCase`；
- `snake_case`。

---

# 9. Seed 可复现生成

正式上线必须实现 Seed：
- 可输入字符串或数字；
- 同一版本数据 + 同一 Seed + 同一筛选条件，生成结果应尽可能一致；
- URL 可选携带 Seed；
- 批量 QA 使用 Seed 复现测试数据。

示例：`checkout-japan-001`。

---

# 10. 数据架构

```text
ISO country metadata
        +
GeoNames / 其他开放行政区数据（含城市/行政区中心坐标）
        +
libaddressinput metadata
        +
Faker locale / 自建本地规则
        +
Official Sandbox Payment Test Registry
        ↓
Normalizer / Validator
        ↓
Country Profile
        ↓
按国家拆分静态 JSON
        ↓
Browser Test Identity Generator
```

## 10.1 Country Profile
```json
{
  "code": "JP",
  "alpha3": "JPN",
  "nameZh": "日本",
  "nameEn": "Japan",
  "nativeName": "日本",
  "locale": "ja-JP",
  "currency": "JPY",
  "timezone": ["Asia/Tokyo"],
  "addressFormat": "...",
  "postalRule": "...",
  "phoneRule": "...",
  "citiesFile": "/data/cities/JP.json",
  "personGenerator": "ja",
  "paymentProviders": ["stripe", "adyen"],
  "map": {
    "enabled": true,
    "coordinateSource": "geonames",
    "precision": "region-center",
    "defaultZoom": 11
  }
}
```

## 10.2 数据分包
不得把全球城市塞进首页 bundle：
```text
/data/countries/index.min.json
/data/countries/JP.profile.json
/data/cities/JP.min.json
/data/cities/US.min.json
/data/maps/country-centers.min.json
/data/payment/stripe-test-cards.json
```

---

## 10.3 全球国家 / 地区完整覆盖原则

正式上线版必须以 **ISO 3166-1 的 249 个国家/地区**为国家选择器和 Country Profile 的基础清单。

每个国家/地区都必须存在一个 `CountryProfile`，至少包含：
- ISO2 / ISO3；
- 中文名 / 英文名 / 本地名（可取得时）；
- 语言 / locale；
- 货币；
- 时区；
- 电话国际区号和格式规则；
- 行政区层级；
- 地址字段顺序；
- 邮编存在性与格式；
- 人名 locale；
- 城市/行政区数据状态；
- Payment Sandbox 覆盖状态；
- 地图支持状态、坐标来源、坐标精度等级（country-center / region-center / city-center）。

### 10.3.1 Coverage Level

每个国家写入 `coverageLevel`：

- `localized-full`：地址、行政区/城市、人名、电话、邮编、货币/时区，以及国家匹配的官方 Sandbox 支付资料均有本地化支持；
- `localized-address`：地址与人物资料完整本地化，但支付测试只能使用 Generic Sandbox；
- `generic-safe`：国家可选择，使用真实国家/行政区基础数据和通用安全生成规则；不能为了“看起来完整”伪造不存在的行政层级或邮编。

页面不需要把 coverageLevel 暴露成复杂技术术语，但 `/sources` 和数据状态页必须可查询。

### 10.3.2 全量国家/地区清单

以下清单必须全部进入国家选择器和自动数据构建流程：

| 国家/地区 1 | 国家/地区 2 | 国家/地区 3 |
|---|---|---|
| **AD** · 安道尔 · Andorra | **AE** · 阿拉伯联合酋长国 · United Arab Emirates | **AF** · 阿富汗 · Afghanistan |
| **AG** · 安提瓜和巴布达 · Antigua and Barbuda | **AI** · 安圭拉 · Anguilla | **AL** · 阿尔巴尼亚 · Albania |
| **AM** · 亚美尼亚 · Armenia | **AO** · 安哥拉 · Angola | **AQ** · 南极洲 · Antarctica |
| **AR** · 阿根廷 · Argentina | **AS** · 美属萨摩亚 · American Samoa | **AT** · 奥地利 · Austria |
| **AU** · 澳大利亚 · Australia | **AW** · 阿鲁巴 · Aruba | **AX** · 奥兰群岛 · Åland Islands |
| **AZ** · 阿塞拜疆 · Azerbaijan | **BA** · 波斯尼亚和黑塞哥维那 · Bosnia and Herzegovina | **BB** · 巴巴多斯 · Barbados |
| **BD** · 孟加拉国 · Bangladesh | **BE** · 比利时 · Belgium | **BF** · 布基纳法索 · Burkina Faso |
| **BG** · 保加利亚 · Bulgaria | **BH** · 巴林 · Bahrain | **BI** · 布隆迪 · Burundi |
| **BJ** · 贝宁 · Benin | **BL** · 圣巴泰勒米 · Saint Barthélemy | **BM** · 百慕大 · Bermuda |
| **BN** · 文莱 · Brunei Darussalam | **BO** · 玻利维亚 · Bolivia, Plurinational State of | **BQ** · 荷属加勒比区 · Bonaire, Sint Eustatius and Saba |
| **BR** · 巴西 · Brazil | **BS** · 巴哈马 · Bahamas | **BT** · 不丹 · Bhutan |
| **BV** · 布韦岛 · Bouvet Island | **BW** · 博茨瓦纳 · Botswana | **BY** · 白俄罗斯 · Belarus |
| **BZ** · 伯利兹 · Belize | **CA** · 加拿大 · Canada | **CC** · 科科斯（基林）群岛 · Cocos (Keeling) Islands |
| **CD** · 刚果（金） · Congo, The Democratic Republic of the | **CF** · 中非共和国 · Central African Republic | **CG** · 刚果（布） · Congo |
| **CH** · 瑞士 · Switzerland | **CI** · 科特迪瓦 · Côte d'Ivoire | **CK** · 库克群岛 · Cook Islands |
| **CL** · 智利 · Chile | **CM** · 喀麦隆 · Cameroon | **CN** · 中国 · China |
| **CO** · 哥伦比亚 · Colombia | **CR** · 哥斯达黎加 · Costa Rica | **CU** · 古巴 · Cuba |
| **CV** · 佛得角 · Cabo Verde | **CW** · 库拉索 · Curaçao | **CX** · 圣诞岛 · Christmas Island |
| **CY** · 塞浦路斯 · Cyprus | **CZ** · 捷克 · Czechia | **DE** · 德国 · Germany |
| **DJ** · 吉布提 · Djibouti | **DK** · 丹麦 · Denmark | **DM** · 多米尼克 · Dominica |
| **DO** · 多米尼加共和国 · Dominican Republic | **DZ** · 阿尔及利亚 · Algeria | **EC** · 厄瓜多尔 · Ecuador |
| **EE** · 爱沙尼亚 · Estonia | **EG** · 埃及 · Egypt | **EH** · 西撒哈拉 · Western Sahara |
| **ER** · 厄立特里亚 · Eritrea | **ES** · 西班牙 · Spain | **ET** · 埃塞俄比亚 · Ethiopia |
| **FI** · 芬兰 · Finland | **FJ** · 斐济 · Fiji | **FK** · 福克兰群岛 · Falkland Islands (Malvinas) |
| **FM** · 密克罗尼西亚 · Micronesia, Federated States of | **FO** · 法罗群岛 · Faroe Islands | **FR** · 法国 · France |
| **GA** · 加蓬 · Gabon | **GB** · 英国 · United Kingdom | **GD** · 格林纳达 · Grenada |
| **GE** · 格鲁吉亚 · Georgia | **GF** · 法属圭亚那 · French Guiana | **GG** · 根西岛 · Guernsey |
| **GH** · 加纳 · Ghana | **GI** · 直布罗陀 · Gibraltar | **GL** · 格陵兰 · Greenland |
| **GM** · 冈比亚 · Gambia | **GN** · 几内亚 · Guinea | **GP** · 瓜德罗普 · Guadeloupe |
| **GQ** · 赤道几内亚 · Equatorial Guinea | **GR** · 希腊 · Greece | **GS** · 南乔治亚和南桑威奇群岛 · South Georgia and the South Sandwich Islands |
| **GT** · 危地马拉 · Guatemala | **GU** · 关岛 · Guam | **GW** · 几内亚比绍 · Guinea-Bissau |
| **GY** · 圭亚那 · Guyana | **HK** · 中国香港特别行政区 · Hong Kong | **HM** · 赫德岛和麦克唐纳群岛 · Heard Island and McDonald Islands |
| **HN** · 洪都拉斯 · Honduras | **HR** · 克罗地亚 · Croatia | **HT** · 海地 · Haiti |
| **HU** · 匈牙利 · Hungary | **ID** · 印度尼西亚 · Indonesia | **IE** · 爱尔兰 · Ireland |
| **IL** · 以色列 · Israel | **IM** · 马恩岛 · Isle of Man | **IN** · 印度 · India |
| **IO** · 英属印度洋领地 · British Indian Ocean Territory | **IQ** · 伊拉克 · Iraq | **IR** · 伊朗 · Iran, Islamic Republic of |
| **IS** · 冰岛 · Iceland | **IT** · 意大利 · Italy | **JE** · 泽西岛 · Jersey |
| **JM** · 牙买加 · Jamaica | **JO** · 约旦 · Jordan | **JP** · 日本 · Japan |
| **KE** · 肯尼亚 · Kenya | **KG** · 吉尔吉斯斯坦 · Kyrgyzstan | **KH** · 柬埔寨 · Cambodia |
| **KI** · 基里巴斯 · Kiribati | **KM** · 科摩罗 · Comoros | **KN** · 圣基茨和尼维斯 · Saint Kitts and Nevis |
| **KP** · 朝鲜 · Korea, Democratic People's Republic of | **KR** · 韩国 · Korea, Republic of | **KW** · 科威特 · Kuwait |
| **KY** · 开曼群岛 · Cayman Islands | **KZ** · 哈萨克斯坦 · Kazakhstan | **LA** · 老挝 · Lao People's Democratic Republic |
| **LB** · 黎巴嫩 · Lebanon | **LC** · 圣卢西亚 · Saint Lucia | **LI** · 列支敦士登 · Liechtenstein |
| **LK** · 斯里兰卡 · Sri Lanka | **LR** · 利比里亚 · Liberia | **LS** · 莱索托 · Lesotho |
| **LT** · 立陶宛 · Lithuania | **LU** · 卢森堡 · Luxembourg | **LV** · 拉脱维亚 · Latvia |
| **LY** · 利比亚 · Libya | **MA** · 摩洛哥 · Morocco | **MC** · 摩纳哥 · Monaco |
| **MD** · 摩尔多瓦 · Moldova, Republic of | **ME** · 黑山 · Montenegro | **MF** · 法属圣马丁 · Saint Martin (French part) |
| **MG** · 马达加斯加 · Madagascar | **MH** · 马绍尔群岛 · Marshall Islands | **MK** · 北马其顿 · North Macedonia |
| **ML** · 马里 · Mali | **MM** · 缅甸 · Myanmar | **MN** · 蒙古 · Mongolia |
| **MO** · 中国澳门特别行政区 · Macao | **MP** · 北马里亚纳群岛 · Northern Mariana Islands | **MQ** · 马提尼克 · Martinique |
| **MR** · 毛里塔尼亚 · Mauritania | **MS** · 蒙特塞拉特 · Montserrat | **MT** · 马耳他 · Malta |
| **MU** · 毛里求斯 · Mauritius | **MV** · 马尔代夫 · Maldives | **MW** · 马拉维 · Malawi |
| **MX** · 墨西哥 · Mexico | **MY** · 马来西亚 · Malaysia | **MZ** · 莫桑比克 · Mozambique |
| **NA** · 纳米比亚 · Namibia | **NC** · 新喀里多尼亚 · New Caledonia | **NE** · 尼日尔 · Niger |
| **NF** · 诺福克岛 · Norfolk Island | **NG** · 尼日利亚 · Nigeria | **NI** · 尼加拉瓜 · Nicaragua |
| **NL** · 荷兰 · Netherlands | **NO** · 挪威 · Norway | **NP** · 尼泊尔 · Nepal |
| **NR** · 瑙鲁 · Nauru | **NU** · 纽埃 · Niue | **NZ** · 新西兰 · New Zealand |
| **OM** · 阿曼 · Oman | **PA** · 巴拿马 · Panama | **PE** · 秘鲁 · Peru |
| **PF** · 法属波利尼西亚 · French Polynesia | **PG** · 巴布亚新几内亚 · Papua New Guinea | **PH** · 菲律宾 · Philippines |
| **PK** · 巴基斯坦 · Pakistan | **PL** · 波兰 · Poland | **PM** · 圣皮埃尔和密克隆群岛 · Saint Pierre and Miquelon |
| **PN** · 皮特凯恩群岛 · Pitcairn | **PR** · 波多黎各 · Puerto Rico | **PS** · 巴勒斯坦领土 · Palestine, State of |
| **PT** · 葡萄牙 · Portugal | **PW** · 帕劳 · Palau | **PY** · 巴拉圭 · Paraguay |
| **QA** · 卡塔尔 · Qatar | **RE** · 留尼汪 · Réunion | **RO** · 罗马尼亚 · Romania |
| **RS** · 塞尔维亚 · Serbia | **RU** · 俄罗斯 · Russian Federation | **RW** · 卢旺达 · Rwanda |
| **SA** · 沙特阿拉伯 · Saudi Arabia | **SB** · 所罗门群岛 · Solomon Islands | **SC** · 塞舌尔 · Seychelles |
| **SD** · 苏丹 · Sudan | **SE** · 瑞典 · Sweden | **SG** · 新加坡 · Singapore |
| **SH** · 圣赫勒拿 · Saint Helena, Ascension and Tristan da Cunha | **SI** · 斯洛文尼亚 · Slovenia | **SJ** · 斯瓦尔巴和扬马延 · Svalbard and Jan Mayen |
| **SK** · 斯洛伐克 · Slovakia | **SL** · 塞拉利昂 · Sierra Leone | **SM** · 圣马力诺 · San Marino |
| **SN** · 塞内加尔 · Senegal | **SO** · 索马里 · Somalia | **SR** · 苏里南 · Suriname |
| **SS** · 南苏丹 · South Sudan | **ST** · 圣多美和普林西比 · Sao Tome and Principe | **SV** · 萨尔瓦多 · El Salvador |
| **SX** · 荷属圣马丁 · Sint Maarten (Dutch part) | **SY** · 叙利亚 · Syrian Arab Republic | **SZ** · 斯威士兰 · Eswatini |
| **TC** · 特克斯和凯科斯群岛 · Turks and Caicos Islands | **TD** · 乍得 · Chad | **TF** · 法属南部领地 · French Southern Territories |
| **TG** · 多哥 · Togo | **TH** · 泰国 · Thailand | **TJ** · 塔吉克斯坦 · Tajikistan |
| **TK** · 托克劳 · Tokelau | **TL** · 东帝汶 · Timor-Leste | **TM** · 土库曼斯坦 · Turkmenistan |
| **TN** · 突尼斯 · Tunisia | **TO** · 汤加 · Tonga | **TR** · 土耳其 · Türkiye |
| **TT** · 特立尼达和多巴哥 · Trinidad and Tobago | **TV** · 图瓦卢 · Tuvalu | **TW** · 台湾 · Taiwan, Province of China |
| **TZ** · 坦桑尼亚 · Tanzania, United Republic of | **UA** · 乌克兰 · Ukraine | **UG** · 乌干达 · Uganda |
| **UM** · 美国本土外小岛屿 · United States Minor Outlying Islands | **US** · 美国 · United States | **UY** · 乌拉圭 · Uruguay |
| **UZ** · 乌兹别克斯坦 · Uzbekistan | **VA** · 梵蒂冈 · Holy See (Vatican City State) | **VC** · 圣文森特和格林纳丁斯 · Saint Vincent and the Grenadines |
| **VE** · 委内瑞拉 · Venezuela, Bolivarian Republic of | **VG** · 英属维尔京群岛 · Virgin Islands, British | **VI** · 美属维尔京群岛 · Virgin Islands, U.S. |
| **VN** · 越南 · Viet Nam | **VU** · 瓦努阿图 · Vanuatu | **WF** · 瓦利斯和富图纳 · Wallis and Futuna |
| **WS** · 萨摩亚 · Samoa | **YE** · 也门 · Yemen | **YT** · 马约特 · Mayotte |
| **ZA** · 南非 · South Africa | **ZM** · 赞比亚 · Zambia | **ZW** · 津巴布韦 · Zimbabwe |

### 10.3.3 国家级 fallback 规则

1. **无邮编国家/地区**：邮编字段直接不显示，不随机编造。
2. **行政层级较少**：只显示实际存在的层级，例如 Country → City，不强行补 State。
3. **城市数据较少**：允许用户选择国家随机生成；左侧只列已验证城市/地区。
4. **非拉丁文字**：本地地址为主，同时尽可能提供拉丁转写；转写不可用则仅显示本地名 + 国家英文名。
5. **支付本地测试资料缺失**：使用官方 Generic Sandbox，不伪装成本地银行发行。
6. **电话号码测试保留号段不可确定**：只生成格式模板/掩码形式，避免碰撞真实号码。
7. **数据源冲突**：以 Country Profile 中声明的优先级和人工 override 为准，更新流程不得自动覆盖已验证 override。

### 10.3.4 国家示例不是开发范围限制

US / JP / CN / DE / FR / GB 等只用于文档举例。开发者不得把示例国家误解成支持范围；**249 个国家/地区必须全部可选择并具备最低安全生成能力。**

# 11. 数据同步与自动更新（正式上线必须完成）

本项目必须实现**可无人值守运行的数据自动更新流水线**。网页运行时不直接依赖 GeoNames 等外部在线 API；上游数据由 GitHub Actions 定时同步、清洗、校验并转换成本站自己的静态数据包。只有全部检查通过后才允许进入生产部署。

## 11.1 自动更新目标

自动更新系统负责：
- 国家/地区基础索引；
- 一级行政区（州、省、都道府县等）；
- 二级行政区与城市；
- 城市本地名、英文名、备用名称；
- 地址字段顺序与国家地址格式规则；
- 邮编格式/正则与可获得的邮编关联数据；
- 各数据源的同步时间、版本、许可证与校验状态；
- 前端可读取的“数据库最后更新时间”。

以下内容**不得通过自动爬取生成**：
- 真实个人资料；
- 真实住宅完整门牌地址；
- 真实银行卡/金融账户；
- 支付平台生产卡资料。

支付测试资料只维护经过人工确认的 Provider 官方 Sandbox/Test 白名单文件。

## 11.2 数据源与更新策略

支付测试资料也纳入自动更新体系：
- `payment-stripe.json`：从 Stripe 官方 Testing 文档维护品牌/国家/场景测试资料；
- `payment-adyen.json`：从 Adyen 官方 Test Cards 文档维护品牌/国家/币种/场景；
- `payment-braintree.json`：从 Braintree 官方 Sandbox Testing 文档维护测试卡场景；
- 自动同步脚本只抓取/解析官方公开测试资料，不抓取第三方“卡号生成器”或真实 BIN 数据库。


| 数据类别 | 推荐来源 | 更新方式 | 本站用途 |
|---|---|---|---|
| 国家/地区索引 | ISO 3166 基线 + 版本库 | 低频人工审查，构建时校验 | 国家代码、名称、分组 |
| 行政区/城市 | GeoNames 下载库 | 每周自动；支持按国家增量 | 州/省/城市、本地名、经纬度参考 |
| 地址格式规则 | Google libaddressinput metadata | 每周检查变更 | 字段顺序、必填项、邮编规则 |
| 人名/电话等合成规则 | Faker.js + 自建 Country Profile | 随依赖升级/规则库版本更新 | 合成测试身份 |
| 支付测试资料 | Stripe/Adyen 等官方 Sandbox 文档整理 | 版本化人工维护 | Test Only 支付字段 |

GeoNames 官方下载目录提供按国家代码拆分的数据文件，并持续更新；本项目优先按国家增量下载，避免网页运行时实时调用其免费 Web Service。libaddressinput 的地址 metadata 用于国家/地区地址字段、格式和校验规则，不作为真实住宅地址来源。

## 11.3 更新频率

默认计划：
- **每周日 03:20（Asia/Tokyo）**执行完整同步；
- 支持 GitHub Actions `workflow_dispatch` 手动触发；
- 支持只同步一个或多个国家，例如 `JP,US,DE`；
- 依赖库安全升级与数据同步分开执行，不混在同一个工作流；
- GeoNames 上游虽然可更频繁更新，但本站默认每周同步一次，降低无意义提交与部署次数。

GitHub Actions 的定时任务使用 `schedule`，同时保留手动触发入口。时区若运行环境不支持直接指定，则将日本时间换算为 UTC cron，并在注释中写明。

## 11.4 数据更新流水线

完整流程必须严格按以下顺序执行：

```text
GitHub Actions 定时/手动触发
        ↓
读取上一次 manifest / ETag / Last-Modified / SHA256
        ↓
检查上游是否变化
        ↓
无变化 → 写入检查日志 → 结束（不部署）
        ↓
有变化
        ↓
下载到 tmp/raw（禁止直接覆盖 production data）
        ↓
许可证与来源白名单校验
        ↓
解压 / UTF-8 规范化 / 去除坏行
        ↓
行政区与城市父子关系重建
        ↓
地址规则合并到 Country Profile
        ↓
生成 candidate 数据包
        ↓
Schema 校验 + 关系校验 + 统计异常检测
        ↓
随机抽样生成测试身份并做格式测试
        ↓
Astro 全站 build + Vitest + Playwright smoke test
        ↓
失败 → 丢弃 candidate + 保留上一版 + 生成错误报告
        ↓
全部通过
        ↓
生成 manifest / changelog / 数据版本号
        ↓
原子替换 production data
        ↓
Git commit（只有真实变化才提交）
        ↓
Cloudflare Pages Git 集成自动构建和发布
```

原则：**任何上游异常都不能直接破坏线上数据。**

## 11.5 推荐脚本

项目必须包含：

```text
scripts/data/
├─ sync-geonames.ts
├─ sync-address-metadata.ts
├─ normalize-geonames.ts
├─ build-country-profiles.ts
├─ build-city-indexes.ts
├─ validate-schema.ts
├─ validate-relations.ts
├─ validate-statistics.ts
├─ smoke-generate.ts
├─ build-manifest.ts
├─ diff-data.ts
└─ restore-last-good.ts
```

每个脚本只完成一个职责，禁止把“下载、清洗、生成、部署”全部塞进单个脚本。

## 11.6 GitHub Actions 工作流

必须至少包含以下工作流：

```text
.github/workflows/
├─ data-sync.yml          # 每周自动同步开放数据
├─ data-country-sync.yml  # 手动指定国家更新
├─ ci.yml                 # 每次提交运行 Schema/Test/Build
└─ dependency-update.yml  # 依赖升级，与数据更新分离
```

`data-sync.yml` 的逻辑要求：
1. checkout；
2. 固定 Node LTS；
3. `npm ci`；
4. 恢复上次下载缓存；
5. 执行上游变化检查；
6. 下载 candidate 数据；
7. 生成标准化数据；
8. 运行所有验证；
9. 构建站点；
10. 比较数据 diff；
11. 无有效变化则退出，不产生空提交；
12. 有变化且验证通过才提交生成文件和 manifest。

GitHub Actions 示例骨架：

```yaml
name: Sync Address Data

on:
  schedule:
    - cron: "20 18 * * 6" # 周日 03:20 JST（UTC+9）
  workflow_dispatch:

permissions:
  contents: write

jobs:
  sync:
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run data:sync
      - run: npm run data:validate
      - run: npm test
      - run: npm run build
      - run: npm run data:commit-if-changed
```

实际实现时必须把下载超时、重试次数和单个国家失败处理写进脚本，不能无限重试。

## 11.7 上游下载与增量策略

### GeoNames
- 城市/行政区经纬度字段必须保留，用于区域地图中心点；不得把坐标伪装成合成门牌的精确坐标。
- 优先使用官方 download dump，不让最终用户请求 GeoNames Web Service；
- 按 ISO2 国家代码维护源文件映射；
- 记录 HTTP `ETag` / `Last-Modified`（可获得时）与 SHA256；
- 文件未改变时不重新清洗该国家；
- 单个国家下载失败时标记为 failed，不覆盖该国 last-known-good 数据；
- 支持全量重建命令 `npm run data:rebuild-all`。

### libaddressinput metadata
- 缓存国家级 metadata；
- 对比上次 hash；
- 若某国家地址格式字段发生变化，自动标记该国家为 `rulesChanged`；
- 触发 Country Profile 重新构建和对应国家测试；
- 不把 metadata 当作“地址真实性”证明。

## 11.8 数据清洗规则

必须统一：
- UTF-8；
- Unicode NFC；
- 国家代码 uppercase；
- 空白字符与不可见控制字符清理；
- 去除完全重复记录；
- 保留本地名称与英文/ASCII 名称，不用英文覆盖本地名；
- 行政区必须保存稳定 ID，而不是只用显示名称关联；
- 城市记录必须可追溯到 countryCode 和上级行政区；
- 对存在争议或特殊行政归属的数据，不自行推断政治归属，按所采用数据源的代码并在来源页说明。

## 11.9 必须执行的数据验证

### Schema 验证
使用 Zod/JSON Schema 检查：
- Country Profile 必填字段；
- ISO2/ISO3 格式；
- 地址模板字段是否合法；
- postalRule/phoneRule 是否可编译；
- citiesFile 是否存在。

### 关系验证
- 城市 countryCode 必须存在；
- admin1/admin2 ID 必须能解析；
- 同一稳定 ID 不得映射到两个国家；
- 城市页 slug 不得冲突；
- Country Profile 引用的数据文件必须可加载。

### 统计异常检测
每次更新与上一版本比较：
- 国家总数变化；
- 各国城市数量变化比例；
- 一级行政区数量变化；
- 文件体积突增/突降；
- 地址规则字段变化。

默认异常阈值建议：
- 单国城市数量一次变化超过 ±20%：阻止自动发布，除非在 allowlist 中解释；
- 全球国家数量变化：必须阻止自动发布并要求人工复核；
- 单个国家数据变成 0：必须失败；
- JSON 体积突然变成上一版 30% 以下或 300% 以上：失败并报警。

## 11.10 生成器抽样测试

数据通过结构校验后，还必须真正调用生成器：
- 每个已变化国家随机生成至少 20 条；
- 常用国家（CN/US/JP/GB/DE/FR/CA/AU/KR/SG）每次完整同步至少 100 条；
- 检查 fullAddress 非空；
- 检查邮编是否匹配该国规则；
- 检查本地地址与国际地址都能格式化；
- 检查姓名/电话/邮箱生成函数不会抛错；
- Sandbox 支付资料必须来自白名单，不能随机生成生产卡号。

## 11.11 Last Known Good 与回滚

必须保留“上一版可用数据”：

```text
data/generated/             # 当前生产数据
data/manifests/current.json
data/manifests/history/
artifacts/data-snapshots/    # CI 可选压缩快照
```

规则：
- 下载阶段绝不直接写 `data/generated/`；
- 先写到 `tmp/candidate/`；
- 通过全部测试后再原子替换；
- 失败时 production data 保持不动；
- manifest 保存当前数据版本与前一版本 commit SHA；
- 如线上新版本出现问题，可通过 Git revert / Cloudflare Pages rollback 回退到上一部署。

## 11.12 数据版本与 Manifest

每次成功更新必须生成：

```json
{
  "dataVersion": "2026.09.04.1",
  "generatedAt": "2026-09-04T03:28:12+09:00",
  "sources": [
    {
      "name": "GeoNames",
      "fetchedAt": "...",
      "sourceModifiedAt": "...",
      "license": "CC BY 4.0",
      "sha256": "..."
    },
    {
      "name": "libaddressinput metadata",
      "fetchedAt": "...",
      "sha256": "..."
    }
  ],
  "countries": 249,
  "changedCountries": ["JP", "US"],
  "validation": "passed"
}
```

版本号允许采用 `YYYY.MM.DD.N`。构建页面读取该 manifest，不在 UI 中写死日期。

## 11.13 前端展示数据库状态

Footer 和 `/sources` 页面必须显示：
- 数据库版本；
- 最近成功更新时间；
- 最近同步状态；
- 数据源名称；
- “格式真实、具体资料为合成测试数据”的说明。

建议显示：

```text
数据库版本：2026.09.04.1
最近更新：2026-09-04 03:28 JST
数据源：GeoNames / libaddressinput / 本地规则库
状态：已通过自动校验
```

如果某次定时更新失败，用户端仍展示**最近一次成功更新**时间，不显示失败 candidate 的日期。

## 11.14 Cloudflare Pages 自动部署

正式站使用 Cloudflare Pages Git 集成：
- 生产分支建议 `main`；
- GitHub Actions 只有在数据真实变化且验证通过后才向生产分支提交；
- Cloudflare Pages 监听该 Git 提交并自动构建部署；
- 不需要在数据同步 workflow 中存放 Cloudflare API Token；
- 如项目未来改为 Direct Upload/自定义 CI，再单独使用 Wrangler 或 Deploy Hook，不与当前 Git 集成方案混用。

这样可以把“上游更新权限”和“Cloudflare 部署权限”分离，减少密钥管理风险。

## 11.15 缓存、超时和故障保护

必须实现：
- 下载连接/读取超时；
- 指数退避重试，单文件建议最多 3 次；
- GitHub Actions cache 缓存原始下载和依赖；
- 单国失败不允许用空文件覆盖旧数据；
- 上游返回 HTML 错误页时必须通过 MIME/文件头检查拒绝；
- ZIP 解压前检查大小上限与文件名，避免 Zip Slip；
- 所有外部内容只作为数据解析，不执行其中脚本；
- 日志不得输出任何 GitHub/Cloudflare Secret。

## 11.16 自动更新日志与可观测性

每次运行至少输出：
- 开始/结束时间；
- 上游是否变化；
- 下载成功/失败国家数；
- changedCountries；
- 校验耗时；
- build/test 结果；
- 是否产生生产提交。

并生成机器可读报告：

```text
reports/data-sync/latest.json
reports/data-sync/latest.md
```

失败时 GitHub Actions 任务必须是红色失败状态；不允许捕获异常后仍返回成功。

## 11.17 自动更新验收标准

自动更新功能只有同时满足以下条件才算完成：
- [ ] `schedule` 与 `workflow_dispatch` 均可用；
- [ ] 无变化时不产生空 commit、不触发无意义部署；
- [ ] 可手动只更新指定国家；
- [ ] 上游下载失败不会破坏已有生产数据；
- [ ] candidate 必须经过 schema/关系/统计/生成器/build 测试；
- [ ] 所有校验通过才允许提交；
- [ ] manifest 可追踪每个数据源的时间、版本、许可和 hash；
- [ ] Footer 自动显示最近一次成功的数据更新时间；
- [ ] `/sources` 可查看数据版本与来源；
- [ ] 可从 Git 历史或 Cloudflare 部署记录回滚；
- [ ] 不需要人工每周登录服务器维护。

---


# 12. 地图功能与零后端实现（正式上线必须完成）

## 12.1 产品定位

地图属于**区域位置概览**，不是地址真实性验证器。生成的街道/门牌为合成测试数据，因此地图不得尝试把该合成门牌匹配到现实中的某栋住宅。

推荐展示：

```text
区域位置 · 非精确住宅定位
日本 / 东京都 / 涩谷区
时区：Asia/Tokyo
区域中心：35.66, 139.70
[ Leaflet 交互地图 ]
© OpenStreetMap contributors
```

## 12.2 技术方案

前端使用：
- **Leaflet**：开源、轻量、移动端友好的交互式地图组件；
- **OpenStreetMap 标准瓦片**：默认地图底图；
- **GeoNames 城市/行政区中心坐标**：地图定位数据；
- **Astro + React Island**：地图组件仅在客户端需要时初始化。

流程：

```text
Country / City selection
        ↓
读取本地 JP/US/... 城市 JSON
        ↓
取得 city.center.lat / city.center.lng
        ↓
Leaflet setView()
        ↓
按当前视口请求 OpenStreetMap tiles
```

**不调用实时地理编码 API，不需要 API Key，不需要后端服务器。**

## 12.3 坐标精度等级

每条地图数据必须带 `mapPrecision`：

- `city-center`：城市中心点；
- `region-center`：州/省/都道府县/行政区中心；
- `country-center`：国家级 fallback；
- `unavailable`：无可靠坐标时不显示地图，只显示文本位置。

严禁把 `city-center` / `region-center` 坐标展示成“该生成门牌的精确坐标”。

## 12.4 OpenStreetMap 使用规则

默认瓦片 URL 不写死在业务组件中，放入配置：

```ts
export const MAP_CONFIG = {
  provider: "openstreetmap",
  tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© OpenStreetMap contributors",
  defaultZoom: 10,
  maxZoom: 15
}
```

必须遵守：
- 地图中持续显示 `© OpenStreetMap contributors` attribution；
- 只加载用户实际查看的当前视口，不做全国家/全城市瓦片预加载；
- 不提供“离线下载地图”或后台批量抓瓦片；
- 尊重瓦片服务的 HTTP 缓存策略，不主动禁用缓存；
- Tile Provider 必须可配置切换，不能把 OSM URL 散落硬编码在多个组件；
- 公共 OSM 瓦片属于 best-effort 服务，无 SLA；地图失败不得影响生成器核心功能。

如未来站点地图流量明显增大，可只替换 Tile Provider，无需重写身份生成器、国家数据或页面结构。

## 12.5 隐私设计

地图初始化时，浏览器会直接向地图瓦片服务请求当前视口所需瓦片，因此第三方可能看到常规网络请求信息（例如 IP、User-Agent、Referer）。隐私政策必须对此做简要说明。

同时必须保证：
- 不把姓名发送给地图服务；
- 不把合成街道和门牌发送给地图服务；
- 不把电话、邮箱、公司、用户名发送给地图服务；
- 不把 Sandbox Payment 数据发送给地图服务；
- 只通过普通瓦片请求展示当前城市/行政区附近地图。

## 12.6 性能与加载

- 地图容器始终在页面上可见，不使用折叠；
- Leaflet JS/CSS 可按需加载；
- 地图区未进入或未接近视口时，可以延迟初始化瓦片请求；
- 用户切换城市时，如果地图尚未初始化，只更新待显示坐标；
- 地图初始化后切换城市使用 `setView` / `flyTo`，不重建整个页面；
- 同一城市重新生成身份资料时，不重复请求无意义的新地图位置；
- 地图失败、超时、被拦截时显示文本 fallback：国家 / 行政区 / 城市 / 时区 / 中心坐标。

## 12.7 可访问性

- 地图容器必须有可读标题，例如 `aria-label="涩谷区区域位置地图"`；
- 地图旁边始终提供等价文本位置，不要求用户必须操作地图才能获取位置；
- 地图不能阻断键盘滚动；
- 移动端避免地图捕获所有触摸手势导致页面无法滚动；
- “区域位置 · 非精确住宅定位”必须是可见文字，不只放 tooltip。

## 12.8 地图验收标准

- [ ] 国家/城市切换后地图同步更新；
- [ ] 地图使用城市/行政区中心坐标，不对合成门牌做地理编码；
- [ ] 地图 attribution 始终可见；
- [ ] 无瓦片预加载/离线下载/批量抓取；
- [ ] 地图网络失败时核心生成器仍完全可用；
- [ ] 地图失败时有文本坐标 fallback；
- [ ] 地图相关请求不携带姓名、街道、门牌、电话、邮箱、支付资料；
- [ ] 当前正式架构无需后端服务器或地图代理服务器。

---

# 13. 技术栈与工程结构

推荐正式技术栈：
- Astro：国家页、城市页静态生成与 SEO；
- TypeScript；
- React Islands：国家面板、城市搜索、生成器、复制、批量表格；
- Tailwind CSS 或项目自有 Design Tokens；
- Faker.js；
- Leaflet：区域地图；
- OpenStreetMap：默认地图瓦片；
- Zod：运行时数据 schema 校验；
- Vitest：单元测试；
- Playwright：端到端测试；
- GitHub Actions；
- Cloudflare Pages。

**架构限制：本次不部署业务后端、不建数据库、不自建 API。** 浏览器直接加载 Cloudflare Pages 静态资源；地图直接加载可配置 Tile Provider；GitHub Actions 仅用于构建和数据更新。

工程目录：
```text
src/
├─ components/
│  ├─ CountryMegaDropdown.tsx
│  ├─ CitySidebar.tsx
│  ├─ IdentityCards.tsx
│  ├─ BatchGenerator.tsx
│  ├─ MapPanel.tsx
│  └─ SiteFooter.tsx
├─ generator/
│  ├─ person/
│  ├─ address/
│  ├─ contact/
│  ├─ work/
│  ├─ account/
│  └─ payment-sandbox/
├─ map/
│  ├─ MapProvider.ts
│  ├─ map-config.ts
│  └─ coordinate-utils.ts
├─ data/
├─ layouts/
├─ pages/
│  ├─ index.astro
│  ├─ privacy.astro
│  ├─ terms.astro
│  ├─ sources.astro
│  └─ batch.astro
├─ i18n/
├─ utils/
└─ styles/
scripts/
├─ sync-geonames.ts
├─ sync-address-metadata.ts
├─ sync-payment-test-data.ts
├─ build-country-profiles.ts
└─ validate-data.ts
```

---

# 14. 多语言

正式上线至少支持：
- 简体中文；
- English。

架构必须支持后续 locale 文件直接增加语言，但开发本次把完整 i18n 基础一次做好：
- UI 文案；
- 国家名；
- 数据标签；
- 错误提示；
- 隐私/条款页面；
- SEO metadata 模板。

本地地址仍按所选国家原生语言输出，不受 UI 语言影响。

---

# 15. SEO

## 15.1 路由
```text
/jp-address
/jp-address/tokyo
/us-address
/us-address/california/los-angeles
```

## 15.2 每个国家页
必须独立：
- Title；
- Description；
- H1；
- canonical；
- hreflang；
- Open Graph；
- Breadcrumb structured data；
- WebApplication / SoftwareApplication schema（按实际适用）；
- 150~300 字有用说明。

注意：说明文字不堆关键词，不复制其他网站介绍，不在底部重复城市链接墙。

## 15.3 Sitemap
自动生成：
- 国家页；
- 重点城市页；
- 隐私、条款、数据来源；
- 批量生成页。

---

# 16. 性能要求

上线验收目标：
- 首页核心 JS 尽量 < 200KB gzip（不包含懒加载国家数据）；
- 国家城市数据按需加载；
- 切换已访问国家优先使用浏览器缓存；
- 城市列表 > 500 条启用虚拟滚动；
- 避免首次加载全球城市数据库；
- 图片仅 Footer 二维码等少量资源；
- Lighthouse Performance / Accessibility / Best Practices / SEO 目标 ≥ 90（合理环境下）。

---

# 17. 可访问性

- 全站键盘可操作；
- Mega Dropdown 支持 Esc；
- 搜索框有 label / aria-label；
- 当前国家和城市用 `aria-current` / `aria-selected`；
- 复制成功用不打断操作的 live region；
- 文本对比度满足 WCAG AA；
- 不仅依赖颜色表示“当前选中”；
- 二维码旁必须同时显示“微信公众号：小产品实验室”，不能只放图片。
- 地图必须有等价文字位置、可读 aria-label，并避免吞掉页面键盘/触摸滚动。

---

# 18. 错误处理与降级

- 国家数据加载失败：显示“该国家数据暂时不可用”，保留国家切换；
- 城市文件失败：退化到国家级随机生成，不显示伪造完整城市列表；
- Clipboard API 不可用：使用兼容复制方案；
- LocalStorage 不可用：保存按钮提示“当前浏览器未允许本地保存”；
- Sandbox 支付数据加载失败：隐藏具体测试卡行并显示“Provider 测试数据暂不可用”，绝不临时随机造卡号；
- 数据版本不兼容：阻止使用错误 schema，并记录前端 console diagnostic。
- 地图瓦片加载失败：隐藏空白地图画布，显示国家/行政区/城市/时区/中心坐标文本 fallback；不得影响身份生成、复制、保存、批量与导出。

---

# 19. 安全与隐私设计

- 无用户账户；
- 无密码上传；
- 无真实个人数据采集；
- 默认不使用营销 Cookie；
- 不把生成结果发送到本站后端服务器；
- 地图只加载区域瓦片，不把生成的姓名、街道、门牌、电话、邮箱、支付资料发送给地图服务；
- 所有保存资料仅存在当前浏览器 LocalStorage；
- 邮箱使用 `.test` 域名；
- 支付测试资料只使用官方 Sandbox；
- 禁止在页面文案宣传规避支付、税务、地区限制或身份验证用途。

如未来增加统计，必须优先采用不采集生成内容的隐私友好统计；在本次规格中**不把生成资料作为统计事件参数**。

---

# 20. Footer 最终设计（本次必须开发）

Footer 不是一行版权文字，而是正式信息区：

```text
┌──────────────────────────────────────────────────────────────┐
│ 小产品实验室 · 全球地址生成器                               │
│ 生成符合各国格式习惯的合成测试身份资料，仅用于开发与测试。  │
│                                                              │
│ 产品                         帮助与政策                       │
│ 全球地址生成器               隐私政策                        │
│ 批量生成                     使用条款                        │
│ 数据来源                     清空本地数据                    │
│                                                              │
│ 联系我们                                                     │
│ 微信公众号：小产品实验室    [公众号二维码图片]               │
│ 反馈邮箱：【待填写反馈邮箱】                                 │
│                                                              │
│ © 当前年份 TinyProductLab / 小产品实验室                     │
└──────────────────────────────────────────────────────────────┘
```

### 20.1 微信公众号
- 名称固定显示：**小产品实验室**；
- 图片路径预留：`/assets/wechat-official-account-qr.png`；
- 二维码建议 120~160px；
- 必须有圆角/留白，但不能对二维码本体做变形、裁切、滤镜；
- 点击二维码在桌面可放大查看；
- 移动端不强制扫描提示，仅展示“长按识别/保存后识别”等中性说明。

> 当前文档没有拿到实际二维码图片，因此线框图和开发规格使用占位资源；正式上线前只需替换同名图片文件，无需改布局代码。

### 20.2 反馈邮箱
统一通过配置项：
```ts
export const SITE_CONTACT = {
  feedbackEmail: "【待填写反馈邮箱】",
  wechatOfficialAccount: "小产品实验室",
  wechatQr: "/assets/wechat-official-account-qr.png"
}
```

Footer、隐私政策、关于页均读取同一配置，避免三处写死。

> 当前会话中未提供真实反馈邮箱，开发阶段使用 `【待填写反馈邮箱】` 占位；上线构建时若仍为占位符，CI 必须报错阻止发布。

---

# 21. 隐私政策 `/privacy`（本次必须开发）

页面应使用清楚、短句、非法律腔说明以下内容：

## 21.1 建议正式文案

**隐私政策**

最后更新：由构建日期自动生成。

“小产品实验室 · 全球地址生成器”主要在您的浏览器本地生成测试数据。我们不要求注册账号，也不会因为使用生成器而要求您提交真实姓名、真实住址、真实银行卡或身份证件信息。

**我们处理什么数据**  
生成的姓名、地址、电话、邮箱、账号资料等为合成测试数据，生成过程默认在浏览器本地完成。若您使用“收藏”“最近使用”等功能，相应内容会保存在当前浏览器的 LocalStorage 中，不会自动上传到我们的服务器。

**支付测试资料**  
页面展示的支付卡资料仅用于支付服务商的 Sandbox/Test 环境。我们不提供真实支付卡、银行账户或可用于真实交易的金融账户信息。

**Cookie 与统计**  
本站默认不使用营销 Cookie。若站点启用基础访问统计，不得将生成的姓名、地址、卡号、邮箱等测试内容作为统计参数上传。实际启用的统计服务应在本页列明。

**本地数据**  
您可以通过站内“清空本地数据”功能删除收藏、最近国家、最近生成记录等；清除浏览器网站数据也会删除这些内容。

**第三方数据来源**  
国家、行政区、城市和地址格式可能参考公开数据源。具体数据源、许可证和更新时间请查看“数据来源”页面。

**地图服务**  
当地图区域需要显示时，您的浏览器可能直接向 OpenStreetMap 或站点配置的其他地图瓦片服务请求当前视口所需地图图片。此类请求可能包含普通网络连接信息（如 IP、User-Agent、Referer）。本站不会把生成的姓名、街道门牌、电话、邮箱、账号或 Sandbox Payment 数据作为地图请求参数发送。地图只用于展示城市/行政区的大致区域位置。

**外部链接**  
本站可能提供第三方数据源或支付 Sandbox 文档链接。离开本站后的隐私规则由对应第三方负责。

**联系我们**  
微信公众号：小产品实验室  
反馈邮箱：【待填写反馈邮箱】

我们可能随着功能、数据源或法规要求更新本政策。更新后会修改页面的“最后更新”日期。

---

# 22. 使用条款 `/terms`（本次必须开发）

核心文案：
- 工具用于软件开发、QA、表单验证、UI/UX 示例、国际化测试、教学演示等合法测试用途；
- 生成数据不保证对应真实个人、真实住宅或可投递地址；
- 不得用于身份冒用、诈骗、骚扰、伪造文件、真实支付或规避第三方平台规则；
- Sandbox 支付数据只适用于对应测试环境；
- 开放数据源按其许可证使用；
- 网站按“现状”提供，不承诺所有国家字段对所有业务系统 100% 兼容。

---

# 23. 数据来源 `/sources`（本次必须开发）

页面字段：
- 当前数据库版本；
- 最近一次成功更新时间；
- 最近一次自动同步状态；
- 本次变更国家/地区数量；
- 数据源名称；
- 用途；
- License；
- 官方链接；
- sourceModifiedAt / fetchedAt；
- SHA256（可放在“技术详情”中）；
- 本站清洗、合并与合成方式。

页面数据必须直接读取 `data/manifests/current.json`，不得人工写死“更新时间”。自动同步失败时继续展示最近一次成功版本，并可在技术详情中注明“最近一次同步失败，但线上仍使用上一版已校验数据”。

示例类别：
- ISO 国家基础元数据；
- GeoNames：城市/行政区与中心坐标；
- Leaflet：前端开源地图库；
- OpenStreetMap：默认地图数据/瓦片与 attribution；
- GeoNames 行政区/城市；
- libaddressinput 地址格式 metadata；
- Faker 本地化生成数据；
- 支付 Provider Sandbox/Test 官方资料。

网站不得把“格式合规”表述成“真实可投递”。

---

# 24. 关于与反馈 `/about`

内容：
- 小产品实验室简介；
- 工具用途；
- 数据边界；
- 微信公众号二维码；
- 反馈邮箱；
- GitHub（如未来公开源码，可由配置增加）；
- Bug 反馈建议格式：国家、城市、错误字段、期望格式、截图（不得要求用户提交真实身份证或真实银行卡资料）。

---

# 25. 移动端最终规则

- 顶部国家快捷入口横向滚动；
- “全部国家”全屏选择；
- 城市入口显示为“当前城市 + 选择城市”，打开全屏列表；
- 结果区所有卡片单列且不折叠；
- 主操作按钮允许两行排列；
- Footer 二维码居中展示，政策链接两列；
- 卡号/UUID/长地址允许换行；
- 复制按钮保持可点击面积 ≥ 44px。

---

# 26. 测试方案

## 26.1 单元测试
- Country Profile schema；
- 邮编 formatter；
- 地址 formatter；
- Seed；
- 年龄与生日；
- `.test` 邮箱；
- Sandbox Provider 只允许白名单测试卡。

## 26.2 E2E
- 国家切换；
- Mega Dropdown 搜索与 Esc；
- 城市搜索/选择；
- 重新生成保持城市；
- 复制；
- 保存与清空 LocalStorage；
- 批量导出；
- 隐私/Footer 链接；
- 手机端国家/城市全屏面板；
- 地图随国家/城市切换；
- 地图失败 fallback；
- 地图请求不包含生成的人物/地址/支付字段。

## 26.3 数据质量
抽样国家必须覆盖：
- 拉丁字母地址；
- 中文；
- 日文；
- 韩文；
- 阿拉伯文；
- 无邮编国家/地区；
- 复杂邮编格式；
- 联邦州制国家；
- 有城市中心坐标国家；
- 只能降级到 region-center / country-center 的国家。

---

# 27. 上线验收清单（全部通过才发布）

### 交互
- [ ] 打开国家页立即有完整结果；
- [ ] 全部核心字段直出，无折叠；
- [ ] “全部国家”可搜索并覆盖 ISO 3166-1 的 249 个国家/地区；
- [ ] 左侧城市完整可访问，正文不重复城市；
- [ ] 国家/城市切换不整页闪白；
- [ ] 重新生成保持筛选；
- [ ] 每字段复制、复制全部可用。

### 数据
- [ ] Country Profile schema 全通过；
- [ ] 城市数据懒加载；
- [ ] `.test` 邮箱；
- [ ] Sandbox 卡只来自白名单 Provider 官方测试资料；
- [ ] Payment Sandbox 支持多 Provider / 多品牌 / 多产品 / 多国家 / 多币种 / 多测试场景，并验证国家不匹配时正确降级为 Generic Sandbox；
- [ ] 不生成真实敏感证件/账户字段；
- [ ] 数据来源页有许可与更新时间。

### 批量
- [ ] 5~500 条；
- [ ] Seed；
- [ ] CSV/JSON/JSONL/TXT；
- [ ] UTF-8 中文/日文/韩文导出正常。

### 自动更新库
- [ ] GitHub Actions 每周定时同步可正常执行；
- [ ] GeoNames（含中心坐标）/ 地址规则 / Payment Sandbox 官方测试目录都进入独立同步与版本记录；
- [ ] 支持手动 workflow_dispatch 与指定国家同步；
- [ ] 上游未变化时不产生空提交；
- [ ] 下载失败/校验失败不会覆盖 last-known-good；
- [ ] Schema、父子关系、统计异常、随机生成、Vitest、Playwright、Astro build 全通过才发布；
- [ ] manifest 记录 source/license/fetchedAt/sourceModifiedAt/hash/generatedAt；
- [ ] Footer 与 `/sources` 自动显示最近一次成功更新时间；
- [ ] 可从 Git/Cloudflare 部署历史回滚；
- [ ] 自动更新不依赖最终用户实时调用第三方 API。

### 地图 / 零后端
- [ ] Leaflet 地图区默认展开且位于结果区最后；
- [ ] 地图只使用城市/行政区/国家中心坐标，不对合成门牌做地理编码；
- [ ] OSM attribution 始终可见；
- [ ] 无瓦片预加载、离线下载或后台批量抓取；
- [ ] 地图失败不影响地址、人物、Sandbox Payment、批量生成与导出；
- [ ] 地图请求不携带姓名、合成街道/门牌、电话、邮箱、支付资料；
- [ ] 正式上线无需 VPS、数据库、业务 API 或地图代理服务器；
- [ ] Tile Provider 可配置替换。

### Footer / 法务
- [ ] Footer 有“隐私政策 / 使用条款 / 数据来源”；
- [ ] Footer 显示微信公众号“**小产品实验室**”；
- [ ] `/assets/wechat-official-account-qr.png` 已替换为真实公众号二维码；
- [ ] `【待填写反馈邮箱】` 已替换为真实反馈邮箱；
- [ ] CI 对二维码缺失或邮箱占位执行 fail build；
- [ ] `/privacy`、`/terms`、`/sources`、`/about` 可访问。

### 性能与可访问性
- [ ] 城市大列表不卡顿；
- [ ] 移动端无横向页面溢出；
- [ ] 键盘可操作；
- [ ] 对比度与 aria 状态正确；
- [ ] Lighthouse 四项主要指标目标 ≥ 90。

---


# 附录 A. 本次设计参考（非照抄）

- USAddrGen：用于观察“完整人物档案 + 地址 + 工作 + 支付测试 + 账号设备 + 地图”的信息密度与一屏展示方式。
- Stripe Testing：https://docs.stripe.com/testing
- Adyen Test Cards：https://docs.adyen.com/development-resources/test-cards-and-credentials/test-card-numbers
- Braintree Testing：https://developer.paypal.com/braintree/docs/reference/general/testing/
- Leaflet：https://leafletjs.com/
- OpenStreetMap Tile Usage Policy：https://operations.osmfoundation.org/policies/tiles/
- GeoNames：https://www.geonames.org/

借鉴原则：学习信息架构与测试数据完整性，不复制第三方页面布局、文字、品牌或视觉设计。

# 28. 给 AI 开发者的最终执行指令

特别强调 V8：
- 249 个 ISO 国家/地区必须全部进入国家选择器与 Country Profile，不得只完成热门国家；
- 支付模块必须实现多 Provider、多品牌、多产品类型、多国家/币种/场景的 Sandbox 数据池，避免所有结果看起来完全一样；
- 任何完整 PAN 都只能来自官方 Sandbox 测试目录，不允许通过 Luhn/BIN 算法自行制造生产样式卡号；
- 人物资料要比单纯地址更完整，但 SSN、身份证、护照、银行账户等高风险字段必须保持禁用；
- 所有字段默认直接可见，不以折叠面板隐藏核心资料；
- 地图作为最后一个常驻区块，使用 Leaflet + 可配置 OSM Tile Provider + GeoNames 中心坐标；不对合成门牌做地理编码；
- 本次正式架构必须保持零业务后端：Cloudflare Pages + GitHub Actions，不部署 VPS、数据库、常驻 API 或地图代理；


> **一次性完成正式上线版本，不拆 MVP，不保留“以后再做”的核心功能。** 站点采用“顶部国家切换 + 全部国家 Mega Dropdown + 左侧完整城市/地区 + 右侧完整测试身份”的原创布局。用户打开国家页立即得到结果。所有人物、地址、联系方式、Sandbox 支付测试资料、工作资料、账号与技术资料、区域地图默认全部显示，不允许 Accordion 或“查看更多”。城市仅在左侧/移动端城市选择器出现，不在正文底部重复。实现单条生成、Seed、LocalStorage 保存、最近使用、收藏、批量 5~500 条、CSV/JSON/JSONL/TXT 导出、中文/英文 i18n、SEO 国家/城市页；同时完整实现 GitHub Actions 数据自动更新系统：每周同步 GeoNames/libaddressinput、增量检测、candidate 数据区、Schema/关系/统计/随机生成测试、manifest、last-known-good、失败保护、Git 提交与 Cloudflare Pages 自动部署。自动更新失败不得影响线上上一版数据。Footer 必须包含隐私政策、使用条款、数据来源、微信公众号“**小产品实验室**”与二维码、反馈邮箱；同时开发 `/privacy`、`/terms`、`/sources`、`/about` 页面。支付资料仅允许使用支付平台官方 Sandbox/Test 数据，不随机生成生产银行卡号。生成结果默认只在浏览器本地处理，不上传本站后端服务器；地图仅按城市/行政区中心加载当前视口瓦片，任何生成的人物/街道/门牌/支付资料都不得进入地图请求。