import webpack from 'webpack';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const site = require('./src/');

export default {
  target: 'node', // everything only runs during build
  entry: './src',
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        include: __dirname + '/src'
      },
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
    new StaticSiteGeneratorPlugin('main', site.staticRoutes(), site),
    new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': JSON.stringify('production') } }),
    new CopyPlugin([
      { from: 'static' }
    ])
  ]
};
