// The page head: social preview image and structured data (src/components).
const test = require('node:test');
const assert = require('node:assert/strict');
const { default: register } = require('@babel/register');

register({ only: [/\/src\//] });

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Head = require('../src/components/head').default;

const head = (props) => renderToStaticMarkup(React.createElement(Head, props));
const jsonld = (html) => JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/.exec(html)[1]);

const post = { canonical: 'a-post', title: 'A post', description: 'About it.', type: 'article', pubdate: '2026-11-13T10:00:00-04:00' };
const image = { src: '/images/photo-ab12cd34.webp', width: 1400, height: 695, alt: 'A photo of it' };

test('a post without an image keeps the site preview image', () => {
  const html = head(post);
  assert.match(html, /property="og:image" content="https:\/\/repl\.ca\/social-mushroom\.jpg"/);
  assert.match(html, /property="og:image:width" content="1200"/);
  assert.match(html, /og:image:alt" content="A yellow mushroom/);
  const data = jsonld(html);
  assert.equal(data.image, undefined);
  assert.equal(data.description, 'About it.');
});

test('a post with an image uses it, with its size and alt text, and lists it in the JSON-LD', () => {
  const html = head({ ...post, image });
  assert.match(html, /property="og:image" content="https:\/\/repl\.ca\/images\/photo-ab12cd34\.webp"/);
  assert.match(html, /property="og:image:width" content="1400"/);
  assert.match(html, /property="og:image:height" content="695"/);
  assert.match(html, /og:image:alt" content="A photo of it"/);
  assert.doesNotMatch(html, /social-mushroom/);
  assert.deepEqual(jsonld(html), {
    '@context': 'https://schema.org/',
    '@type': 'BlogPosting',
    headline: 'A post',
    datePublished: post.pubdate,
    author: { '@type': 'Person', name: 'James Bowes' },
    description: 'About it.',
    image: 'https://repl.ca/images/photo-ab12cd34.webp',
  });
});

test('pages that are not posts have no structured data', () => {
  assert.doesNotMatch(head({ canonical: '/', description: 'Home' }), /application\/ld\+json/);
});
