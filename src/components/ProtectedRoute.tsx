import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();

  // Check if this is an OAuth callback
  const searchParams = new URLSearchParams(location.search);
  const isOAuthCallback = searchParams.get('integration_success') === 'true' || 
                          searchParams.get('integration_error') !== null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Check if user exists AND has a valid session
  // If email confirmation is required, session will be null until confirmed
  if (!user || !session) {
    // If this is an OAuth callback, preserve the query params in the redirect
    if (isOAuthCallback) {
      return <Navigate to={`/login${location.search}`} state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};