import React from 'react';

// Affiliate links to Amazon are marked sponsored, as search engines ask.
const AFFILIATE = /^https?:\/\/([^/]*\.)?amazon\.[a-z.]+\//i;

export default (props) => {
  const rel = AFFILIATE.test(props.href || '') ? 'sponsored noopener' : undefined;
  return (
    <a href={ props.href } className="text-link" rel={ rel }>{ props.children }</a>
  );
};
