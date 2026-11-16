import React from 'react';

import { isoDate, displayDate } from './date';

export default (props) => {
  const slug = props.post.slug + '/';
  const Title = (props) => <a className="title-link" href={ slug }>{ props.children }</a>
  return (
      <article className="extract">
        <header>
          <h2 className="extract-title"><Title>{ props.post.header.title }</Title></h2>
          <time className="post-date" dateTime={ isoDate(props.post.header.date) }>
            { displayDate(props.post.header.date) }
          </time>
        </header>
        <p>{ props.post.header.summary }</p>
        <footer className="extract-more">
          <a className="text-link" href={ slug }>
            More<span className="visually-hidden"> about { props.post.header.title }</span> <span aria-hidden="true">&gt;</span>
          </a>
        </footer>
      </article>
  );
};
