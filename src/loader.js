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
import Link from './components/link';

const markdownToReactComponents = {
  a: Link,
  code: Code,
  codeblock: CodeBlock,
};

function* genFiles(dir) {
  const contents = readdirSync(dir);
  for (const file of contents) {
    const full = join(dir, file);
    if (statSync(full).isDirectory()) {
      yield* loadFiles(full);
    } else {
      yield full;
    }
  }
}


function codeblock(state, node) {
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
          code: codeblock,
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

    let slug = basename(file, extname(file));
    files.push({fs: file, ast: ast, header: header, slug: slug});
  }

  // Sort posts from newest to oldest.
  return files.sort((a, b) => a.header.date > b.header.date ? -1 : 1);
};
