import React from 'react';
import Favicons from './favicons';
import Analytics from './analytics';
import StructuredData from './structured-data';

export default (props) => {
  return (
    <head>
      <title>{ props.title ? props.title + " | repl" : "repl" }</title>

      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      <meta name="theme-color" content="#2d4247" />
      <meta name="author" content="James Bowes" />
      <meta name="twitter:site" content="@jrbowes" />
      <meta name="twitter:creator" content="@jrbowes" />
      <meta name="twitter:card" content="summary_large_image" />
     { props.description && 
        <>
          <meta name="description" content={props.description} />
          <meta property="og:description" content={props.description} />
        </>
     }

      <meta property="og:title" content={props.title} />
      <meta property="og:site_name" content="repl" />
      <meta property="og:url" content={"https://repl.ca/" + props.canonical + "/"} />
      <meta property="og:type" content={props.type || "website"} />      
      <meta property="og:image" content="https://repl.ca/social-mushroom.jpg" />   
      <meta name="twitter:image" content="https://repl.ca/social-mushroom.jpg" />   

      <link rel="canonical" href={ "https://repl.ca/" + props.canonical + "/"} />
    
      { props.type && <StructuredData title={props.title} pubdate={props.pubdate} /> }

      <link rel="stylesheet" href="/css/style.css" />

      <Favicons />
      <Analytics />
    </head>
  );
};
