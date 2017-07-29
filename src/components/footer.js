import React from 'react';

function Link(props) {
  return (
    <section className="flex-auto tc ph1">
      <a className="dim black-50" href={props.to}>
        {props.children}
      </a>
    </section>
  );
}

export default (props) => {
  return (
    <footer className="bt bw2 mh5-l mh3 mh4-m mt5 pt4 ph4 ph5-ns flex flex-column f7">
      <div className="flex flex-auto flex-wrap mh7-ns">
        <Link to="https://github.com/jbowes">github</Link>
        <Link to="https://github.com/jbowes/repl">source</Link>
        <Link to="https://twitter.com/jrbowes">twitter</Link>
        <Link to="https://www.linkedin.com/in/jbowes/">linkedin</Link>
      </div>
      <section className="flex-auto mv3 tc i black-50">Copyright © 2017 James Bowes</section>
    </footer>
  );
};
