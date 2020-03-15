import React from 'react';

export default (props) => {
  let code = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-103396477-1');
  `;

  return (
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-103396477-1"/>
    <script dangerouslySetInnerHTML={ {__html: code }} />
  );
};
