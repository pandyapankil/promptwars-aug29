import React from 'react';
import ReactDOM from 'react-dom/client';
import { initFirebase } from './firebase';
import { seedDatabase } from './lib/seed';
import App from './App';
import './index.css';

async function bootstrap() {
  await initFirebase();
  // Mount React immediately — don't block on seed
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // Seed in background — permission errors are non-fatal
  seedDatabase().catch(err => console.warn('Seed skipped (may already be seeded):', err.message));
}

bootstrap().catch(console.error);
