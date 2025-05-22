import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyList from '../components/property/PropertyList';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import AuthModal from '../components/auth/AuthModal';
import { getLocationsList, getFeaturedLocations, getLocationStats } from '../data/locations';
import TeamSection from '../components/team/TeamSection';
import propertyApi from '../api/propertyApi';
import Input from '../components/ui/Input';
import { NotificationContext } from '../contexts/NotificationContext';
import useAuth from '../hooks/useAuth';
import { LOCATIONS, FLAT_TYPES, PRICE_RANGES } from '../constants/constants';
import ChatBot from '../components/chat/ChatBot';

/**
 * Home Page Component
 */
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useContext(NotificationContext);
  
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedFlatType, setSelectedFlatType] = useState('');
  const [locationStats, setLocationStats] = useState(null);
  const [searchParams, setSearchParams] = useState({
    location: '',
    flatType: '',
    priceRange: [0, 20000000]
  });
  
  // Store the last intended action
  const [pendingAction, setPendingAction] = useState(null);

  // Add chatbot state
  const [showChatBot, setShowChatBot] = useState(true);

  // Memoize handlers to prevent recreating them on each render
  const handleSearchParamChange = useCallback((param, value) => {
    setSearchParams(prev => ({
      ...prev,
      [param]: value
    }));
  }, []);

  // Handle location selection - Updated to ensure proper state updates
  const handleLocationSelect = useCallback((location) => {
    console.log('Location selected:', location);
    setSelectedLocation(location);
    // Update the search params with the selected location
    setSearchParams(prev => ({
      ...prev,
      location: location
    }));
    setShowLocationModal(false);
  }, []);

  // Add a function to toggle the location modal with debug info
  const toggleLocationModal = useCallback(() => {
    console.log('Toggling location modal. Current state:', !showLocationModal);
    setShowLocationModal(prev => !prev);
  }, [showLocationModal]);

  // Handle search click with auth check - Simplified to ensure it works correctly
  const handleSearch = useCallback(() => {
    console.log('Search clicked with location:', searchParams.location);
    if (!user) {
      showNotification({ 
        type: 'info', 
        message: 'Please log in to search for properties' 
      });
      setPendingAction(() => () => {
        navigate(`/properties${searchParams.location ? `?location=${searchParams.location}` : ''}`);
      });
      setShowAuthModal(true);
      return;
    }
    
    // Navigate directly to properties with location parameter
    navigate(`/properties${searchParams.location ? `?location=${searchParams.location}` : ''}`);
  }, [user, searchParams.location, navigate, showNotification]);

  // Handle property card click
  const handlePropertyClick = useCallback((propertyId) => {
    if (!user) {
      showNotification({ 
        type: 'error', 
        message: 'Please log in to view property details' 
      });
      setPendingAction(() => () => {
        navigate(`/properties/${propertyId}`);
      });
      setShowAuthModal(true);
      return;
    }
    
    navigate(`/properties/${propertyId}`);
  }, [user, navigate, showNotification]);


  const handleViewPropertiesClick = useCallback(() => {
    if (!user) {
      showNotification({ 
        type: 'error', 
        message: 'Please log in to view properties' 
      });
      setPendingAction(() => () => {
        navigate(`/properties`);
      });
      setShowAuthModal(true);
      return;
    }
    
    navigate(`/properties`);
  }, [user, navigate, showNotification]);

  // Handle auth modal close
  const handleAuthModalClose = useCallback(() => {
    setShowAuthModal(false);
    // If user is now authenticated and there was a pending action, execute it
    if (user && pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [user, pendingAction]);

  // Preload the hero image on component mount
  useEffect(() => {
    // Preload the hero background image as soon as possible
    const preloadImage = () => {
      const img = new Image();
      img.src = '/images/hero-background.png';
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = (e) => {
        console.error('Error loading hero image:', e);
        // Fallback to set loaded state true after a delay even if image fails
        setTimeout(() => setImageLoaded(true), 500);
      };
      
      // Set a timeout as a fallback
      const timer = setTimeout(() => {
        setImageLoaded(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    };
    
    preloadImage();
    
    // Add a link tag for browser preloading
    if (!document.querySelector('link[rel="preload"][href="/images/hero-background.png"]')) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = '/images/hero-background.png';
      preloadLink.as = 'image';
      document.head.appendChild(preloadLink);
    }
  }, []);

  // Fetch data only once on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured properties
        const featuredResponse = await propertyApi.getFeaturedProperties();
        console.log('Raw featured response:', featuredResponse);
        
        // Process response data using the extractData helper
        const featuredData = propertyApi.extractData(featuredResponse);
        console.log('Extracted featured data:', featuredData);
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        // Check if featuredData is null, undefined, or empty
        if (!featuredData) {
          console.log('No featured properties returned from API');
          setFeaturedProperties([]);
        } else if (Array.isArray(featuredData)) {
          console.log('Featured properties loaded:', featuredData.length);
          
          // Validate and process the data to match PropertyCardDTO structure
          const processedProperties = featuredData.map(property => {
            // Ensure all properties from PropertyCardDTO are present
            const processed = {
              id: property.id,
              name: property.name || 'Unnamed Property',
              location: property.location || 'Location not specified',
              minPrice: property.minPrice || null,
              maxPrice: property.maxPrice || null,
              imageUrl: property.imageUrl || null,
              featured: property.featured || property.isFeatured || true,
              isFeatured: property.featured || property.isFeatured || true,
              flatTypes: Array.isArray(property.flatTypes) ? property.flatTypes : [],
              possessionDate: property.possessionDate || null,
              workDone: property.workDone || null,
              status: property.status || null
            };
            return processed;
          });
          
          setFeaturedProperties(processedProperties);
        } else {
          console.log('Unexpected data structure for featured properties:', featuredData);
          if (featuredData && typeof featuredData === 'object') {
            if (featuredData.id) {
              setFeaturedProperties([featuredData]);
            } else {
              const possibleArray = Object.values(featuredData).filter(item => item && typeof item === 'object');
              if (possibleArray.length > 0) {
                setFeaturedProperties(possibleArray);
              } else {
                setFeaturedProperties([]);
              }
            }
          } else {
            setFeaturedProperties([]);
          }
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error);
        if (isMounted) {
          setFeaturedProperties([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Hero Section Component with Search - Memoized to prevent unnecessary re-renders
  const HeroSection = useMemo(() => {
    return () => (
      <section className="relative h-[80vh] overflow-hidden">
        {/* Background image with simplified loading - removed scale animation */}
        <div 
          className={`absolute inset-0 bg-cover bg-center ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            backgroundImage: 'url(/images/hero-background.png)', 
            backgroundPosition: 'center 30%',
            transition: 'opacity 0.5s ease' // Simple fade only, no transform
          }}
        >
          {/* Simplified overlay gradient - no backdrop-blur */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-800/75 to-primary-800/40"></div>
        </div>

        {/* Simplified loading experience */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-primary-800 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-secondary-400 border-r-transparent border-b-secondary-400 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-display font-bold text-white">Welcome to Truvista</h3>
            </div>
          </div>
        )}

        {/* Simplified content without heavy animations */}
        <div className={`relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transition: 'opacity 0.5s ease' }} // Simple fade only
        >
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2 font-display">
              Find Your <span className="text-secondary-400">Dream Home</span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-white/90 font-display font-light mb-4">
              in Pune's Premier Locations
            </h2>
            <p className="text-lg text-white/80 mb-6">
              Explore our curated selection of premium properties.
            </p>
            
            {/* Simplified search box with smaller buttons */}
            <div className="bg-white/95 rounded-lg shadow-elegant overflow-hidden">
              <div className="p-3 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={toggleLocationModal}
                  className="flex-1 flex items-center bg-neutral-50 rounded-lg px-3 py-2 text-left border border-neutral-100 hover:border-primary-300 hover:bg-white text-sm"
                  aria-label="Select location"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-neutral-700 font-medium">
                    {searchParams.location ? searchParams.location : 'Select Your Location'}
                  </span>
                </button>
                
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 font-medium shadow-md text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              </div>
            </div>
            
            {/* Simple stats without animations */}
            {locationStats && (
              <div className="mt-6 flex flex-wrap gap-6 text-white">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{locationStats?.total || '250'}+</p>
                    <p className="text-sm text-white/70">Properties</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{locationStats?.totalLocations || '15'}</p>
                    <p className="text-sm text-white/70">Locations</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{locationStats?.avgGrowth || '12'}%</p>
                    <p className="text-sm text-white/70">Avg. Growth</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Removed decorative elements that cause lag */}
      </section>
    );
  }, [imageLoaded, searchParams.location, handleSearch, locationStats, toggleLocationModal]);

  // Location Selection Modal - Reverted to original design but keeping functionality fixes
  const LocationSelectionModal = () => (
    <Modal
      isOpen={showLocationModal}
      onClose={() => setShowLocationModal(false)}
      title="Select Location"
    >
      <div className="grid grid-cols-1 gap-2 p-4">
        {LOCATIONS.map(location => (
          <div 
            key={location}
            className={`
              px-4 py-3 border rounded-md cursor-pointer transition-colors
              ${selectedLocation === location 
                ? 'bg-primary-50 border-primary-500 text-primary-800' 
                : 'hover:bg-neutral-50 border-neutral-200 text-neutral-700'}
            `}
            onClick={() => handleLocationSelect(location)}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 mr-3 ${selectedLocation === location ? 'text-primary-600' : 'text-neutral-400'}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {location}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );


  // Features Section Component
  // const FeaturesSection = () => (
  //   <section className="py-20 bg-white">
  //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //       <div className="text-center mb-16">
  //         <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4 font-display">
  //           Why Choose Truvista
  //         </h2>
  //         <p className="max-w-2xl mx-auto text-neutral-600">
  //           Experience the difference with our premium real estate services
  //         </p>
  //       </div>

  //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
  //         {[
  //           {
  //             icon: (
  //               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  //               </svg>
  //             ),
  //             title: "Trusted Excellence",
  //             description: "20+ years of delivering exceptional luxury real estate services"
  //           },
  //           {
  //             icon: (
  //               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  //               </svg>
  //             ),
  //             title: "24/7 Premium Support",
  //             description: "Round-the-clock assistance from our dedicated team of professionals"
  //           },
  //           {
  //             icon: (
  //               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  //               </svg>
  //             ),
  //             title: "Expert Guidance",
  //             description: "Professional advice from industry leaders with deep local knowledge"
  //           },
  //           {
  //             icon: (
  //               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  //               </svg>
  //             ),
  //             title: "Curated Selection",
  //             description: "Handpicked properties meeting our rigorous standards of excellence"
  //           }
  //         ].map((feature, index) => (
  //           <div 
  //             key={index}
  //             className="text-center bg-white shadow-elegant rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform"
  //           >
  //             <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-primary-600">
  //               {feature.icon}
  //             </div>
  //             <h3 className="text-lg font-semibold mb-3 text-primary-800">{feature.title}</h3>
  //             <p className="text-neutral-600 text-sm">
  //               {feature.description}
  //             </p>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </section>
  // );


  // Featured Properties Section
  const FeaturedPropertiesSection = () => (
    <section className="py-20 bg-neutral-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-50 opacity-50 rounded-full"></div>
      <div className="absolute top-40 -right-20 w-72 h-72 bg-primary-50 opacity-50 rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4 font-display">
            Featured Properties
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-600">
            Explore our handpicked selection of premium properties in Pune's most desirable locations
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" color="primary" />
          </div>
        ) : (
          <div className="property-list-wrapper relative">
            {Array.isArray(featuredProperties) && featuredProperties.length > 0 ? (
              <PropertyList 
                properties={featuredProperties.map(property => ({
                  ...property,
                  // Only mask name for unauthenticated users
                  name: user ? property.name : '******',
                  // Ensure other required fields are present even if null in the API response
                  imageUrl: property.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&h=600&fit=crop',
                  flatTypes: property.flatTypes || [],
                  // Keep the original featured flag value (don't override it)
                  featured: property.featured === true,
                  isFeatured: property.featured === true // Keep for backward compatibility
                }))} 
                columns={3} 
                onPropertyClick={handlePropertyClick}
              />
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-elegant p-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 text-primary-600 rounded-full mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-display font-semibold text-primary-800 mb-3">No featured properties available</h3>
                <p className="text-neutral-600 mb-6">Check back soon as we're constantly adding new premium properties to our portfolio.</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            onClick={handleViewPropertiesClick}
            variant="primary"
            size="lg"
            className="shadow-md hover:shadow-lg transition-all duration-300"
          >
            View All Properties
          </Button>
        </div>
      </div>
    </section>
  );

  // Testimonials Section
  // const TestimonialsSection = () => (
  //   <section className="py-24 bg-neutral-50 relative">
  //     <div className="absolute inset-0 bg-gradient-to-br from-primary-800/5 to-primary-600/5"></div>
      
  //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
  //       <div className="text-center mb-16">
  //         <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4 font-display">
  //           What Our Clients Say
  //         </h2>
  //         <p className="max-w-2xl mx-auto text-neutral-600">
  //           Discover why our clients trust us for their real estate needs
  //         </p>
  //       </div>
        
  //       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  //         {[
  //           {
  //             name: 'Aditya Sathe',
  //             role: 'Property Buyer',
  //             content: 'Truvista helped me find the perfect home for my family. Their attention to detail and understanding of our needs made the process seamless and enjoyable.',
  //             avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  //           },
  //           {
  //             name: 'Siddhi Lonari',
  //             role: 'Property Investor',
  //             content: "I've used Truvista for multiple investment properties. Their market insights and property selections have consistently delivered excellent returns on my investments.",
  //             avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  //           },
  //           {
  //             name: 'Rahul Mehta',
  //             role: 'First-time Buyer',
  //             content: "As a first-time buyer, I was nervous about the process. Truvista's team guided me every step of the way, from financing options to final documentation. Highly recommended!",
  //             avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
  //           }
  //         ].map((testimonial, index) => (
  //           <div 
  //             key={index}
  //             className="bg-white p-8 rounded-xl shadow-elegant hover:shadow-lg transition-all duration-300 relative"
  //           >
  //             <div className="absolute top-6 right-8 text-secondary-300">
  //               <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="none">
  //                 <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.95.78-3 .53-.81 1.24-1.48 2.13-2 .33-.2.58-.6.58-.98 0-.06 0-.12-.03-.18-.07-.21-.21-.36-.38-.43-.21-.09-.47-.09-.7.05-2.14 1.23-3.74 3.07-4.54 5.18-.35.95-.5 1.95-.5 2.97 0 1.1.29 2.2.89 3.14.58.92 1.39 1.56 2.4 1.89.44.15.88.22 1.33.22.76 0 1.51-.22 2.14-.65.71-.49 1.27-1.21 1.56-2.05.2-.62.31-1.28.31-1.94 0-.06 0-.11-.01-.16z" />
  //                 <path d="M21.048 15.757c0-.88-.23-1.618-.69-2.217-.326-.42-.768-.683-1.327-.812-.55-.128-1.066-.137-1.54-.028-.16-.95.1-1.95.78-3 .53-.81 1.24-1.48 2.13-2 .33-.2.58-.6.58-.98 0-.06 0-.12-.03-.18-.07-.21-.21-.36-.38-.43-.21-.09-.47-.09-.7.05-2.14 1.23-3.74 3.07-4.54 5.18-.35.95-.5 1.95-.5 2.97 0 1.1.29 2.2.89 3.14.58.92 1.39 1.56 2.4 1.89.44.15.88.22 1.33.22.76 0 1.51-.22 2.14-.65.71-.49 1.27-1.21 1.56-2.05.2-.62.31-1.28.31-1.94 0-.06 0-.11-.01-.16z" />
  //               </svg>
  //             </div>
            
  //             <p className="text-neutral-700 italic mb-6 pt-4">{testimonial.content}</p>
              
  //             <div className="flex items-center mt-6">
  //               <img 
  //                 src={testimonial.avatar} 
  //                 alt={testimonial.name} 
  //                 className="w-12 h-12 rounded-full mr-4 border-2 border-secondary-100" 
  //               />
  //               <div>
  //                 <p className="font-semibold text-primary-800">{testimonial.name}</p>
  //                 <p className="text-neutral-500 text-sm">{testimonial.role}</p>
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </section>
  // );

  // CTA Section
  const CtaSection = () => (
    <section className="py-24 bg-primary-800 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900 to-primary-800"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-700 opacity-30 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-primary-700 opacity-10 transform rotate-6 scale-150 origin-bottom-right"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 className="text-3xl md:text-4xl text-white/80 lg:text-5xl font-display font-bold mb-6">
          Ready to Find Your Dream Property?
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
          Let our experienced team guide you through your property journey.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={() => {handleViewPropertiesClick}}
            variant="secondary" 
            size="lg"
            className="min-w-[180px] shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1 transform"
          >
            View Properties
          </Button>
          <Button 
            onClick={() => navigate('/contact')}
            variant="outline" 
            size="lg"
            className="min-w-[180px] border-white text-white hover:bg-white/10 shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1 transform"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );

  // Handle chatbot search
  const handleChatbotSearch = (filters) => {
    const params = new URLSearchParams();
    
    // Add all non-empty filters to URL params
    if (filters.location) params.set('location', filters.location);
    if (filters.flatType) params.set('flatType', filters.flatType.replace(/\s+/g, ''));
    if (filters.minPrice) params.set('priceRange', `${filters.minPrice}-${filters.maxPrice || ''}`);
    
    // Navigate to properties page with filters
    navigate(`/properties?${params.toString()}`);
  };

  // Close chatbot
  const handleCloseChatBot = () => {
    setShowChatBot(false);
  };

  // Memoize the main sections to prevent unnecessary re-renders
  const MemoizedHeroSection = React.memo(HeroSection);
  const MemoizedFeaturedPropertiesSection = React.memo(FeaturedPropertiesSection);
  // const MemoizedFeaturesSection = React.memo(FeaturesSection);
  // const MemoizedTestimonialsSection = React.memo(TestimonialsSection);
  const MemoizedCtaSection = React.memo(CtaSection);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <MemoizedHeroSection />
      <MemoizedFeaturedPropertiesSection />
      {/* <MemoizedFeaturesSection />
      <MemoizedTestimonialsSection /> */}
      <MemoizedCtaSection />
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose} 
      />
      
      {/* Location Selection Modal - Render at top level */}
      <LocationSelectionModal />
      
      {/* ChatBot Component */}
      {showChatBot && (
        <ChatBot 
          onSearch={handleChatbotSearch}
          onClose={handleCloseChatBot}
        />
      )}
    </div>
  );
};

export default Home; 