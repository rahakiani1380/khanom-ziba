// خانوم زیبا - frontend (jQuery + Tailwind). All server calls use $.ajax.
$(function () {
  let lang = localStorage.lang || 'fa';
  let bag = JSON.parse(localStorage.bag || '{}');
  let token = localStorage.token || null;
  let user = null, cat = 'all', query = '', mode = 'in', step = { n: 1 }, qty = 1, sort = 'popular', cats = [], timer = null, curGal = [], curEmoji = '', gi = 0, sliderTimers = [], brandF = '', footCfg = {};
  const imgs = p => p.images || [];
  const pu = p => '#/product/' + p.id + (p.slug ? '-' + p.slug : '');   // product address (slug = readable name in the URL)
  const cur = p => p.sp != null ? p.sp : p.p;      // price to pay (special offer price if any)
  const was = p => p.sp != null ? p.p : p.o;       // crossed-out old price
  let cdTimer = null, clockOff = 0, lastExp = 0;
  const picInner = p => imgs(p).length ? `<img src="${esc(imgs(p)[0])}" alt="${esc(p.alt || p[lang])}" loading="lazy" class="w-full h-full object-cover">` : p.e;
  const kids = id => cats.filter(c => (c.parent || null) === id);   // children of a category (null = top level)
  const catName = id => { const c = cats.find(x => x.id === id); return c ? c[lang] : id; };
  const FREE_FROM = 1000000, SHIP = 60000;

  const t = k => I18N[lang][k] || k;
  const num = x => Number(x).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US');
  const price = x => num(x) + ' ' + t('cur');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stars = r => '<span class="text-amber-500">' + '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r)) + '</span>';
  const inp = 'w-full border rounded-xl px-3 py-2 bg-paper';
  const btn = 'bg-brand text-white rounded-xl px-5 py-2 font-semibold';
  const box = 'bg-white border rounded-2xl p-5';

  // ---- jQuery AJAX helper ----
  function api(method, url, data) {
    return $.ajax({
      method, url, contentType: 'application/json',
      data: data && method !== 'GET' ? JSON.stringify(data) : data,
      headers: token ? { Authorization: 'Bearer ' + token } : {}
    });
  }
  const errKey = xhr => 'e_' + ((xhr.responseJSON && xhr.responseJSON.error) || 'server');
  const saveBag = () => { localStorage.bag = JSON.stringify(bag); header(); };
  function toast(m) { $('#toast').text(m).css('opacity', 1); clearTimeout(toast.t); toast.t = setTimeout(() => $('#toast').css('opacity', 0), 2000); }

  // ---- shared pieces ----
  const card = p => `
  <article class="bg-white text-slate-800 border rounded-2xl overflow-hidden flex flex-col relative">
    ${was(p) ? `<span class="absolute top-2 start-2 bg-red-600 text-white text-xs rounded-lg px-2">${num(Math.round((1 - cur(p) / was(p)) * 100))}${lang === 'fa' ? '٪' : '%'}</span>` : ''}
    <a href="${pu(p)}" class="grid place-items-center text-6xl h-40 overflow-hidden" style="background:${p.bg}">${picInner(p)}</a>
    <div class="p-3 flex flex-col gap-1 flex-1">
      ${p.brand ? `<div class="text-xs text-slate-400">${esc(p.brand)}</div>` : ''}<a href="${pu(p)}" class="font-bold">${p[lang]}</a>
      <div>${stars(p.r)} <span class="text-sm text-slate-500">${num(p.r)}</span></div>
      <div class="mt-auto flex items-center justify-between">
        <div><div class="font-extrabold text-brand">${price(cur(p))}</div>${was(p) ? `<div class="line-through text-sm text-slate-400">${price(was(p))}</div>` : ''}</div>
        <button data-add="${p.id}" class="${btn} !px-3" aria-label="${t('add')}">＋</button>
      </div>
    </div>
  </article>`;
  const grid = l => `<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">${l.map(card).join('')}</div>`;
  const head = (title, link) => `<div class="flex justify-between items-baseline mb-3"><h2 class="text-2xl font-extrabold">${title}</h2>${link ? `<a href="#/products" class="text-brand text-sm">${t('viewall')}</a>` : ''}</div>`;
  const field = (id, label, val, extra = '') => `<div><label for="${id}" class="block font-semibold mt-3 mb-1">${label}</label><input id="${id}" class="${inp}" value="${esc(val)}" ${extra}></div>`;

  // ---- banners: one banner = several slides (image + link + text) that change every N seconds ----
  const slideStyle = x => `background-color:${esc(x.bg)};color:${esc(x.color)};` + (x.image ? `background-image:url('${esc(x.image)}');background-size:cover;background-position:center;` : '');
  const slideBody = (x, big) => (x['t' + lang] ? `<h${big ? 2 : 3} class="${big ? 'text-3xl md:text-5xl' : 'text-lg'} font-extrabold" style="text-shadow:0 1px 6px #0003">${esc(x['t' + lang])}</h${big ? 2 : 3}>` : '') + (x['p' + lang] ? `<p class="${big ? 'max-w-md' : 'text-sm'}">${esc(x['p' + lang])}</p>` : '');
  const bannerBox = (b, cls, big) => `<div class="bslider relative overflow-hidden rounded-3xl ${cls}" data-int="${b.interval || 5}">${b.slides.map((x, i) => {
    const c = `slide absolute inset-0 ${big ? 'p-8' : 'p-6'} flex flex-col justify-center gap-1 transition-opacity duration-700 motion-reduce:transition-none ${i ? 'opacity-0 pointer-events-none' : 'opacity-100'}`;
    return x.link ? `<a href="${esc(x.link)}" data-cat class="${c}" style="${slideStyle(x)}">${slideBody(x, big)}</a>` : `<div class="${c}" style="${slideStyle(x)}">${slideBody(x, big)}</div>`;
  }).join('')}${b.slides.length > 1 ? `<div class="absolute bottom-2 inset-x-0 flex justify-center gap-2 z-10">${b.slides.map((_, i) => `<button data-dot="${i}" class="w-2.5 h-2.5 rounded-full bg-white ${i ? 'opacity-50' : 'opacity-100'}" aria-label="${i + 1}"></button>`).join('')}</div>` : ''}</div>`;

  // ---- special offer box (home page shows a few products, the offer page shows all) ----
  const OFFER_LIMIT = 4;
  const offerBox = (o, all, full) => {
    const list = all.filter(p => o.products.includes(p.id)); if (!list.length) return '';
    const more = !full && list.length > OFFER_LIMIT, arrow = lang === 'fa' ? '‹' : '›';
    return `<section class="mt-10 rounded-3xl p-5" style="background:${esc(o.bg)};color:${esc(o.color)}">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4"><h2 class="text-2xl font-extrabold">🔥 ${esc(o['t' + lang])}</h2>
        <div class="flex items-center gap-2 rounded-xl px-3 py-1" style="background:#0003"><span>${t('endsIn')}</span><b class="cd text-lg" dir="ltr" data-end="${esc(o.end)}"></b></div></div>
      <div class="lg:flex lg:gap-4 lg:items-stretch"><div class="flex-1 min-w-0">${grid(full ? list : list.slice(0, OFFER_LIMIT))}</div>
        ${more ? `<a href="#/offer/${esc(o.id)}" class="hidden lg:flex flex-col items-center justify-center gap-2 w-36 shrink-0 rounded-2xl p-4 text-center font-bold" style="background:${esc(o.color)};color:${esc(o.bg)}"><span class="grid place-items-center w-12 h-12 rounded-full text-3xl border-2 border-current">${arrow}</span>${t('showMore')}<span class="text-sm font-normal">${num(list.length)} ${t('products')}</span></a>` : ''}</div>
      ${more ? `<div class="lg:hidden text-center mt-5"><a href="#/offer/${esc(o.id)}" class="inline-block rounded-xl px-6 py-2 font-semibold" style="background:${esc(o.color)};color:${esc(o.bg)}">${t('showMore')} · ${num(list.length)} ${t('products')}</a></div>` : ''}</section>`;
  };

  // ---- reviews: stars + comment ----
  const reviewForm = (p, mine) => !token ? `<p>${t('loginToReview')} <a href="#/login" class="text-brand font-semibold">${t('login')}</a></p>` :
    `<form id="rf" data-id="${p.id}"><p class="font-semibold mb-1">${mine ? t('editRev') : t('rate')}</p>
      <div id="stars" class="text-3xl text-amber-500" data-val="${mine ? mine.stars : 0}">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-star="${n}" aria-label="${n}">${mine && n <= mine.stars ? '★' : '☆'}</button>`).join('')}</div>
      <textarea id="rtext" rows="3" maxlength="600" class="${inp} mt-2" placeholder="${t('revPh')}">${esc(mine ? mine.text : '')}</textarea>
      <p id="err" class="text-red-600 min-h-6"></p><button class="${btn}">${mine ? t('updRev') : t('sendRev')}</button></form>`;

  // ---- my orders (profile page) ----
  const SC = { pending: 'bg-amber-100', processing: 'bg-sky-100', shipped: 'bg-indigo-100', delivered: 'bg-emerald-100', canceled: 'bg-red-100' };
  const STEPS = ['pending', 'processing', 'shipped', 'delivered'];
  const fdate = d => new Date(d).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const ordersHtml = os => `<section class="max-w-xl mx-auto mt-8"><h2 class="text-xl font-extrabold mb-3">${t('myorders')}</h2>` + (os.length ? os.map(o => `<div class="${box} mb-3">
    <div class="flex flex-wrap justify-between items-center gap-2"><span class="text-sm text-slate-500">${fdate(o.date)} · <span dir="ltr">#${String(o.id).slice(-6)}</span></span><span class="rounded-full px-3 py-0.5 text-sm font-semibold ${SC[o.status]}">${t('st_' + o.status)}</span></div>
    ${o.status === 'canceled' ? '' : `<div class="flex gap-1 my-3 text-xs">${STEPS.map((k, i) => `<span class="flex-1 text-center"><span class="block h-1.5 rounded-full mb-1 ${i <= STEPS.indexOf(o.status) ? 'bg-brand' : 'bg-slate-200'}"></span>${t('st_' + k)}</span>`).join('')}</div>`}
    ${o.items.map(i => `<div class="flex items-center gap-3 py-1"><span class="inline-grid place-items-center w-11 h-11 rounded-lg overflow-hidden text-xl shrink-0" style="background:${esc(i.bg)}">${i.image ? `<img src="${esc(i.image)}" alt="" class="w-full h-full object-cover">` : esc(i.e)}</span>
      <a href="#/product/${i.id}" class="flex-1 hover:text-brand">${esc(i[lang])} <span class="text-slate-500">× ${num(i.qty)}</span></a><span>${price(i.price * i.qty)}</span></div>`).join('')}
    <div class="flex justify-between border-t mt-2 pt-2 font-bold"><span>${t('total')}</span><span class="text-brand">${price(o.total)}</span></div></div>`).join('') : `<p class="${box}">${t('noorders')}</p>`) + `</section>`;

  // ---- pages (each returns a jQuery promise or HTML) ----
  const pages = {
    home() {
      return $.when(api('GET', '/api/products'), api('GET', '/api/banners'), api('GET', '/api/offers')).then((r1, r2, r3) => {
        const all = r1[0], bn = r2[0], offs = r3[0].offers, best = [...all].sort((a, b) => b.sold - a.sold || b.n - a.n).slice(0, 4), news = all.slice(-4);
        const mainB = bn.find(b => b.slot === 'main'), sideB = bn.filter(b => b.slot === 'side').slice(0, 2);
        const hero = (mainB || sideB.length) ? `<section class="grid md:grid-cols-3 gap-4">
          ${mainB ? bannerBox(mainB, `h-72 ${sideB.length ? 'md:col-span-2' : 'md:col-span-3'}`, true) : ''}
          ${sideB.length ? `<div class="flex flex-col gap-4 md:h-72 ${mainB ? '' : 'md:col-span-3'}">${sideB.map(b => bannerBox(b, 'h-32 md:h-auto md:flex-1', false)).join('')}</div>` : ''}</section>` : '';
        clockOff = r3[0].now - Date.now();
        const offerHtml = offs.map(o => offerBox(o, all, false)).join('');
        return `<h1 class="sr-only">${t('siteH1')}</h1>${hero}${offerHtml}
        <section class="mt-10">${head(t('cats'))}<div class="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3">
          ${kids(null).map(c => `<a href="#/products/${c.slug || c.id}" data-cat class="bg-white border rounded-2xl py-4 text-center"><span class="block text-3xl">${esc(c.icon)}</span><b>${esc(c[lang])}</b></a>`).join('')}</div></section>
        <section class="mt-10">${head(t('best'), 1)}${grid(best)}</section>
        <section class="mt-10 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          ${[['🚚', 'f1'], ['✅', 'f2'], ['↩️', 'f3'], ['💬', 'f4']].map(([i, k]) => `<div class="${box} flex gap-3 items-center"><span class="text-3xl">${i}</span><b>${t(k)}</b></div>`).join('')}</section>
        <section class="mt-10">${head(t('news'), 1)}${grid(news)}</section>
        <p class="mt-8 bg-teal-50 rounded-xl p-3 text-sm">${t('tip')}</p>`;
      });
    },
    notfound() {
      return `<div class="${box} text-center"><h1 class="text-2xl font-extrabold mb-2">404</h1><p class="mb-3">${t('e404')}</p><a href="#/" class="${btn} inline-block">${t('home')}</a></div>`;
    },
    offer(id) {
      return $.when(api('GET', '/api/products'), api('GET', '/api/offers')).then((r1, r2) => {
        clockOff = r2[0].now - Date.now(); const o = r2[0].offers.find(x => x.id === id);
        return `<a href="#/" class="text-slate-500">‹ ${t('home')}</a>` + (o ? offerBox(o, r1[0], true) : `<p class="mt-4">${t('offerOver')}</p><a href="#/products" class="${btn} inline-block mt-2">${t('shop')}</a>`);
      });
    },
    products(id) {
      cat = id ? ((cats.find(c => c.slug === id || c.id === id) || {}).id || id) : 'all';
      return $.when(api('GET', '/api/products', { cat, q: query, sort, brand: brandF }), api('GET', '/api/brands')).then((r1, r2) => {
        const l = r1[0], brands = r2[0];
        const cur = cats.find(c => c.id === cat), chain = [];
        for (let c = cur; c; c = cats.find(x => x.id === c.parent)) chain.unshift(c);
        const show = cur ? (kids(cat).length ? kids(cat) : kids(cur.parent || null)) : kids(null);
        const crumb = `<a href="#/products" data-cat class="text-brand">${t('products')}</a>` + chain.map(c => ` › <a href="#/products/${c.slug || c.id}" data-cat class="${c.id === cat ? 'font-bold' : 'text-brand'}">${esc(c[lang])}</a>`).join('');
        const chip = c => `<a href="#/products/${c.slug || c.id}" data-cat class="border rounded-full px-4 py-1 ${c.id === cat ? 'bg-brand text-white border-brand' : 'bg-white'}">${esc(c.icon)} ${esc(c[lang])}</a>`;
        const so = [['popular', 's_popular'], ['bestseller', 's_best'], ['priceAsc', 's_low'], ['priceDesc', 's_high']];
        return `<div class="text-sm mb-2">${crumb}</div>
          <div class="flex flex-wrap justify-between items-center gap-3 mb-3"><h1 class="text-2xl font-extrabold">${cur ? esc(cur[lang]) : t('products')}</h1>
            <div class="flex flex-wrap gap-3">${brands.length ? `<label class="flex items-center gap-2">${t('brand')}<select id="brandsel" class="border rounded-xl px-3 py-1 bg-white"><option value="">${t('allBrands')}</option>${brands.map(b => `<option value="${esc(b.name)}" ${brandF === b.name ? 'selected' : ''}>${esc(b.name)} (${num(b.count)})</option>`).join('')}</select></label>` : ''}<label class="flex items-center gap-2">${t('s_label')}<select id="sort" class="border rounded-xl px-3 py-1 bg-white">${so.map(([v, k]) => `<option value="${v}" ${sort === v ? 'selected' : ''}>${t(k)}</option>`).join('')}</select></label></div></div>
          <div class="flex gap-2 flex-wrap mb-4">${show.map(chip).join('')}</div>
          ${l.length ? grid(l) : `<p>${t('nores')}</p>`}
          ${cur && cur.seoText ? `<section class="${box} mt-8"><h2 class="text-xl font-extrabold mb-2">${esc(cur[lang])}</h2><p class="whitespace-pre-line text-slate-600">${esc(cur.seoText)}</p></section>` : ''}`;
      });
    },
    product(id) {
      return $.when(api('GET', '/api/products/' + id), api('GET', '/api/products', { cat: 'all' }), api('GET', '/api/products/' + id + '/reviews')).then((r1, r2, r3) => {
        curGal = r1[0].images || []; curEmoji = r1[0].e; gi = 0; clockOff = (r1[0].now || Date.now()) - Date.now();
        const revs = r3[0].reviews, mine = r3[0].mine;
        const p = r1[0], more = r2[0].filter(x => x.c === p.c && x.id !== p.id).slice(0, 4);
        return `
        <a href="#/products" class="text-slate-500">${t('back')}</a>
        <div class="grid md:grid-cols-2 gap-8 mt-3">
          <div><div id="zoom" class="relative overflow-hidden rounded-3xl aspect-square grid place-items-center text-[8rem] cursor-zoom-in" style="background:${p.bg}">${curGal.length ? `<img id="zimg" src="${esc(curGal[0])}" alt="${esc(p.alt || p[lang])}" class="w-full h-full object-cover transition-transform duration-200">` : `<span id="zimg" class="transition-transform duration-200">${p.e}</span>`}</div>
            ${curGal.length > 1 ? `<div class="flex gap-2 mt-3 flex-wrap">${curGal.map((g, i) => `<button data-thumb="${i}" class="w-16 h-16 rounded-xl overflow-hidden border-2 ${i ? 'border-transparent' : 'border-brand'}"><img src="${esc(g)}" alt="" class="w-full h-full object-cover"></button>`).join('')}</div>` : ''}</div>
          <div><span class="text-slate-500">${esc(catName(p.c))}</span>${p.brand ? ` · <a href="#/products" data-brand="${esc(p.brand)}" class="text-brand font-semibold">${esc(p.brand)}</a>` : ''}<h1 class="text-3xl font-extrabold">${p[lang]}</h1>
            <div>${stars(p.r)} <b>${num(p.r)}</b> <span class="text-slate-500">(${num(p.n)} ${t('ratings')})</span></div>
            <p class="text-2xl font-extrabold text-brand my-2">${price(cur(p))} ${was(p) ? `<span class="line-through text-base text-slate-400">${price(was(p))}</span>` : ''}</p>${p.spEnd ? `<p class="inline-flex items-center gap-2 rounded-xl bg-red-50 text-red-700 px-3 py-1 mb-2">🔥 ${t('endsIn')} <b class="cd" dir="ltr" data-end="${esc(p.spEnd)}"></b></p>` : ''}
            <p class="text-slate-500">${t('stock')}</p>
            <div class="flex items-center gap-3 mt-4">
              <div class="inline-flex items-center border rounded-xl"><button data-q="-1" class="w-9 h-9">−</button><span id="q" class="w-8 text-center">${num(1)}</span><button data-q="1" class="w-9 h-9">+</button></div>
              <button data-add="${p.id}" data-useq="1" class="${btn}">${t('add')}</button></div>
          </div>
        </div>
        <section class="${box} mt-8"><h2 class="text-xl font-extrabold mb-2">${t('details')}</h2><p>${p[lang === 'fa' ? 'df' : 'de']}</p></section>
        ${(p.specs || []).length ? `<section class="${box} mt-6"><h2 class="text-xl font-extrabold mb-2">${t('specs')}</h2><table class="w-full text-sm"><tbody>${p.specs.map(x => `<tr class="border-t"><th class="text-start font-semibold p-2 w-1/3 bg-slate-50">${esc(x['t' + lang] || x.tfa || x.ten)}</th><td class="p-2">${esc(x['v' + lang] || x.vfa || x.ven)}</td></tr>`).join('')}</tbody></table></section>` : ''}
        <section id="reviews" class="${box} mt-6"><h2 class="text-xl font-extrabold mb-3">${t('reviews')}</h2>
          <div class="grid md:grid-cols-[180px_1fr] gap-6"><div><div class="text-4xl font-extrabold">${num(p.r)}</div>${stars(p.r)}<div class="text-sm text-slate-500">${num(p.n)} ${t('ratings')}</div></div><div>${reviewForm(p, mine)}</div></div>
          <div class="mt-4">${revs.length ? revs.map(r => `<div class="border-t pt-3 mt-3"><div class="flex flex-wrap items-center gap-2"><b>${esc(r.name)}</b>${stars(r.stars)}<span class="text-xs text-slate-400">${fdate(r.date)}</span></div>${r.text ? `<p class="mt-1 whitespace-pre-line">${esc(r.text)}</p>` : ''}</div>`).join('') : `<p class="text-slate-500 mt-3">${t('noRev')}</p>`}</div></section>
        ${more.length ? `<section class="mt-8">${head(t('you'))}${grid(more)}</section>` : ''}`;
      });
    },
    bag() {
      const ids = Object.keys(bag);
      if (!ids.length) return `<h2 class="text-2xl font-extrabold mb-3">${t('bag')}</h2><div class="${box}"><p class="mb-3">${t('empty')}</p><a href="#/products" class="${btn} inline-block">${t('start')}</a></div>`;
      return api('GET', '/api/products', { cat: 'all' }).then(all => {
        const items = ids.map(i => ({ p: all.find(x => x.id == i), q: bag[i] })).filter(x => x.p);
        const sub = items.reduce((s, x) => s + cur(x.p) * x.q, 0), ship = sub >= FREE_FROM ? 0 : SHIP;
        return `${head(t('bag'))}<div class="grid md:grid-cols-[1.6fr_1fr] gap-6 items-start"><div>
          ${items.map(({ p, q }) => `<div class="bg-white border rounded-2xl p-3 mb-3 grid grid-cols-[64px_1fr_auto] gap-3 items-center">
            <a href="${pu(p)}" class="grid place-items-center text-3xl rounded-xl aspect-square overflow-hidden" style="background:${p.bg}">${picInner(p)}</a>
            <div><a href="${pu(p)}" class="font-bold hover:text-brand">${p[lang]}</a><div class="text-sm text-slate-500">${price(cur(p))}</div>
              <div class="inline-flex items-center border rounded-xl mt-1"><button data-add="${p.id}" data-n="-1" class="w-8 h-8">−</button><span class="w-7 text-center">${num(q)}</span><button data-add="${p.id}" data-n="1" class="w-8 h-8">+</button></div></div>
            <div class="text-end"><b>${price(cur(p) * q)}</b><br><button data-del="${p.id}" class="border rounded-full px-3 text-sm mt-1">${t('remove')}</button></div></div>`).join('')}</div>
          <aside class="${box}"><h3 class="font-extrabold text-lg mb-2">${t('sum')}</h3>
            <div class="flex justify-between"><span>${t('sub')}</span><span>${price(sub)}</span></div>
            <div class="flex justify-between"><span>${t('del')}</span><span>${ship ? price(ship) : t('free')}</span></div><hr class="my-3">
            <div class="flex justify-between font-extrabold"><span>${t('total')}</span><span class="text-brand">${price(sub + ship)}</span></div>
            <p id="err" class="text-red-600 min-h-6 mt-2"></p><button id="checkout" class="${btn} w-full">${t('checkout')}</button></aside></div>`;
      });
    },
    login() {
      if (token && user) return pages.profile();
      const tab = (m, l) => `<button data-mode="${m}" class="border rounded-full px-4 py-1 ${mode === m ? 'bg-brand text-white border-brand' : ''}">${l}</button>`;
      const top = `<h2 class="text-2xl font-extrabold mb-3">${t('login')}</h2><div class="flex gap-2 mb-2">${tab('in', t('signin'))}${tab('up', t('signup'))}</div>`;
      const form = step.n === 1
        ? `<form id="f1">${mode === 'up' ? `<div class="grid grid-cols-2 gap-3">${field('fn', t('fn'), '')}${field('ln', t('ln'), '')}</div>` : ''}
           ${field('ph', t('phone'), '', 'type="tel" dir="ltr" placeholder="09123456789"')}<p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn} w-full">${t('send')}</button></form>`
        : `<form id="f2"><p dir="ltr" class="text-slate-500 text-start">${esc(step.phone)}</p>${field('cd', t('code'), '', 'dir="ltr" inputmode="numeric" maxlength="5"')}
           ${step.devCode ? `<p class="bg-teal-50 rounded-xl p-2 mt-3 text-sm">${t('devcode')}: <b dir="ltr">${step.devCode}</b></p>` : ''}
           <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn} w-full">${t('verify')}</button>
           <button type="button" id="back" class="border rounded-full px-4 py-1 mt-3">${t('change')}</button></form>`;
      return `<div class="${box} max-w-md mx-auto">${top}${form}</div>`;
    },
    profile() {
      if (!token) { goLater('/login'); return ''; }
      return api('GET', '/api/orders/mine').then(os => pages.profileForm() + ordersHtml(os), () => pages.profileForm());
    },
    profileForm() {
      if (!token) { goLater('/login'); return ''; }
      return `<div class="${box} max-w-xl mx-auto"><h2 class="text-2xl font-extrabold">${t('hello')} ${esc(user.firstName)} ${esc(user.lastName)} 🌷</h2><p class="text-slate-500">${t('myprofile')}</p>
        <form id="fp"><div class="grid sm:grid-cols-2 gap-x-3">${field('fn', t('fn'), user.firstName)}${field('ln', t('ln'), user.lastName)}
          ${field('ph', t('phone'), user.phone, 'dir="ltr" readonly')}${field('ci', t('city'), user.city)}</div>
          <label for="ad" class="block font-semibold mt-3 mb-1">${t('addr')}</label><textarea id="ad" rows="3" class="${inp}">${esc(user.address)}</textarea>
          ${field('po', t('post'), user.postalCode, 'dir="ltr" inputmode="numeric" maxlength="10"')}
          <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${t('save')}</button>
          <button type="button" id="logout" class="border border-brand text-brand rounded-xl px-5 py-2 font-semibold">${t('logout')}</button></form></div>`;
    },
    about() {
      return `<h1 class="text-3xl font-extrabold mb-4">${t('at')}</h1><div class="grid md:grid-cols-[1.6fr_1fr] gap-6">
        <div class="${box}">${['a1', 'a2', 'a3'].map(k => `<h2 class="text-xl font-extrabold mt-2">${t(k)}</h2><p class="mb-3">${t(k + 'p')}</p>`).join('')}</div>
        <aside class="${box}"><h2 class="text-xl font-extrabold mb-2">${t('a4')}</h2><p>📞 <b>${t('cp')}:</b> <span dir="ltr">${esc((footCfg.phones || [])[0] || '—')}</span></p>
          <p>✉️ <b>${t('ce')}:</b> <span dir="ltr">${esc(footCfg.email || '—')}</span></p><p>📍 <b>${t('ca')}:</b> ${esc((lang === 'fa' ? footCfg.addrFa : footCfg.addrEn) || footCfg.addrFa || '—')}</p></aside></div>`;
    }
  };

  // ---- banner sliders (every banner has its own speed) ----
  function showSlide($b, n) {
    $b.data('i', n);
    $b.find('.slide').each(function (k) { $(this).toggleClass('opacity-100', k === n).toggleClass('opacity-0 pointer-events-none', k !== n); });
    $b.find('[data-dot]').each(function (k) { $(this).toggleClass('opacity-100', k === n).toggleClass('opacity-50', k !== n); });
  }
  function initSlider() {
    sliderTimers.forEach(clearInterval); sliderTimers = [];
    $('.bslider').each(function () {
      const $b = $(this), n = $b.find('.slide').length; if (n < 2) return;
      $b.data('i', 0);
      sliderTimers.push(setInterval(() => showSlide($b, ($b.data('i') + 1) % n), (Number($b.attr('data-int')) || 5) * 1000));
    });
  }

  // ---- footer (dark, with columns, contact info, social links and a text block) ----
  let footKey = '';
  function drawFooter() {
    const f = footCfg, key = lang + '|' + cats.length; if (footKey === key) return; footKey = key;
    const L = (fa, en) => esc((lang === 'fa' ? fa : en) || fa || en || '');
    const social = [['telegram', '✈️', 'Telegram'], ['instagram', '📸', 'Instagram'], ['linkedin', 'in', 'LinkedIn'], ['whatsapp', '💬', 'WhatsApp']].filter(([k]) => f[k])
      .map(([k, ic, nm]) => `<a href="${esc(f[k])}" target="_blank" rel="noopener noreferrer" class="grid place-items-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 font-bold" aria-label="${nm}">${ic}</a>`).join('');
    const li = (h, x) => `<li><a href="${h}" class="hover:text-white">${x}</a></li>`;
    const col = (title, links) => `<div><h3 class="font-bold text-white mb-3">${title}</h3><ul class="space-y-2">${links}</ul></div>`;
    $('#foot').html(`<div class="bg-slate-800 text-slate-300 text-sm"><div class="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      ${col(t('fShop'), li('#/', t('home')) + li('#/products', t('products')) + li('#/about', t('about')))}
      ${col(t('fService'), li('#/profile', t('myprofile')) + li('#/profile', t('myorders')) + li('#/bag', t('bag')) + li('#/login', t('login')))}
      ${col(t('fCats'), kids(null).map(c => li('#/products/' + (c.slug || c.id), esc(c.icon) + ' ' + esc(c[lang]))).join(''))}
      <div class="space-y-3">${f.hoursFa || f.hoursEn ? `<p class="font-semibold text-white">${L(f.hoursFa, f.hoursEn)}</p>` : ''}
        ${(f.phones || []).map(x => `<p>📞 <span dir="ltr" class="inline-block">${esc(x)}</span></p>`).join('')}${f.email ? `<p>✉️ <span dir="ltr" class="inline-block">${esc(f.email)}</span></p>` : ''}
        ${f.addrFa || f.addrEn ? `<p>📍 ${L(f.addrFa, f.addrEn)}</p>` : ''}${social ? `<div class="flex gap-2 pt-1">${social}</div><p class="text-white font-semibold">${t('follow')}</p>` : ''}</div></div>
      <div class="border-t border-white/10 text-center text-xs py-4 text-slate-400">${L(f.copyFa, f.copyEn)}</div></div>
      ${f.seoFa || f.seoEn ? `<div class="bg-white"><div class="max-w-6xl mx-auto px-4 py-6"><h3 class="font-bold mb-2">${L(f.seoTitleFa, f.seoTitleEn)}</h3>
        <p id="seotxt" class="text-slate-500 text-sm leading-7 line-clamp-3 whitespace-pre-line">${L(f.seoFa, f.seoEn)}</p><button id="seomore" class="text-brand font-semibold mt-2">${t('moreTxt')} ›</button></div></div>` : ''}`);
  }

  // ---- announcement bar (top of the site): messages fade in one after another ----
  let ann = null, annTimer = null, annLang = null, annIdx = 0, annPaused = false;
  function annShow(n) {
    annIdx = n;
    $('[data-ann]').each(function (i) { $(this).toggleClass('opacity-100', i === n).toggleClass('opacity-0 translate-y-2', i !== n); });
    $('[data-annd]').each(function (i) { $(this).toggleClass('opacity-40', i !== n); });
  }
  function drawAnn() {
    if (annLang === lang) return; annLang = lang; clearInterval(annTimer);
    const items = ann && ann.active ? ann.items : [];
    if (!items.length) { $('#ann').empty().hide(); return; }
    $('#ann').show().css({ background: ann.bg, color: ann.color }).html(`<div class="max-w-6xl mx-auto px-4 relative h-9 overflow-hidden text-sm">
      ${items.map((it, i) => `<div data-ann="${i}" class="absolute inset-0 px-8 flex items-center justify-center text-center font-semibold transition-all duration-500 motion-reduce:transition-none ${i ? 'opacity-0 translate-y-2' : 'opacity-100'}">${esc(it[lang] || it.fa || it.en)}</div>`).join('')}
      ${items.length > 1 ? `<div class="absolute inset-y-0 end-4 flex items-center gap-1">${items.map((_, i) => `<button data-annd="${i}" class="w-1.5 h-1.5 rounded-full bg-current ${i ? 'opacity-40' : ''}" aria-label="${i + 1}"></button>`).join('')}</div>` : ''}</div>`);
    annIdx = 0;
    if (items.length > 1) annTimer = setInterval(() => { if (!annPaused) annShow((annIdx + 1) % items.length); }, ann.interval * 1000);
  }

  // ---- countdown timers (special offers) ----
  const p2 = n => { const x = Math.floor(n); return x < 10 ? num(0) + num(x) : num(x); };
  const fmtCd = ms => {
    const sec = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(sec / 86400), cell = x => `<span class="inline-block min-w-[2ch] text-center">${x}</span>`;
    const time = `<span class="inline-flex items-center" dir="ltr">${cell(p2(sec % 86400 / 3600))}<span>:</span>${cell(p2(sec % 3600 / 60))}<span>:</span>${cell(p2(sec % 60))}</span>`;
    return `<span class="inline-flex items-center gap-1" dir="${lang === 'fa' ? 'rtl' : 'ltr'}">${d ? `<span>${num(d)} ${lang === 'fa' ? 'روز' : 'd'}</span>${lang === 'fa' ? '<span>و</span>' : ''}` : ''}${time}</span>`;
  };
  function initCountdown() {
    clearInterval(cdTimer); const $c = $('.cd'); if (!$c.length) return;
    const tick = () => {
      let over = false;
      $c.each(function () { const ms = new Date($(this).attr('data-end')).getTime() - (Date.now() + clockOff); if (ms <= 0) over = true; $(this).html(fmtCd(ms)); });
      if (over && Date.now() - lastExp > 5000) { lastExp = Date.now(); clearInterval(cdTimer); setTimeout(render, 600); } // offer finished: reload the page data
    };
    tick(); cdTimer = setInterval(tick, 1000);
  }

  // ---- real addresses (/product/3-name) instead of #/... : good for Google and for sharing ----
  const ROUTES = ['home', 'products', 'product', 'offer', 'bag', 'login', 'profile', 'about'];
  const routeParts = () => { let p = location.pathname; try { p = decodeURIComponent(p); } catch (e) { } return p.replace(/^\/+|\/+$/g, '').split('/'); };
  const go = path => { if (path !== location.pathname + location.search) history.pushState({}, '', path); render(); window.scrollTo(0, 0); };
  const goLater = path => setTimeout(() => go(path), 0);
  const fixLinks = () => $('a[href^="#/"]').each(function () { $(this).attr('href', $(this).attr('href').slice(1)); }); // #/x -> /x so crawlers can follow every link
  function applySeo() { // keep the tab title, description and canonical in sync while the visitor browses
    api('GET', '/api/seo', { path: location.pathname }).done(m => {
      if (!m.title) return; document.title = m.title;
      const set = (sel, attr, val, tag) => { let $e = $(sel); if (!$e.length) $e = $(tag).appendTo('head'); $e.attr(attr, val); };
      set('meta[name="description"]', 'content', m.desc, '<meta name="description">'); set('meta[name="robots"]', 'content', m.robots, '<meta name="robots">');
      set('link[rel="canonical"]', 'href', m.canonical, '<link rel="canonical">'); set('meta[property="og:title"]', 'content', m.title, '<meta property="og:title">');
      set('meta[property="og:description"]', 'content', m.desc, '<meta property="og:description">'); set('meta[property="og:url"]', 'content', m.canonical, '<meta property="og:url">');
      if (m.image) set('meta[property="og:image"]', 'content', m.image, '<meta property="og:image">');
    });
  }

  // ---- layout + router ----
  function header() {
    $('html').attr({ lang, dir: lang === 'fa' ? 'rtl' : 'ltr' });
    drawAnn(); $('#sq').attr('placeholder', t('search')); $('#lang').text(t('lang'));
    $('#cnt').text(num(Object.values(bag).reduce((a, b) => a + b, 0)));
    $('#userLink').text(user ? '👤 ' + user.firstName : t('login')).attr('href', user ? '#/profile' : '#/login');
    const r = routeParts()[0] || 'home', cur = r === 'product' ? 'products' : r;
    const tree = (pid, d) => kids(pid).map(c => `<li><a href="#/products/${c.slug || c.id}" data-cat class="block rounded-lg px-2 py-1 hover:bg-teal-50 hover:text-brand ${d ? 'text-sm text-slate-600' : 'font-bold'}">${d ? '' : esc(c.icon) + ' '}${esc(c[lang])}</a>${kids(c.id).length ? `<ul class="ms-3 border-s ps-2">${tree(c.id, d + 1)}</ul>` : ''}</li>`).join('');
    const lk = (k, h, x = '') => `<a href="${h}" ${x} class="block py-2 border-b-2 ${cur === k ? 'border-brand text-brand font-semibold' : 'border-transparent'}">${t(k)}</a>`;
    $('#menu').html(lk('home', '#/') + `<div class="group static">${lk('products', '#/products', 'data-cat')} <div class="hidden group-hover:block group-focus-within:block absolute inset-x-0 top-full z-30 bg-white border shadow-xl rounded-b-2xl p-5"><ul class="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">${tree(null, 0)}</ul></div></div>` + lk('about', '#/about'));
    drawFooter(); fixLinks();
  }
  function render() {
    const h = routeParts(), page = ROUTES.includes(h[0] || 'home') ? pages[h[0] || 'home'] : pages.notfound;
    header(); sliderTimers.forEach(clearInterval); clearInterval(cdTimer); $('#lb').remove();
    $.when(page(h[0] === 'product' ? parseInt(h[1], 10) : h[1])).done(html => { $('#app').html(html); initSlider(); initCountdown(); fixLinks(); applySeo(); }).fail(xhr => $('#app').html(`<p>${t(errKey(xhr))}</p>`));
  }

  // ---- events (jQuery delegation) ----
  $(document)
    .on('click', '[data-cat]', function () { query = ''; })
    .on('change', '#sort', function () { sort = $(this).val(); render(); })
    .on('click', '[data-q]', function () { qty = Math.max(1, qty + Number($(this).data('q'))); $('#q').text(num(qty)); })
    .on('click', '[data-add]', function () {
      const id = $(this).data('add'), useQ = $(this).data('useq'), n = useQ ? qty : Number($(this).data('n') || 1);
      bag[id] = (bag[id] || 0) + n; if (bag[id] <= 0) delete bag[id]; saveBag();
      if (n > 0) toast(t('added')); else render();
      if (useQ) { qty = 1; $('#q').text(num(1)); }
      if (n < 0 || $(this).data('n')) render();
    })
    .on('click', '[data-del]', function () { delete bag[$(this).data('del')]; saveBag(); render(); })
    .on('click', '[data-mode]', function () { mode = $(this).data('mode'); step = { n: 1 }; render(); })
    .on('click', '[data-rate]', function () {
      const id = $(this).data('id'), s = $(this).data('rate');
      api('POST', `/api/products/${id}/rate`, { stars: s }).done(() => { toast(t('thanks')); render(); }).fail(x => toast(t(errKey(x))));
    })
    .on('submit', '#f1', function (e) {
      e.preventDefault();
      api('POST', '/api/auth/send-code', { mode, phone: $('#ph').val(), firstName: $('#fn').val() || '', lastName: $('#ln').val() || '' })
        .done(r => { step = { n: 2, phone: r.phone, devCode: r.devCode }; render(); })
        .fail(x => $('#err').text(t(errKey(x))));
    })
    .on('submit', '#f2', function (e) {
      e.preventDefault();
      api('POST', '/api/auth/verify', { phone: step.phone, code: $('#cd').val() })
        .done(r => { token = localStorage.token = r.token; user = r.user; step = { n: 1 }; go('/profile'); })
        .fail(x => $('#err').text(t(errKey(x))));
    })
    .on('click', '#back', () => { step = { n: 1 }; render(); })
    .on('submit', '#fp', function (e) {
      e.preventDefault();
      api('PUT', '/api/profile', { firstName: $('#fn').val(), lastName: $('#ln').val(), city: $('#ci').val(), address: $('#ad').val(), postalCode: $('#po').val() })
        .done(u => { user = u; toast(t('saved')); render(); })
        .fail(x => $('#err').text(t(errKey(x))));
    })
    .on('click', '#logout', () => { token = null; user = null; localStorage.removeItem('token'); go('/'); })
    .on('click', '#checkout', function () {
      if (!token) { go('/login'); return; }
      api('POST', '/api/orders', { items: Object.keys(bag).map(id => ({ id, qty: bag[id] })) })
        .done(() => { bag = {}; saveBag(); $('#app').html(`<div class="${box} max-w-lg mx-auto text-center"><h2 class="text-2xl font-extrabold">${t('done')} 🎀</h2><p class="my-2">${t('demo')}</p><a href="#/" class="${btn} inline-block">${t('home')}</a></div>`); })
        .fail(x => { if (errKey(x) === 'e_profile') { toast(t('e_profile')); go('/profile'); } else $('#err').text(t(errKey(x))); });
    })
    .on('click', '#lang', () => { lang = lang === 'fa' ? 'en' : 'fa'; localStorage.lang = lang; render(); })
    .on('submit', '#sf', function (e) { e.preventDefault(); query = $('#sq').val().trim(); cat = 'all'; go('/products'); });
  // ---- product gallery: hover zoom + full-screen lightbox ----
  function lbDraw() {
    $('#lbmain').html(curGal.length ? `<img src="${esc(curGal[gi])}" alt="" class="max-h-[75vh] max-w-full object-contain rounded-xl">` : `<span class="text-[10rem]">${curEmoji}</span>`);
    $('#lbthumbs button').removeClass('ring-4').eq(gi).addClass('ring-4');
    $('#lbcount').text(curGal.length > 1 ? num(gi + 1) + ' / ' + num(curGal.length) : '');
  }
  function lbOpen(i) {
    gi = i; $('#lb').remove();
    const many = curGal.length > 1;
    $('body').append(`<div id="lb" dir="ltr" class="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-4 gap-3" role="dialog" aria-modal="true">
      <button id="lbx" class="absolute top-4 right-5 text-white text-3xl" aria-label="close">✕</button>
      <div class="flex items-center gap-3 w-full justify-center">${many ? '<button id="lbp" class="text-white text-5xl px-2" aria-label="previous">‹</button>' : ''}<div id="lbmain" class="max-w-3xl grid place-items-center"></div>${many ? '<button id="lbn" class="text-white text-5xl px-2" aria-label="next">›</button>' : ''}</div>
      <div id="lbcount" class="text-white text-sm"></div>
      <div id="lbthumbs" class="flex gap-2 flex-wrap justify-center">${many ? curGal.map((g, k) => `<button data-lbk="${k}" class="w-14 h-14 rounded-lg overflow-hidden ring-white"><img src="${esc(g)}" alt="" class="w-full h-full object-cover"></button>`).join('') : ''}</div></div>`);
    lbDraw();
  }
  const lbGo = d => { if (curGal.length > 1) { gi = (gi + d + curGal.length) % curGal.length; lbDraw(); } };
  $(document)
    .on('mousemove', '#zoom', function (e) {
      const o = $(this).offset();
      $('#zimg').css({ 'transform-origin': ((e.pageX - o.left) / $(this).width() * 100) + '% ' + ((e.pageY - o.top) / $(this).height() * 100) + '%', transform: 'scale(2)' });
    })
    .on('mouseleave', '#zoom', () => $('#zimg').css('transform', 'scale(1)'))
    .on('click', '#zoom', () => lbOpen(gi))
    .on('click', '[data-thumb]', function () {
      gi = Number($(this).attr('data-thumb')); $('#zimg').attr('src', curGal[gi]);
      $('[data-thumb]').removeClass('border-brand').addClass('border-transparent').eq(gi).removeClass('border-transparent').addClass('border-brand');
    })
    .on('click', '#lbx', () => $('#lb').remove())
    .on('click', '#lb', e => { if (e.target.id === 'lb') $('#lb').remove(); })
    .on('click', '#lbp', () => lbGo(-1)).on('click', '#lbn', () => lbGo(1))
    .on('click', '[data-lbk]', function () { gi = Number($(this).attr('data-lbk')); lbDraw(); })
    .on('keydown', e => { if (!$('#lb').length) return; if (e.key === 'Escape') $('#lb').remove(); if (e.key === 'ArrowLeft') lbGo(-1); if (e.key === 'ArrowRight') lbGo(1); });
  $(document)
    .on('mouseenter', '#ann', () => { annPaused = true; }).on('mouseleave', '#ann', () => { annPaused = false; })
    .on('click', '[data-annd]', function () { annShow(Number($(this).attr('data-annd'))); })
    .on('click', '[data-dot]', function () { showSlide($(this).closest('.bslider'), Number($(this).attr('data-dot'))); })
    .on('change', '#brandsel', function () { brandF = $(this).val(); render(); })
    .on('click', '[data-brand]', function () { brandF = $(this).attr('data-brand'); query = ''; })
    .on('click', 'a[href^="/"], a[href^="#/"]', function (e) {   // links move inside the site without reloading
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0 || $(this).attr('target')) return;
      let h = $(this).attr('href'); if (h[0] === '#') h = h.slice(1);
      if (/^\/(api|uploads|admin)(\/|$)/.test(h) || h.startsWith('//')) return;
      e.preventDefault(); go(h);
    })
    .on('click', '#seomore', function () { const $p = $('#seotxt').toggleClass('line-clamp-3'); $(this).text(($p.hasClass('line-clamp-3') ? t('moreTxt') : t('lessTxt')) + ' ›'); })
    .on('click', '[data-star]', function () {
      const v = Number($(this).attr('data-star')); $('#stars').attr('data-val', v);
      $('[data-star]').each(function () { $(this).text(Number($(this).attr('data-star')) <= v ? '★' : '☆'); });
    })
    .on('submit', '#rf', function (e) {
      e.preventDefault(); const st = Number($('#stars').attr('data-val'));
      if (!st) return $('#err').text(t('e_stars'));
      api('POST', '/api/products/' + $(this).attr('data-id') + '/reviews', { stars: st, text: $('#rtext').val() })
        .done(() => { toast(t('thanks')); render(); }).fail(x => $('#err').text(t(errKey(x))));
    });
  $(window).on('popstate', () => { render(); window.scrollTo(0, 0); });

  // ---- start: restore the session, then draw the page ----
  if (location.hash.startsWith('#/')) history.replaceState({}, '', location.hash.slice(1)); // old shared links  /#/product/3  ->  /product/3
  (token ? api('GET', '/api/profile').done(u => { user = u; }).fail(() => { token = null; localStorage.removeItem('token'); }) : $.Deferred().resolve())
    .always(() => api('GET', '/api/categories').done(c => { cats = c; }).always(() => api('GET', '/api/announce').done(a => { ann = a; }).always(() => api('GET', '/api/footer').done(f => { footCfg = f; }).always(render))));
});
