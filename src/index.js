import React from 'react';
import ReactDOM from 'react-dom/client';  // Correct import for React 18
import './index.css';
import './style.css'; // Import the custom styles
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const root = ReactDOM.createRoot(document.getElementById('root')); // createRoot method for React 18
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);