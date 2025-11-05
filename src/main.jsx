import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import { ToastProvider } from './contexts/ToastContext';
import { SupabaseProvider } from './contexts/SupabaseContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <SupabaseProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </SupabaseProvider>
);
