import webpack from 'webpack';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';
import SitemapPlugin from 'sitemap-webpack-plugin';
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
        loader: 'file-loader',
        include: __dirname + '/src',
        options: {
          name: 'assets/img-[hash:6].[ext]',
        },
      },
      {
        test: /\.(ico|otf|pdf)/,
        loader: 'file-loader',
        include: __dirname + '/src/',
        options: {
          name: '[name].[ext]',
        },
      }
    ],
  },
  plugins: [
    new StaticSiteGeneratorPlugin('main', site.staticRoutes(), site),
    new SitemapPlugin({ base: 'https://repl.ca', paths: [ { path: '/', changefreq: 'weekly', priority: '0.5' } ] }),
    new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': JSON.stringify('production') } }),
    new CopyPlugin({
      patterns: [
        { from: 'static' }
      ],
    })
  ]
};
