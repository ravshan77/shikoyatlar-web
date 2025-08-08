import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthPage } from './pages/AuthPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AddComplaintPage } from './pages/AddComplaintPage.tsx';
import { EditComplaintPage } from './pages/EditComplaintPage.tsx';
import { useComplaintStore } from './stores/useComplaintStore.ts';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated }) => {
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

export const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { userSession, reset } = useComplaintStore();

  // Check if user is already authenticated on app start
  useEffect(() => {
    if (userSession) {
      setIsAuthenticated(true);
    }
  }, [userSession]);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    reset(); // Reset store
    // Optionally clear query cache
    queryClient.clear();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Auth Route */}
            <Route 
              path="/auth" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <AuthPage onAuthenticated={handleAuthenticated} />
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <DashboardPage onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/complaints/add" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AddComplaintPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/complaints/edit/:id" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <EditComplaintPage />
                </ProtectedRoute>
              } 
            />

            {/* Default Redirect */}
            <Route 
              path="/" 
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />
              } 
            />

            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Sahifa topilmadi</p>
                    <a 
                      href="/dashboard" 
                      className="text-primary-600 hover:text-primary-800"
                    >
                      Asosiy sahifaga qaytish
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;