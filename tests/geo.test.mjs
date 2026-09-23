import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createReverseServer } from '../server/reverse.mjs';
await import('../i18n.js');
await import('../app.js');
const G = globalThis.ADDRGEN;

test('坐标：粘贴格式、零值、边界与非法值', () => {
  for (const input of ['(45.53676, -94.653826)', '45.53676 -94.653826', '（45.53676，-94.653826）']) assert.deepEqual(G.parseCoordinates(input), [45.53676,-94.653826]);
  assert.deepEqual(G.parseCoordinates('0,0'), [0,0]);
  assert.deepEqual(G.parseCoordinates('-90,180'), [-90,180]);
  for (const input of ['', '91,0', '0,-181', 'NaN,5', '45,', '1,2,3', 'a1,2']) assert.equal(G.parseCoordinates(input), null);
});
test('免税州：批量限制、城市邮编与坐标、Seed 可复现', () => {
  G.state.country = 'US'; G.state.taxFreeOnly = true; G.state.filter = {};
  const seen = new Set();
  for (let i=0;i<300;i++) {
    const id = G.generateIdentity(`tax-${i}`);
    assert.ok(G.TAX_FREE_CODES.has(id.address.regionCode));
    assert.ok(G.CITY_COORDS.US[id.address.city]);
    assert.match(id.address.postal, /^(19[789]|59[168]|97[234])\d{2}$/);
    seen.add(id.address.regionCode);
  }
  assert.equal(seen.size, 3);
  G.state.filter = {admin:'Oregon',city:'Portland'};
  const id = G.generateIdentity('portland');
  assert.equal(id.address.city, 'Portland'); assert.equal(id.address.postal,'97201');
  assert.deepEqual(id,G.generateIdentity('portland'));
  G.state.country='JP'; G.state.filter={};
  assert.ok(G.generateIdentity('japan').address.city);
});
test('后端校验、上游缓存、整站限流与失败处理', async () => {
  let calls = 0;
  const server = createReverseServer({ upstream:'https://provider.invalid/reverse',userAgent:'test',interval:1000,fetcher:async () => { calls++; return {ok:true,json:async()=>({display_name:'Example nearby address'})}; } });
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/reverse`;
  try {
    assert.equal((await fetch(`${base}?lat=&lon=0`)).status,400);
    assert.equal((await fetch(`${base}?lat=91&lon=0`)).status,400);
    const response=await fetch(`${base}?lat=0&lon=0`);
    assert.equal(response.status,200); assert.equal((await response.json()).display_name,'Example nearby address');
    assert.equal((await fetch(`${base}?lat=0&lon=0`)).status,200); assert.equal(calls,1);
    assert.equal((await fetch(`${base}?lat=1&lon=1`)).status,429);
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
test('后端未配置、无结果和上游错误', async () => {
  for (const [config,status,empty] of [
    [{},503,false],
    [{upstream:'https://provider.invalid',userAgent:'test',fetcher:async()=>({ok:true,json:async()=>({error:'Unable to geocode'})})},200,true],
    [{upstream:'https://provider.invalid',userAgent:'test',fetcher:async()=>{throw new Error('offline');}},502,false]
  ]) {
    const server=createReverseServer(config);server.listen(0,'127.0.0.1');await once(server,'listening');
    try {const r=await fetch(`http://127.0.0.1:${server.address().port}/api/reverse?lat=0&lon=0`);assert.equal(r.status,status);if(empty)assert.equal((await r.json()).display_name,null);}
    finally {await new Promise(resolve=>server.close(resolve));}
  }
});
test('Photon 响应转换及无结果处理', async () => {
  let upstreamUrl;
  const server = createReverseServer({upstream:'https://provider.invalid/reverse',provider:'photon',userAgent:'test',interval:0,fetcher:async url=>{upstreamUrl=url;return {ok:true,json:async()=>({features:[{properties:{name:'County Road 177',city:'Saint Martin Township',state:'Minnesota',postcode:'56307',country:'United States'}}]})};}});
  server.listen(0,'127.0.0.1');await once(server,'listening');
  try {
    const r=await fetch(`http://127.0.0.1:${server.address().port}/api/reverse?lat=45.53676&lon=-94.653826&lang=zh-CN`);
    assert.equal(r.status,200);assert.match((await r.json()).display_name,/Minnesota, 56307/);assert.equal(upstreamUrl.searchParams.get('lang'),'en');
  } finally {await new Promise(resolve=>server.close(resolve));}
});
