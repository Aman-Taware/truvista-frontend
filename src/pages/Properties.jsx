import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import { Section } from '../components/ui/Container';
import Button from '../components/ui/Button';
import { Select, MultiSelect } from '../components/ui/Input';
import Input from '../components/ui/Input';
import PropertyList from '../components/property/PropertyList';
import propertyApi from '../api/propertyApi';
import { LOCATIONS, FLAT_TYPES, PRICE_RANGES, SORT_OPTIONS } from '../constants/constants';
import { toast } from 'react-hot-toast';

/**
 * Properties/Search Page Component
 * Displays property listings with search and filter capabilities
 */
const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProperties, setTotalProperties] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 0;
  });
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    location: searchParams.get('location') || '',
    flatType: searchParams.get('flatType') || '',
    priceRange: searchParams.get('priceRange') || 'all',
    sort: searchParams.get('sort') || 'featured'
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const PAGE_SIZE = 6;

  // Available locations for dropdown
  const locationOptions = [
    {value: "all", label: "All Locations"},
    ...LOCATIONS.map(location => ({
      value: location,
      label: location
    }))
  ];

  // Available flat types for dropdown
  const flatTypeOptions = [
    {value: "all", label: "All Flat Types"},
    ...FLAT_TYPES.map(type => ({
      value: type.replace(/\s+/g, ''),  // Remove spaces, e.g., "1 BHK" becomes "1BHK"
      label: type
    }))
  ];

  // Available price ranges for dropdown
  const priceRangeOptions = [
    { value: 'all', label: 'All Price Ranges' },
    ...PRICE_RANGES.map(range => ({
      value: `${range.min}-${range.max}`,
      label: range.label
    }))
  ];

  // Sorting options - remove "newest" option
  const sortOptions = SORT_OPTIONS.filter(option => option.value !== 'newest');

  // Fetch properties based on filters
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setProperties([]);
      
      try {
        // Parse price range
        let minPrice = null;
        let maxPrice = null;
        if (filters.priceRange && filters.priceRange !== 'all') {
          const [min, max] = filters.priceRange.split('-').map(Number);
          minPrice = min;
          maxPrice = max;
        }

        // Prepare API filters
        const apiFilters = {
          name: filters.name || null,
          location: filters.location === 'all' ? null : filters.location,
          
          // Fix flatTypes format - ensure it's a single string without spaces (not an array)
          flatTypes: filters.flatType && filters.flatType !== 'all' 
            ? filters.flatType  // Already in format "2BHK" without spaces
            : null,
            
          minPrice,
          maxPrice,
          page: currentPage,
          size: PAGE_SIZE,
          sortBy: filters.sort === 'featured' ? 'featured' : 'price',
          sortDirection: filters.sort === 'price_low' ? 'asc' : 'desc'
        };

        console.log('Sending filters to API:', apiFilters);

        // Call API
        const response = await propertyApi.searchProperties(apiFilters);
        
        if (response.success) {
          console.log('Received successful response:', response.data);
          setProperties(response.data.content || []);
          setTotalProperties(response.data.totalElements || 0);
          setTotalPages(response.data.totalPages || 0);
        } else {
          console.error('API returned error:', response.message);
          toast.error(response.message || 'Failed to fetch properties');
          setProperties([]);
          setTotalProperties(0);
          setTotalPages(0);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to fetch properties');
        setProperties([]);
        setTotalProperties(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters, currentPage]);

  // Update URL search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.location && filters.location !== 'all') params.set('location', filters.location);
    if (filters.flatType && filters.flatType !== 'all') params.set('flatType', filters.flatType);
    if (filters.priceRange && filters.priceRange !== 'all') params.set('priceRange', filters.priceRange);
    if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort);
    
    // Always include the current page if not on the first page
    if (currentPage > 0) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [filters, setSearchParams, currentPage]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    console.log(`Filter changed: ${name} = ${value}`);
    
    // Special handling for page changes
    if (name === 'page') {
      setCurrentPage(value);
      
      // Update URL with new page
      const params = new URLSearchParams(searchParams);
      params.set('page', value);
      setSearchParams(params);
      return;
    }
    
    // For non-page filters, reset to first page
    setCurrentPage(0);
    
    const newFilters = { ...filters, [name]: value };
    
    // Update state
    setFilters(newFilters);
    
    // Update URL parameters - only add non-empty values
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val && val !== 'all' && val !== '') {
        params.set(key, val);
      }
    });
    
    setSearchParams(params);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    // Use handleFilterChange with special page handling
    handleFilterChange('page', pageNumber);
    
    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Apply all filters
  const handleApplyFilters = () => {
    setShowMobileFilters(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      name: '',
      location: '',
      flatType: '',
      priceRange: 'all',
      sort: 'featured'
    });
    
    // Reset pagination
    setCurrentPage(0);
    
    // Clear all search params
    setSearchParams(new URLSearchParams());
  };

  // Handle property card click
  const handlePropertyClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  return (
    <div className="bg-neutral-50 py-4">
      <Container>
        {/* Enhanced Search Bar - Prominent at the top */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
          <div className="mb-3">
            <Input 
              type="text"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Search by property name or keywords"
              className="w-full"
              size="sm"
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          
          {/* Desktop Filters */}
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Select 
                label="Location"
                options={locationOptions}
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                size="sm"
              />
              
              <MultiSelect
                label="Flat Type"
                options={flatTypeOptions}
                value={filters.flatType}
                onChange={(e) => handleFilterChange('flatType', e.target.value)}
                size="sm"
              />
              
              <Select
                label="Price Range"
                options={priceRangeOptions}
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                size="sm"
              />
              
              <Select
                label="Sort By"
                options={sortOptions}
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                size="sm"
              />
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="ghost" 
                onClick={handleResetFilters}
                className="mr-2"
                size="sm"
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          {/* Mobile Filter Button */}
          <div className="md:hidden flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center"
              size="xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="inline-block">Filters</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Filters Modal with overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white rounded-t-lg md:rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-primary-800">Filters</h3>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="text-neutral-400 hover:text-neutral-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <Select 
                    label="Location"
                    options={locationOptions}
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                  
                  <MultiSelect
                    label="Flat Type"
                    options={flatTypeOptions}
                    value={filters.flatType}
                    onChange={(e) => handleFilterChange('flatType', e.target.value)}
                  />
                  
                  <Select
                    label="Price Range"
                    options={priceRangeOptions}
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  />
                  
                  <Select
                    label="Sort By"
                    options={sortOptions}
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  />
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={handleApplyFilters}
                    size="sm"
                  >
                    Apply Filters
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    fullWidth
                    onClick={handleResetFilters}
                    size="sm"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-3">
          <div className="bg-white rounded-md shadow-sm px-2 py-1 inline-flex items-center text-xs">
            <span className="text-neutral-600 mr-1">
              {loading 
                ? 'Searching properties...' 
                : `Found ${totalProperties} ${totalProperties === 1 ? 'property' : 'properties'}`}
            </span>
            {!loading && totalProperties > 0 && (
              <span className="bg-primary-100 text-primary-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {totalProperties}
              </span>
            )}
          </div>
        </div>
        
        {/* Property List */}
        <PropertyList 
          properties={properties} 
          isLoading={loading}
          emptyMessage="No properties match your search criteria."
          className="mb-6"
          onPropertyClick={handlePropertyClick}
        />
        
        {/* Enhanced Pagination */}
        {properties.length > 0 && !loading && totalPages > 0 && (
          <div className="flex justify-center mt-6">
            <div className="inline-flex bg-white rounded-md shadow-sm text-xs">
              {/* Previous Page Button */}
              <Button
                variant={currentPage === 0 ? 'disabled' : 'ghost'}
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="!rounded-r-none border-r text-primary-600"
                size="xs"
              >
                <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Prev
              </Button>
              
              {/* Page Numbers */}
              <div className="hidden md:flex">
                {[...Array(Math.min(totalPages, 5)).keys()].map(idx => {
                  // Show at most 5 pages with current page in the middle if possible
                  let pageNum;
                  if (totalPages <= 5) {
                    // If we have 5 or fewer pages, show all
                    pageNum = idx;
                  } else if (currentPage < 2) {
                    // If we're at the beginning, show first 5 pages
                    pageNum = idx;
                  } else if (currentPage > totalPages - 3) {
                    // If we're at the end, show last 5 pages
                    pageNum = totalPages - 5 + idx;
                  } else {
                    // Otherwise, show 2 pages before and after current page
                    pageNum = currentPage - 2 + idx;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-2 py-1 border-r text-xs font-medium ${
                        currentPage === pageNum
                          ? "bg-primary-50 text-primary-700 font-semibold"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              
              {/* Current Page Indicator for Mobile */}
              <div className="md:hidden px-2 py-1 border-r text-xs font-medium bg-primary-50 text-primary-700">
                Page {currentPage + 1} of {totalPages}
              </div>
              
              {/* Next Page Button */}
              <Button
                variant={currentPage === totalPages - 1 ? 'disabled' : 'ghost'}
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="!rounded-l-none text-primary-600"
                size="xs"
              >
                Next
                <svg className="h-3 w-3 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Properties; 