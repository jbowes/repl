module.exports = {
  plugins: [
    require('postcss-import')(),
    require('@fullhuman/postcss-purgecss')({
      content: ['public/**/*.html']
    }),
    require('cssnano')({
      discardComments: {removeAll: true}
    })
  ]
};
