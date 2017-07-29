import React from 'react';

import Link from './link';

import moment from 'moment';

export default (props) => {
  const slug = props.post.slug + '/';
  const More = (props) => <Link href={ slug }>{ props.children }</Link>
  const Title = (props) => <a className="link dim blue" href={ slug }>{ props.children }</a>
  return (
      <article className="pv3">
        <header>
          <h1 className="mv0 lh-solid f2-ns f3"><Title>{ props.post.header.title }</Title></h1>
          <date className="f6 fw3 lh-solid ttu">
            { moment(props.post.header.date).format('DD MMM YYYY') }
          </date>
        </header>
        <p>{ props.post.header.summary }</p>
        <footer className="ttu f6">
          <More>More ▶</More>
        </footer>
      </article>
  );
};
