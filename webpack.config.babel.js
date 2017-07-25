import webpack from 'webpack';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';

const site = require('./src/');

export default {
  entry: './src',
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        include: __dirname + '/src'
      },
      //{
        //test: /\.css/,
        //loader: ExtractTextPlugin.extract(
          //'css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss'
        //),
        //include: __dirname + '/src'
      //},
      {
        test: /\.(jpg|png)/,
        loader: 'file-loader?name=assets/img-[hash:6].[ext]',
        include: __dirname + '/src'
      },
      {
        test: /\.(ico|otf|pdf)/,
        loader: 'file-loader?name=[name].[ext]',
        include: __dirname + '/src/'
      }
    ],
  },
  plugins: [
    new StaticSiteGeneratorPlugin('main', site.staticRoutes, site),
    new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': JSON.stringify('production') } })
  ]
};
