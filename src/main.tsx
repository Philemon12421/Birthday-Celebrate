/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// IMPORTANT: index.css MUST be the first import so Tailwind loads before React
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in index.html');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
