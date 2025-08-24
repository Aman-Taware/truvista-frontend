import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../api/adminApi';

/**
 * Admin Dashboard Component
 * Simplified dashboard with quick actions and overview sections
 * Updated for improved mobile responsiveness
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    properties: { total: 0, featured: 0, available: 0 },
    bookings: { total: 0, pending: 0, confirmed: 0, completed: 0, canceled: 0 },
    users: { total: 0, admins: 0, users: 0, active: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardStats();
      console.log('Dashboard stats:', response);
      setStats(response || stats);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Function to format number with commas
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  };

  return (
    <AdminLayout>
      <div className="px-3 sm:px-6 py-6 w-full overflow-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your real estate platform management
          </p>
        </div>
        
        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link to="/admin/properties/create" className="bg-white rounded-lg shadow p-3 sm:p-4 hover:bg-gray-50 transition-all flex items-center">
              <div className="p-2 bg-indigo-100 rounded-md mr-3 sm:mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Add New Property</span>
            </Link>
            
            <Link to="/admin/bookings" className="bg-white rounded-lg shadow p-3 sm:p-4 hover:bg-gray-50 transition-all flex items-center">
              <div className="p-2 bg-green-100 rounded-md mr-3 sm:mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Bookings</span>
            </Link>
            
            <Link to="/admin/users" className="bg-white rounded-lg shadow p-3 sm:p-4 hover:bg-gray-50 transition-all flex items-center">
              <div className="p-2 bg-blue-100 rounded-md mr-3 sm:mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </Link>
            
            <Link to="/admin/properties" className="bg-white rounded-lg shadow p-3 sm:p-4 hover:bg-gray-50 transition-all flex items-center">
              <div className="p-2 bg-amber-100 rounded-md mr-3 sm:mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">View All Properties</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 