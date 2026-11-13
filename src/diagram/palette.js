// The code-highlighting palette as plain colours, for SVG presentation
// attributes. The page styles diagrams through classes and the theme's CSS
// variables (src/css/style.css), which override these; the attributes are what
// is left where a page's CSS is not, such as Chrome's reading mode, a feed
// reader, or the SVG opened on its own. They match the dark code panel.
const PALETTE = {
  blue: '#92b0c2',
  red: '#f88a87',
  green: '#8cc298',
  orange: '#f88f00',
  yellow: '#bab215',
};
const PANEL = { fg: '#d8d4bd', bg: '#0d1315' };

// The colour a group's `currentColor` takes without CSS: its palette colour,
// and the operator blue for edges.
function groupColour(cls, style) {
  if (style) return PALETTE[style.color];
  if (cls === 'dg-edge') return PALETTE.blue;
  return undefined;
}

module.exports = { PALETTE, PANEL, groupColour };
