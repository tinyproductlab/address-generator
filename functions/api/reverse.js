// Only this path runs at the edge; static assets remain static.
export async function onRequest({ request }) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (request.method !== 'GET') return new Response('{"error":"method_not_allowed"}', { status: 405, headers });
  const input = new URL(request.url);
  const target = new URL('https://account.tinylabpro.com/api/address/reverse');
  for (const name of ['lat', 'lon', 'lang']) {
    const value = input.searchParams.get(name);
    if (value !== null) target.searchParams.set(name, value.slice(0,100));
  }
  try {
    const response = await fetch(target, { headers: { Accept: 'application/json', 'User-Agent': 'TinyLabAddressGenerator/1.0' }, signal: AbortSignal.timeout(10000), redirect: 'error' });
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('non_json');
    const retry = response.headers.get('retry-after');
    if (retry) headers['Retry-After'] = retry;
    return new Response(response.body, { status: response.status, headers });
  } catch { return new Response('{"error":"upstream_unavailable"}', { status: 502, headers }); }
}
