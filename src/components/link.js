import React from 'react';

export default (props) => {
  return (
    <a href={ props.href } className="text-link">{ props.children }</a>
  );
};
