import React from 'react';
import ReactDOMServer from 'react-dom/server';

export default (locals, callback) => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <p>
    nothing here.
    </p>
  );
  callback(null, html);
};

export const staticRoutes =  ['/'];
