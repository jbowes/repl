// Renders one schematic source file to SVG for previewing.
//   node scripts/render-schematic.js <input.yaml> [output.svg] [--view plan|front|side|iso[,..]] [--alt "text"]
// Without an output path the SVG is written to stdout.
const fs = require('fs');

const { renderSchematic } = require('../src/schematic/render');

const args = process.argv.slice(2);
const take = (flag) => {
  const at = args.indexOf(flag);
  return at === -1 ? undefined : args.splice(at, 2)[1];
};
const alt = take('--alt');
const view = take('--view');

const [input, output] = args;
if (!input) {
  console.error('usage: node scripts/render-schematic.js <input.yaml> [output.svg] [--view plan|front|side|iso[,..]] [--alt "text"]');
  process.exit(2);
}

try {
  const svg = renderSchematic(fs.readFileSync(input, 'utf8'), { alt, view, standalone: true });
  if (output) fs.writeFileSync(output, svg + '\n');
  else process.stdout.write(svg + '\n');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
