/* 静态页（关于 / 404 / u）的界面语言。
 * 生成器主页由 app.js 负责 i18n，但这些静态页原来一行脚本都没有，
 * 所以在主页切了语言点进来还是中文。这里用与 app.js 完全一致的
 * 语言判定顺序（?lang= → localStorage tlb-lang → navigator → zh-CN），
 * 并写回同一个 localStorage 键，保证两边来回跳转语言不丢。
 *
 * 文案来源：i18n.js 的 UI 键 + page-copy.js 的长文案。 */
(function () {
  'use strict';

  const I18N = window.ADDRGEN_I18N;
  const COPY = window.ADDRGEN_PAGE_COPY;
  const LEGAL = window.ADDRGEN_LEGAL_COPY;
  if (!I18N) return;

  const LOCALES = I18N.locales;
  const DEFAULT_LOCALE = I18N.fallback === 'en' ? 'zh-CN' : I18N.fallback;
  const STORE_KEY = 'tlb-lang';

  function normalizeLocale(value) {
    if (!value) return '';
    const lower = String(value).replace(/_/g, '-').toLowerCase();
    const exact = LOCALES.find((l) => l.code.toLowerCase() === lower);
    if (exact) return exact.code;
    if (lower.startsWith('zh')) return /hant|tw|hk|mo/.test(lower) ? 'zh-TW' : 'zh-CN';
    const base = lower.split('-')[0];
    const byBase = LOCALES.find((l) => l.code.toLowerCase() === base);
    return byBase ? byBase.code : '';
  }
  function detectLocale() {
    try {
      const fromUrl = normalizeLocale(new URLSearchParams(location.search).get('lang'));
      if (fromUrl) return fromUrl;
    } catch { /* ignore */ }
    let stored = '';
    try { stored = localStorage.getItem(STORE_KEY) || ''; } catch { /* ignore */ }
    if (stored === 'zh') stored = 'zh-CN';
    const fromStore = normalizeLocale(stored);
    if (fromStore) return fromStore;
    const navLangs = (navigator.languages || (navigator.language ? [navigator.language] : [])) || [];
    for (let i = 0; i < navLangs.length; i += 1) {
      const hit = normalizeLocale(navLangs[i]);
      if (hit) return hit;
    }
    return DEFAULT_LOCALE;
  }

  let lang = DEFAULT_LOCALE;
  try { lang = detectLocale(); } catch { lang = DEFAULT_LOCALE; }

  function lookup(table, key) {
    const cur = table[lang];
    if (cur && cur[key] != null) return cur[key];
    const fb = table[I18N.fallback];
    return (fb && fb[key] != null) ? fb[key] : null;
  }
  // 短 UI 词沿用 i18n.js（隐私政策 / 使用条款 / 联系我们等已有 16 语言），
  // 长文案走 page-copy.js；同名时页面文案优先。
  function t(key) {
    const legal = LEGAL ? lookup(LEGAL, key) : null;
    if (legal != null) return legal;
    const page = COPY ? lookup(COPY, key) : null;
    if (page != null) return page;
    const ui = lookup(I18N.table, key);
    return ui != null ? ui : key;
  }

  function apply() {
    document.documentElement.lang = lang;
    document.documentElement.dir = (I18N.rtl || []).includes(lang) ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = t(el.dataset.i18n);
      el.textContent = v;
      // 译文为空的提示段落（中文界面下的"中文为准"说明）自动收起
      if (el.classList.contains('legal-notice')) el.hidden = !v;
    });
    // 带内联标签（<b>/<code>/<a>）的段落。文案全部由本仓库维护，无用户输入。
    document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-alt]').forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const v = t(el.dataset.i18nTitle);
      if (el.tagName === 'TITLE') document.title = v; else el.setAttribute('title', v);
    });
    // 「{c}地址与人物资料生成器」这类模板：国家名交给 Intl.DisplayNames 出，
    // 16 种语言都能拿到正确的本地化国名，不必手写 16×N 条翻译。
    document.querySelectorAll('[data-i18n-tpl]').forEach((el) => {
      let out = t(el.dataset.i18nTpl);
      const region = el.dataset.i18nRegion;
      if (region) {
        let name = region;
        try { name = new Intl.DisplayNames([lang], { type: 'region' }).of(region) || region; } catch { /* ignore */ }
        out = out.replace('{c}', name);
      }
      el.textContent = out;
    });
    const sel = document.getElementById('pageLang');
    if (sel) {
      if (!sel.options.length) {
        sel.innerHTML = LOCALES.map((l) => `<option value="${l.code}">${l.label}</option>`).join('');
      }
      sel.value = lang;
    }
    // 「返回生成器」带上 ?lang=，localStorage 被禁时也不丢语言
    document.querySelectorAll('[data-keep-lang]').forEach((a) => {
      try {
        const u = new URL(a.getAttribute('href'), location.href);
        u.searchParams.set('lang', lang);
        a.setAttribute('href', u.pathname + u.search + u.hash);
      } catch { /* ignore */ }
    });
  }

  function setLang(next) {
    const code = normalizeLocale(next);
    if (!code || code === lang) return;
    lang = code;
    try { localStorage.setItem(STORE_KEY, lang); } catch { /* ignore */ }
    apply();
  }

  function boot() {
    apply();
    const sel = document.getElementById('pageLang');
    if (sel) sel.addEventListener('change', (e) => setLang(e.target.value));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
