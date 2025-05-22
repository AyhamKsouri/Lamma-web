// src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;           // where to send unauthenticated users
  loadingComponent?: React.ReactNode;
  allowedRoles?: string[];         // if set, only these roles can see children
  unauthorizedPath?: string;       // where to send unauthorized users
}

export function ProtectedRoute({
  children,
  fallbackPath = '/login',
  loadingComponent,
  allowedRoles,
  unauthorizedPath = '/not-authorized',
}: ProtectedRouteProps) {
  const { user, isChecking, error } = useAuth();
  const location = useLocation();

  // 1) still checking token?
  if (isChecking) {
    if (loadingComponent) return <>{loadingComponent}</>;
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-lg text-gray-500">Checking session…</p>
        </div>
      </div>
    );
  }

  // 2) token error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg">Authentication Error</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            onClick={() => (window.location.href = fallbackPath)}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // 3) not logged in?
  if (!user) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // 4) role guard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  // 5) passed all checks
  return <>{children}</>;
}

// HOC version, if you need it
export function withProtectedRoute<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function WithProtectedRouteWrapper(props: P) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}
