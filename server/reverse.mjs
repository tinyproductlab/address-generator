import http from 'node:http';
import { pathToFileURL } from 'node:url';

// One process per upstream account. Fixed upstream: user input cannot change the destination.
export function createReverseServer({ upstream = process.env.GEOCODER_URL, userAgent = process.env.GEOCODER_USER_AGENT, provider = process.env.GEOCODER_PROVIDER || "nominatim", fetcher = fetch, interval = 1100 } = {}) {
  const cache = new Map();
  let busy = false, nextAllowed = 0;
  return http.createServer(async (req, res) => {
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(JSON.stringify(data));
    };
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== '/api/reverse') return send(404, { error: 'not_found' });
    if (req.method !== 'GET') return send(405, { error: 'method_not_allowed' });
    const rawLat = url.searchParams.get('lat'), rawLon = url.searchParams.get('lon');
    const lat = Number(rawLat), lon = Number(rawLon);
    if (!rawLat?.trim() || !rawLon?.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return send(400, { error: 'invalid_coordinates' });
    const langInput = url.searchParams.get('lang') || 'en';
    const lang = /^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(langInput) ? langInput : 'en';
    const key = `${lat},${lon},${lang}`;
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return send(200, hit.data);
    if (!upstream || !userAgent) return send(503, { error: 'geocoder_not_configured' });
    if (busy || Date.now() < nextAllowed) { res.setHeader('Retry-After', '2'); return send(429, { error: 'busy' }); }
    busy = true;
    nextAllowed = Date.now() + interval;
    try {
      const target = new URL(upstream);
      target.searchParams.set('lat', String(lat));
      target.searchParams.set('lon', String(lon));
      if (provider === 'photon') {
        target.searchParams.set('limit', '1');
        // Public Photon supports English, German, French and local names.
        target.searchParams.set('lang', ['en','de','fr'].includes(lang) ? lang : 'en');
      } else {
        target.searchParams.set('format', 'jsonv2');
        target.searchParams.set('addressdetails', '1');
        target.searchParams.set('accept-language', lang);
      }
      const response = await fetcher(target, { headers: { 'User-Agent': userAgent, Accept: 'application/json' }, signal: AbortSignal.timeout(8000), redirect: 'error' });
      if (!response.ok) return send(502, { error: 'upstream_unavailable' });
      const body = await response.json();
      if (body.error && !/unable to geocode/i.test(String(body.error))) return send(502, { error: 'upstream_error' });
      let displayName = body.display_name;
      if (provider === 'photon') {
        if (!Array.isArray(body.features)) return send(502, { error: 'invalid_upstream_response' });
        const p = body.features[0]?.properties;
        displayName = p ? [...new Set([p.housenumber, p.street, p.name, p.city, p.county, p.state, p.postcode, p.country].filter(v => typeof v === 'string' && v))].join(', ') : null;
      }
      const data = { display_name: typeof displayName === 'string' ? displayName.slice(0, 4000) : null, lat, lon };
      cache.set(key, { expires: Date.now() + 86400000, data });
      if (cache.size > 2000) cache.delete(cache.keys().next().value);
      send(200, data);
    } catch { send(502, { error: 'upstream_unavailable' }); }
    finally { busy = false; }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createReverseServer().listen(Number(process.env.PORT || 8787), process.env.HOST || '127.0.0.1', () => console.log('Address lookup listening on localhost'));
}
