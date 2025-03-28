import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Admin Route Component
 * Protects routes that should only be accessible to users with admin role
 * Redirects to home page if user is not authenticated or doesn't have admin role
 */
const AdminRoute = () => {
  const { user, loading, isAuthenticated, isAdmin } = useContext(AuthContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // If not authenticated or not admin, redirect to home page
  if (!isAuthenticated || !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // Render the protected admin content
  return <Outlet />;
};

export default AdminRoute; 