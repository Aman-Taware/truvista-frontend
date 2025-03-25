import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropertyCard from '../../components/property/PropertyCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const SearchPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    location: searchParams.get('location') || '',
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // This will be replaced with actual API call
        // For now we'll simulate the data
        // const response = await propertyApi.searchProperties(filters);
        // setProperties(response.data);
        
        // Mock data using PropertyCardDTO structure
        setTimeout(() => {
          setProperties([
            {
              id: 1,
              name: 'Luxury Villa in Greenwood',
              location: 'Bangalore, Karnataka',
              minPrice: 15000000,
              maxPrice: 18000000,
              imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              flatTypes: ['3 BHK', '4 BHK'],
              possessionDate: '2024-03-31',
              workDone: '85%',
              status: 'Nearing Possession',
              isFeatured: false
            },
            {
              id: 2,
              name: 'Modern Apartment in City Center',
              location: 'Mumbai, Maharashtra',
              minPrice: 8500000,
              maxPrice: 11000000,
              imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              flatTypes: ['2 BHK', '3 BHK'],
              possessionDate: '2023-12-31',
              workDone: '100%',
              status: 'Ready to Move',
              isFeatured: true
            },
            {
              id: 3,
              name: 'Spacious Penthouse with Garden',
              location: 'Delhi, NCR',
              minPrice: 22000000,
              maxPrice: 25000000,
              imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              flatTypes: ['4 BHK', '5 BHK'],
              possessionDate: '2024-06-30',
              workDone: '75%',
              status: 'Under Construction',
              isFeatured: false
            },
            {
              id: 4,
              name: 'Cozy 2BHK in Suburb',
              location: 'Pune, Maharashtra',
              minPrice: 4500000,
              maxPrice: 5500000,
              imageUrl: 'https://images.unsplash.com/photo-1543071293-d91175a68672?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              flatTypes: ['2 BHK'],
              possessionDate: '2023-09-30',
              workDone: '100%',
              status: 'Ready to Move',
              isFeatured: false
            }
          ]);
          setLoading(false);
        }, 1000);

      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties');
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    // Will implement actual filtering logic later
  };

  // Handle property click
  const handlePropertyClick = (propertyId) => {
    window.location.href = `/properties/${propertyId}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-6">Search Properties</h1>
      
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={applyFilters}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
              <input
                type="text"
                name="query"
                value={filters.query}
                onChange={handleFilterChange}
                placeholder="Search properties..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Property Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="penthouse">Penthouse</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Min Price</label>
              <select
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">No Min</option>
                <option value="1000000">₹10 Lac</option>
                <option value="3000000">₹30 Lac</option>
                <option value="5000000">₹50 Lac</option>
                <option value="10000000">₹1 Cr</option>
                <option value="20000000">₹2 Cr</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Max Price</label>
              <select
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">No Max</option>
                <option value="3000000">₹30 Lac</option>
                <option value="5000000">₹50 Lac</option>
                <option value="10000000">₹1 Cr</option>
                <option value="20000000">₹2 Cr</option>
                <option value="50000000">₹5 Cr</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Locations</option>
                <option value="bangalore">Bangalore</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
                <option value="pune">Pune</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
      
      {/* Search Results */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Search Results</h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-error-500 text-lg">{error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-10 bg-neutral-50 rounded-lg">
            <p className="text-lg text-neutral-500">No properties found matching your criteria.</p>
            <p className="text-neutral-500 mt-2">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPropertyClick={handlePropertyClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 