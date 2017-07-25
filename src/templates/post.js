// A single blog post
import React from 'react';

import Page from '../components/page';
import Head from '../components/head';
import Content from '../components/content';

export default (props) => {
  return (
    <Page>
      <Head />
      <Content>
        <p>nothing here</p>
      </Content>
    </Page>
  );
};

