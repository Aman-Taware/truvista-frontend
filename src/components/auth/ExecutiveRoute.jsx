import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Executive Route Component
 * Protects routes that should only be accessible to users with executive or admin role
 */
const ExecutiveRoute = () => {
  const { user, loading, isAuthenticated, isAdmin, isExecutive, ensureAuthenticated } = useContext(AuthContext);
  const [isChecking, setIsChecking] = useState(false);
  const [authResult, setAuthResult] = useState(null);
  
  useEffect(() => {
    const checkAuth = async () => {
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

  if (loading || isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated() && !authResult) {
    return <Navigate to="/" replace />;
  }
  
  if (user && !isAdmin() && !isExecutive()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ExecutiveRoute;
