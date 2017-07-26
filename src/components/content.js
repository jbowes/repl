import React from 'react';

export default (props) => {
  return (
    <body>
      <article>
        { props.children }
      </article>
    </body>
  );
};
