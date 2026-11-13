import React from 'react';
import Favicons from './favicons';
import StructuredData from './structured-data';

const SITE = "https://repl.ca/";

const DEFAULT_IMAGE = {
  url: SITE + "social-mushroom.jpg",
  width: 1200,
  height: 627,
  alt: "A yellow mushroom with white flecks on its cap, growing from the forest floor",
};

// Prefetch same-site pages on hover/press; skip files (/sitemap.xml, images).
const SPECULATION_RULES = JSON.stringify({
  prefetch: [{
    where: { and: [
      { href_matches: "/*" },
      { not: { href_matches: "/*.*" } },
      { not: { selector_matches: "[rel~=nofollow]" } },
    ] },
    eagerness: "moderate",
  }],
});

export default (props) => {
  // The home page passes canonical "/"; posts pass their slug.
  const slug = (props.canonical || "").replace(/^\/+|\/+$/g, "");
  const url = slug ? SITE + slug + "/" : SITE;

  // A post can set its own preview image; everything else gets the site's.
  const image = props.image
    ? { url: SITE + props.image.src.replace(/^\//, ""), width: props.image.width, height: props.image.height, alt: props.image.alt }
    : DEFAULT_IMAGE;

  return (
    <head>
      <title>{ props.title ? props.title + " | repl" : "repl" }</title>

      <meta charSet="utf-8" />
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
      <meta property="og:image" content={image.url} />
      <meta property="og:image:width" content={image.width} />
      <meta property="og:image:height" content={image.height} />
      <meta property="og:image:alt" content={image.alt} />

      <link rel="canonical" href={url} />
    
      { props.type && <StructuredData title={props.title} pubdate={props.pubdate} description={props.description} image={props.image && image.url} /> }

      <link rel="stylesheet" href="/css/style.css" />

      <script type="speculationrules" dangerouslySetInnerHTML={{ __html: SPECULATION_RULES }} />

      <Favicons />
    </head>
  );
};
