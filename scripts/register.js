// Lets Node require the site's source, which is written as ES modules with JSX
// (src/). Each .js file under src/ is compiled to CommonJS by esbuild as it is
// loaded; everything else (node_modules, scripts) is left to Node.
const Module = require('module');
const path = require('path');
const { transformSync } = require('esbuild');

const SRC = path.join(__dirname, '..', 'src') + path.sep;
const load = Module._extensions['.js'];

Module._extensions['.js'] = function (module, filename) {
  if (!filename.startsWith(SRC)) return load(module, filename);

  const source = require('fs').readFileSync(filename, 'utf8');
  const { code } = transformSync(source, {
    loader: 'jsx',
    format: 'cjs',
    jsx: 'automatic',
    target: 'node' + process.versions.node,
    sourcemap: 'inline',
    sourcefile: filename,
  });
  module._compile(code, filename);
};
