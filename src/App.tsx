// src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CalendarPage from './pages/Calendar';
import EditProfile from './pages/editProfile';   // <-- PascalCase
import NewEvent from './pages/NewEvent';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import LoginPage from './pages/loginPage';
import NotFound from './pages/NotFound';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Define route configuration for better maintenance
interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

const protectedRoutes: RouteConfig[] = [
  { path: '/',           element: <Dashboard /> },
  { path: 'events',      element: <Events /> },
  { path: 'new-event',   element: <NewEvent /> },
  { path: 'events/:id',  element: <EventDetails /> },
  { path: 'calendar',    element: <CalendarPage /> },
  { path: 'profile',     element: <Profile /> },
  { path: 'edit-profile',element: <EditProfile /> }, // <-- use PascalCase and kebab-path if you like
];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected wrapper */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Generate protected routes */}
            {protectedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path === '/' ? '' : path}
                element={element} 
              />
            ))}

            {/* 404 inside protected area */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Fallback for any other public route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
