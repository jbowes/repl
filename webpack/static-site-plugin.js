const path = require('path');
const evaluate = require('eval');

// Renders each route with the entry bundle's default export `(locals, callback)`
// and emits the result as `<route>/index.html`, then drops the bundle so the
// build-time renderer isn't deployed. Minimal replacement for
// static-site-generator-webpack-plugin, which pulls in a vulnerable cheerio.
class StaticSitePlugin {
  constructor({ entry = 'main', paths, locals }) {
    this.entry = entry;
    this.paths = paths;
    this.locals = locals;
  }

  apply(compiler) {
    const { webpack } = compiler;
    compiler.hooks.thisCompilation.tap('StaticSitePlugin', compilation => {
      compilation.hooks.processAssets.tapPromise(
        { name: 'StaticSitePlugin', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE },
        async () => {
          try {
            const bundle = compilation.getAsset(`${this.entry}.js`) || compilation.getAsset('bundle.js');
            if (!bundle) throw new Error('StaticSitePlugin: entry bundle not found');

            let render = evaluate(bundle.source.source().toString(), bundle.name, {}, true);
            render = render.default || render;
            if (typeof render !== 'function') {
              throw new Error('StaticSitePlugin: entry must export a function (is output.libraryTarget "umd"?)');
            }

            for (const route of this.paths) {
              const html = await new Promise((resolve, reject) =>
                render({ path: route, ...this.locals }, (err, out) => (err ? reject(err) : resolve(out)))
              );
              compilation.emitAsset(toAssetName(route), new webpack.sources.RawSource(html));
            }

            // Only needed to render; nothing in the pages loads it. Deleting it
            // before the minify stage also means no bundle.js.LICENSE.txt.
            compilation.deleteAsset(bundle.name);
          } catch (err) {
            compilation.errors.push(err);
          }
        }
      );
    });
  }
}

function toAssetName(route) {
  const name = route.replace(/^[/\\]/, '');
  return /\.html?$/i.test(name) ? name : path.join(name, 'index.html');
}

module.exports = StaticSitePlugin;
