<div align="center">

<img src="assets/logo/address-generator-logo-104.png" width="72" height="72" alt="地址生成器">

# 全球地址与人物资料生成器

选择国家或城市，立即生成一份格式自然、字段完整、可以直接复制的资料。

[立即使用](https://addressgen.tinylabpro.com/) · [批量生成](https://addressgen.tinylabpro.com/#batch) · [关于与反馈](https://addressgen.tinylabpro.com/about)

<br>

![249 个国家 / 地区](https://img.shields.io/badge/国家与地区-249-3475ed?style=flat-square)
![16 种界面语言](https://img.shields.io/badge/界面语言-16-6b5ce7?style=flat-square)
![无需注册](https://img.shields.io/badge/注册-无需-159570?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-可安装-f08a32?style=flat-square)

</div>

<p align="center">
  <img src="assets/readme-hero.svg" alt="全球地址与人物资料生成器宣传图" width="100%">
</p>

## 这是什么？

这是一个面向开发、QA、国际化和表单演示的全球资料生成工具。它把地址、姓名、联系方式、职业、账号资料等常用字段放在一张结果卡里，打开即有结果，选择即更新。

你可以从日本、美国、中国、英国、德国、加拿大等常用国家开始，也可以搜索完整的 249 个国家 / 地区列表。

## 为什么适合放进工作流？

| 选择范围 | 生成结果 | 使用方式 |
| --- | --- | --- |
| 国家、州省、城市或地区 | 本地地址与国际地址 | 单项复制或复制全部 |
| 249 个国家 / 地区 | 姓名、电话、邮箱、生日、职业 | Seed 固定结果，方便复现 |
| 16 种界面语言 | 货币、时区、语言代码、设备资料 | 批量导出 CSV / JSON / JSONL / TXT |

### 一张卡片，覆盖常用字段

```text
基本资料       本地姓名 · 罗马字 · 性别 · 出生日期 · 年龄
地址与联系方式 本地地址 · 国际地址 · 城市 · 邮编 · 电话 · 邮箱
银行卡         卡组织 · 卡号外观 · 有效期 · 安全码 · 账单地址
工作资料       职业 · 公司 · 行业 · 公司规模 · 收入 · 币种
账号与技术资料 用户名 · 密码 · UUID · 个人主页 · OS · User-Agent
其他人物档案   教育程度 · 身高体重 · 血型 · 兴趣 · 个人简介
```

> 页面中的地址、人物和账号资料是合成示例数据，适合开发、演示、QA 和表单格式验证；不代表真实个人，也不保证可以用于任何第三方账户或支付场景。

## 核心功能

- **全球范围**：ISO 3166-1 国家 / 地区选择器，支持中文名、英文名、本地名和 ISO 代码搜索。
- **本地格式**：地址、姓名、电话、邮编、货币和时区会随所选国家与城市变化。
- **即时生成**：打开页面即有结果，重新生成会保留当前国家和城市筛选。
- **可复现**：填写 Seed 后，同一国家和筛选条件可以得到同一份结果，方便 QA 重现问题。
- **批量导出**：一次生成 1–500 条，支持 CSV、JSON、JSONL 和 TXT。
- **本地优先**：生成和保存默认在当前浏览器完成，不要求注册，不上传生成结果。
- **手机友好**：城市和国家在手机上使用全屏选择器，按钮和复制入口适合触控。
- **可安装**：支持 PWA，安装到主屏后，断网仍可生成、复制和批量导出；地图会降级为文字位置。

## 立即开始

打开 [addressgen.tinylabpro.com](https://addressgen.tinylabpro.com/)，页面会自动生成一份默认资料：

1. 点击顶部的国家，或打开“全部国家”搜索目标地区。
2. 需要时在城市 / 地区里锁定范围。
3. 复制单个字段、复制全部，或向下使用批量生成。

常用入口：

- [日本地址与人物资料生成器](https://addressgen.tinylabpro.com/jp-address-generator/)
- [美国地址与人物资料生成器](https://addressgen.tinylabpro.com/us-address-generator/)
- [中国地址与人物资料生成器](https://addressgen.tinylabpro.com/cn-address-generator/)
- [英国地址与人物资料生成器](https://addressgen.tinylabpro.com/uk-address-generator/)
- [德国地址与人物资料生成器](https://addressgen.tinylabpro.com/de-address-generator/)
- [加拿大地址与人物资料生成器](https://addressgen.tinylabpro.com/ca-address-generator/)

## 隐私与数据边界

- 生成逻辑在浏览器本地运行，默认不向本站上传生成结果。
- “已保存”和“最近生成”使用浏览器 LocalStorage，只保存在当前设备。
- 邮箱只生成格式示例，不进行 MX、SMTP 或存在性验证，也不会发信。
- 银行卡字段仅用于外观和表单结构展示，不接入真实支付网络。
- 地图只展示城市、行政区或国家中心位置，不对合成门牌做精确定位。
- 不生成身份证号、护照号、社会安全号、税号、银行账户或其他真实证件字段。

详细说明：[`隐私政策`](https://addressgen.tinylabpro.com/privacy) · [`使用条款`](https://addressgen.tinylabpro.com/terms) · [`数据来源`](https://addressgen.tinylabpro.com/sources) · [`关于与反馈`](https://addressgen.tinylabpro.com/about)

## 开发说明

这是一个无构建步骤的纯前端静态项目：

- `index.html`：首页生成器模板；国家专页由脚本从它生成。
- `app.js`：国家档案、资料生成、Seed、保存、批量导出和地图逻辑。
- `i18n.js`：16 种界面语言；界面语言与资料本地化分开处理。
- `styles.css`：响应式布局、深色模式、RTL 和移动端选择器。
- `manifest.webmanifest` / `service-worker.js`：PWA 清单与离线缓存。
- `data/card-brands/`：卡组织编号规则和来源 manifest。
- `scripts/build-pages.mjs`：生成国家页和 sitemap。
- `scripts/check-release.mjs`：发布前资源、页面和安全边界检查。
- `tests/`：Node 内置测试，覆盖数据规则和生成一致性。

本地运行：

```bash
python3 -m http.server 8000
```

修改首页模板后重新生成国家页：

```bash
node scripts/build-pages.mjs
node --test tests/*.test.mjs
node scripts/check-release.mjs
```

## 项目结构

```text
index.html              首页生成器模板
*-address-generator/    国家专页
*-address/              旧路径跳转页
app.js                  生成逻辑与国家档案
i18n.js                 16 种界面语言
styles.css              响应式样式
manifest.webmanifest    PWA 清单
service-worker.js       离线缓存
data/card-brands/       卡组织规则与来源
scripts/                页面生成与发布检查
tests/                  单元测试
```

## 许可与反馈

项目中的代码与数据规则请以仓库文件中的许可和来源说明为准。发现格式问题、国家数据问题或移动端体验问题，欢迎通过 [关于与反馈](https://addressgen.tinylabpro.com/about) 联系。
