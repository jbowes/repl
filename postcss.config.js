// `npm run css` only resolves @imports. Purging and minifying happen per page
// in scripts/inline-css.js, which needs the full, unpurged stylesheet.
module.exports = {
  plugins: [require('postcss-import')()]
};
