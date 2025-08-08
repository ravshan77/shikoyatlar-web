import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthPage } from './pages/AuthPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
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
      <div className="App">
        {isAuthenticated ? (
          <DashboardPage onLogout={handleLogout} />
        ) : (
          <AuthPage onAuthenticated={handleAuthenticated} />
        )}
      </div>
    </QueryClientProvider>
  );
};

export default App;