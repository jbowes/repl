import React from 'react';

export default (props) => {
  return (
    <article className={props.className}>
      <header>
        <h1>{ props.title }</h1>
      </header>

      { props.children }
    </article>
  );
};
