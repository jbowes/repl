// Trims what React's renderToStaticMarkup writes without changing how a page
// reads: entity escapes a browser does not need, the `/>` on void elements,
// camel-cased attribute names, the spaces after commas in lists, and the end
// tags HTML lets a parser infer (`</p>` before a block or its parent's end,
// `</li>` before the next item or the list's end). Tags and
// text are handled apart so a `'` in a paragraph is never mistaken for markup.
// React escapes `<` and `>` in text and attribute values, so a tag always ends
// at the first `>`. The contents of <script> and <style> are left alone.
const NODE = /<[^>]*>|[^<]+/g;
const VOID = /^<(?:meta|link|img|source|br|hr|input)\b/;
const CAMEL = / (charSet|srcSet|dateTime)=/g;
const STYLE = / style="([^\s"'=<>`]*[^\s"'=<>`/])"/;
const LIST = / (srcset|sizes)="([^"]*)"/g;

// Text needs no escape for a quote or `>`, nor does an attribute for a single quote.
const text = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&gt;/g, '>');

function tag(t) {
  // `&name=` is never read as a character reference in an attribute value
  t = t.replace(/&#x27;/g, "'").replace(/&amp;(?=\w+=)/g, '&').replace(STYLE, ' style=$1').replace(CAMEL, (_, name) => ` ${name.toLowerCase()}=`);
  t = t.replace(LIST, (_, name, value) => ` ${name}="${value.replace(/, /g, ',')}"`);
  if (/^<meta\b[^>]*\bname="viewport"/.test(t)) t = t.replace(/, /g, ',');
  // inline SVG is not HTML void elements: it keeps its `/>`
  t = t.replace(/\s*\/>$/, VOID.test(t) ? '>' : '/>');
  return t;
}

// `</p>` is implied by the end of its parent or by one of these starting.
const P_END = /<\/p>(?=<\/(?:div|article|section|header|footer|main|aside|blockquote|li|dd|td|th|body)>|<(?:p|div|ul|ol|dl|pre|table|blockquote|section|article|aside|header|footer|figure|hr|h[1-6])[\s>])/g;
const LI_END = /<\/li>(?=<li[\s>]|<\/(?:ul|ol)>)/g;

function minifyHtml(html) {
  let raw = false; // inside <script> or <style>
  const out = html.replace(NODE, (node) => {
    if (node[0] !== '<') return raw ? node : text(node);
    if (/^<(?:script|style)\b/.test(node)) raw = true;
    else if (/^<\/(?:script|style)\b/.test(node)) raw = false;
    return tag(node);
  });
  return out.replace(P_END, '').replace(LI_END, '');
}

module.exports = { minifyHtml };
