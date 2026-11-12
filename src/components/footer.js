import React from 'react';

function Link(props) {
  return (
    <section className="footer-item">
      <a className="footer-link" href={props.to}>
        {props.children}
      </a>
    </section>
  );
}

export default (props) => {
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <Link to="https://github.com/jbowes">github</Link>
        <Link to="https://github.com/jbowes/repl">source</Link>
        <Link to="https://bsky.app/profile/repl.ca">bluesky</Link>
        <Link to="https://www.linkedin.com/in/jbowes/">linkedin</Link>
      </div>
      <section className="copyright">Copyright © 2017 — { new Date().getFullYear() } James Bowes</section>
    </footer>
  );
};
