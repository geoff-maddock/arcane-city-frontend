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
  
  // Show error in the UI (using textContent to prevent XSS)
  const root = document.getElementById('root');
  if (root) {
    const container = document.createElement('div');
    container.style.cssText = 'padding: 20px; font-family: system-ui, -apple-system, sans-serif;';
    
    const title = document.createElement('h1');
    title.style.color = '#e11d48';
    title.textContent = 'Configuration Error';
    
    const description = document.createElement('p');
    description.textContent = 'The application cannot start due to missing environment configuration.';
    
    const errorList = document.createElement('ul');
    errorList.style.color = '#991b1b';
    envValidation.errors.forEach(err => {
      const li = document.createElement('li');
      li.textContent = err;
      errorList.appendChild(li);
    });
    
    const help = document.createElement('p');
    help.style.cssText = 'margin-top: 20px; color: #64748b;';
    help.textContent = 'Please check your .env file and ensure all required variables are set.';
    
    container.appendChild(title);
    container.appendChild(description);
    container.appendChild(errorList);
    container.appendChild(help);
    
    root.appendChild(container);
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