import React from 'react';

import { JSONLD, Generic, Author } from 'react-structured-data';

export default (props) => (
  <JSONLD dangerouslyExposeHtml>
      <Generic jsonldtype="BlogPosting" schema={{ headline: props.title, datePublished: props.pubdate }}>
        <Author name="James Bowes" />
      </Generic>
  </JSONLD>
);
