import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { AuthProvider } from './context/AuthContext';  // ✅ import this
import { UserProvider } from './context/UserContext';
import 'leaflet/dist/leaflet.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ wrap AuthProvider around App */}
      <UserProvider>
        <App />
      </UserProvider>
    </AuthProvider>
  </React.StrictMode>
);
