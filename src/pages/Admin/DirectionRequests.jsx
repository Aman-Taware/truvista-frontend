import { useState, useEffect, useContext, useCallback } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../api/adminApi';
import { NotificationContext } from '../../contexts/NotificationContext';
import { debounce } from 'lodash';

const DirectionRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and Sorting State
  const [filters, setFilters] = useState({
    propertyId: '',
    startDate: '',
    endDate: '',
  });
  const [sortBy, setSortBy] = useState('requestedAt');
  const [sortDir, setSortDir] = useState('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { addNotification } = useContext(NotificationContext);

  const fetchDirectionRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDir,
      };
      const data = await adminApi.getDirectionRequests(params);
      if (data && data.content) {
        setRequests(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        // This case might handle a flat array response if the API is inconsistent
        setRequests(Array.isArray(data) ? data : []);
        setTotalPages(Array.isArray(data) ? 1 : 0);
        setTotalElements(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      setError('Failed to fetch direction requests.');
      addNotification('error', 'Failed to fetch direction requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize, sortBy, sortDir, addNotification]);

  const fetchProperties = useCallback(async () => {
    try {
      const props = await adminApi.getAllProperties();
      if (props && Array.isArray(props)) {
        setProperties(props);
      }
    } catch (err) {
        addNotification('error', 'Failed to fetch properties for filter.');
        console.error(err);
    }
  }, [addNotification]);


  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    const debouncedFetch = debounce(() => fetchDirectionRequests(), 500);
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [fetchDirectionRequests]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(0); // Reset to first page on filter change
  };

  const resetFilters = () => {
    setFilters({
      propertyId: '',
      startDate: '',
      endDate: '',
    });
    setSortBy('requestedAt');
    setSortDir('desc');
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
        setCurrentPage(newPage);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="sm:flex sm:items-center mb-4 sm:mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Direction Enquiries</h1>
            <p className="mt-1 text-sm text-gray-700">
              A list of all user requests for property directions.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">Property</label>
              <select
                id="propertyId"
                name="propertyId"
                value={filters.propertyId}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Properties</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>{prop.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-1 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-1 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">User</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Property</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('requestedAt')}>
                      Requested At
                      {sortBy === 'requestedAt' && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr>
                  ) : error ? (
                    <tr><td colSpan="3" className="text-center py-4 text-red-500">{error}</td></tr>
                  ) : requests.length > 0 ? (
                    requests.map((req) => (
                      <tr key={req.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <button 
                            onClick={() => { setSelectedRequest(req); setIsModalOpen(true); }}
                            className="text-indigo-600 hover:text-indigo-900 hover:underline focus:outline-none"
                          >
                            {req.userName}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{req.propertyName}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(req.requestedAt).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="text-center py-4">No direction requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Pagination */}
        {totalPages > 0 && (
           <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
           <div className="flex flex-1 justify-between sm:hidden">
             <button
               onClick={() => handlePageChange(currentPage - 1)}
               disabled={currentPage === 0}
               className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
             >
               Previous
             </button>
             <button
               onClick={() => handlePageChange(currentPage + 1)}
               disabled={currentPage >= totalPages - 1}
               className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
             >
               Next
             </button>
           </div>
           <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
             <div>
               <p className="text-sm text-gray-700">
                 Showing <span className="font-medium">{(currentPage * pageSize) + 1}</span> to <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> of{' '}
                 <span className="font-medium">{totalElements}</span> results
               </p>
             </div>
             <div>
               <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                 <button
                   onClick={() => handlePageChange(currentPage - 1)}
                   disabled={currentPage === 0}
                   className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                 >
                   <span className="sr-only">Previous</span>
                   &lt;
                 </button>
                 {/* Page numbers can be added here if needed */}
                 <button
                   onClick={() => handlePageChange(currentPage + 1)}
                   disabled={currentPage >= totalPages - 1}
                   className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                 >
                   <span className="sr-only">Next</span>
                   &gt;
                 </button>
               </nav>
             </div>
           </div>
         </div>
        )}

        {/* User Detail Modal */}
        {isModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">User Details</h3>
                <div className="mt-2 px-7 py-3 text-left">
                  <p className="text-sm text-gray-500"><strong className="font-medium text-gray-800">Name:</strong> {selectedRequest.userName}</p>
                  <p className="text-sm text-gray-500 mt-2"><strong className="font-medium text-gray-800">Email:</strong> {selectedRequest.userEmail}</p>
                  <p className="text-sm text-gray-500 mt-2"><strong className="font-medium text-gray-800">Contact:</strong> {selectedRequest.userContactNo}</p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    id="ok-btn"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    Close
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

export default DirectionRequestsPage;
