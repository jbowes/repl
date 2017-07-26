import React from 'react';

export default (props) => {
  return (
      <article>
        <header>
          <h1><a href={props.post.slug + '/'}>{ props.post.header.title }</a></h1>
        </header>
      </article>
  );
};
