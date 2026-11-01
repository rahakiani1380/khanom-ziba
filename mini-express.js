// A tiny Express-like server built ONLY on Node.js built-in modules.
// This means you do NOT need "npm install" at all.
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webp': 'image/webp' };

function express() {
  const routes = [], mw = [];
  const app = (req, res) => {
    const u = new URL(req.url, 'http://localhost');
    req.pathname = u.pathname; req.query = Object.fromEntries(u.searchParams); const sock = req.socket.remoteAddress || '';  // real visitor address (only trusted from a reverse proxy / CDN)
    const trust = process.env.TRUST_PROXY === '1' || !!process.env.RENDER || /^(::1|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|f[cd]|::ffff:(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.))/i.test(sock);
    req.ip = (trust && (req.headers['cf-connecting-ip'] || String(req.headers['x-forwarded-for'] || '').split(',')[0].trim())) || sock; req.params = {};
    res.status = c => { res.statusCode = c; return res; };
    res.html = (h, code) => { res.statusCode = code || 200; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(h); };
    res.text = (h, type) => { res.setHeader('Content-Type', (type || 'text/plain') + '; charset=utf-8'); res.end(h); };
    res.redirect = (to, code) => { res.statusCode = code || 301; res.setHeader('Location', encodeURI(decodeURI(to))); res.end(); };
    res.json = o => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); };
    res.sendFile = f => fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end('Not found'); } res.setHeader('Content-Type', MIME[path.extname(f)] || 'text/plain'); res.end(d); });
    let stack = [...mw];
    const r = routes.find(x => x.m === req.method && x.re.test(req.pathname));
    if (r) { req.params = { ...r.re.exec(req.pathname).groups }; stack = stack.concat(r.h); }
    let i = 0;
    const next = () => {
      const f = stack[i++];
      if (!f) { res.statusCode = 404; return res.end('Not found'); }
      try { f(req, res, next); } catch (e) { console.error(e); res.statusCode = 500; res.json({ error: 'server' }); }
    };
    next();
  };
  app.use = f => mw.push(f);
  ['get', 'post', 'put', 'delete'].forEach(m => app[m] = (p, ...h) => routes.push({ m: m.toUpperCase(), re: p === '*' ? /^.*$/ : new RegExp('^' + p.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), h }));
  app.listen = (port, cb) => { // slow-connection (slowloris) protection
    const srv = http.createServer(app); srv.headersTimeout = 15000; srv.requestTimeout = 30000; srv.keepAliveTimeout = 5000; srv.maxHeadersCount = 60; srv.maxConnections = 3000;
    return srv.listen(port, cb);
  };
  return app;
}
express.json = () => (req, res, next) => {
  if (req.method === 'GET' || req.method === 'DELETE') return next();
  let b = '';
  req.on('data', c => { b += c; if (b.length > (req.pathname === '/api/admin/upload' ? 4e6 : 2e5)) req.destroy(); });
  req.on('end', () => { try { req.body = b ? JSON.parse(b) : {}; } catch { return res.status(400).json({ error: 'invalid' }); } next(); });
};
express.static = dir => {
  dir = path.resolve(dir);
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    let p; try { p = decodeURIComponent(req.pathname); } catch { return next(); }
    const f = path.join(dir, p);
    if (f !== dir && !f.startsWith(dir + path.sep)) return next();
    if (p === '/' || /(^|[\\/])(index|admin)\.html$/.test(f)) return next(); // these pages are built by the server (SEO tags)
    fs.readFile(f, (e, d) => {
      if (e) return next();
      const type = MIME[path.extname(f)] || 'application/octet-stream';
      res.setHeader('Content-Type', type);
      if (p.startsWith('/uploads/')) res.setHeader('Cache-Control', 'public, max-age=604800');
      if (/^text|javascript|json|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) { res.setHeader('Content-Encoding', 'gzip'); res.setHeader('Vary', 'Accept-Encoding'); return res.end(zlib.gzipSync(d)); }
      res.end(d);
    });
  };
};
module.exports = express;
