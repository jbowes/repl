const test = require('node:test');
const assert = require('node:assert/strict');

const { minifyHtml } = require('../scripts/minify-html');

test('void elements lose their slash and camel case, but SVG keeps its slash', () => {
  assert.equal(minifyHtml('<meta charSet="utf-8"/><link rel="x" href="/a" />'), '<meta charset="utf-8"><link rel="x" href="/a">');
  assert.equal(minifyHtml('<svg><path d="M0 0" /></svg>'), '<svg><path d="M0 0"/></svg>');
});

test('escapes a browser does not need are dropped from text, and only those', () => {
  assert.equal(minifyHtml('<p>it&#x27;s &quot;a&quot; &gt; b &lt; c &amp; d</p>'), '<p>it\'s "a" > b &lt; c &amp; d</p>');
  assert.equal(minifyHtml('<a title="it&#x27;s &quot;x&quot;">'), '<a title="it\'s &quot;x&quot;">');
});

test('lists lose the space after each comma, and attribute values keep their quotes', () => {
  assert.equal(minifyHtml('<img srcSet="a 1w, b 2w" sizes="(a) 1px, 2px"/>'), '<img srcset="a 1w,b 2w" sizes="(a) 1px,2px">');
  assert.equal(minifyHtml('<meta property="og:image" content="https://x/y"/>'), '<meta property="og:image" content="https://x/y">');
});

test('end tags the parser infers are dropped, and no others', () => {
  assert.equal(minifyHtml('<div><p>a</p></div><p>b</p><p>c</p><ul><li>d</li><li>e</li></ul>'), '<div><p>a</div><p>b<p>c<ul><li>d<li>e</ul>');
  assert.equal(minifyHtml('<p><a href="/">a</a></p><span>b</span>'), '<p><a href="/">a</a></p><span>b</span>');
});

test('script and style contents are left alone', () => {
  const script = '<script type="application/ld+json">{"a":"it&#x27;s"}</script>';
  assert.equal(minifyHtml(script), script);
});

test('a simple style value loses its quotes, and a & before name= is not escaped', () => {
  assert.equal(minifyHtml('<svg style="max-width:800px" a="b">'), '<svg style=max-width:800px a="b">');
  assert.equal(minifyHtml('<a href="/x?a=1&amp;page=2&amp;b">'), '<a href="/x?a=1&page=2&amp;b">');
});
