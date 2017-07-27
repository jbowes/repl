import React from 'react';
import Analytics from './analytics';

export default (props) => {
  return (
    <head>
      <title>repl</title>

      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />

      <link rel="stylesheet" href="https://unpkg.com/tachyons@4.6.1/css/tachyons.min.css" />
      <link rel="stylesheet" href="/css/style.css" />

      <Analytics />
    </head>
  );
};
