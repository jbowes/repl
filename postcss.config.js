// src/css/style.css is hand-written and self-contained, so `npm run css` only
// minifies it. cssnano's default preset keeps the `/*!` licence banners (for
// tachyons and normalize.css, whose idioms some rules follow) on purpose.
module.exports = {
  plugins: [require('cssnano')()]
};
