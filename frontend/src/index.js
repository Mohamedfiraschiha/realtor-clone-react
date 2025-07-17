import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ C'EST BIEN ICI qu'on importe createRoot
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="362633341927-n8t9ajanjbk6q5pqld85nss8d08nrikg.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();
