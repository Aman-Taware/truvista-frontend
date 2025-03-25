import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * ProtectedRoute Component
 * Used to protect routes that require authentication
 * Redirects to home page if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait while authentication state is loading
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If authenticated, render the children
  if (isAuthenticated) {
    return children;
  }

  // Otherwise, redirect to home page
  return <Navigate to="/" replace />;
};

export default ProtectedRoute; 