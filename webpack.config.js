// @babel/register 8 is ESM-only, so webpack-cli can no longer load a
// *.babel.js config through it. Register Babel here (the source and the real
// config use JSX / ES modules), then hand off to the actual config.
const { default: register } = require('@babel/register');

register({ only: [/\/src\//, /\/webpack\/config\.js$/] });

module.exports = require('./webpack/config').default;
