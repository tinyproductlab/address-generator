# 小产品实验室 · 全球地址与人物资料生成器

纯前端静态站：真实地名与本地地址格式 + 随机生成的人物、联系方式、银行卡外观、工作与账号资料，全部在浏览器本地生成，不上传任何数据。

上线地址：**addressgen.tinylabpro.com**（Cloudflare Pages Git 集成，无业务后端）

## 功能

- 打开即生成，选择即更新，全部字段直出，不用折叠面板
- ISO 3166-1 全部 **249 个国家 / 地区**（22 个完整本地化，其余 generic-safe 降级）
- 顶部常用国家 + “全部国家”面板（可按中文名 / 英文名 / 本地名 / ISO 搜索），左侧城市为唯一城市入口
- **16 种界面语言**（含阿拉伯语 RTL）；界面语言与资料本地化分开，本地地址与姓名始终按所选国家语言输出
- Seed 可复现（`?seed=`，同 Seed + 同筛选 = 同结果）；批量 1–500 条；CSV / JSON / JSONL / TXT 导出
- Leaflet + OpenStreetMap 区域地图：只用城市 / 行政区 / 国家中心坐标，不对合成门牌做地理编码
- 无构建步骤、无后端、无数据库、无 Math.random（全程 SeededRandom）

## 数据边界

| 字段 | 规则 |
|---|---|
| 国家 / 行政区 / 城市 | 公开地名数据 |
| 街道 / 门牌 / 姓名 / 电话 / 公司 | 随机合成，按城市绑定，避免跨城市错配 |
| 邮编 | 优先与城市关联；无可靠映射时只按该国格式生成 |
| 邮箱 | 主流服务商真实域名 + 随机本地部分；不做 MX / SMTP / 存在性验证，不发信 |
| 银行卡 | 只按卡组织公开编号结构生成外观型 PAN，**末位主动破坏 Luhn 校验**，不接入真实 BIN 库 |
| 个人主页 | 固定为本站 `/u/<name>-<random>`，不指向真实第三方网站 |
| 不生成 | 身份证号 / 护照号 / SSN / 税号 / 银行账户 / IBAN / routing number / 生物识别 |

卡组织规则与来源核验记录：`data/card-brands/`（含 `source-manifest.json`）。

## 目录

```text
index.html              首页（生成器模板，唯一手工维护的页面结构）
i18n.js                 16 种界面语言的语言包
app.js                  国家档案、生成器、卡组织规则、地图、批量导出
styles.css              样式（含深色模式与 RTL）
*-address-generator/    由 scripts/build-pages.mjs 从 index.html 生成的国家页
*-address/              旧路径，保留为 noindex 跳转页
u/                      个人主页字段说明页
privacy|terms|sources|about.html   法务与说明页
data/card-brands/       卡组织编号规则与来源 manifest
scripts/                页面生成与上线前检查
tests/                  单元测试（node --test）
```

## 开发

```bash
# 本地预览
python3 -m http.server 8000

# 改完 index.html 后重新生成国家页与 sitemap
node scripts/build-pages.mjs

# 单元测试：卡组织规则、PAN 全部 Luhn-invalid、女性身高上限、身高体重联动、
#           邮箱域名池、Seed 复现、邮编与城市关联、OS/UA 一致、16 语言键完整
node --test tests/*.test.mjs

# 上线前检查：占位反馈邮箱 / 缺失二维码 / 残留测试文案 / sitemap 死链会直接失败
node scripts/check-release.mjs
```

以上三条命令即 GitHub Actions（`.github/workflows/ci.yml`）执行的内容。
