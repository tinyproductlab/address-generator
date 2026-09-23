# 经纬度查询接口部署

需要 Node.js 22+。静态网站通过 `https://account.tinylabpro.com/api/address/reverse` 查询，本服务仅监听本机 8787 端口。

配置环境变量后运行 `node server/reverse.mjs`，生产环境交给 systemd 等进程管理器运行：

- `GEOCODER_URL`：地图服务的 Nominatim 兼容 reverse 接口完整 HTTPS URL（可包含供应商密钥参数，保留在服务器环境变量中）。
- `GEOCODER_USER_AGENT`：标明产品名和实际联系地址。
- `PORT`：默认 8787。

支持 `GEOCODER_PROVIDER=photon`（Photon GeoJSON）或默认 `nominatim`（Nominatim JSON）。不设置供应商时接口返回 503；前端仍能定位输入坐标，会明确提示地址查询不可用。没有把任何公共免费供应商作为默认服务。

Nginx 在地址生成器域名下添加：

```nginx
location = /api/reverse {
    proxy_pass http://127.0.0.1:8787;
    proxy_read_timeout 12s;
}
```

若静态站托管在另一平台，需要该域名的反向代理/边缘路由把 `/api/reverse` 转发到本服务。不要将服务器直接暴露为不限来源的公共查询接口。

服务按整站单进程限制上游请求间隔至少 1.1 秒，不排队；繁忙返回 429。相同坐标与语言缓存 24 小时，最多 2000 项，重启失效。不记录查询坐标日志。生产可增加持久缓存、入口限流；不要通过多进程绕过上游限额。

如要使用 OSMF 公共 Nominatim，站点运营者须先确认适用并遵守 https://operations.osmfoundation.org/policies/nominatim/ ：整站最多 1 请求/秒、可识别 User-Agent、缓存、署名、仅用户手动触发，不支持自动补全及批量坐标查询；用量大或以地理编码为主营功能时选择第三方/自建服务。本功能不在随机生成或批量导出时调用上游。

部署验证：有效坐标应返回附近地址或 `display_name: null`；非法坐标返回 400；上游失败返回 502。前端坐标保留原始输入，附近地址不会替换随机资料。地图及地址数据署名为 OpenStreetMap，供应商若要求额外署名需补入前端。

## 当前线上部署（2026-09-23）

服务器 `ubuntu@129.213.55.197`，目录 `/opt/address-geocoder`，Docker 容器 `address-geocoder`，与账户 API 在 `unmark_default` 网络通信。只运行一个实例，128MB 内存限制。使用 Photon 公共服务 `https://photon.komoot.io/reverse`，无需账号。遵守 https://github.com/komoot/photon#demo-server 的合理用量要求，不保证可用性；量大时替换为自建或商业供应商。

请求链：网页 → `account.tinylabpro.com/api/address/reverse` → 内网查询容器 → Photon。只转发 lat、lon、lang，不转发用户 Cookie 或认证信息。该 GET 路由单独允许地址生成器正式域名的跨域访问，不改变账号接口的跨域规则。

`account-route.ts` 部署为账户服务 `src/address-route.ts`，在 server.ts 中注册。原 server.ts 备份于 `backups/address-20260923/server.ts`，原 API 镜像 `tinylab-account-api:before-address-20260923`。随机生成不依赖该后端；接口故障不影响免税州生成。
