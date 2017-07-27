// Index of blog posts
import React from 'react';

import Page from '../components/page';
import Head from '../components/head';
import Extract from '../components/extract';
import Footer from '../components/footer';

export default (props) => {
  const extracts = props.posts.map(post => <li><Extract post={post} /></li>);
  return (
    <Page>
      <Head />
      <body className="near-black bg min-vh-100 flex flex-column helvetica">
        <header className="title bb bw3 mh5-ns mh3 flex">
          <div className="br bw3 flex-none ph4 pv3">
            <h4 className="ttu mv0 fw4 tracked-mega">James Bowes</h4>
            <h1 className="f-headline lh-solid ttu tracked-tight mv0">repl</h1>
          </div>
        </header>
        <main className="w-90 w-two-thirds-ns center ph3-ns">
          <ul>
            { extracts }
          </ul>
        </main>
        <Footer />
      </body>
    </Page>
  );
};
