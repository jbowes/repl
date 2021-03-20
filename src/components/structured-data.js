import React from 'react';

import { JSONLD, Generic, Author } from 'react-structured-data';

export default (props) => (
  <JSONLD dangerouslyExposeHtml>
      <Generic type="NewsArticle">
        <Author name="James Bowes" />
      </Generic>
  </JSONLD>
);
