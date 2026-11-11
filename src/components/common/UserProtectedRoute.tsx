import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AgroLoader from './AgroLoader';

export const UserProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, openLoginModal } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openLoginModal();
    }
  }, [isLoading, isAuthenticated, openLoginModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AgroLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default UserProtectedRoute;

