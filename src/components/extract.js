import React from 'react';

import moment from 'moment';

export default (props) => {
  const slug = props.post.slug + '/';
  const Title = (props) => <a className="link dim blue" href={ slug }>{ props.children }</a>
  return (
      <article className="pv3">
        <header>
          <h2 className="mv0 lh-solid f2-ns f3"><Title>{ props.post.header.title }</Title></h2>
          <time className="f6 fw3 lh-solid ttu" dateTime={ moment(props.post.header.date).format('YYYY-MM-DD') }>
            { moment(props.post.header.date).format('DD MMM YYYY') }
          </time>
        </header>
        <p>{ props.post.header.summary }</p>
        <footer className="ttu f6">
          <a className="red link dim" href={ slug }>
            More<span className="clip"> about { props.post.header.title }</span> <span aria-hidden="true">&gt;</span>
          </a>
        </footer>
      </article>
  );
};
