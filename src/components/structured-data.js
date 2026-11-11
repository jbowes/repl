import React from 'react';

// Emits schema.org BlogPosting JSON-LD for a post.
export default (props) => {
  const data = {
    '@context': 'https://schema.org/',
    '@type': 'BlogPosting',
    headline: props.title,
    datePublished: props.pubdate,
    author: { '@type': 'Person', name: 'James Bowes' },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
