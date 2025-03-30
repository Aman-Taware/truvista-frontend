import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Admin Route Component
 * Protects routes that should only be accessible to users with admin role
 * Redirects to home page if user is not authenticated or doesn't have admin role
 * Now uses proactive authentication restoration
 */
const AdminRoute = () => {
  const { user, loading, isAuthenticated, isAdmin, ensureAuthenticated } = useContext(AuthContext);
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

  // Show loading spinner while checking authentication
  if (loading || isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // If not authenticated or not admin, redirect to home page
  if (!isAuthenticated() && !authResult) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated but not admin, redirect to home page
  if (user && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // Render the protected admin content
  return <Outlet />;
};

export default AdminRoute; 