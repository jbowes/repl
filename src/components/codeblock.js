import React from 'react';
import { Highlight, Prism } from 'prism-react-renderer';

// Add additional language parsers
(typeof global !== "undefined" ? global : window).Prism = Prism;
require("prismjs/components/prism-http");


export const CodeBlock = ({ children, className }) => {
  const language = className.replace(/language-/, "");
  const code = String(Array.isArray(children) ? children.join('') : children).replace(/\n$/, '');
  // theme={{ plain: {}, styles: [] }} turns off the default inline styling
  return (
    <Highlight prism={Prism} code={code} language={language} theme={{ plain: {}, styles: [] }}>
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <pre className="pre br2 pv3 ph3 code-block">
          <code className={className}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
            </code>
        </pre>
      )}
    </Highlight>
  );
};

export default CodeBlock;
