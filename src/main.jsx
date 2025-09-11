import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import App from './App.jsx'

// React DevTools 제거 (프로덕션 최적화)
if (import.meta.env.PROD) {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
  delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
