// src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Layout from './components/user/Layout';
import Dashboard from './pages/user/Dashboard';
import Events from './pages/user/Events';
import CalendarPage from './pages/user/Calendar';
import NewEvent from './pages/user/NewEvent';
import EventDetails from './pages/user/EventDetails';
import Profile from './pages/user/Profile';
import EditProfile from './pages/user/editProfile';
import AdminPage from './pages/admin/AdminPage';
import UsersAdminPage from './pages/admin/UsersAdminPage';
import LoginPage from './pages/auth/loginPage';
import NotFound from './pages/user/NotFound';
import UserDetailAdminPage from './pages/admin/UserDetailAdminPage';
import EventsAdminPage from './pages/admin/EventsAdminPage';
import VerifyResetCodePage from './components/common/VerifyResetCodePage';
import ResetPasswordPage from './components/common/ResetPasswordPage';
import UserProfile from './pages/user/UserProfile';
import CreatorEventDetails from './pages/user/creatorEventDetails';
import ReportsPage from './pages/admin/Reportspage';
import {Toaster} from 'react-hot-toast';
import ReportDetailPage from "./pages/admin/ReportDetailsPage";
import AuditLogPage from './pages/admin/AuditLogPage';
import SettingsPage from './pages/user/settings_page';      


function App() {
  return (
    <AuthProvider>
      <BrowserRouter> 
      <Toaster position="top-right"/>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-reset-code" element={<VerifyResetCodePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected area */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* User routes */}
            <Route path="events" element={<Events />} />
            <Route path="new-event" element={<NewEvent />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="events/:id/creator" element={<CreatorEventDetails />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="settings" element={<SettingsPage />} />
            
            
            


            {/* Admin routes */}
            <Route path="admin" element={<AdminPage />} />
            <Route path="admin/users" element={<UsersAdminPage />} />
            <Route path="admin/users/:id" element={<UserDetailAdminPage />} />
            <Route path="/admin/events" element={<EventsAdminPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/reports/:id" element={<ReportDetailPage />} /> 
            <Route path="/admin/audit" element={<AuditLogPage />} />

            {/* 404 inside public area */}

            

            {/* 404 inside protected area */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Fallback for unmatched public URLs */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;
