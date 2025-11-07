import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { validateEnvironment } from './lib/env'

// Validate environment configuration on startup
const envValidation = validateEnvironment();

if (!envValidation.isValid) {
  console.error('Environment configuration errors:');
  envValidation.errors.forEach(error => console.error(`  - ${error}`));
  
  // Show error in the UI
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
        <h1 style="color: #e11d48;">Configuration Error</h1>
        <p>The application cannot start due to missing environment configuration.</p>
        <ul style="color: #991b1b;">
          ${envValidation.errors.map(err => `<li>${err}</li>`).join('')}
        </ul>
        <p style="margin-top: 20px; color: #64748b;">
          Please check your .env file and ensure all required variables are set.
        </p>
      </div>
    `;
  }
  throw new Error('Environment validation failed');
}

// Log warnings if any
if (envValidation.warnings.length > 0) {
  console.warn('Environment configuration warnings:');
  envValidation.warnings.forEach(warning => console.warn(`  - ${warning}`));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)