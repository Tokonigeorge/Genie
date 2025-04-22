import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

const ProtectedRoute: React.FC = () => {
  const { user, loading, session } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  console.log(user, session, 'wee');
  if (!user || !session) {
    const currentPath = window.location.pathname;
    sessionStorage.setItem('redirectPath', currentPath);
    return <Navigate to='/login' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
