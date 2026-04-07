import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jwtToken');
  const userId = localStorage.getItem('userId');
  const location = useLocation();

  if (!token || !userId) {
    // Redirect to login and remember where user wanted to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;