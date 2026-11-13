// The shared link component.
const test = require('node:test');
const assert = require('node:assert/strict');
const { default: register } = require('@babel/register');

register({ only: [/\/src\//] });

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Link = require('../src/components/link').default;

const html = (href) => renderToStaticMarkup(React.createElement(Link, { href }, 'x'));

test('links to Amazon are marked sponsored', () => {
  assert.match(html('https://www.amazon.com/s?k=a&tag=repl03-20'), /rel="sponsored noopener"/);
  assert.match(html('https://amazon.co.uk/dp/B000000000'), /rel="sponsored noopener"/);
});

test('other links are left alone', () => {
  assert.doesNotMatch(html('https://example.com/amazon.com/'), /rel=/);
  assert.doesNotMatch(html('/another-post/'), /rel=/);
  assert.doesNotMatch(html('https://notamazon.com/'), /rel=/);
});
