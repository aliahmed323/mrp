import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { seedIfEmpty } from './services/storage/db.ts';

// ============================================================
// Seed sample data on first launch (runs silently in background)
// ============================================================
seedIfEmpty().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
