import React from 'react';
import Favicons from './favicons';
import StructuredData from './structured-data';

const SITE = "https://repl.ca/";

export default (props) => {
  // The home page passes canonical "/"; posts pass their slug.
  const slug = (props.canonical || "").replace(/^\/+|\/+$/g, "");
  const url = slug ? SITE + slug + "/" : SITE;

  return (
    <head>
      <title>{ props.title ? props.title + " | repl" : "repl" }</title>

      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      <meta name="theme-color" content="#2d4247" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#0d1315" media="(prefers-color-scheme: dark)" />
      <meta name="author" content="James Bowes" />
      <meta name="twitter:card" content="summary_large_image" />
     { props.description && 
        <>
          <meta name="description" content={props.description} />
          <meta property="og:description" content={props.description} />
        </>
     }

      <meta property="og:title" content={props.title || "repl"} />
      <meta property="og:site_name" content="repl" />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={props.type || "website"} />      
      <meta property="og:image" content="https://repl.ca/social-mushroom.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="627" />
      <meta property="og:image:alt" content="A yellow mushroom with white flecks on its cap, growing from the forest floor" />

      <link rel="canonical" href={url} />
    
      { props.type && <StructuredData title={props.title} pubdate={props.pubdate} /> }

      <link rel="stylesheet" href="/css/style.css" />

      <Favicons />
    </head>
  );
};
