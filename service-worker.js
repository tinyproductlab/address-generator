/* 小产品实验室 · 全球地址与人物资料生成器 — Service Worker
 *
 * 目标：装到桌面后断网也能继续生成地址与人物资料（生成逻辑本来就全在本地）。
 *
 * 缓存策略：
 *   - 应用外壳（HTML / CSS / JS / 图标）：precache，安装时一次装好；
 *   - 导航请求（HTML）：network-first，拿不到网络再回退缓存，避免部署后一直看到旧页面；
 *   - 同源静态资源：stale-while-revalidate，先给缓存再后台更新；
 *   - 地图瓦片与任何跨域请求：**一律不缓存、不预取**。
 *
 * 这一条是硬要求：OpenStreetMap 的瓦片使用政策禁止批量下载与离线囤积，
 * 所以 SW 必须对 tile 服务直接放行到网络，绝不写进 Cache Storage。
 */
const VERSION = '2026.09.05.2';
const SHELL_CACHE = `addrgen-shell-${VERSION}`;
const RUNTIME_CACHE = `addrgen-runtime-${VERSION}`;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/i18n.js',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/assets/favicon-32.png',
  '/assets/apple-touch-icon.png',
  '/assets/icon-192.png',
  '/assets/logo/address-generator-logo.png'
];

// 绝不进缓存的主机：地图瓦片与地图库
const NEVER_CACHE_HOSTS = [
  'tile.openstreetmap.org',
  'a.tile.openstreetmap.org',
  'b.tile.openstreetmap.org',
  'c.tile.openstreetmap.org',
  'unpkg.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // 单个资源失败不应该让整个安装失败
    await Promise.all(SHELL_ASSETS.map((url) => cache.add(url).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((k) => k.startsWith('addrgen-') && k !== SHELL_CACHE && k !== RUNTIME_CACHE)
      .map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

function shouldBypass(url) {
  if (url.origin !== self.location.origin) return true;      // 跨域一律放行，不缓存
  if (NEVER_CACHE_HOSTS.includes(url.hostname)) return true;
  return false;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (shouldBypass(url)) return;                              // 地图瓦片等直接走网络

  // 导航请求：优先网络，保证部署后能立刻拿到新页面；断网时回退缓存，再回退首页
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return (await caches.match(req))
          || (await caches.match('/index.html'))
          || (await caches.match('/'))
          || Response.error();
      }
    })());
    return;
  }

  // 同源静态资源：先给缓存，后台顺带更新。
  // 注意：更新必须写回"命中它的那个 cache"。否则 precache 里的旧 styles.css / app.js
  // 会一直被 caches.match() 优先命中，把新版本永远挡在外面。
  event.respondWith((async () => {
    const shellCache = await caches.open(SHELL_CACHE);
    const shellHit = await shellCache.match(req);
    const cached = shellHit || await caches.match(req);
    const network = fetch(req).then(async (res) => {
      if (res && res.ok) {
        const target = shellHit ? shellCache : await caches.open(RUNTIME_CACHE);
        target.put(req, res.clone());
      }
      return res;
    }).catch(() => cached || Response.error());
    return cached || network;
  })());
});
