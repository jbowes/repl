const { readFileSync } = require('fs');

// Emits the images that markdown posts reference (see src/images.js) into the
// output directory. `images` is a function returning a Map of output path to
// source file, called at emit time so it sees everything the posts referenced.
class ImagesPlugin {
  constructor({ images }) {
    this.images = images;
  }

  apply(compiler) {
    const { webpack } = compiler;
    compiler.hooks.thisCompilation.tap('ImagesPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        { name: 'ImagesPlugin', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        () => {
          for (const [name, file] of this.images()) {
            compilation.emitAsset(name, new webpack.sources.RawSource(readFileSync(file)));
            compilation.fileDependencies.add(file);
          }
        }
      );
    });
  }
}

module.exports = ImagesPlugin;
