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
        { file.ast.result.props.children }
      </Post>
    );

    // The doctype can't be written in JSX
    return callback(null, '<!doctype html>'+html);
  }

  // else its an index page.
  const html = ReactDOMServer.renderToStaticMarkup(
    <Index posts={getFiles()}/>
  );

  // The doctype can't be written in JSX
  return callback(null, '<!doctype html>'+html);
};

export function staticRoutes() {
  const files = getFiles();
  let routes = ['/'];
  for (const file of files) {
    routes.push(file.slug);
  }

  return routes;
};
