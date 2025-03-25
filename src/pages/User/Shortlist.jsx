import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../contexts/NotificationContext';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import shortlistApi from '../../api/shortlistApi';

/**
 * User Shortlist Page - Modern Design
 * Shows properties saved by the user with elegant card layout
 */
const ShortlistPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
    
    // Fetch user's shortlisted properties
    const fetchShortlist = async () => {
      try {
        setLoading(true);
        
        // Direct API call
        const response = await shortlistApi.getShortlist();
        console.log("Shortlist API Response:", response);
        
        // Process response - already handled by interceptor
        if (response) {
          let shortlistItems = [];
          
          // Check for API response wrapped in data property
          if (response.data && Array.isArray(response.data)) {
            shortlistItems = response.data;
          } else if (Array.isArray(response)) {
            shortlistItems = response;
          } else if (response.properties) {
            shortlistItems = response.properties;
          } else if (response.items) {
            shortlistItems = response.items;
          } else {
            // If it's a single object 
            shortlistItems = [response];
          }
          
          console.log("Processed shortlist data:", shortlistItems);
          setProperties(shortlistItems);
        } else {
          setProperties([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shortlist:', error);
        setLoading(false);
        showNotification({
          type: 'error',
          message: 'Failed to load shortlist. Please try again later.'
        });
      }
    };
    
    fetchShortlist();
  }, [showNotification]);
  
  // Handle property removal from shortlist
  const handleRemoveFromShortlist = async (shortlistId) => {
    try {
      await shortlistApi.removeFromShortlist(shortlistId);
      // Update local state to remove the property
      setProperties(properties.filter(prop => prop.id !== shortlistId));
      showNotification({
        type: 'success',
        message: 'Property removed from shortlist'
      });
    } catch (error) {
      console.error('Error removing from shortlist:', error);
      showNotification({
        type: 'error',
        message: 'Failed to remove property from shortlist'
      });
    }
  };
  
  // Helper function to get property image with fallback
  const getPropertyImage = (property) => {
    if (!property) {
      return '/images/property-placeholder.jpg';
    }
    
    // Try direct imageUrl first
    if (property.imageUrl) {
      return property.imageUrl;
    }
    
    // Try direct thumbnail if available
    if (property.thumbnailUrl) {
      return property.thumbnailUrl;
    }
    
    // Try property images if available
    if (property.propertyImages && property.propertyImages.length > 0) {
      const image = property.propertyImages[0];
      return image.url || image.imageUrl || image.path || null;
    }
    
    // Check for media array (legacy format)
    if (property.media && property.media.length > 0) {
      const image = property.media[0];
      return image.url || image.imageUrl || image.path || null;
    }
    
    // Check for mainImage field
    if (property.mainImage) {
      return property.mainImage;
    }
    
    // Final fallback - local image path instead of external placeholder
    return '/images/property-placeholder.jpg';
  };
  
  // Handle view property click
  const handleViewProperty = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };
  
  // Loading state with spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4 shadow-md"></div>
          <p className="text-neutral-800 font-medium text-sm">Loading your shortlist...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Your Shortlist</h1>
              <p className="text-neutral-700 mt-1">Properties you've saved for future reference</p>
            </div>
            <span className="mt-2 md:mt-0 bg-neutral-100 text-neutral-800 px-3 py-1 rounded-full text-sm font-medium">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'}
            </span>
          </div>
        </div>
        
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">Your Shortlist is Empty</h2>
              <p className="text-neutral-700 mb-6">
                You haven't saved any properties to your shortlist yet. Browse our properties and add your favorites.
              </p>
              <Button 
                as={Link}
                to="/properties" 
                variant="primary"
              >
                Browse Properties
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {properties.map((property) => {
              // Debug property data
              console.log("Rendering property:", property);
              
              // Extract key property fields (handle both data structures)
              const propertyId = property.propertyId || property.id;
              const propertyName = property.propertyName || property.name || "Unnamed Property";
              const propertyLocation = property.propertyLocation || property.location || property.address || "Location not specified";
              const shortlistId = property.id;
              
              return (
                <div 
                  key={shortlistId || `property-${Math.random()}`} 
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Property Image */}
                  <div className="relative cursor-pointer" onClick={() => handleViewProperty(propertyId)}>
                    <div className="h-44 overflow-hidden">
                      <img 
                        src={getPropertyImage(property)} 
                        alt={propertyName} 
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/property-placeholder.jpg';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Property Details */}
                  <div className="p-4">
                    {/* Property Name */}
                    <h3 
                      className="font-bold text-lg text-neutral-900 mb-1 hover:text-primary-600 transition-colors truncate cursor-pointer"
                      onClick={() => handleViewProperty(propertyId)}
                    >
                      {propertyName}
                    </h3>
                    
                    {/* Location */}
                    <div className="flex items-center text-sm text-neutral-700 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate font-medium">
                        {propertyLocation}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                      <Button 
                        onClick={() => handleViewProperty(propertyId)}
                        variant="outline"
                        size="sm"
                        className="text-sm flex-grow mr-2"
                      >
                        View Details
                      </Button>
                      
                      <Button
                        onClick={() => handleRemoveFromShortlist(shortlistId)}
                        variant="ghost"
                        size="sm"
                        className="text-error-500 hover:text-error-600 hover:bg-error-50 text-sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Back to Properties Navigation */}
        <div className="mt-10 pt-6 border-t border-neutral-200 text-center">
          <Button 
            as={Link}
            to="/properties" 
            variant="outline"
            className="mr-3"
          >
            Browse More Properties
          </Button>
          <Button 
            as={Link}
            to="/user/bookings" 
            variant="primary"
          >
            View Your Bookings
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default ShortlistPage; 