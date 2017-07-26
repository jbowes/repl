import React from 'react';

export default (props) => {
  return (
    <body>
      <article>
        <header>
          <h1>{ props.title }</h1>
        </header>

        { props.children }
      </article>
    </body>
  );
};
