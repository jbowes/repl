import React from 'react';
import Favicons from './favicons';
import Analytics from './analytics';

export default (props) => {
  return (
    <head>
      <title>{ props.title ? "repl: " + props.title : "repl" }</title>

      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      <meta name="theme-color" content="#2d4247" />
     { props.description && 
        <meta name="description" content="{props.description}" />
     }

      <link rel="canonical" href={ "https://repl.ca/" + props.canonical + "/"} />
    
      <link rel="stylesheet" href="/css/style.css" />

      <Favicons />
      <Analytics />
    </head>
  );
};
