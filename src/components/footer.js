import React from 'react';

function Link(props) {
  return (
    <section className="flex-none ph2">
      <a className="dim black-60" href={props.to}>
        {props.children}
      </a>
    </section>
  );
}

export default (props) => {
  return (
    <footer className="bt bw2 mh5-l mh3 mh4-m mt5 pt4 flex flex-column f7">
      <div className="flex flex-auto flex-wrap justify-center">
        <Link to="https://github.com/jbowes">github</Link>
        <Link to="https://github.com/jbowes/repl">source</Link>
        <Link to="https://twitter.com/jrbowes">twitter</Link>
        <Link to="https://www.linkedin.com/in/jbowes/">linkedin</Link>
        <Link to="https://stackoverflow.com/story/jbowes">stack overflow</Link>
      </div>
      <section className="flex-auto mv3 tc i black-60">Copyright © 2017 — { new Date().getFullYear() } James Bowes</section>
    </footer>
  );
};
