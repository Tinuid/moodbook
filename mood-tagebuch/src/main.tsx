import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import App from './App.tsx';
import { requestPersistentStorage } from './lib/storage';

// Best-effort: keep our data from being evicted (esp. iOS Safari).
void requestPersistentStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
