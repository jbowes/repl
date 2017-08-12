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
      <meta name="theme-color" content="#2d4247" />

      <link rel="stylesheet" href="/css/style.css" />

      <Analytics />
    </head>
  );
};
