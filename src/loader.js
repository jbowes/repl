import { createElement } from 'react';

import { readdirSync, statSync, readFileSync } from 'fs';
import { basename, extname, join } from 'path';

import remark from 'remark';
import frontmatter from 'remark-frontmatter';
import remark2rehype from 'remark-rehype';
import rehype2react from 'rehype-react';
import { load } from 'js-yaml';
import u from 'unist-builder';

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


function codeblock(h, node) {
  var value = node.value ? node.value + '\n' : '';
  var props = {}
  var code

  if (node.lang) {
    props.className = ['language-' + node.lang]
  }

  code = h(node, 'codeblock', props, [u('text', value)])

  if (node.meta) {
    code.data = {meta: node.meta}
  }

  return code;
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
        header = load(node.children[0].value);
        return node;
      })
      .use(remark2rehype, {
        handlers: {
          code: codeblock,
        },
      })
      .use(rehype2react, {
        createElement: createElement,
        components: markdownToReactComponents,        
      })
      .freeze()
      .processSync(contents);

    if (header.draft) continue;

    let slug = basename(file, extname(file));
    files.push({fs: file, ast: ast, header: header, slug: slug});
  }
  // Sort posts from oldest to newest.
  // XXX: To be strictly correct this should parse as date times first.
  console.log(files[0].header.date);
  files.sort((a, b) => a.header.date < b.header.date);
  return files;
};
