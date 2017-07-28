module.exports = {
  plugins: [
    require('postcss-import')(),
    require('cssnano')({
      discardComments: {removeAll: true}
    }),
    require('postcss-uncss')({
      html: ['public/**/*.html']
    })
  ]
};
