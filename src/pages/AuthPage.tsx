import React, { useState } from 'react';
import { authApiService } from '../services/authApiService.ts';
import { TwoFactorAuth } from '../components/TwoFactorAuth.tsx';
import { useComplaintStore } from '../stores/useComplaintStore.ts';

interface AuthPageProps {
  onAuthenticated: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUserSession } = useComplaintStore();

  const handleAuthenticate = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authApiService.authenticate(code);
      
      if (response.status && response.data) {
        // Save user session
        setUserSession({
          workerId: response.data.worker_id,
          workerName: response.data.worker_name,
        });
        
        sessionStorage.setItem('userToken', response.data.token)
        
        onAuthenticated();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TwoFactorAuth
      onAuthenticate={handleAuthenticate}
      isLoading={isLoading}
    />
  );
};