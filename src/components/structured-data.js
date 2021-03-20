import React from 'react';

import { JSONLD, Generic, Author } from 'react-structured-data';

export default (props) => (
  <JSONLD dangerouslyExposeHtml>
      <Generic type="NewsArticle" schema={{ headline: props.title }}>
        <Author name="James Bowes" />
      </Generic>
  </JSONLD>
);
