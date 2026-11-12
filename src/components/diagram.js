import React from 'react';

// The child is an <svg> string rendered at build time by src/diagram.
export const Diagram = ({ children }) => {
  const svg = String(Array.isArray(children) ? children.join('') : children);
  return <figure className="diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default Diagram;
