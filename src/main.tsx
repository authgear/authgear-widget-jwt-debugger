import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import JWTDebugger from './JWTDebugger';
import BrowserCompatibility from './components/BrowserCompatibility';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  (
    <BrowserCompatibility>
      <JWTDebugger />
    </BrowserCompatibility>
  ) as React.ReactElement
); 