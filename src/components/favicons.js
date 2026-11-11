import React from 'react';
import { readFileSync } from 'fs';

// Read once at build time and inlined, so a page view makes no favicon request.
const icon = 'data:image/png;base64,' + readFileSync('./src/assets/favicon-32x32.png').toString('base64');

export default () => (
  <>
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" href={icon} />
  </>
);
