// Renders one diagram source file to SVG for previewing.
//   node scripts/render-diagram.js <input> [output.svg] [--alt "text"]
// Without an output path the SVG is written to stdout.
const fs = require('fs');

const { renderDiagram } = require('../src/diagram/render');

const args = process.argv.slice(2);
let alt;
const altAt = args.indexOf('--alt');
if (altAt !== -1) alt = args.splice(altAt, 2)[1];

const [input, output] = args;
if (!input) {
  console.error('usage: node scripts/render-diagram.js <input> [output.svg] [--alt "text"]');
  process.exit(2);
}

const svg = renderDiagram(fs.readFileSync(input, 'utf8'), { alt });
if (output) fs.writeFileSync(output, svg + '\n');
else process.stdout.write(svg + '\n');
