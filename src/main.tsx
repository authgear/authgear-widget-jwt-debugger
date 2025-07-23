import React from 'react';
import ReactDOM from 'react-dom/client';
import './utils/cryptoPolyfill';
import './index.css';
import JWTDebugger from './JWTDebugger';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  (<JWTDebugger />) as React.ReactElement
); 