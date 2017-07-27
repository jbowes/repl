// A single blog post
import React from 'react';

import Page from '../components/page';
import Head from '../components/head';
import Content from '../components/content';
import Footer from '../components/footer';

export default (props) => {
  return (
    <Page>
      <Head />
      <body className="near-black bg min-vh-100 flex flex-column helvetica">
        <header className="title bb bw3 mh5-ns mh3 flex">
          <div className="br bw3 flex-none ph3 pv2">
            <h1 className="f2 lh-solid ttu tracked-tight mv0">repl</h1>
          </div>
          <div className="flex-auto pl4 pv3">
            <h1 className="f6 lh-solid ttu mv0 fw5 tracked-mega">
              1/128 scale realistic detail programming
            </h1>
          </div>
        </header>

        <main className="w-90 w-two-thirds-ns center ph3-ns">
            <Content title={props.title}>
               { props.children }
            </Content>
        </main>
        <Footer />
      </body>
    </Page>
  );
};
