// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CalendarPage from './pages/Calendar';
import Profile from './pages/Profile';
import NewEvent from './pages/NewEvent';
import EventDetails from './pages/EventDetails';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import  LoginPage  from './pages/loginPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* All other routes require authentication */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="new-event" element={<NewEvent />} />
            {/* 404 fallback inside protected area */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;