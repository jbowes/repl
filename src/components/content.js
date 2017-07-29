import React from 'react';

import moment from 'moment';

export default (props) => {
  return (
    <article className={props.className}>
      <header>
        <h1 className="mb0 lh-solid f2-ns f3">{ props.post.header.title }</h1>
        <date className="f6 fw3 lh-solid ttu">
          { moment(props.post.header.date).format('DD MMM YYYY') }
        </date>
      </header>

      { props.children }
    </article>
  );
};
