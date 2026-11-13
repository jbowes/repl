import path from 'path';
import webpack from 'webpack';
import StaticSitePlugin from './static-site-plugin';
import ImagesPlugin from './images-plugin';
import SitemapPlugin from 'sitemap-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const site = require('../src/');
const { emittedImages, COPY_QUALITY, AVIF_QUALITY } = require('../src/images');

export default {
  mode: 'production',
  target: 'node', // everything only runs during build
  optimization: {
    // Webpack minifies the emitted HTML in production, and by default drops the
    // quotes around any attribute value that is legal without them. That is
    // valid HTML, but some link-preview parsers (WhatsApp's) skip an unquoted
    // og:image, so keep the quotes.
    minimize: { html: { normalizeAttributeQuotes: false } },
  },
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
    new ImagesPlugin({ images: emittedImages, quality: COPY_QUALITY, avifQuality: AVIF_QUALITY }),
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
