import React from 'react';

import moment from 'moment';

export default (props) => {
  return (
    <article className={['post-content', props.className].filter(Boolean).join(' ')}>
      <header>
        <h1 className="post-title">{ props.post.header.title }</h1>
        <time className="post-date" dateTime={ moment(props.post.header.date).format('YYYY-MM-DD') }>
          { moment(props.post.header.date).format('DD MMM YYYY') }
        </time>
      </header>

      { props.children }
    </article>
  );
};
