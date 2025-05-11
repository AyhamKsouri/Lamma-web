import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Using custom hook instead of direct context

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string; // Optional custom redirect path
  loadingComponent?: React.ReactNode; // Optional custom loading component
}

export function ProtectedRoute({ 
  children, 
  fallbackPath = '/login',
  loadingComponent,
}: ProtectedRouteProps) {
  const { user, isChecking, error } = useAuth(); // Add error handling
  const location = useLocation();

  // Show loading state
  if (isChecking) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-lg text-gray-500">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  // Handle authentication error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg">Authentication Error</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={() => window.location.href = fallbackPath}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <Navigate 
        to={fallbackPath}
        state={{ from: location }} // Preserve the location for redirect after login
        replace 
      />
    );
  }

  // Render protected content
  return <>{children}</>;
}

// Add a HOC version for class components or simpler usage
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