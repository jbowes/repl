// src/css/style.css is hand-written and self-contained, so this only minifies
// it into public/css/style.css. lightningcss keeps the `/*!` licence banners
// (for tachyons and normalize.css, whose idioms some rules follow) on purpose.
const fs = require('fs');
const path = require('path');
const { transform } = require('lightningcss');

const from = path.join(__dirname, '..', 'src', 'css', 'style.css');
const to = path.join(__dirname, '..', 'public', 'css', 'style.css');

const { code } = transform({ filename: from, code: fs.readFileSync(from), minify: true });
fs.mkdirSync(path.dirname(to), { recursive: true });
fs.writeFileSync(to, code);
