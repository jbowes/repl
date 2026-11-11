module.exports = {
  plugins: [
    require('postcss-import')(),
    require('@fullhuman/postcss-purgecss')({
      content: ['public/**/*.html'],
      // Theme switching is done with an html[data-theme] attribute set by
      // inline JS, which PurgeCSS can't see in the static HTML.
      safelist: { greedy: [/data-theme/] }
    }),
    require('cssnano')({
      discardComments: {removeAll: true}
    })
  ]
};
