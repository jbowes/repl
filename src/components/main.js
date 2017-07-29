import React from 'react';

export default (props) => {
  return (
    <main className="flex-auto w-90 w-two-thirds-ns center ph3-ns">
      { props.children }
    </main>
  );
};
