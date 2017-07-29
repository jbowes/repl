import React from 'react';

export default (props) => {
  return (
    <a href={ props.href } className="red link dim">{ props.children }</a>
  );
};
