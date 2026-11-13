const { readFileSync } = require('fs');

// Emits the images that markdown posts reference (see src/images.js) into the
// output directory. `images` is a function returning a Map of output path to
// { file, width }, called at emit time so it sees everything the posts
// referenced. A `width` means a smaller copy: the file resized to that width,
// in its own format, which also leaves no metadata behind.
class ImagesPlugin {
  constructor({ images }) {
    this.images = images;
  }

  apply(compiler) {
    const { webpack } = compiler;
    compiler.hooks.thisCompilation.tap('ImagesPlugin', compilation => {
      compilation.hooks.processAssets.tapPromise(
        { name: 'ImagesPlugin', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        async () => {
          let sharp; // only loaded when something needs resizing
          for (const [name, { file, width }] of this.images()) {
            let data;
            if (width) {
              sharp = sharp || require('sharp');
              data = await sharp(file).resize({ width, withoutEnlargement: true }).toBuffer();
            } else {
              data = readFileSync(file);
            }
            compilation.emitAsset(name, new webpack.sources.RawSource(data));
            compilation.fileDependencies.add(file);
          }
        }
      );
    });
  }
}

module.exports = ImagesPlugin;
