// A single blog post
import React from 'react';

import Page from '../components/page';
import Head from '../components/head';
import Body from '../components/body';
import Main from '../components/main';
import Content from '../components/content';
import Footer from '../components/footer';

export default (props) => {
  const Link = (props) => <a href="/" className="link blue">{ props.children }</a>
  return (
    <Page>
      <Head canonical={props.post.slug} />
      <Body className="flex flex-column">
        <header className="ttu bb bw3 mh5-l mh4-m mh3 flex flex-column flex-row-ns">
          <div className="bb bw3 bb-0-ns br-ns bw3-ns flex-none ph3 pv2">
            <h1 className="f3 f2-l lh-solid tracked-tight mv0"><Link>repl</Link></h1>
          </div>
          <div className="flex-auto pl3 pl4-l pv3">
            <h1 className="f6 lh-solid mv0 fw5 tracked-mega">
              1/128 scale realistic detail programming
            </h1>
          </div>
        </header>

        <Main>
          <Content post={props.post}>
            { props.children }
          </Content>
        </Main>
        <Footer />
      </Body>
    </Page>
  );
};
