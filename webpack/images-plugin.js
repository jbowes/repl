const { readFileSync } = require('fs');

// Emits the images that markdown posts reference (see src/images.js) into the
// output directory. `images` is a function returning a Map of output path to
// { file, width }, called at emit time so it sees everything the posts
// referenced. A `width` means a smaller copy: the file resized to that width,
// in its own format at `quality` (WebP and JPEG; PNG stays lossless), which
// also leaves no metadata behind.
class ImagesPlugin {
  constructor({ images, quality }) {
    this.images = images;
    this.quality = quality;
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
              const img = sharp(file).resize({ width, withoutEnlargement: true });
              const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
              if (ext === '.webp') img.webp({ quality: this.quality });
              else if (ext === '.jpg' || ext === '.jpeg') img.jpeg({ quality: this.quality, mozjpeg: true });
              data = await img.toBuffer();
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
