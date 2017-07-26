// Index of blog posts
import React from 'react';

import Page from '../components/page';
import Head from '../components/head';
import Extract from '../components/extract';

export default (props) => {
  const extracts = props.posts.map(post => <li><Extract post={post} /></li>);
  return (
    <Page>
      <Head />
      <body>
        <ul>
          { extracts }
        </ul>
      </body>
    </Page>
  );
};
