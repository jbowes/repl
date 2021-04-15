// Index of blog posts
import React from 'react';

import Page from '../components/page';
import Head from '../components/head';
import Body from '../components/body';
import Main from '../components/main';
import Extract from '../components/extract';
import Footer from '../components/footer';

export default (props) => {
  const Link = (props) => <a href="/" className="link blue">{ props.children }</a>
  props.posts.map(p => console.log(p.header.date));
  const extracts = props.posts.map(post => <li><Extract post={post} /></li>);
  return (
    <Page>
      <Head  canonical="/" title="index" description="Articles about web programming, distributed systems, and security, by James Bowes" />
      <Body>
        <header className="bb bw3 mh5-l mh4-m mh3 flex flex-column flex-row-l ttu">
          <div className="bb bw3 bb-0-l br-l bw3-l flex-none ph3 ph4-l pv3 flex flex-row flex-column-l flex-wrap">
            <h1 className="mv0 fw4 tracked-mega f6 pl2-l flex-none order-2 self-center self-start-l"><Link>James Bowes</Link></h1>
            <h1 className="f3 f-subheadline-l lh-solid tracked-tight mv0 flex-auto order-1 order-last-l"><Link>repl</Link></h1>
          </div>
          <div className="flex-auto pl3 pl5-l pv3 tc-m">
            <h1 className="f1 f-headline-ns lh-solid tracked mv0">website</h1>
            <h1 className="f6 lh-solid mv0 fw5 tracked-mega pl1 pl3-ns nowrap-ns">
              1/128 scale realistic detail programming
            </h1>
          </div>
        </header>

        <Main>
          <ul className="list pl0">
            { extracts }
          </ul>
        </Main>
        <Footer />
      </Body>
    </Page>
  );
};
