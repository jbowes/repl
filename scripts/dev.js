// `npm run dev`: builds the site, serves public/ on http://localhost:5000, and
// rebuilds when src/, content/ or static/ change. Reload the page to see it.
const { spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const PORT = process.env.PORT || 5000; // macOS's AirPlay Receiver takes 5000
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.xml': 'application/xml',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.txt': 'text/plain',
};

// A fresh process each time, so changed modules are never served from cache.
function rebuild() {
  for (const script of ['build.js', 'minify-css.js']) {
    const { status } = spawnSync(process.execPath, [path.join(__dirname, script)], { stdio: 'inherit' });
    if (status) return console.error(`${script} failed`);
  }
  console.log('built');
}

rebuild();

let timer;
for (const dir of ['src', 'content', 'static']) {
  fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 100);
  });
}

http.createServer((req, res) => {
  let file = path.join(PUBLIC, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(PUBLIC)) file = PUBLIC;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404).end('not found');
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
