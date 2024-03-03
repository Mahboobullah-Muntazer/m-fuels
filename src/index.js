import React from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM

import './index.css';
import App from './App';

import { ContextProvider } from './contexts/ContextProvider';
import { AuthContextProvider } from './contexts/AuthContext';

// Use ReactDOM.render instead of createRoot
ReactDOM.render(
  <AuthContextProvider>
    <ContextProvider>
      <App />
    </ContextProvider>
  </AuthContextProvider>,
  document.getElementById('root')
);
