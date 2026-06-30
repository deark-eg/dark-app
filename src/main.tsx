import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill window.scrollTo to prevent smooth scrolling / coordinate issues in sandboxed iframes
if (typeof window !== 'undefined') {
  const originalScrollTo = window.scrollTo;
  window.scrollTo = function (optionsOrX?: any, y?: any) {
    try {
      if (typeof optionsOrX === 'object' && optionsOrX !== null) {
        if (originalScrollTo) {
          originalScrollTo.call(window, optionsOrX);
        }
      } else {
        if (originalScrollTo) {
          originalScrollTo.call(window, optionsOrX, y);
        }
      }
    } catch (e) {
      try {
        if (typeof optionsOrX === 'object' && optionsOrX !== null) {
          const top = optionsOrX.top !== undefined ? optionsOrX.top : window.scrollY;
          const left = optionsOrX.left !== undefined ? optionsOrX.left : window.scrollX;
          if (originalScrollTo) {
            originalScrollTo.call(window, left, top);
          }
        }
      } catch (err) {
        console.warn("window.scrollTo fallback failed", err);
      }
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
