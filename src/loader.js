import { Fragment } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

import { readdirSync, statSync, readFileSync } from 'fs';
import { basename, extname, join } from 'path';

import { remark } from 'remark';
import frontmatter from 'remark-frontmatter';
import remark2rehype from 'remark-rehype';
import rehype2react from 'rehype-react';
import { load, YAML11_SCHEMA } from 'js-yaml';
import { u } from 'unist-builder';

import Code from './components/code';
import CodeBlock from './components/codeblock';
import Diagram from './components/diagram';
import Link from './components/link';
import { renderDiagram } from './diagram/render';
import { renderSchematic } from './schematic/render';
import { schematicSource } from './schematic/source';
import { isLocal, processImage } from './images';

const markdownToReactComponents = {
  a: Link,
  code: Code,
  codeblock: CodeBlock,
  diagram: Diagram,
};

function* genFiles(dir) {
  const contents = readdirSync(dir);
  for (const file of contents) {
    const full = join(dir, file);
    if (statSync(full).isDirectory()) {
      yield* genFiles(full);
    } else if (extname(full) === '.md') {
      // content/images/ and friends are not posts.
      yield full;
    }
  }
}


function codeblock(state, node, file) {
  // ```diagram alt="..." [style="sketch"] blocks become an SVG drawn at build
  // time.
  if (node.lang === 'diagram') {
    const alt = /\balt="([^"]*)"/.exec(node.meta || '');
    const style = /\bstyle="([^"]*)"/.exec(node.meta || '');
    const svg = renderDiagram(node.value, { alt: alt && alt[1], style: style && style[1] });
    const result = {
      type: 'element',
      tagName: 'diagram',
      properties: {},
      children: [u('text', svg)],
    };
    state.patch(node, result);
    return state.applyData(node, result);
  }

  // ```schematic alt="..." [view="iso"] [src="file.yaml"] blocks: plan and
  // isometric drawings of physical objects, drawn at build time in the same
  // panel as diagrams. src reads the source from a file beside the post.
  if (node.lang === 'schematic') {
    const alt = /\balt="([^"]*)"/.exec(node.meta || '');
    const view = /\bviews?="([^"]*)"/.exec(node.meta || '');
    const source = schematicSource(node.value, node.meta, file);
    const svg = renderSchematic(source, { alt: alt && alt[1], view: view && view[1] });
    const result = {
      type: 'element',
      tagName: 'diagram',
      properties: {},
      children: [u('text', svg)],
    };
    state.patch(node, result);
    return state.applyData(node, result);
  }

  const value = node.value ? node.value + '\n' : '';
  const props = {};

  if (node.lang) {
    props.className = ['language-' + node.lang];
  }

  const result = {
    type: 'element',
    tagName: 'codeblock',
    properties: props,
    children: [u('text', value)],
  };

  if (node.meta) {
    result.data = { meta: node.meta };
  }

  state.patch(node, result);
  return state.applyData(node, result);
}

// ![alt](path) with a local path becomes an <img> carrying its size and either
// an inlined data: URI or a hashed file; remote URLs pass through untouched.
function image(file) {
  return (state, node) => {
    const props = isLocal(node.url)
      ? processImage(node.url, node.alt, file)
      : { src: node.url, alt: node.alt };
    props.className = ['post-image'];
    if (node.title) props.title = node.title;

    const result = { type: 'element', tagName: 'img', properties: props, children: [] };
    state.patch(node, result);
    return state.applyData(node, result);
  };
}

export function listFiles(dir) {
  let files = [];
  for (const file of genFiles(dir)) {
    let header;
    const contents = readFileSync(file);
    const ast = remark()
      .use({ settings: { fences: true } })
      .use(frontmatter, ['yaml'])
      .use(() => node => {
        // js-yaml 5 no longer parses timestamps by default; YAML 1.1 does.
        header = load(node.children[0].value, { schema: YAML11_SCHEMA });
        return node;
      })
      .use(remark2rehype, {
        handlers: {
          code: (state, node) => codeblock(state, node, file),
          image: image(file),
        },
      })
      .use(rehype2react, {
        Fragment,
        jsx,
        jsxs,
        components: markdownToReactComponents,
      })
      .freeze()
      .processSync(contents);

    if (header.draft) continue;

    // YAML `|` block scalars keep their line breaks, which would end up as
    // newlines (`&#10;`) in the description meta tags.
    if (typeof header.description === 'string') {
      header.description = header.description.replace(/\s+/g, ' ').trim();
    }

    let slug = basename(file, extname(file));
    files.push({fs: file, ast: ast, header: header, slug: slug});
  }

  // Sort posts from newest to oldest.
  return files.sort((a, b) => a.header.date > b.header.date ? -1 : 1);
};
