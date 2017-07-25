import React from 'react';
import ReactDOMServer from 'react-dom/server';

import Post from './templates/post';

export default (locals, callback) => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <Post />
  );
  callback(null, html);
};

export const staticRoutes =  ['/'];
