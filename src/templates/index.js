// Index of blog posts
import React from 'react';

import Page from '../components/page';
import Head from '../components/head';
import Body from '../components/body';
import Main from '../components/main';
import Extract from '../components/extract';
import Footer from '../components/footer';

export default (props) => {
  const Link = (props) => <a href="/" className="brand-link">{ props.children }</a>
  const extracts = props.posts.map(post => <li><Extract post={post} /></li>);
  return (
    <Page>
      <Head canonical="/" description="Articles about web programming, distributed systems, and security, by James Bowes" />
      <Body>
        <header className="masthead home-masthead">
          <div className="home-brand">
            <p className="home-byline"><Link>James Bowes</Link></p>
            <h1 className="home-title"><Link>repl</Link></h1>
          </div>
          <div className="home-hero">
            <div className="hero-name">website</div>
            <p className="tagline">
              1/128 scale realistic detail programming
            </p>
          </div>
        </header>

        <Main>
          <ul className="post-list">
            { extracts }
          </ul>
        </Main>
        <Footer />
      </Body>
    </Page>
  );
};
