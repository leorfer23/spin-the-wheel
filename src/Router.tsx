import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })));
const Auth = lazy(() => import('./pages/auth/Auth').then(module => ({ default: module.Auth })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ModularDashboard = lazy(() => import('./pages/dashboard/ModularDashboard').then(module => ({ default: module.ModularDashboard })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const Router: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <BrowserRouter>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/signup" element={<Navigate to="/auth" replace />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
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
              
              {/* Debug route for TiendaNube */}
              <Route 
                path="/dashboard/tiendanube-debug" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div>Loading debug page...</div>}>
                      {React.createElement(React.lazy(() => import('./pages/dashboard/TiendaNubeDebug')))}
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};