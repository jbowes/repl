import React from 'react';
import ReactDOMServer from 'react-dom/server';

import Post from './templates/post';
import Index from './templates/index';

import { listFiles } from './loader';

let files; // memoized
function getFiles() {
  files = files || listFiles('./content');
  return files;
}

export default (locals, callback) => {
  for (let file of getFiles()) {
    if (file.slug != locals.path) continue;

    const html = ReactDOMServer.renderToStaticMarkup(
      <Post post={file}>
        { file.ast.contents.props.children }
      </Post>
    );
    return callback(null, html);
  }

  // else its an index page.
  const html = ReactDOMServer.renderToStaticMarkup(
    <Index posts={getFiles()}/>
  );
  return callback(null, html);
};

export function staticRoutes() {
  const files = getFiles();
  let routes = ['/'];
  for (const file of files) {
    routes.push(file.slug);
  }

  return routes;
};
