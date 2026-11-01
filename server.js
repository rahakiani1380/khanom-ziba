// خانوم زیبا - backend (Node.js + Express). Run: npm install && npm start
const express = require('./mini-express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
let DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'db.json');
const seed = require('./data/products.json');
const FREE_SHIPPING_FROM = 1000000, SHIPPING = 60000;

// ---- every response: security headers + rate limit per visitor (DDoS / abuse protection) ----
const CSP = ["default-src 'self'", "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://code.jquery.com https://*.googletagmanager.com https://*.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "font-src 'self' https://fonts.gstatic.com data:", "img-src 'self' data: blob: https:", "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-src https://www.googletagmanager.com", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"].join('; ');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()'); res.setHeader('Cross-Origin-Opener-Policy', 'same-origin'); res.removeHeader('X-Powered-By');
  if (process.env.CSP !== 'off') res.setHeader('Content-Security-Policy', CSP);
  if (String(req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  const api = req.pathname.startsWith('/api/');
  const w = hit('g:' + req.ip, 600, 60000) || (api ? hit('a:' + req.ip, 240, 60000) : 0);
  if (w) { res.setHeader('Retry-After', w); return api ? res.status(429).json({ error: 'rate', retry: w }) : (res.statusCode = 429, res.end('Too many requests')); }
  if (api) res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => { if (req.pathname.startsWith('/api/') || req.pathname === '/admin') res.setHeader('X-Robots-Tag', 'noindex, nofollow'); next(); }); // API and admin never go to Google

// ---- tiny JSON "database" (replace with MongoDB/PostgreSQL for production) ----
const load = () => { try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { return { users: {}, sessions: {}, ratings: {}, orders: [] }; } };
const writeDb = (text) => { fs.mkdirSync(path.dirname(DB_FILE), { recursive: true }); fs.writeFileSync(DB_FILE, text); };
const save = (d) => {
  d.products = products; d.categories = categories; d.banners = banners; d.offers = offers; d.announce = announce; d.footer = footerCfg; d.seo = seo; d.posts = posts;
  const text = JSON.stringify(d, null, 2);
  try { writeDb(text); }
  catch (e) { // this folder blocks writing (antivirus / OneDrive / Controlled folder access): move the database to the user folder
    const old = DB_FILE; DB_FILE = path.join(require('os').homedir(), 'khanom-ziba-data', 'db.json');
    console.warn(`WARNING: cannot write ${old} (${e.code}). Database moved to ${DB_FILE}`);
    writeDb(text);
  }
};
// Make sure the database file can be written. If this folder is blocked (read-only, antivirus, OneDrive...),
// the data is saved in your user folder instead, and a warning is printed.
(function ensureWritable() {
  try { fs.mkdirSync(path.dirname(DB_FILE), { recursive: true }); const probe = path.join(path.dirname(DB_FILE), '.write-test'); fs.writeFileSync(probe, 'ok'); fs.unlinkSync(probe); }
  catch (e) {
    const alt = path.join(require('os').homedir(), 'khanom-ziba-data', 'db.json');
    console.warn(`WARNING: cannot write to ${DB_FILE} (${e.code}). Using ${alt} instead.`);
    DB_FILE = alt; fs.mkdirSync(path.dirname(alt), { recursive: true });
  }
  console.log('Database file:', DB_FILE);
})();
// ======================= SECURITY CORE =======================
// secret key: from APP_SECRET (recommended on a real server) or an auto-created file next to the database
const SECRET_HEX = (() => {
  if (process.env.APP_SECRET) return crypto.createHash('sha256').update(process.env.APP_SECRET).digest('hex');
  const f = path.join(path.dirname(DB_FILE), 'secret.key');
  try { const k = fs.readFileSync(f, 'utf8').trim(); if (/^[0-9a-f]{64}$/.test(k)) return k; } catch { }
  const k = crypto.randomBytes(32).toString('hex');
  try { fs.writeFileSync(f, k, { mode: 0o600 }); } catch { console.warn('WARNING: cannot save secret.key. Set the APP_SECRET environment variable.'); }
  return k;
})();
const KEY = Buffer.from(SECRET_HEX, 'hex');
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const hmac = (s) => crypto.createHmac('sha256', KEY).update(String(s)).digest('hex').slice(0, 40);
const uidOf = (phone) => hmac('uid:' + phone);                 // customers are stored under an HMAC of the phone number, never under the number itself
const encKey = crypto.createHash('sha256').update(Buffer.concat([KEY, Buffer.from('enc')])).digest();
function enc(obj) { const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', encKey, iv), ct = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]); return [iv, c.getAuthTag(), ct].map(b => b.toString('base64')).join('.'); }
function dec(str) { try { const [iv, tag, ct] = String(str).split('.').map(x => Buffer.from(x, 'base64')); const d = crypto.createDecipheriv('aes-256-gcm', encKey, iv); d.setAuthTag(tag); return JSON.parse(Buffer.concat([d.update(ct), d.final()]).toString('utf8')); } catch { return null; } }
const getU = (db, uid) => { const r = db.users[uid]; const d = r && dec(r.enc); return d ? { uid, ...d } : null; };
const setU = (db, uid, d) => { const { uid: _u, ...rest } = d; db.users[uid] = { enc: enc(rest) }; };
const publicUser = (u) => { const { uid, ...r } = u; return r; };
const maskPhone = (p) => String(p || '').replace(/^(\d{4})\d+(\d{3})$/, '$1***$2');
const safeEq = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const SESSION_MS = 30 * 864e5;
const sessionUid = (req, db) => { const s = db.sessions[sha((req.headers.authorization || '').replace('Bearer ', ''))]; return s && s.exp > Date.now() && db.users[s.uid] ? s.uid : null; };

// rate limiting: returns 0 if allowed, otherwise the number of seconds to wait
const buckets = new Map();
function hit(key, limit, windowMs) { const n = Date.now(); let b = buckets.get(key); if (!b || b.reset < n) { b = { c: 0, reset: n + windowMs }; buckets.set(key, b); } b.c++; return b.c > limit ? Math.ceil((b.reset - n) / 1000) : 0; }
const lockMsg = (res, sec) => { res.setHeader('Retry-After', sec); return res.status(429).json({ error: 'rate', retry: sec }); };
const OTP = { cooldown: process.env.OTP_COOLDOWN !== undefined ? Number(process.env.OTP_COOLDOWN) : 60, window: 600, maxSends: 3, lockSec: 600, maxFails: 5 }; // 1 min between codes, max 3 codes / 10 min, 5 wrong codes -> locked 10 min
const otp = {}, pending = {};
setInterval(() => { const n = Date.now(); for (const [k, b] of buckets) if (b.reset < n) buckets.delete(k); for (const k of Object.keys(otp)) { const o = otp[k]; if (o.lockUntil < n && (!o.sent.length || o.sent[o.sent.length - 1] < n - 36e5)) delete otp[k]; } for (const k of Object.keys(pending)) if (pending[k].exp < n) delete pending[k]; }, 60000).unref();

const SEED_CATS = [
  { id: 'dev', parent: null, fa: 'دستگاه‌ها', en: 'Devices', icon: '🩺' },
  { id: 'dev-thermo', parent: 'dev', fa: 'تب‌سنج', en: 'Thermometers', icon: '🌡️' },
  { id: 'dev-bp', parent: 'dev', fa: 'فشارسنج', en: 'Blood pressure', icon: '🩺' },
  { id: 'dev-oxi', parent: 'dev', fa: 'پالس اکسی‌متر', en: 'Pulse oximeters', icon: '🫀' },
  { id: 'vit', parent: null, fa: 'ویتامین‌ها', en: 'Vitamins', icon: '💊' },
  { id: 'vit-d', parent: 'vit', fa: 'ویتامین D', en: 'Vitamin D', icon: '☀️' },
  { id: 'vit-omega', parent: 'vit', fa: 'امگا ۳', en: 'Omega-3', icon: '🐟' },
  { id: 'aid', parent: null, fa: 'کمک‌های اولیه', en: 'First aid', icon: '🧰' },
  { id: 'ortho', parent: null, fa: 'ارتوپدی', en: 'Orthopedic', icon: '🦵' },
  { id: 'hyg', parent: null, fa: 'بهداشتی', en: 'Hygiene', icon: '🧼' }];
const SEED_BANNERS = [
  { id: 'b1', slot: 'main', active: true, interval: 5, slides: [{ bg: '#6d49e8', color: '#ffffff', image: '', link: '#/products', tfa: 'سلامتی شما، درِ منزل', ten: 'Your health, delivered home', pfa: 'دستگاه‌های پزشکی، ویتامین و لوازم کمک‌های اولیه مطمئن برای تمام اعضای خانواده.', pen: 'Trusted medical devices, vitamins and first-aid supplies for the whole family.' }] },
  { id: 'b2', slot: 'side', active: true, interval: 5, slides: [{ bg: '#fdecc8', color: '#1f2a2e', image: '', link: '#/products/dev', tfa: 'دستگاه‌های سلامت خانگی', ten: 'Home health devices', pfa: 'تا ۲۰٪ تخفیف', pen: 'Up to 20% off' }] },
  { id: 'b3', slot: 'side', active: true, interval: 5, slides: [{ bg: '#dbeafe', color: '#1f2a2e', image: '', link: '#/products/vit', tfa: 'ویتامین و مکمل', ten: 'Vitamins & supplements', pfa: 'تازه‌های فروشگاه', pen: 'New arrivals' }] }];
function migrateBanners(list) { // old data: one image per banner  ->  new data: one banner holds many slides
  const out = []; let mainBox = null;
  for (const b of list) {
    if (Array.isArray(b.slides)) { out.push(b); continue; }
    const slide = { image: b.image || '', link: b.link || '', tfa: b.tfa || '', ten: b.ten || '', pfa: b.pfa || '', pen: b.pen || '', bg: b.bg || '#6d49e8', color: b.color || '#ffffff' };
    if (b.slot === 'main' && b.active) { if (!mainBox) { mainBox = { id: b.id, slot: 'main', active: true, interval: 5, slides: [] }; out.push(mainBox); } mainBox.slides.push(slide); }
    else out.push({ id: b.id, slot: b.slot === 'side' ? 'side' : 'main', active: !!b.active, interval: 5, slides: [slide] });
  }
  return out;
}
let products = load().products || seed; // products, categories and banners live in db.json so the admin can edit them
let categories = load().categories || SEED_CATS;
let banners = migrateBanners(load().banners || SEED_BANNERS);
const SEED_SEO = {
  baseUrl: '', siteName: 'خانوم زیبا', titleTpl: '%s | خانوم زیبا',
  defDesc: 'فروشگاه اینترنتی لوازم پزشکی و بهداشتی خانوم زیبا؛ خرید دستگاه‌های سلامت خانگی، ویتامین و مکمل، کمک‌های اولیه و ارتوپدی با ضمانت اصالت کالا و ارسال سریع.',
  defKeywords: '', ogImage: '', robotsBlock: false, gsc: '', bing: '', ga: '', gtm: '',
  pages: { home: { title: 'فروشگاه اینترنتی لوازم پزشکی و بهداشتی', desc: '', keywords: '' }, products: { title: 'خرید لوازم پزشکی و بهداشتی', desc: '', keywords: '' }, about: { title: 'درباره ما', desc: '', keywords: '' }, blog: { title: 'مطالب و مقالات سلامت', desc: '', keywords: '' } }, redirects: [] };
const mergeSeo = (x) => { x = x || {}; return { ...SEED_SEO, ...x, pages: { ...SEED_SEO.pages, ...(x.pages || {}) }, redirects: x.redirects || [] }; };
let seo = mergeSeo(load().seo);
let footerCfg = load().footer || {
  hoursFa: 'روزهای شنبه تا پنجشنبه، از ساعت ۹ الی ۲۱ پاسخگوی سوالات شما هستیم.', hoursEn: 'Saturday to Thursday, 9 am – 9 pm, we answer your questions.',
  phones: ['021-0000 0000'], email: 'info@khanomziba.ir', addrFa: 'آدرس فروشگاه شما اینجا', addrEn: 'Your shop address here',
  telegram: '', instagram: '', linkedin: '', whatsapp: '',
  copyFa: '© ۲۰۲۶ خانوم زیبا. تمامی حقوق محفوظ است.', copyEn: '© 2026 خانوم زیبا. All rights reserved.',
  seoTitleFa: 'خرید لوازم پزشکی و بهداشتی از فروشگاه اینترنتی خانوم زیبا', seoTitleEn: 'Buy medical and health supplies from خانوم زیبا online shop',
  seoFa: 'خانوم زیبا فروشگاه اینترنتی لوازم پزشکی و بهداشتی است. در اینجا دستگاه‌های سلامت خانگی مانند تب‌سنج، فشارسنج و پالس اکسی‌متر، ویتامین‌ها و مکمل‌ها، لوازم کمک‌های اولیه و ارتوپدی را با ضمانت اصالت کالا و ارسال سریع به درِ منزل تهیه کنید.\nاین فروشگاه فقط محصولات بدون نسخه عرضه می‌کند. برای علائم بیماری و مصرف دارو حتماً با پزشک یا داروساز مشورت کنید.',
  seoEn: 'خانوم زیبا is an online shop for medical and health supplies. Buy home health devices such as thermometers, blood pressure monitors and pulse oximeters, vitamins and supplements, first-aid and orthopedic supplies with guaranteed originality and fast home delivery.\nWe sell non-prescription products only. For symptoms or medicines, always ask your doctor or pharmacist.' };
let posts = load().posts || [];
let announce = load().announce || { active: true, bg: '#6d49e8', color: '#ffffff', interval: 5, items: [{ fa: 'ارسال رایگان برای خرید بالای ۱٬۰۰۰٬۰۰۰ تومان', en: 'Free delivery on orders over 1,000,000 Toman' }, { fa: 'فقط محصولات اصل', en: 'Original products only' }] };
let offers = load().offers || [{ id: 'o1', tfa: 'تخفیف ویژه هفته', ten: 'Weekly special offer', percent: 20, end: new Date(Date.now() + 7 * 864e5).toISOString(), bg: '#c0392b', color: '#ffffff', products: [1, 2, 4], active: true }];
// ---- special offers: the lowest active offer price wins ----
const activeOffers = () => offers.filter(o => o.active && new Date(o.end).getTime() > Date.now());
function applyOffer(p) {
  let best = null;
  for (const o of activeOffers()) {
    if (!o.products.includes(p.id)) continue;
    const sp = Math.round(p.p * (1 - o.percent / 100));
    if (!best || sp < best.sp) best = { sp, spEnd: o.end, spPct: o.percent };
  }
  return best || {};
}
const eff = (p) => { const o = applyOffer(p); return o.sp != null ? o.sp : p.p; }; // price the customer really pays



const toEnDigits = (s) => String(s || '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const normPhone = (s) => { const m = toEnDigits(s).replace(/[\s-]/g, '').match(/^(?:\+98|0098|98|0)?(9\d{9})$/); return m ? '0' + m[1] : null; };
const err = (res, code, status = 400) => res.status(status).json({ error: code });

function auth(req, res, next) {
  const db = load(), uid = sessionUid(req, db), user = uid && getU(db, uid);
  if (!user) return err(res, 'login', 401);
  req.uid = uid; req.user = user; req.db = db; next();
}

// products with live rating (base rating + customer ratings)
function withRating(p, db) {
  const list = Object.values(db.ratings[p.id] || {});
  const sum = list.reduce((a, b) => a + b, 0);
  const n = p.n + list.length;
  return { ...p, n, r: n ? Math.round(((p.r * p.n + sum) / n) * 10) / 10 : 0, mine: null, slug: slugOf(p), alt: (p.seo && p.seo.alt) || '' };
}

// ---- products ----
const soldMap = (db) => { const m = {}; db.orders.forEach(o => { if (o.status !== 'canceled') o.items.forEach(i => { m[i.id] = (m[i.id] || 0) + i.qty; }); }); return m; };
app.get('/api/products', (req, res) => {
  const db = load(), q = String(req.query.q || '').toLowerCase(), cat = req.query.cat, brand = req.query.brand, sold = soldMap(db);
  const ids = cat && cat !== 'all' ? descIds(cat) : null; // a category includes all of its sub-categories
  const sorts = { popular: (a, b) => b.n - a.n || b.r - a.r, bestseller: (a, b) => b.sold - a.sold || b.n - a.n, priceAsc: (a, b) => (a.sp ?? a.p) - (b.sp ?? b.p), priceDesc: (a, b) => (b.sp ?? b.p) - (a.sp ?? a.p) };
  const list = products.filter(p => (!ids || ids.includes(p.c)) && (!brand || p.brand === brand) && (!q || (p.en + p.fa + (p.brand || '')).toLowerCase().includes(q))).map(p => ({ ...withRating(p, db), sold: sold[p.id] || 0, ...applyOffer(p) }));
  if (sorts[req.query.sort]) list.sort(sorts[req.query.sort]);
  res.json(list);
});
app.get('/api/products/:id', (req, res) => {
  const p = products.find(x => x.id == req.params.id);
  if (!p) return err(res, 'notfound', 404);
  res.json({ ...withRating(p, load()), ...applyOffer(p), now: Date.now() });
});
app.post('/api/products/:id/rate', auth, (req, res) => {
  const id = Number(req.params.id), stars = Number(req.body.stars);
  if (!products.find(p => p.id === id) || !(stars >= 1 && stars <= 5)) return err(res, 'invalid');
  (req.db.ratings[id] = req.db.ratings[id] || {})[req.uid] = stars;
  save(req.db);
  res.json(withRating(products.find(p => p.id === id), req.db));
});

// ---- auth by phone number (codes are rate-limited per phone number and per visitor) ----
app.post('/api/auth/send-code', (req, res) => {
  const { mode, firstName = '', lastName = '' } = req.body, phone = normPhone(req.body.phone), db = load();
  if (mode === 'up' && (!String(firstName).trim() || !String(lastName).trim())) return err(res, 'name');
  if (!phone) return err(res, 'phone');
  let w = hit('sc:' + req.ip, 10, 15 * 60000); if (w) return lockMsg(res, w);
  const uid = uidOf(phone), st = otp[uid] = otp[uid] || { sent: [], fails: 0, lockUntil: 0 }, now = Date.now();
  if (st.lockUntil > now) return lockMsg(res, Math.ceil((st.lockUntil - now) / 1000));
  st.sent = st.sent.filter(t => t > now - OTP.window * 1000);
  const last = st.sent[st.sent.length - 1];
  if (last && now - last < OTP.cooldown * 1000) return lockMsg(res, Math.ceil((OTP.cooldown * 1000 - (now - last)) / 1000));
  if (st.sent.length >= OTP.maxSends) { st.lockUntil = now + OTP.lockSec * 1000; return lockMsg(res, OTP.lockSec); }
  if (mode === 'in' && !db.users[uid]) return err(res, 'noaccount');
  if (mode === 'up' && db.users[uid]) return err(res, 'exists');
  st.sent.push(now);
  const code = String(crypto.randomInt(10000, 99999));
  pending[uid] = { codeHash: hmac('otp:' + uid + code), mode, firstName: String(firstName).trim().slice(0, 40), lastName: String(lastName).trim().slice(0, 40), phone, exp: now + 2 * 60 * 1000 };
  console.log(`[SMS] code for ${maskPhone(phone)}: ${code}`); // TODO: send with your SMS provider (Kavenegar, Melipayamak, ...)
  res.json({ ok: true, phone, devCode: process.env.NODE_ENV === 'production' && !process.env.SHOW_CODE ? undefined : code });
});
app.post('/api/auth/verify', (req, res) => {
  const phone = normPhone(req.body.phone); if (!phone) return err(res, 'code');
  const w = hit('vf:' + req.ip, 30, 15 * 60000); if (w) return lockMsg(res, w);
  const uid = uidOf(phone), st = otp[uid], p = pending[uid], now = Date.now();
  if (st && st.lockUntil > now) return lockMsg(res, Math.ceil((st.lockUntil - now) / 1000));
  const good = p && p.exp > now && safeEq(p.codeHash, hmac('otp:' + uid + toEnDigits(req.body.code).trim()));
  if (!good) {
    if (st && ++st.fails >= OTP.maxFails) { st.lockUntil = now + OTP.lockSec * 1000; st.fails = 0; delete pending[uid]; return lockMsg(res, OTP.lockSec); }
    return err(res, 'code');
  }
  const db = load();
  if (p.mode === 'up') { if (db.users[uid]) return err(res, 'exists'); setU(db, uid, { firstName: p.firstName, lastName: p.lastName, phone, city: '', address: '', postalCode: '' }); }
  if (!db.users[uid]) return err(res, 'noaccount');
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[sha(token)] = { uid, exp: now + SESSION_MS }; save(db); delete pending[uid]; if (st) st.fails = 0;
  res.json({ token, user: publicUser(getU(db, uid)) });
});

// ---- profile ----
app.get('/api/profile', auth, (req, res) => res.json(publicUser(req.user)));
app.put('/api/profile', auth, (req, res) => {
  const b = req.body, post = toEnDigits(b.postalCode || '').trim(), s = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
  if (!s(b.firstName, 40) || !s(b.lastName, 40)) return err(res, 'name');
  if (post && !/^\d{10}$/.test(post)) return err(res, 'post');
  const u = req.user; Object.assign(u, { firstName: s(b.firstName, 40), lastName: s(b.lastName, 40), city: s(b.city, 60), address: s(b.address, 400), postalCode: post });
  setU(req.db, req.uid, u); save(req.db); res.json(publicUser(u));
});

// ---- orders (total is always calculated on the server) ----
app.post('/api/orders', auth, (req, res) => {
  const rw = hit('ord:' + req.uid, 10, 60000); if (rw) return lockMsg(res, rw);
  const u = req.user;
  if (!u.city || !u.address || !u.postalCode) return err(res, 'profile');
  const items = (req.body.items || []).map(i => ({ p: products.find(x => x.id == i.id), qty: Math.max(1, Math.min(99, Number(i.qty) || 0)) })).filter(i => i.p);
  if (!items.length) return err(res, 'invalid');
  const subtotal = items.reduce((s, i) => s + eff(i.p) * i.qty, 0), shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING;
  const order = { id: Date.now(), uid: req.uid, status: 'pending', cust: enc({ firstName: u.firstName, lastName: u.lastName, phone: u.phone, city: u.city, address: u.address, postalCode: u.postalCode }), items: items.map(i => ({ id: i.p.id, qty: i.qty, price: eff(i.p) })), subtotal, shipping, total: subtotal + shipping, date: new Date().toISOString() };
  req.db.orders.push(order); save(req.db);
  res.json(order);
});

// ======================= ADMIN PANEL API =======================
// Change the login with:  ADMIN_USER=myname ADMIN_PASS=strong-password npm start
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
if (ADMIN_PASS === 'admin123') { console.warn('WARNING: using the default admin password. Set ADMIN_PASS before going live!'); if (process.env.NODE_ENV === 'production') { console.error('FATAL: refusing to start in production with the default admin password. Set ADMIN_PASS.'); process.exit(1); } }
const adminTokens = new Map(), fails = {}; // token -> expiry time (12 hours)
setInterval(() => { for (const k in fails) delete fails[k]; }, 15 * 60 * 1000); // unlock every 15 min
const same = (a, b) => { const h = v => crypto.createHash('sha256').update(String(v)).digest(); return crypto.timingSafeEqual(h(a), h(b)); };
function adminAuth(req, res, next) {
  const tk = (req.headers.authorization || '').replace('Bearer ', '');
  if (!(adminTokens.get(tk) > Date.now())) return err(res, 'login', 401);
  next();
}
const CATS = ['dev', 'vit', 'aid', 'ortho', 'hyg'], STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];
function cleanProduct(b) {
  const s = v => String(v == null ? '' : v).trim(), p = Number(b.p), o = b.o === '' || b.o == null ? undefined : Number(b.o);
  if (!s(b.en) || !s(b.fa) || !categories.some(x => x.id === b.c) || !(p > 0) || (o !== undefined && !(o > p))) return null;
  const sg = b.seo || {}, seoP = { title: s(sg.title).slice(0, 120), desc: s(sg.desc).slice(0, 300), keywords: s(sg.keywords).slice(0, 200), slug: slugify(sg.slug), noindex: sg.noindex === true || sg.noindex === 'true', alt: s(sg.alt).slice(0, 150) };
  const specs = (Array.isArray(b.specs) ? b.specs : []).map(x => ({ tfa: s(x.tfa).slice(0, 60), vfa: s(x.vfa).slice(0, 100), ten: s(x.ten).slice(0, 60), ven: s(x.ven).slice(0, 100) })).filter(x => (x.tfa || x.ten) && (x.vfa || x.ven)).slice(0, 30);
  const images = (Array.isArray(b.images) ? b.images : []).map(s).filter(u => /^(\/uploads\/[\w.-]+|https:\/\/[^\s'"()<>]+)$/.test(u)).slice(0, 8);
  return { c: b.c, brand: s(b.brand).slice(0, 60), seo: seoP, updated: new Date().toISOString(), images, specs, p: Math.round(p), ...(o ? { o: Math.round(o) } : {}), e: s(b.e) || '📦', bg: /^#[0-9a-f]{6}$/i.test(b.bg) ? b.bg : '#e3f1f0', en: s(b.en), fa: s(b.fa), de: s(b.de), df: s(b.df) };
}

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip;
  if ((fails[ip] || 0) >= 5 || hit('al:' + ip, 30, 600000)) return err(res, 'locked', 429);
  if (same(req.body.username, ADMIN_USER) && same(req.body.password, ADMIN_PASS)) {
    fails[ip] = 0; const tk = crypto.randomBytes(24).toString('hex'); adminTokens.set(tk, Date.now() + 12 * 3600 * 1000); return res.json({ token: tk });
  }
  fails[ip] = (fails[ip] || 0) + 1; err(res, 'badlogin', 401);
});
app.post('/api/admin/logout', adminAuth, (req, res) => { adminTokens.delete((req.headers.authorization || '').replace('Bearer ', '')); res.json({ ok: true }); });

app.get('/api/admin/stats', adminAuth, (req, res) => {
  const db = load(), valid = db.orders.filter(o => o.status !== 'canceled');
  res.json({ products: products.length, users: Object.keys(db.users).length, orders: db.orders.length, revenue: valid.reduce((s, o) => s + o.total, 0), pending: db.orders.filter(o => (o.status || 'pending') === 'pending').length });
});

// products: create / read / update / delete
app.get('/api/admin/products', adminAuth, (req, res) => res.json(products));
app.post('/api/admin/products', adminAuth, (req, res) => {
  const c = cleanProduct(req.body); if (!c) return err(res, 'invalid');
  const p = { id: Math.max(0, ...products.map(x => x.id)) + 1, ...c, r: 0, n: 0 };
  products.push(p); save(load()); res.json(p);
});
app.put('/api/admin/products/:id', adminAuth, (req, res) => {
  const i = products.findIndex(x => x.id == req.params.id), c = cleanProduct(req.body);
  if (i < 0) return err(res, 'notfound', 404); if (!c) return err(res, 'invalid');
  const { o, ...rest } = products[i]; products[i] = { ...rest, ...c }; save(load()); res.json(products[i]);
});
app.delete('/api/admin/products/:id', adminAuth, (req, res) => {
  const i = products.findIndex(x => x.id == req.params.id); if (i < 0) return err(res, 'notfound', 404);
  products.splice(i, 1); save(load()); res.json({ ok: true });
});

// orders: list + change status
app.get('/api/admin/orders', adminAuth, (req, res) => {
  const db = load();
  res.json(db.orders.map(o => ({ ...o, status: o.status || 'pending', customer: (o.cust && dec(o.cust)) || {} })).map(({ cust, uid, ...r }) => r).reverse());
});
app.put('/api/admin/orders/:id', adminAuth, (req, res) => {
  const db = load(), o = db.orders.find(x => x.id == req.params.id);
  if (!o) return err(res, 'notfound', 404); if (!STATUSES.includes(req.body.status)) return err(res, 'invalid');
  o.status = req.body.status; save(db); res.json(o);
});

// users: list
app.get('/api/admin/users', adminAuth, (req, res) => {
  const db = load();
  res.json(Object.keys(db.users).map(uid => { const { uid: _x, ...u } = getU(db, uid) || {}; return { ...u, orders: db.orders.filter(o => o.uid === uid).length }; }));
});

// ======================= CATEGORIES (tree) + BANNERS =======================
const UPLOADS = path.join(__dirname, 'public', 'uploads');
function descIds(id) { return [id, ...categories.filter(c => c.parent === id).flatMap(c => descIds(c.id))]; }
function cleanCat(b, selfId) {
  const s = v => String(v == null ? '' : v).trim(), parent = b.parent || null;
  if (!s(b.fa) || !s(b.en)) return null;
  if (parent && !categories.some(c => c.id === parent)) return null;
  if (selfId && parent && descIds(selfId).includes(parent)) return null; // no loops
  let slug = slugify(b.slug) || slugify(s(b.en)) || 'category'; const base = slug; let i = 2;
  while (categories.some(c => c.id !== selfId && (c.slug === slug || c.id === slug))) slug = base + '-' + i++; // slugs must be unique
  return { fa: s(b.fa), en: s(b.en), icon: s(b.icon) || '📁', parent, slug, seoTitle: s(b.seoTitle).slice(0, 120), seoDesc: s(b.seoDesc).slice(0, 300), seoText: s(b.seoText).slice(0, 3000), noindex: b.noindex === true || b.noindex === 'true' };
}
function cleanSlide(x) {
  const s = v => String(v == null ? '' : v).trim(), col = v => /^#[0-9a-f]{6}$/i.test(v) ? v : null;
  const image = s(x.image), link = s(x.link);
  if (image && !/^(\/uploads\/[\w.-]+|https:\/\/[^\s'"()<>]+)$/.test(image)) return null;
  if (link && !/^#?\/(products(\/[^\s/'"<>()]+)?|offer\/[\w-]+|about)?$/.test(link)) return null;
  if (!s(x.tfa) && !s(x.ten) && !image) return null;
  return { image, link, tfa: s(x.tfa).slice(0, 120), ten: s(x.ten).slice(0, 120), pfa: s(x.pfa).slice(0, 250), pen: s(x.pen).slice(0, 250), bg: col(x.bg) || '#6d49e8', color: col(x.color) || '#ffffff' };
}
function cleanBanner(b) { // a banner = a place on the home page + several slides that change every "interval" seconds
  const slides = (Array.isArray(b.slides) ? b.slides : []).slice(0, 10).map(cleanSlide);
  if (!slides.length || slides.some(x => !x)) return null;
  return { slot: b.slot === 'side' ? 'side' : 'main', active: b.active !== false && b.active !== 'false', interval: Math.min(60, Math.max(2, Number(b.interval) || 5)), slides };
}
app.get('/api/categories', (req, res) => res.json(categories));
app.get('/api/banners', (req, res) => res.json(banners.filter(b => b.active)));

app.post('/api/admin/categories', adminAuth, (req, res) => {
  const c = cleanCat(req.body); if (!c) return err(res, 'invalid');
  const cat = { id: 'c' + Date.now().toString(36), ...c }; categories.push(cat); save(load()); res.json(cat);
});
app.put('/api/admin/categories/:id', adminAuth, (req, res) => {
  const i = categories.findIndex(c => c.id === req.params.id); if (i < 0) return err(res, 'notfound', 404);
  const c = cleanCat(req.body, req.params.id); if (!c) return err(res, 'invalid');
  categories[i] = { id: categories[i].id, ...c }; save(load()); res.json(categories[i]);
});
app.delete('/api/admin/categories/:id', adminAuth, (req, res) => {
  const id = req.params.id, i = categories.findIndex(c => c.id === id); if (i < 0) return err(res, 'notfound', 404);
  if (categories.some(c => c.parent === id)) return err(res, 'haschildren');
  if (products.some(p => p.c === id)) return err(res, 'inuse');
  categories.splice(i, 1); save(load()); res.json({ ok: true });
});

app.get('/api/admin/banners', adminAuth, (req, res) => res.json(banners));
app.post('/api/admin/banners', adminAuth, (req, res) => {
  const c = cleanBanner(req.body); if (!c) return err(res, 'invalid');
  const b = { id: 'b' + Date.now().toString(36), ...c }; banners.push(b); save(load()); res.json(b);
});
app.put('/api/admin/banners/:id', adminAuth, (req, res) => {
  const i = banners.findIndex(b => b.id === req.params.id); if (i < 0) return err(res, 'notfound', 404);
  const c = cleanBanner(req.body); if (!c) return err(res, 'invalid');
  banners[i] = { id: banners[i].id, ...c }; save(load()); res.json(banners[i]);
});
app.delete('/api/admin/banners/:id', adminAuth, (req, res) => {
  const i = banners.findIndex(b => b.id === req.params.id); if (i < 0) return err(res, 'notfound', 404);
  banners.splice(i, 1); save(load()); res.json({ ok: true });
});
app.post('/api/admin/banners/:id/move', adminAuth, (req, res) => { // change the order of banners
  const i = banners.findIndex(b => b.id === req.params.id), j = i + (Number(req.body.dir) < 0 ? -1 : 1);
  if (i < 0 || j < 0 || j >= banners.length) return err(res, 'invalid');
  [banners[i], banners[j]] = [banners[j], banners[i]]; save(load()); res.json(banners);
});
app.post('/api/admin/upload', adminAuth, (req, res) => { // banner image upload (png / jpg / webp, max 2.5 MB)
  const m = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(req.body.data || '');
  if (!m) return err(res, 'invalid');
  const buf = Buffer.from(m[2], 'base64'); if (buf.length > 2.5 * 1024 * 1024) return err(res, 'toolarge');
  const okSig = { png: () => buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), jpeg: () => buf[0] === 0xff && buf[1] === 0xd8, webp: () => buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP' };
  if (!okSig[m[1]]()) return err(res, 'invalid'); // the file content must really be that image type
  const name = crypto.randomBytes(8).toString('hex') + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1]);
  fs.mkdirSync(UPLOADS, { recursive: true }); fs.writeFileSync(path.join(UPLOADS, name), buf);
  res.json({ url: '/uploads/' + name });
});

// ======================= SPECIAL OFFERS (flash sales) + MY ORDERS =======================
function cleanOffer(b) {
  const s = v => String(v == null ? '' : v).trim(), col = v => /^#[0-9a-f]{6}$/i.test(v) ? v : null;
  const pct = Number(b.percent), end = new Date(b.end);
  const ids = [...new Set((Array.isArray(b.products) ? b.products : []).map(Number).filter(id => products.some(p => p.id === id)))];
  if ((!s(b.tfa) && !s(b.ten)) || !(pct >= 1 && pct <= 90) || isNaN(end) || !ids.length) return null;
  return { tfa: s(b.tfa), ten: s(b.ten), percent: Math.round(pct), end: end.toISOString(), bg: col(b.bg) || '#c0392b', color: col(b.color) || '#ffffff', products: ids, active: b.active !== false && b.active !== 'false' };
}
app.get('/api/offers', (req, res) => res.json({ now: Date.now(), offers: activeOffers() }));
app.get('/api/admin/offers', adminAuth, (req, res) => res.json(offers));
app.post('/api/admin/offers', adminAuth, (req, res) => {
  const c = cleanOffer(req.body); if (!c) return err(res, 'invalid');
  const o = { id: 'o' + Date.now().toString(36), ...c }; offers.push(o); save(load()); res.json(o);
});
app.put('/api/admin/offers/:id', adminAuth, (req, res) => {
  const i = offers.findIndex(o => o.id === req.params.id); if (i < 0) return err(res, 'notfound', 404);
  const c = cleanOffer(req.body); if (!c) return err(res, 'invalid');
  offers[i] = { id: offers[i].id, ...c }; save(load()); res.json(offers[i]);
});
app.delete('/api/admin/offers/:id', adminAuth, (req, res) => {
  const i = offers.findIndex(o => o.id === req.params.id); if (i < 0) return err(res, 'notfound', 404);
  offers.splice(i, 1); save(load()); res.json({ ok: true });
});
app.post('/api/admin/offers/:id/move', adminAuth, (req, res) => {
  const i = offers.findIndex(o => o.id === req.params.id), j = i + (Number(req.body.dir) < 0 ? -1 : 1);
  if (i < 0 || j < 0 || j >= offers.length) return err(res, 'invalid');
  [offers[i], offers[j]] = [offers[j], offers[i]]; save(load()); res.json(offers);
});

// the logged-in customer's own orders, with product names and status
app.get('/api/orders/mine', auth, (req, res) => {
  res.json(req.db.orders.filter(o => o.uid === req.uid).map(o => ({
    id: o.id, date: o.date, status: o.status || 'pending', subtotal: o.subtotal, shipping: o.shipping, total: o.total,
    items: o.items.map(i => { const p = products.find(x => x.id === i.id); return { id: i.id, qty: i.qty, price: i.price, fa: p ? p.fa : '#' + i.id, en: p ? p.en : '#' + i.id, e: p ? p.e : '📦', bg: p ? p.bg : '#eeeeee', image: (p && p.images && p.images[0]) || '' }; })
  })).reverse());
});

// ======================= REVIEWS (stars + comment) + ANNOUNCEMENT BAR =======================
const pubName = (u) => u ? `${u.firstName} ${String(u.lastName || '').slice(0, 1)}.` : '—'; // public name: "Sara K."
app.get('/api/products/:id/reviews', (req, res) => {
  const db = load(), all = (db.reviews || {})[req.params.id] || {}, me = sessionUid(req, db);
  const reviews = Object.entries(all).map(([u, r]) => ({ name: pubName(getU(db, u)), stars: r.stars, text: r.text, date: r.date })).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json({ reviews, mine: me && all[me] ? { stars: all[me].stars, text: all[me].text } : null });
});
app.post('/api/products/:id/reviews', auth, (req, res) => { // one review per customer per product (sending again edits it)
  const rw = hit('rv:' + req.uid, 8, 60000); if (rw) return lockMsg(res, rw);
  const id = Number(req.params.id), stars = Math.round(Number(req.body.stars)), text = String(req.body.text || '').trim().slice(0, 600);
  if (!products.some(p => p.id === id) || !(stars >= 1 && stars <= 5)) return err(res, 'invalid');
  const db = req.db; db.reviews = db.reviews || {};
  (db.reviews[id] = db.reviews[id] || {})[req.uid] = { stars, text, date: new Date().toISOString() };
  (db.ratings[id] = db.ratings[id] || {})[req.uid] = stars; // the stars also count in the product rating
  save(db); res.json({ ok: true });
});
app.get('/api/admin/reviews', adminAuth, (req, res) => {
  const db = load(), out = [];
  for (const [pid, m] of Object.entries(db.reviews || {})) for (const [uid, r] of Object.entries(m)) {
    const p = products.find(x => x.id == pid), u = getU(db, uid) || {};
    out.push({ pid, uid, phone: maskPhone(u.phone), product: p ? { fa: p.fa, en: p.en } : { fa: '#' + pid, en: '#' + pid }, name: `${u.firstName || ''} ${u.lastName || ''}`.trim(), ...r });
  }
  res.json(out.sort((a, b) => new Date(b.date) - new Date(a.date)));
});
app.delete('/api/admin/reviews/:pid/:uid', adminAuth, (req, res) => {
  const db = load(), { pid, uid } = req.params;
  if (!db.reviews || !db.reviews[pid] || !db.reviews[pid][uid]) return err(res, 'notfound', 404);
  delete db.reviews[pid][uid]; if (db.ratings[pid]) delete db.ratings[pid][uid];
  save(db); res.json({ ok: true });
});

function cleanAnnounce(b) {
  const s = (v, n) => String(v == null ? '' : v).trim().slice(0, n), col = v => /^#[0-9a-f]{6}$/i.test(v) ? v : null;
  const items = (Array.isArray(b.items) ? b.items : []).map(x => ({ fa: s(x.fa, 160), en: s(x.en, 160) })).filter(x => x.fa || x.en).slice(0, 10);
  return { active: b.active !== false && b.active !== 'false', bg: col(b.bg) || '#6d49e8', color: col(b.color) || '#ffffff', interval: Math.min(30, Math.max(2, Number(b.interval) || 5)), items };
}
app.get('/api/announce', (req, res) => res.json(announce));
app.get('/api/admin/announce', adminAuth, (req, res) => res.json(announce));
app.put('/api/admin/announce', adminAuth, (req, res) => { announce = cleanAnnounce(req.body); save(load()); res.json(announce); });

// ======================= BRANDS + FOOTER SETTINGS =======================
app.get('/api/brands', (req, res) => {
  const m = {}; products.forEach(p => { if (p.brand) m[p.brand] = (m[p.brand] || 0) + 1; });
  res.json(Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)));
});
function cleanFooter(b) {
  const s = (v, n) => String(v == null ? '' : v).trim().slice(0, n), url = v => { v = s(v, 200); return /^https:\/\/[^\s'"<>]+$/.test(v) ? v : ''; };
  const phones = (Array.isArray(b.phones) ? b.phones : String(b.phones || '').split('\n')).map(x => s(x, 30)).filter(Boolean).slice(0, 4);
  return { hoursFa: s(b.hoursFa, 200), hoursEn: s(b.hoursEn, 200), phones, email: s(b.email, 80), addrFa: s(b.addrFa, 200), addrEn: s(b.addrEn, 200),
    telegram: url(b.telegram), instagram: url(b.instagram), linkedin: url(b.linkedin), whatsapp: url(b.whatsapp),
    copyFa: s(b.copyFa, 200), copyEn: s(b.copyEn, 200), seoTitleFa: s(b.seoTitleFa, 150), seoTitleEn: s(b.seoTitleEn, 150), seoFa: s(b.seoFa, 3000), seoEn: s(b.seoEn, 3000) };
}
app.get('/api/footer', (req, res) => res.json(footerCfg));
app.get('/api/admin/footer', adminAuth, (req, res) => res.json(footerCfg));
app.put('/api/admin/footer', adminAuth, (req, res) => { footerCfg = cleanFooter(req.body); save(load()); res.json(footerCfg); });

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ======================= BLOG (posts, comments) =======================
const postPath = (p) => `/blog/${p.id}${p.slug ? '-' + p.slug : ''}`;
// tiny, safe text format:  ## heading  ### sub-heading  - list  1. numbered  > quote  **bold**  [text](link)  ![alt](/uploads/image.webp)
function renderContent(src) {
  const e = escHtml;
  const inline = (t) => e(t)
    .replace(/!\[([^\]]*)\]\((\/uploads\/[\w.-]+|https:\/\/[^\s)"'<>]+)\)/g, (m, a, u) => `<img src="${u}" alt="${a}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\((\/[\w\-./%]*|https:\/\/[^\s)"'<>]+)\)/g, (m, a, u) => `<a href="${u}"${u.startsWith('http') ? ' target="_blank" rel="noopener nofollow"' : ''}>${a}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const out = [];
  for (const raw of String(src || '').replace(/\r/g, '').split(/\n{2,}/)) {
    const t = raw.trim(); if (!t) continue; const lines = t.split('\n'); let m;
    if ((m = /^(#{2,3})\s+(.+)$/.exec(t))) out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
    else if (lines.every(l => /^[-*]\s+/.test(l))) out.push(`<ul>${lines.map(l => `<li>${inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`);
    else if (lines.every(l => /^\d+[.)]\s+/.test(l))) out.push(`<ol>${lines.map(l => `<li>${inline(l.replace(/^\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`);
    else if (lines.every(l => /^>\s?/.test(l))) out.push(`<blockquote>${inline(lines.map(l => l.replace(/^>\s?/, '')).join(' '))}</blockquote>`);
    else out.push(`<p>${inline(t).replace(/\n/g, '<br>')}</p>`);
  }
  return out.join('\n');
}
const plainText = (src) => String(src || '').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#*>_`]/g, ' ').replace(/\s+/g, ' ').trim();
const readMin = (src) => Math.max(1, Math.round(plainText(src).split(' ').filter(Boolean).length / 180));
const postPub = (p, full) => ({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt || cutText(plainText(p.content), 160), cover: p.cover, alt: p.alt || p.title, tags: p.tags || [], date: p.date, updated: p.updated, readMin: readMin(p.content), ...(full ? { html: renderContent(p.content) } : {}) });
const published = () => posts.filter(p => p.status === 'published' && new Date(p.date) <= new Date()).sort((a, b) => new Date(b.date) - new Date(a.date));
function cleanPost(b) {
  const s = (v, n) => String(v == null ? '' : v).trim().slice(0, n), img = (v) => /^(\/uploads\/[\w.-]+|https:\/\/[^\s'"()<>]+)$/.test(v) ? v : '';
  const title = s(b.title, 150); if (!title || !s(b.content, 60000)) return null;
  const sg = b.seo || {}, d = new Date(b.date);
  return { title, slug: slugify(b.slug) || slugify(title), excerpt: s(b.excerpt, 300), content: s(b.content, 60000), cover: img(s(b.cover, 300)), alt: s(b.alt, 150),
    tags: s(b.tags, 200).split(/[,،]/).map(x => x.trim()).filter(Boolean).slice(0, 10), status: b.status === 'draft' ? 'draft' : 'published', date: isNaN(d) ? '' : d.toISOString(),
    seo: { title: s(sg.title, 120), desc: s(sg.desc, 300), keywords: s(sg.keywords, 200), noindex: sg.noindex === true || sg.noindex === 'true' } };
}
app.get('/api/posts', (req, res) => { const q = String(req.query.q || '').toLowerCase(), lim = Math.min(50, Number(req.query.limit) || 50); res.json(published().filter(p => !q || (p.title + (p.excerpt || '')).toLowerCase().includes(q)).slice(0, lim).map(p => postPub(p))); });
app.get('/api/posts/:id', (req, res) => { const p = published().find(x => x.id == req.params.id); if (!p) return err(res, 'notfound', 404); res.json(postPub(p, true)); });
app.get('/api/posts/:id/comments', (req, res) => {
  const db = load(), L = ((db.pcomments || {})[req.params.id] || []).map(c => ({ id: c.id, name: pubName(getU(db, c.uid)), text: c.text, date: c.date })).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json({ comments: L });
});
app.post('/api/posts/:id/comments', auth, (req, res) => {
  const id = Number(req.params.id), text = String(req.body.text || '').trim().slice(0, 1000);
  if (!published().some(p => p.id === id) || text.length < 2) return err(res, 'invalid');
  const w = hit('pc:' + req.uid, 6, 60000); if (w) return lockMsg(res, w);
  const db = req.db; db.pcomments = db.pcomments || {}; const L = db.pcomments[id] = db.pcomments[id] || [];
  if (L.filter(c => c.uid === req.uid).length >= 10) return err(res, 'limit');
  L.push({ id: Date.now() + '' + crypto.randomInt(100, 999), uid: req.uid, text, date: new Date().toISOString() }); save(db); res.json({ ok: true });
});
app.get('/api/admin/posts', adminAuth, (req, res) => res.json([...posts].sort((a, b) => b.id - a.id).map(p => ({ ...p, path: postPath(p) }))));
app.post('/api/admin/posts', adminAuth, (req, res) => {
  const c = cleanPost(req.body); if (!c) return err(res, 'invalid');
  const now = new Date().toISOString(), p = { id: Math.max(0, ...posts.map(x => x.id)) + 1, ...c, date: c.date || now, updated: now }; posts.push(p); save(load()); res.json(p);
});
app.put('/api/admin/posts/:id', adminAuth, (req, res) => {
  const i = posts.findIndex(x => x.id == req.params.id); if (i < 0) return err(res, 'notfound', 404);
  const c = cleanPost(req.body); if (!c) return err(res, 'invalid');
  posts[i] = { id: posts[i].id, ...c, date: c.date || posts[i].date, updated: new Date().toISOString() }; save(load()); res.json(posts[i]);
});
app.delete('/api/admin/posts/:id', adminAuth, (req, res) => { const i = posts.findIndex(x => x.id == req.params.id); if (i < 0) return err(res, 'notfound', 404); posts.splice(i, 1); save(load()); res.json({ ok: true }); });
app.post('/api/admin/render', adminAuth, (req, res) => res.json({ html: renderContent(String(req.body.content || '').slice(0, 60000)) })); // preview
app.get('/api/admin/pcomments', adminAuth, (req, res) => {
  const db = load(), out = [];
  for (const [pid, L] of Object.entries(db.pcomments || {})) for (const c of L) { const p = posts.find(x => x.id == pid), u = getU(db, c.uid) || {}; out.push({ pid, id: c.id, post: p ? p.title : '#' + pid, name: `${u.firstName || ''} ${u.lastName || ''}`.trim(), phone: maskPhone(u.phone), text: c.text, date: c.date }); }
  res.json(out.sort((a, b) => new Date(b.date) - new Date(a.date)));
});
app.delete('/api/admin/pcomments/:pid/:cid', adminAuth, (req, res) => {
  const db = load(), L = (db.pcomments || {})[req.params.pid] || [], i = L.findIndex(c => c.id === req.params.cid); if (i < 0) return err(res, 'notfound', 404);
  L.splice(i, 1); save(db); res.json({ ok: true });
});
app.get('/api/admin/security', adminAuth, (req, res) => res.json({ defaultAdminPass: ADMIN_PASS === 'admin123', https: String(req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https' || seo.baseUrl.startsWith('https://'), secretFromEnv: !!process.env.APP_SECRET,
  production: process.env.NODE_ENV === 'production', showCode: process.env.NODE_ENV !== 'production' || !!process.env.SHOW_CODE, csp: process.env.CSP !== 'off', cdn: !!req.headers['cf-connecting-ip'], users: Object.keys(load().users).length }));

// ======================= SEO: meta tags, sitemap, robots, redirects, audit =======================
function escHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function slugify(s) { return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 80); }
const slugOf = (p) => (p.seo && p.seo.slug) || slugify(p.en);
const cutText = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s\S*$/, '') + '…' : s; };
const faNum = (n) => Number(n).toLocaleString('fa-IR');
const prodPath = (p) => `/product/${p.id}${slugOf(p) ? '-' + slugOf(p) : ''}`;
const catPath = (c) => `/products/${c.slug || c.id}`;
const origin = (req) => (seo.baseUrl || `${String(req.headers['x-forwarded-proto'] || 'http').split(',')[0]}://${req.headers.host || 'localhost'}`).replace(/\/+$/, '');
const absUrl = (base, u) => !u ? '' : /^https?:/.test(u) ? u : base + encodeURI(u);
const withTpl = (t) => t ? seo.titleTpl.replace('%s', t) : seo.siteName;
const catChain = (id) => { const out = []; for (let c = categories.find(x => x.id === id); c; c = categories.find(x => x.id === c.parent)) out.unshift(c); return out; };
const prodTitle = (p) => (p.seo && p.seo.title) || `خرید ${p.fa}${p.brand ? ' ' + p.brand : ''}`;
const prodDesc = (p) => (p.seo && p.seo.desc) || `${cutText(p.df, 95)} قیمت ${faNum(eff(p))} تومان، ضمانت اصالت کالا و ارسال سریع.`;
const catTitle = (c) => c.seoTitle || `خرید ${c.fa}`;
const catDesc = (c) => c.seoDesc || cutText(c.seoText, 160) || `خرید ${c.fa} با ضمانت اصالت کالا، قیمت مناسب و ارسال سریع از ${seo.siteName}.`;
// every category gets a clean URL name (slug)
categories.forEach(c => { if (!c.slug) { const b = slugify(c.en) || c.id; let k = b, i = 2; while (categories.some(o => o !== c && (o.slug === k || o.id === k))) k = b + '-' + i++; c.slug = k; } });

function metaFor(req, rawPath) {
  let path; try { path = decodeURIComponent(String(rawPath).split('?')[0]); } catch { path = String(rawPath).split('?')[0]; }
  if (path.length > 1) path = path.replace(/\/+$/, '');
  const rd = seo.redirects.find(r => r.from === path); if (rd) return { redirect: rd.to };
  const base = origin(req), db = load(), pg = (k) => seo.pages[k] || {};
  const m = { status: 200, robots: seo.robotsBlock ? 'noindex,nofollow' : 'index,follow', ogType: 'website', ld: [], body: '', keywords: seo.defKeywords, desc: seo.defDesc, title: seo.siteName, image: absUrl(base, seo.ogImage), canonical: base + encodeURI(path) };
  const hide = () => { m.robots = 'noindex,nofollow'; };
  const crumbs = (items) => m.ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: base + encodeURI(p) })) });
  const list = (arr) => `<ul>${arr.map(p => `<li><a href="${escHtml(encodeURI(prodPath(p)))}">${escHtml(p.fa)}</a> — ${faNum(eff(p))} تومان</li>`).join('')}</ul>`;
  const catLinks = (arr) => `<nav><ul>${arr.map(c => `<li><a href="${escHtml(encodeURI(catPath(c)))}">${escHtml(c.fa)}</a></li>`).join('')}</ul></nav>`;
  let mm;
  if (path === '/') {
    const h = pg('home'), f = footerCfg, sameAs = [f.telegram, f.instagram, f.linkedin, f.whatsapp].filter(Boolean);
    m.title = withTpl(h.title); m.desc = h.desc || seo.defDesc; m.keywords = h.keywords || seo.defKeywords;
    m.ld.push({ '@context': 'https://schema.org', '@type': 'Organization', name: seo.siteName, url: base, ...(m.image ? { logo: m.image } : {}), ...(sameAs.length ? { sameAs } : {}), ...(f.phones[0] ? { contactPoint: { '@type': 'ContactPoint', telephone: f.phones[0], contactType: 'customer service', availableLanguage: 'fa' } } : {}) });
    m.ld.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: seo.siteName, url: base, inLanguage: 'fa' });
    m.body = `<h1>${escHtml(h.title || seo.siteName)}</h1><p>${escHtml(m.desc)}</p>${catLinks(categories.filter(c => !c.parent))}${list(products.slice(0, 24))}`;
  } else if (path === '/products') {
    const h = pg('products'); m.title = withTpl(h.title); m.desc = h.desc || seo.defDesc; m.keywords = h.keywords || seo.defKeywords;
    crumbs([['خانه', '/'], ['محصولات', '/products']]);
    m.body = `<h1>${escHtml(h.title || 'محصولات')}</h1><p>${escHtml(m.desc)}</p>${catLinks(categories.filter(c => !c.parent))}${list(products.slice(0, 100))}`;
  } else if ((mm = /^\/products\/(.+)$/.exec(path))) {
    const c = categories.find(x => x.slug === mm[1] || x.id === mm[1]);
    if (!c) { m.status = 404; m.title = 'صفحه پیدا نشد'; m.desc = ''; hide(); m.body = '<h1>دسته‌بندی پیدا نشد</h1><p><a href="/products">همه محصولات</a></p>'; }
    else if (mm[1] !== c.slug) return { redirect: catPath(c) };
    else {
      const ids = descIds(c.id); m.title = withTpl(catTitle(c)); m.desc = catDesc(c); if (c.noindex) hide();
      crumbs([['خانه', '/'], ['محصولات', '/products'], ...catChain(c.id).map(x => [x.fa, catPath(x)])]);
      m.body = `<h1>${escHtml(c.fa)}</h1>${c.seoText ? `<p>${escHtml(c.seoText)}</p>` : ''}${catLinks(categories.filter(x => x.parent === c.id))}${list(products.filter(p => ids.includes(p.c)).slice(0, 100))}`;
    }
  } else if ((mm = /^\/product\/(\d+)(?:-.*)?$/.exec(path))) {
    const p = products.find(x => x.id === Number(mm[1]));
    if (!p) { m.status = 404; m.title = 'صفحه پیدا نشد'; m.desc = ''; hide(); m.body = '<h1>محصول پیدا نشد</h1><p><a href="/products">همه محصولات</a></p>'; }
    else if (path !== prodPath(p)) return { redirect: prodPath(p) };
    else {
      m.title = withTpl(prodTitle(p)); m.desc = prodDesc(p); m.keywords = (p.seo && p.seo.keywords) || [p.fa, p.brand].filter(Boolean).join('، ');
      m.ogType = 'product'; if (p.images && p.images[0]) m.image = absUrl(base, p.images[0]); if (p.seo && p.seo.noindex) hide();
      const real = Object.values(db.ratings[p.id] || {}), off = applyOffer(p), alt = (p.seo && p.seo.alt) || p.fa;
      const ld = { '@context': 'https://schema.org', '@type': 'Product', name: p.fa, description: m.desc, sku: String(p.id), ...((p.images || []).length ? { image: p.images.map(u => absUrl(base, u)) } : {}), ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
        offers: { '@type': 'Offer', url: m.canonical, priceCurrency: 'IRR', price: String(eff(p) * 10), availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', ...(off.spEnd ? { priceValidUntil: off.spEnd.slice(0, 10) } : {}) } };
      if (real.length) ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: String(Math.round(real.reduce((a, b) => a + b, 0) / real.length * 10) / 10), reviewCount: String(real.length) }; // only real customer ratings
      m.ld.push(ld);
      crumbs([['خانه', '/'], ['محصولات', '/products'], ...catChain(p.c).map(x => [x.fa, catPath(x)]), [p.fa, prodPath(p)]]);
      m.body = `<article><h1>${escHtml(p.fa)}</h1>${p.brand ? `<p>برند: ${escHtml(p.brand)}</p>` : ''}<p>قیمت: ${faNum(eff(p))} تومان</p><p>${escHtml(p.df)}</p>${(p.specs || []).length ? `<table>${p.specs.map(x => `<tr><th>${escHtml(x.tfa || x.ten)}</th><td>${escHtml(x.vfa || x.ven)}</td></tr>`).join('')}</table>` : ''}${(p.images || []).map(u => `<img class="max-w-xs rounded-xl" src="${escHtml(u)}" alt="${escHtml(alt)}" loading="lazy">`).join('')}</article>`;
    }
  } else if (path === '/categories') {
    m.title = withTpl('دسته‌بندی محصولات'); m.desc = `دسته‌بندی کامل محصولات ${seo.siteName}: ` + categories.filter(c => !c.parent).map(c => c.fa).join('، ') + '.';
    crumbs([['خانه', '/'], ['دسته‌بندی', '/categories']]);
    m.body = `<h1>دسته‌بندی محصولات</h1>${catLinks(categories.filter(c => !c.parent))}`;
  } else if (path === '/blog') {
    const h = pg('blog'); m.title = withTpl(h.title || 'مطالب و مقالات'); m.desc = h.desc || seo.defDesc; m.keywords = h.keywords || seo.defKeywords;
    crumbs([['خانه', '/'], ['مطالب', '/blog']]);
    m.body = `<h1>${escHtml(h.title || 'مطالب و مقالات')}</h1><p>${escHtml(m.desc)}</p><ul>${published().map(p => `<li><a href="${escHtml(encodeURI(postPath(p)))}">${escHtml(p.title)}</a> — ${escHtml(postPub(p).excerpt)}</li>`).join('')}</ul>`;
  } else if ((mm = /^\/blog\/(\d+)(?:-.*)?$/.exec(path))) {
    const p = published().find(x => x.id === Number(mm[1]));
    if (!p) { m.status = 404; m.title = 'صفحه پیدا نشد'; m.desc = ''; hide(); m.body = '<h1>مطلب پیدا نشد</h1><p><a href="/blog">همه مطالب</a></p>'; }
    else if (path !== postPath(p)) return { redirect: postPath(p) };
    else {
      const sg = p.seo || {}, pub = postPub(p, true); m.title = withTpl(sg.title || p.title); m.desc = sg.desc || pub.excerpt; m.keywords = sg.keywords || (p.tags || []).join('، '); m.ogType = 'article';
      if (p.cover) m.image = absUrl(base, p.cover); if (sg.noindex) hide();
      m.ld.push({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: m.desc, ...(p.cover ? { image: [absUrl(base, p.cover)] } : {}), datePublished: p.date, dateModified: p.updated || p.date, inLanguage: 'fa', mainEntityOfPage: m.canonical,
        author: { '@type': 'Organization', name: seo.siteName }, publisher: { '@type': 'Organization', name: seo.siteName, ...(seo.ogImage ? { logo: { '@type': 'ImageObject', url: absUrl(base, seo.ogImage) } } : {}) }, ...((p.tags || []).length ? { keywords: p.tags.join(',') } : {}) });
      crumbs([['خانه', '/'], ['مطالب', '/blog'], [p.title, postPath(p)]]);
      m.body = `<article><h1>${escHtml(p.title)}</h1>${p.cover ? `<img class="max-w-sm rounded-2xl" src="${escHtml(p.cover)}" alt="${escHtml(p.alt || p.title)}">` : ''}${pub.html}</article>`;
    }
  } else if (path === '/about') {
    const h = pg('about'); m.title = withTpl(h.title); m.desc = h.desc || seo.defDesc; m.keywords = h.keywords || seo.defKeywords;
    crumbs([['خانه', '/'], ['درباره ما', '/about']]);
    m.body = `<h1>${escHtml(h.title || 'درباره ما')}</h1><p>${escHtml(m.desc)}</p><p>${escHtml((footerCfg.phones || []).join(' - '))} ${escHtml(footerCfg.email)}</p>`;
  } else if (/^\/offer\/[\w-]+$/.test(path) || ['/login', '/profile', '/bag'].includes(path)) { // private / temporary pages: hidden from Google
    hide(); m.title = withTpl({ '/login': 'ورود و ثبت‌نام', '/profile': 'پروفایل من', '/bag': 'سبد خرید' }[path] || 'تخفیف ویژه'); m.body = `<h1>${escHtml(m.title)}</h1>`;
  } else { m.status = 404; m.title = 'صفحه پیدا نشد'; m.desc = ''; hide(); m.body = '<h1>صفحه پیدا نشد</h1><p><a href="/">بازگشت به صفحه اصلی</a></p>'; }
  return m;
}
function headHtml(m) {
  const e = escHtml;
  const analytics = [seo.ga && `<script async src="https://www.googletagmanager.com/gtag/js?id=${seo.ga}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${seo.ga}');</script>`,
    seo.gtm && `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${seo.gtm}');</script>`];
  return [`<title>${e(m.title)}</title>`, `<meta name="description" content="${e(m.desc)}">`, m.keywords ? `<meta name="keywords" content="${e(m.keywords)}">` : '', `<meta name="robots" content="${m.robots}">`, `<link rel="canonical" href="${e(m.canonical)}">`,
    `<meta property="og:type" content="${m.ogType}">`, `<meta property="og:site_name" content="${e(seo.siteName)}">`, '<meta property="og:locale" content="fa_IR">', `<meta property="og:title" content="${e(m.title)}">`, `<meta property="og:description" content="${e(m.desc)}">`, `<meta property="og:url" content="${e(m.canonical)}">`, m.image ? `<meta property="og:image" content="${e(m.image)}">` : '',
    `<meta name="twitter:card" content="${m.image ? 'summary_large_image' : 'summary'}">`, `<meta name="twitter:title" content="${e(m.title)}">`, `<meta name="twitter:description" content="${e(m.desc)}">`, m.image ? `<meta name="twitter:image" content="${e(m.image)}">` : '',
    seo.gsc ? `<meta name="google-site-verification" content="${e(seo.gsc)}">` : '', seo.bing ? `<meta name="msvalidate.01" content="${e(seo.bing)}">` : '',
    ...m.ld.map(x => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`), ...analytics].filter(Boolean).join('\n  ');
}
let shellCache = { m: 0, html: '' };
function renderShell(m) {
  const f = path.join(__dirname, 'public', 'index.html'), st = fs.statSync(f);
  if (st.mtimeMs !== shellCache.m) shellCache = { m: st.mtimeMs, html: fs.readFileSync(f, 'utf8') };
  const gtm = seo.gtm ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${seo.gtm}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` : '';
  return shellCache.html.replace('<!--SEO_HEAD-->', () => headHtml(m)).replace('<!--SEO_BODY_TOP-->', () => gtm).replace('<!--SEO_BODY-->', () => m.body);
}

app.get('/api/seo', (req, res) => { // used by the browser to update the tab title / description when the visitor moves between pages
  const m = metaFor(req, req.query.path || '/'); if (m.redirect) return res.json({ redirect: m.redirect });
  res.json({ title: m.title, desc: m.desc, robots: m.robots, canonical: m.canonical, image: m.image, status: m.status });
});
app.get('/robots.txt', (req, res) => {
  res.text(seo.robotsBlock ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nDisallow: /admin\nDisallow: /profile\nDisallow: /bag\nDisallow: /login\n\nSitemap: ${origin(req)}/sitemap.xml\n`);
});
app.get('/sitemap.xml', (req, res) => {
  const base = origin(req), u = (p, d) => `<url><loc>${escHtml(base + encodeURI(p))}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`;
  const cats = categories.filter(c => !c.noindex && products.some(p => descIds(c.id).includes(p.c)));
  res.text(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[u('/'), u('/products'), u('/categories'), u('/blog'), u('/about'), ...cats.map(c => u(catPath(c))), ...products.filter(p => !(p.seo && p.seo.noindex)).map(p => u(prodPath(p), p.updated && p.updated.slice(0, 10))), ...published().filter(pp => !(pp.seo && pp.seo.noindex)).map(pp => u(postPath(pp), (pp.updated || pp.date).slice(0, 10)))].join('\n')}\n</urlset>`, 'application/xml');
});

// ---- admin: SEO settings, redirects, audit ----
app.get('/api/admin/seo', adminAuth, (req, res) => res.json(seo));
app.put('/api/admin/seo', adminAuth, (req, res) => {
  const b = req.body || {}, s = (v, n) => String(v == null ? '' : v).trim().slice(0, n), ok = (re, v) => re.test(v) ? v : '';
  if (b.general) {
    const g = b.general, site = s(g.siteName, 60) || 'خانوم زیبا', tpl = s(g.titleTpl, 100);
    Object.assign(seo, { baseUrl: ok(/^https?:\/\/[^\s/?#]+$/, s(g.baseUrl, 120).replace(/\/+$/, '')), siteName: site, titleTpl: tpl.includes('%s') ? tpl : '%s | ' + site,
      defDesc: s(g.defDesc, 300), defKeywords: s(g.defKeywords, 300), ogImage: ok(/^(\/uploads\/[\w.-]+|https:\/\/[^\s'"()<>]+)$/, s(g.ogImage, 300)), robotsBlock: g.robotsBlock === true || g.robotsBlock === 'true',
      gsc: ok(/^[\w-]{10,100}$/, s(g.gsc, 100)), bing: ok(/^[\w-]{10,100}$/, s(g.bing, 100)), ga: ok(/^G-[A-Z0-9]{4,20}$/, s(g.ga, 30)), gtm: ok(/^GTM-[A-Z0-9]{4,12}$/, s(g.gtm, 30)) });
  }
  if (b.pages) for (const k of ['home', 'products', 'about', 'blog']) if (b.pages[k]) seo.pages[k] = { title: s(b.pages[k].title, 120), desc: s(b.pages[k].desc, 300), keywords: s(b.pages[k].keywords, 200) };
  if (b.redirects) seo.redirects = (Array.isArray(b.redirects) ? b.redirects : []).map(r => ({ from: s(r.from, 300), to: s(r.to, 300) })).filter(r => r.from.startsWith('/') && r.from !== r.to && /^(\/|https:\/\/)/.test(r.to)).slice(0, 200);
  save(load()); res.json(seo);
});
app.get('/api/admin/seo/audit', adminAuth, (req, res) => {
  const issues = [], add = (level, code, area, id, name) => issues.push({ level, code, area, id, name });
  const titles = {}; products.forEach(p => { const k = withTpl(prodTitle(p)); (titles[k] = titles[k] || []).push(p.id); });
  if (!seo.baseUrl) add('error', 'baseUrl', 'global'); if (seo.robotsBlock) add('error', 'robotsBlock', 'global');
  if (!seo.ogImage) add('warn', 'noOg', 'global'); if ((seo.defDesc || '').length < 70) add('warn', 'defDesc', 'global');
  if (!seo.gsc) add('info', 'noGsc', 'global'); if (!seo.ga && !seo.gtm) add('info', 'noGa', 'global');
  ['home', 'products', 'about'].forEach(k => { if (!(seo.pages[k] || {}).desc) add('info', 'pageNoDesc', 'page', k, { fa: { home: 'خانه', products: 'محصولات', about: 'درباره ما' }[k], en: k }); });
  for (const p of products) {
    const nm = { fa: p.fa, en: p.en };
    if (!(p.images || []).length) add('warn', 'noImage', 'product', p.id, nm);
    if (String(p.df || '').length < 50) add('warn', 'thinText', 'product', p.id, nm);
    if (withTpl(prodTitle(p)).length > 60) add('warn', 'longTitle', 'product', p.id, nm);
    if (titles[withTpl(prodTitle(p))].length > 1) add('warn', 'dupTitle', 'product', p.id, nm);
    if (!p.brand) add('info', 'noBrand', 'product', p.id, nm);
    if (p.seo && p.seo.noindex) add('info', 'noindexed', 'product', p.id, nm);
  }
  for (const c of categories) { const nm = { fa: c.fa, en: c.en }; if (!c.seoText) add('info', 'catNoText', 'category', c.id, nm); if (!c.seoDesc) add('info', 'catNoDesc', 'category', c.id, nm); }
  const n = (l) => issues.filter(i => i.level === l).length;
  res.json({ score: Math.max(0, 100 - 15 * n('error') - 4 * n('warn') - Math.min(15, n('info'))), issues });
});

// every other address: real 404 for missing files, 301 for old/duplicate addresses, otherwise the page with SEO tags already inside
app.get('*', (req, res) => {
  const p = req.pathname;
  if (/\.[a-z0-9]{2,5}$/i.test(p)) { res.statusCode = 404; return res.end('Not found'); }
  if (p.length > 1 && p.endsWith('/')) return res.redirect(p.replace(/\/+$/, '') || '/', 301);
  const m = metaFor(req, p);
  if (m.redirect) return res.redirect(m.redirect, 301);
  if (seo.robotsBlock) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.html(renderShell(m), m.status);
});



// ---- one-time upgrade of an older database: phone numbers -> hashed ids + encrypted profile data, raw session tokens -> hashed ----
(function migrateDb() {
  const db = load(); if (db.v === 2) return;
  const U = {}, S = {};
  for (const [k, u] of Object.entries(db.users || {})) {
    if (u && u.enc) { U[k] = u; continue; }
    const phone = u.phone || k, uid = uidOf(phone);
    U[uid] = { enc: enc({ firstName: u.firstName || '', lastName: u.lastName || '', phone, city: u.city || '', address: u.address || '', postalCode: u.postalCode || '' }) };
  }
  for (const [tk, v] of Object.entries(db.sessions || {})) { if (typeof v === 'string') S[sha(tk)] = { uid: uidOf(v), exp: Date.now() + SESSION_MS }; else S[tk] = v; }
  const remap = (o) => { const out = {}; for (const [pid, m] of Object.entries(o || {})) { out[pid] = {}; for (const [k, v] of Object.entries(m)) out[pid][/^09\d{9}$/.test(k) ? uidOf(k) : k] = v; } return out; };
  db.users = U; db.sessions = S; db.ratings = remap(db.ratings); db.reviews = remap(db.reviews);
  (db.orders || []).forEach(o => { if (o.phone) { o.uid = uidOf(o.phone); o.cust = enc({ ...(o.customer || {}), phone: o.phone }); delete o.phone; delete o.customer; } });
  db.v = 2; save(db);
})();
setInterval(() => { const db = load(), n = Date.now(); let ch = false; for (const [k, s] of Object.entries(db.sessions)) if (s.exp < n) { delete db.sessions[k]; ch = true; } if (ch) save(db); }, 3600e3).unref(); // forget expired logins

app.listen(PORT, () => console.log(`خانوم زیبا running on http://localhost:${PORT}`));
