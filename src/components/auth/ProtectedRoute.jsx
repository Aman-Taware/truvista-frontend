import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * ProtectedRoute Component
 * Used to protect routes that require authentication
 * Redirects to home page if user is not authenticated
 * Now uses proactive authentication restoration
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, ensureAuthenticated } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(false);
  const [authResult, setAuthResult] = useState(null);
  
  // Attempt to ensure authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      // Only check if we're not already authenticated
      if (!isAuthenticated()) {
        setIsChecking(true);
        try {
          const result = await ensureAuthenticated();
          setAuthResult(result);
        } catch (error) {
          console.error('Error ensuring authentication:', error);
          setAuthResult(false);
        } finally {
          setIsChecking(false);
        }
      }
    };
    
    if (!loading) {
      checkAuth();
    }
  }, [ensureAuthenticated, isAuthenticated, loading]);

  // Wait while authentication state is loading or checking
  if (loading || isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // If authenticated, render the children
  if (isAuthenticated() || authResult) {
    return children;
  }

  // Otherwise, redirect to home page
  return <Navigate to="/" state={{ from: location.pathname }} replace />;
};

export default ProtectedRoute; 