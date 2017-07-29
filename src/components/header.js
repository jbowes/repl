import React from 'react';

import moment from 'moment';

export default (props) => {
  const slug = props.post.slug + '/';
  const Title = (props) => <a className="link dim blue" href={ slug }>{ props.children }</a>
  return (
    <header>
      <h1 className="mv0"><Title>{ props.post.header.title }</Title></h1>
      <date className="f6 fw3 lh-solid ttu">
        { moment(props.post.header.date).format('DD MMM YYYY') }
      </date>
    </header>
  );
};
