import React from 'react';
import Highlight, { defaultProps } from 'prism-react-renderer';

// Add additional language parsers
import Prism from "prism-react-renderer/prism";
(typeof global !== "undefined" ? global : window).Prism = Prism;
require("prismjs/components/prism-http");


export const CodeBlock = ({ children, className }) => {
  const language = className.replace(/language-/, "");
  const props = {...defaultProps};
  // theme={undefined} turns off the default inline styling
  return (
    <Highlight {...props} code={children[0].replace(/\n$/, '')} language={language} theme={undefined}>
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <pre className="pre br2 pv3 ph3 bg-blue beige">
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
