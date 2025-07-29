import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';

// Dashboard pages
import { ModularDashboard } from './pages/dashboard/ModularDashboard';

// Public demo page
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const Router: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/demo" replace />} />
            <Route path="/demo" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ModularDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/wheel/:wheelId"
              element={
                <ProtectedRoute>
                  <ModularDashboard />
                </ProtectedRoute>
              }
            />
            
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};