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
        <header className="title bb bw3 mh5-l mh3 flex flex-column flex-row-l">
          <div className="bb bw3 bb-0-l br-l bw3-l flex-none ph3 ph4-l pv3 flex flex-row flex-column-l flex-wrap">
            <h1 className="ttu mv0 fw4 tracked-mega f6 pl2-l flex-none order-2 self-center self-start-l">James Bowes</h1>
            <h1 className="f3 f-subheadline-l lh-solid ttu tracked-tight mv0 flex-auto order-1 order-last-l">repl</h1>
          </div>
          <div className="flex-auto pl3 pl5-l pv3 tc-m">
            <h1 className="f1 f-headline-ns lh-solid ttu tracked mv0">website</h1>
            <h1 className="f6 lh-solid ttu mv0 fw5 tracked-mega pl1 pl3-ns nowrap-ns">
              1/128 scale realistic detail programming
            </h1>
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
