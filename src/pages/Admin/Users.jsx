import { useState, useEffect, useContext, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../api/adminApi';
import { NotificationContext } from '../../contexts/NotificationContext';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useContext(NotificationContext);
  
  // State for user statistics
  const [stats, setStats] = useState({});
  
  // Add state to track which dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // States for pagination and filtering
  const [currentPage, setCurrentPage] = useState(0); // Changed to zero-based for backend compatibility
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const itemsPerPage = 10;
  
  // States for sorting
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [currentPage, itemsPerPage, sortBy, sortDir]);
  
  // Debounced effect for search term and role filter
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchFilteredUsers();
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, filterRole]);

  const fetchUsers = async () => {
    if (searchTerm || filterRole) {
      return; // Let the debounced fetchFilteredUsers handle this
    }
    
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: itemsPerPage,
        sortBy: sortBy,
        sortDir: sortDir
      };
      
      const response = await adminApi.getUsers(params);
      console.log('Users response:', response);
      
      if (response && response.content) {
        setUsers(response.content);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalElements);
      } else {
        setUsers(response || []);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      showNotification({
        type: 'error',
        message: 'Failed to load users. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFilteredUsers = async () => {
    if (!searchTerm && !filterRole) {
      return fetchUsers();
    }
    
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: itemsPerPage,
        sortBy: sortBy,
        sortDir: sortDir
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (filterRole && filterRole !== 'all') {
        params.role = filterRole;
      }
      
      const response = await adminApi.getFilteredUsers(params);
      console.log('Filtered users response:', response);
      
      if (response && response.content) {
        setUsers(response.content);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalElements);
      } else {
        setUsers(response || []);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching filtered users:', err);
      setError('Failed to load users');
      showNotification({
        type: 'error',
        message: 'Failed to load users. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserStats = async () => {
    try {
      const response = await adminApi.getUserStats();
      console.log('User stats response:', response);
      setStats(response);
    } catch (err) {
      console.error('Error fetching user statistics:', err);
    }
  };

  const handleUpdateUserStatus = async (userId, isActive) => {
    try {
      await adminApi.patchUser(userId, { active: isActive });
      showNotification({
        type: 'success',
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
      });
      fetchUsers(); // Refresh the list
      fetchUserStats(); // Refresh the stats
    } catch (err) {
      console.error('Error updating user status:', err);
      showNotification({
        type: 'error',
        message: 'Failed to update user status. Please try again.'
      });
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await adminApi.patchUser(userId, { role: newRole });
      showNotification({
        type: 'success',
        message: `User role updated to ${newRole}`
      });
      fetchUsers(); // Refresh the list
      fetchUserStats(); // Refresh the stats
    } catch (err) {
      console.error('Error updating user role:', err);
      showNotification({
        type: 'error',
        message: 'Failed to update user role. Please try again.'
      });
    }
  };

  // Toggle the dropdown menu
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };
  
  // Format user statistics for display
  const formattedStats = useMemo(() => {
    if (!stats || Object.keys(stats).length === 0) {
      return null;
    }
    
    return {
      totalUsers: stats.totalUsers || 0,
      usersByRole: stats.usersByRole || {},
      activeUsers: stats.activeUsers || 0,
      inactiveUsers: stats.inactiveUsers || 0
    };
  }, [stats]);

  // Generate avatar placeholder with initials
  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role label style
  const getRoleClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'executive':
        return 'bg-indigo-100 text-indigo-800';
      case 'user':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Change page handler for pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('');
    setCurrentPage(0);
    setSortBy('id');
    setSortDir('asc');
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="sm:flex sm:items-center mb-4 sm:mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Users</h1>
            <p className="mt-1 text-sm text-gray-700">
              A list of all users including their name, email, role and account status.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <button
              onClick={() => {
                fetchUsers();
                fetchUserStats();
              }}
              className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        
        {/* User Statistics */}
        {formattedStats && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-indigo-50 rounded-md">
                    <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-semibold text-gray-900">{formattedStats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-green-50 rounded-md">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">Active Users</dt>
                      <dd className="text-lg font-semibold text-gray-900">{formattedStats.activeUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-red-50 rounded-md">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">Inactive Users</dt>
                      <dd className="text-lg font-semibold text-gray-900">{formattedStats.inactiveUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-purple-50 rounded-md">
                    <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">Admin Users</dt>
                      <dd className="text-lg font-semibold text-gray-900">{formattedStats.usersByRole?.ADMIN || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">Filters</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={resetFilters}
                className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded border border-gray-200 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 text-sm shadow-sm"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0); // Reset to first page when searching
                }}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>
            
            {/* Role Filter */}
            <div>
              <select
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 shadow-sm"
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(0); // Reset to first page when filtering
                }}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="EXECUTIVE">Executive</option>
                <option value="USER">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-60 text-red-500">
              {error}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 px-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-4 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-900">No users found</p>
              <p className="text-sm mt-1 text-gray-500">No users match your current filter criteria.</p>
              <button 
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-md hover:bg-indigo-100"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block min-w-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">
                        User
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {user.profilePicture ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={user.profilePicture}
                                  alt={user.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                  {getInitials(user.name)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-500 text-xs">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div>{user.email}</div>
                          {user.contactNo && <div className="text-xs mt-1">{user.contactNo}</div>}
                        </td>
                        <td className="px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleClass(user.role)}`}>
                            {user.role || 'User'}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            user.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="dropdown-container relative">
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                              onClick={() => toggleDropdown(user.id)}
                            >
                              Actions
                              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <div 
                              className={`absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                                openDropdownId === user.id ? 'block' : 'hidden'
                              }`} 
                              role="menu" 
                              aria-orientation="vertical"
                            >
                              <div className="py-1" role="none">
                                <button
                                  onClick={() => {
                                    handleUpdateUserRole(user.id, 'ADMIN');
                                    setOpenDropdownId(null);
                                  }}
                                  className="text-gray-700 block px-4 py-2 text-xs w-full text-left hover:bg-gray-100"
                                  role="menuitem"
                                >
                                  Make Admin
                                </button>
                                <button
                                  onClick={() => {
                                    handleUpdateUserRole(user.id, 'EXECUTIVE');
                                    setOpenDropdownId(null);
                                  }}
                                  className="text-gray-700 block px-4 py-2 text-xs w-full text-left hover:bg-gray-100"
                                  role="menuitem"
                                >
                                  Make Executive
                                </button>
                                <button
                                  onClick={() => {
                                    handleUpdateUserRole(user.id, 'USER');
                                    setOpenDropdownId(null);
                                  }}
                                  className="text-gray-700 block px-4 py-2 text-xs w-full text-left hover:bg-gray-100"
                                  role="menuitem"
                                >
                                  Make User
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  onClick={() => {
                                    handleUpdateUserStatus(user.id, !user.active);
                                    setOpenDropdownId(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-xs ${
                                    user.active
                                      ? 'text-red-600 hover:bg-red-50'
                                      : 'text-green-600 hover:bg-green-50'
                                  }`}
                                >
                                  {user.active ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view */}
              <ul className="md:hidden divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.profilePicture ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.profilePicture}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                              {getInitials(user.name)}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>

                      <div className="dropdown-container relative">
                        <button
                          type="button"
                          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                          onClick={() => toggleDropdown(user.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                        <div 
                          className={`absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                            openDropdownId === user.id ? 'block' : 'hidden'
                          }`} 
                          role="menu" 
                          aria-orientation="vertical"
                        >
                          <div className="py-1" role="none">
                            <button
                              onClick={() => {
                                handleUpdateUserRole(user.id, 'ADMIN');
                                setOpenDropdownId(null);
                              }}
                              className="text-gray-700 block px-4 py-2 text-xs w-full text-left hover:bg-gray-100"
                              role="menuitem"
                            >
                              Make Admin
                            </button>
                            <button
                              onClick={() => {
                                handleUpdateUserRole(user.id, 'EXECUTIVE');
                                setOpenDropdownId(null);
                              }}
                              className="text-gray-700 block px-4 py-2 text-xs w-full text-left hover:bg-gray-100"
                              role="menuitem"
                            >
                              Make Executive
                            </button>
                            <button
                              onClick={() => {
                                handleUpdateUserRole(user.id, 'USER');
                                setOpenDropdownId(null);
                              }}
                              className="text-gray-700 block px-4 py-2 text-xs w-full text-left hover:bg-gray-100"
                              role="menuitem"
                            >
                              Make User
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                handleUpdateUserStatus(user.id, !user.active);
                                setOpenDropdownId(null);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs ${
                                user.active
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {user.active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleClass(user.role)}`}>
                        {user.role || 'User'}
                      </span>
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </div>

                    {user.contactNo && <div className="mt-1 text-xs text-gray-500">Tel: {user.contactNo}</div>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && users.length > 0 && (
          <div className="mt-4 bg-white rounded-lg border border-gray-100 shadow-sm px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-gray-500 mb-2 sm:mb-0">
                Showing <span className="font-medium">{users.length > 0 ? (currentPage * itemsPerPage) + 1 : 0}</span> to{' '}
                <span className="font-medium">
                  {Math.min((currentPage + 1) * itemsPerPage, totalItems)}
                </span>{' '}
                of <span className="font-medium">{totalItems}</span> results
              </div>
              <div className="flex justify-between sm:justify-end">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className={`relative inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                      currentPage === 0 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers - show only on larger screens */}
                  <div className="hidden sm:flex">
                    {[...Array(totalPages).keys()].map(number => {
                      // Maximum 5 page buttons - show first, last, current, and surrounding
                      if (
                        number === 0 || 
                        number === totalPages - 1 || 
                        (number >= currentPage - 1 && number <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={number}
                            onClick={() => handlePageChange(number)}
                            className={`relative inline-flex items-center px-3 py-1 text-xs font-medium rounded-md mx-0.5 ${
                              currentPage === number
                                ? 'z-10 bg-indigo-600 text-white border border-indigo-600'
                                : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                            }`}
                          >
                            {number + 1}
                          </button>
                        );
                      } else if (
                        (number === 1 && currentPage > 2) || 
                        (number === totalPages - 2 && currentPage < totalPages - 3)
                      ) {
                        // Show ellipsis
                        return (
                          <span key={number} className="relative inline-flex items-center px-1 py-1 text-xs font-medium text-gray-700">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  {/* Show current/total on small screens */}
                  <span className="sm:hidden inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded-md border border-gray-300">
                    {currentPage + 1} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1 || totalPages === 0}
                    className={`relative inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                      currentPage === totalPages - 1 || totalPages === 0 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersPage; 