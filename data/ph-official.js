/*
 * 菲律宾地点数据（仅用于合成测试地址）
 *
 * 行政区 / Barangay 名称：PSA PSGC；邮编：PHLPost。
 * 街道与门牌仍由浏览器虚构生成，绝不下载或输出真实住址。
 * 此文件由 scripts/sync-ph-psgc.mjs 更新。
 */
globalThis.ADDRGEN_PH_OFFICIAL = Object.freeze({
  source: 'PSA PSGC + PHLPost',
  version: 'seed-2026-09-18',
  updatedAt: '2026-09-18',
  cities: {
    Makati: { postal: '1200', barangays: ['Poblacion', 'San Antonio'] },
    'Quezon City': { postal: '1100', barangays: ['Diliman', 'Cubao'] },
    Taguig: { postal: '1630', barangays: ['Fort Bonifacio', 'Bagumbayan'] },
    'Cebu City': { postal: '6000', barangays: ['Lahug', 'Capitol Site'] },
    'Mandaue City': { postal: '6014', barangays: ['Tipolo', 'Alang-Alang'] },
    'Davao City': { postal: '8000', barangays: ['Matina', 'Bajada'] }
  }
});
