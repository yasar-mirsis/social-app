/**
 * Client Entry Point
 *
 * This is the main entry point for the social-app React frontend.
 * It renders the root component and mounts it to the DOM.
 *
 * Implementation will be added in subsequent tasks.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
