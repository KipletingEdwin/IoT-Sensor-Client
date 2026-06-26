import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

// Redux Store Configuration
import { store } from './features/redux/store';

// Global Styles and Layout Root
import App from './App';
import './index.css';

/**
 * Academic Context: Root Application Mounting Entry Point
 * Wraps the React tree with the Redux Provider to make the slice context available.
 * Zustand runs independently alongside this provider without requiring a context wrapper.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
