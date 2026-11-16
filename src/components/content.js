import React from 'react';

import { isoDate, displayDate } from './date';

export default (props) => {
  return (
    <article className={['post-content', props.className].filter(Boolean).join(' ')}>
      <header>
        <h1 className="post-title">{ props.post.header.title }</h1>
        <time className="post-date" dateTime={ isoDate(props.post.header.date) }>
          { displayDate(props.post.header.date) }
        </time>
      </header>

      { props.children }
    </article>
  );
};
