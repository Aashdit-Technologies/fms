import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/Store';

export const PublicRoute = ({ children }) => {
  const { authenticated } = useAuthStore();

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
