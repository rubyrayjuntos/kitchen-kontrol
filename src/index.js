import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import KitchenKontrol from './KitchenKontrol';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Set a default Chiaroscuro theme on app startup so the design system's
// [data-theme="..."] rules take effect even when the app is served as
// a static build (nginx) and the initial HTML doesn't include the attribute.
try {
  const saved = window.localStorage && window.localStorage.getItem('kk_theme');
  const theme = saved || 'professional';
  if (document && document.documentElement) {
    document.documentElement.setAttribute('data-theme', theme);
  }
} catch (e) {
  // noop in environments without window/localStorage
}

root.render(
  <React.StrictMode>
    <KitchenKontrol />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
