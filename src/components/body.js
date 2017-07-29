import React from 'react';

export default (props) => {
  return (
    <body className="flex flex-column">
      { props.children }
    </body>
  );
};
