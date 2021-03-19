import { readdirSync, statSync, readFileSync } from 'fs';
import { basename, extname, join } from 'path';

import remark from 'remark';
import frontmatter from 'remark-frontmatter';
import react from 'remark-react';
import { safeLoad } from 'js-yaml';

import Link from './components/link';

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

export function listFiles(dir) {
  let files = [];
  for (const file of genFiles(dir)) {
    let header;
    const contents = readFileSync(file);
    const ast = remark()
      .use(frontmatter, ['yaml'])
      .use(() => node => {
        header = safeLoad(node.children[0].value);
        return node;
      })
      .use(react, {
        remarkReactComponents: {
          a: Link
        }
      })
      .freeze()
      .processSync(contents);

    if (header.draft) continue;

    let slug = basename(file, extname(file));
    files.push({fs: file, ast: ast, header: header, slug: slug});
  }
  // Sort posts from oldest to newest. To strictly be correct this should parse as date times first.
  files.sort((a, b) => a.header.date < b.header.date);
  return files;
};
