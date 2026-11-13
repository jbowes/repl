// A single blog post
import React from 'react';

import Page from '../components/page';
import Head from '../components/head';
import Body from '../components/body';
import Main from '../components/main';
import Content from '../components/content';
import Footer from '../components/footer';

export default (props) => {
  const Link = (props) => <a href="/" className="brand-link">{ props.children }</a>
  return (
    <Page>
      <Head canonical={props.post.slug} title={props.post.header.title} description={props.post.header.description} type="article" pubdate={props.post.header.date} image={props.post.header.social} />
      <Body>
        <header className="masthead post-masthead">
          <div className="post-brand">
            <p className="brand-name"><Link>repl</Link></p>
          </div>
          <div className="post-tagline">
            <p className="tagline">
              1/128 scale realistic detail programming
            </p>
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
