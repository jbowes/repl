import path from 'path';
import webpack from 'webpack';
import StaticSitePlugin from './static-site-plugin';
import SitemapPlugin from 'sitemap-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const site = require('../src/');

export default {
  mode: 'production',
  target: 'node', // everything only runs during build
  entry: './src',
  output: {
    path: path.resolve(__dirname, '../public'),
    clean: true, // don't carry stale files over between builds
    filename: 'bundle.js',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, '../src')
      },
      {
        test: /\.(jpg|png)/,
        loader: 'file-loader',
        include: path.resolve(__dirname, '../src'),
        options: {
          name: 'assets/img-[hash:6].[ext]',
        },
      },
      {
        test: /\.(ico|otf|pdf)/,
        loader: 'file-loader',
        include: path.resolve(__dirname, '../src'),
        options: {
          name: '[name].[ext]',
        },
      }
    ],
  },
  plugins: [
    new StaticSitePlugin({ entry: 'main', paths: site.staticRoutes() }),
    new SitemapPlugin({ base: 'https://repl.ca', options: {
        skipgzip: true,
        lastmod: true, // default to "now",
        changefreq: 'weekly',
        priority: 0.8,
      }, 
      paths: site.staticRoutes().filter(x => x !== '/').map(x => `/${x}/`).concat([ { path: '/', priority: 0.5 } ] ),
    }),
    new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': JSON.stringify('production') } }),
    new CopyPlugin({
      patterns: [
        { from: 'static' }
      ],
    })
  ]
};
