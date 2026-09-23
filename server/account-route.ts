import type { FastifyInstance } from 'fastify';

export function registerAddressLookup(app: FastifyInstance) {
  app.get('/api/address/reverse', { logLevel: 'silent', config: { cors: { origin: 'https://addressgen.tinylabpro.com', credentials: false, methods: ['GET'] } } }, async (request, reply) => {
    const query = request.query as Record<string, unknown>;
    const target = new URL('http://address-geocoder:8787/api/reverse');
    for (const key of ['lat', 'lon', 'lang']) {
      if (typeof query[key] === 'string') target.searchParams.set(key, query[key].slice(0, 100));
    }
    reply.header('Cache-Control', 'no-store');
    try {
      const response = await fetch(target, { signal: AbortSignal.timeout(9500) });
      const retry = response.headers.get('retry-after');
      if (retry) reply.header('Retry-After', retry);
      return reply.code(response.status).send(await response.json());
    } catch { return reply.code(502).send({ error: 'lookup_unavailable' }); }
  });
}
