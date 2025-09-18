import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Proactively check for updated service workers and reload once when a new one takes control
if ('serviceWorker' in navigator) {
  // Ask existing registrations to check for updates at startup
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      try { registration.update(); } catch {}
    }
  });

  // Reload the page once when the updated SW activates and takes control
  let hasReloadedForSW = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hasReloadedForSW) {
      hasReloadedForSW = true;
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
