import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CalendarPage from './pages/Calendar';
import Profile from './pages/Profile';
import NewEvent from './pages/NewEvent';
import EventDetails from './pages/EventDetails';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/loginPage';
import NotFound from './pages/NotFound'; // Add this component

// Define route configuration for better maintenance
interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

// Protected routes configuration
const protectedRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: 'events',
    element: <Events />,
  },
  {
    path: 'events/:id',
    element: <EventDetails />,
  },
  {
    path: 'calendar',
    element: <CalendarPage />,
  },
  {
    path: 'profile',
    element: <Profile />,
  },
  {
    path: 'new-event',
    element: <NewEvent />,
  },
];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes wrapper */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dynamic route generation */}
            {protectedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path === '/' ? '' : path}
                element={element}
              />
            ))}

            {/* 404 handling within protected routes */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Catch-all redirect for non-matching public routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;