import React from 'react';
import ReactDOM from 'react-dom/client';
import { initFirebase } from './firebase';
import { seedDatabase } from './lib/seed';
import App from './App';
import './index.css';

async function bootstrap() {
  await initFirebase();
  await seedDatabase(); // Auto-seeds if collection empty
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap().catch(console.error);
