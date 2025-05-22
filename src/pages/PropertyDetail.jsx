import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import propertyApi from '../api/propertyApi';
import shortlistApi from '../api/shortlistApi';
import bookingApi from '../api/bookingApi';
import { formatPrice, formatPriceRange } from '../utils/format';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';

/**
 * Property Detail Page - Royal & Elegant Design with Compact Layout
 */
const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showNotification } = useContext(AuthContext);
  const { showNotification: showToast } = useContext(NotificationContext);
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inShortlist, setInShortlist] = useState(false);
  const [activeFlatType, setActiveFlatType] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [checkingShortlist, setCheckingShortlist] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHasBooking, setUserHasBooking] = useState(false);
  const [userBookingDetails, setUserBookingDetails] = useState(null);
  const [checkingBookings, setCheckingBookings] = useState(false);
  const [locationPrompt, setLocationPrompt] = useState(false);

  // Fetch property details on component mount
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchPropertyDetails = async () => {
      setLoading(true);
      try {
        const response = await propertyApi.getPropertyById(id);
        // Extract data from the ApiResponse wrapper
        const propertyData = propertyApi.extractData(response);
        console.log("Property data from API:", propertyData);
        
        // Debug media information
        if (propertyData && propertyData.media) {
          console.log("Media data:", propertyData.media);
        }
        
        setProperty(propertyData);
        
        // Set the first flat type as active by default
        if (propertyData && propertyData.flats && propertyData.flats.length > 0) {
          // Group flats by type
          const flatTypes = [...new Set(propertyData.flats.map(flat => flat.type))];
          setActiveFlatType(flatTypes[0]);
        }
        
        // Check if user is logged in, then check shortlist status and booking status
        if (user) {
          checkShortlistStatus(propertyData.id);
          checkUserBookingStatus(propertyData.id);
        } else {
          // Reset states if user is not logged 
          setInShortlist(false);
          setUserHasBooking(false);
          setUserBookingDetails(null);
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
        showToast({
          type: 'error',
          message: 'Failed to load property details. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id, user]);

  // Add a separate effect to check booking status when user state changes
  useEffect(() => {
    // Only check if we have both a user and property id
    if (user && property && property.id) {
      console.log("User state changed, re-checking booking status");
      checkUserBookingStatus(property.id);
      checkShortlistStatus(property.id);
    } else if (!user) {
      // Reset booking and shortlist state when user logs out
      setUserHasBooking(false);
      setUserBookingDetails(null);
      setInShortlist(false);
    }
  }, [user]);

  // Check if the user has already booked a visit for this property
  const checkUserBookingStatus = async (propertyId) => {
    if (!user) return;
    
    setCheckingBookings(true);
    try {
      const response = await bookingApi.getUserBookings();
      console.log("User bookings API response:", response);
      
      // First try to use the extractData method
      let bookings = bookingApi.extractData(response) || [];
      
      // If the extracted bookings is empty but the response isn't, use the response directly
      if (bookings.length === 0 && response && (Array.isArray(response) && response.length > 0)) {
        console.log("extractData returned empty array but response contains data, using response directly");
        bookings = response;
      }
      
      console.log("Bookings to process:", bookings);
      
      // Find booking for this property - check all possible property ID paths
      const propertyBooking = Array.isArray(bookings) && 
        bookings.find(booking => {
          const bookingPropertyId = booking.propertyId || 
            (booking.property && (booking.property.id || booking.property.propertyId));
          
          // Convert both to strings for comparison to avoid type issues
          return String(bookingPropertyId) === String(propertyId);
        });
      
      const hasBooking = !!propertyBooking;
      console.log(`User ${hasBooking ? 'has' : 'does not have'} a booking for property ${propertyId}`);
      console.log("Property booking found:", propertyBooking);
      
      // Update state based on booking status
      setUserHasBooking(hasBooking);
      if (hasBooking && propertyBooking) {
        setUserBookingDetails({
          id: propertyBooking.id,
          visitDate: propertyBooking.visitDate,
          status: propertyBooking.status || 'pending',
          notes: propertyBooking.notes
        });
      } else {
        setUserBookingDetails(null);
      }
    } catch (error) {
      console.error("Error checking booking status:", error);
      setUserHasBooking(false);
      setUserBookingDetails(null);
    } finally {
      setCheckingBookings(false);
    }
  };
  
  // Check if the property is in the user's shortlist
  const checkShortlistStatus = async (propertyId) => {
    if (!user) return;
    
    setCheckingShortlist(true);
    try {
      const response = await shortlistApi.isShortlisted(propertyId);
      const result = shortlistApi.extractData(response);
      setInShortlist(result?.shortlisted || false);
    } catch (error) {
      console.error('Error checking shortlist status:', error);
      // Silent fail - don't show error to user
    } finally {
      setCheckingShortlist(false);
    }
  };

  const toggleShortlist = async () => {
    // Check if user is logged in
    if (!user) {
      showToast({
        type: 'warning',
        message: 'Please log in to save properties to your shortlist'
      });
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    
    try {
      // Optimistic UI update
      setInShortlist(prev => !prev);
      
      // Call API to toggle shortlist status
      const response = await shortlistApi.toggleShortlist(property.id);
      const result = shortlistApi.extractData(response);
      
      // Update based on actual result from server
      if (result && typeof result.shortlisted === 'boolean') {
        setInShortlist(result.shortlisted);
      }
      
      // Show notification
      showToast({
        type: 'success',
        message: inShortlist 
          ? 'Property removed from shortlist' 
          : 'Property added to shortlist'
      });
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      
      // Revert optimistic update
      setInShortlist(prev => !prev);
      
      showToast({
        type: 'error',
        message: 'Failed to update shortlist. Please try again.'
      });
    }
  };

  const handleBookSiteVisit = () => {
    // Prevent booking if user already has a booking
    if (userHasBooking) {
      console.log("User already has a booking for this property");
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      showToast({
        type: 'warning',
        message: 'Please log in to book a site visit'
      });
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    
    // Open booking modal
    setBookingModalOpen(true);
    // Clear the location prompt if it was showing
    setLocationPrompt(false);
  };

  // Function to open WhatsApp with contact number and pre-filled message
  const openWhatsApp = (contactNumber) => {
    if (!contactNumber) {
      showToast({
        type: 'error',
        message: 'Contact number not available. Please contact support.'
      });
      return;
    }

    // Clean the contact number (remove non-numeric characters)
    const cleanNumber = contactNumber.replace(/\D/g, '');
    
    // Create pre-filled message with property name
    const message = encodeURIComponent(`Hi, I've booked a visit for ${property.name} and would like to know the exact location for my visit.`);
    
    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };
  
  // Handle location button click
  const handleLocationClick = () => {
    if (!user) {
      showToast({
        type: 'warning',
        message: 'Please log in to access property location'
      });
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    
    if (userHasBooking && property.assignedUser && property.assignedUser.contactNo) {
      // If user has already booked, open WhatsApp with assigned user's contact
      openWhatsApp(property.assignedUser.contactNo);
    } else {
      // If user hasn't booked, show booking modal with prompt
      setLocationPrompt(true);
      setBookingModalOpen(true);
    }
  };
  
  const submitBooking = async (e) => {
    e.preventDefault();
    
    if (!bookingDate) {
      showToast({
        type: 'warning',
        message: 'Please select a date for your visit'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // The backend expects just the date in LocalDate format
      const bookingData = {
        visitDate: bookingDate, // This is already in YYYY-MM-DD format from the date input
        notes: bookingNote || 'No additional notes'
      };
      
      // Call booking API
      const response = await bookingApi.createBooking(property.id, bookingData);
      const bookingResponse = bookingApi.extractData(response);
      
      console.log("Booking creation successful:", bookingResponse);
      
      showToast({
        type: 'success',
        message: 'Your site visit has been scheduled successfully!'
      });
      
      // Close modal and reset form
      setBookingModalOpen(false);
      setBookingDate('');
      setBookingNote('');
      
      // Update booking status and details immediately (don't rely on another API call)
      setUserHasBooking(true);
      setUserBookingDetails({
        visitDate: bookingDate,
        status: 'PENDING',
        bookingId: bookingResponse?.id || bookingResponse?.bookingId || null
      });
      
      // Only open WhatsApp if the booking was initiated from the location button
      const wasLocationPrompt = locationPrompt;
      setLocationPrompt(false); // Reset location prompt
      
      if (wasLocationPrompt && property.assignedUser && property.assignedUser.contactNo) {
        setTimeout(() => {
          openWhatsApp(property.assignedUser.contactNo);
        }, 500); // Small delay to ensure UI updates first
      } else {
        // Redirect to bookings page if not initiated from location button
        setTimeout(() => {
          navigate('/user/bookings');
        }, 500); // Small delay to ensure toast is visible
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // Check for specific error responses
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Failed to schedule your visit. Please try again.';
      
      // If the error indicates the user already has a booking, update our state
      if (errorMessage.toLowerCase().includes('already booked') || 
          errorMessage.toLowerCase().includes('existing booking')) {
        setUserHasBooking(true);
        // Reset form and close modal
        setBookingModalOpen(false);
        setBookingDate('');
        setBookingNote('');
      }
      
      showToast({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group flats by type for the available configurations section
  const getFlatsByType = () => {
    if (!property || !property.flats) return {};
    
    return property.flats.reduce((acc, flat) => {
      if (!acc[flat.type]) {
        acc[flat.type] = [];
      }
      acc[flat.type].push(flat);
      return acc;
    }, {});
  };

  // Function to handle image loading errors
  const handleImageError = () => {
    console.error("Failed to load property image");
    setImageError(true);
  };

  // Get image URL with fallback
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // Check different property names that might contain the URL
    const url = image.url || image.imageUrl || image.path || null;
    
    // If URL starts with a relative path, try to convert to absolute
    if (url && url.startsWith('/')) {
      // Check if there's a base URL defined in the API
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      return `${baseUrl}${url}`;
    }
    
    return url;
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get the status color for booking status badge
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('cancel')) return 'text-red-600';
    if (statusLower.includes('complet')) return 'text-gray-600';
    if (statusLower.includes('confirm')) return 'text-green-600';
    return 'text-purple-600'; // PENDING or any other status
  };

  // Loading state with elegant spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-neutral-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4 shadow-elegant"></div>
          <p className="text-neutral-700 font-medium text-sm">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Error state with elegant design
  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-elegant border border-neutral-200">
          <h2 className="text-xl font-bold text-primary-800 mb-3">Property Not Found</h2>
          <p className="text-neutral-600 text-sm mb-5">We couldn't find the property you're looking for. It may have been removed or the ID is incorrect.</p>
          <Button
            as={Link}
            to="/properties"
            variant="primary"
          >
            View All Properties
          </Button>
        </div>
      </div>
    );
  }

  // Organize flats by type
  const flatsByType = getFlatsByType();
  const flatTypes = Object.keys(flatsByType);

  // Filter media items by type for easier access - using backend MediaType enum values
  const propertyImages = property.media?.filter(m => m.mediaType === 'PROPERTY_IMAGE') || [];
  const floorPlanImage = property.media?.find(m => m.mediaType === 'FLOOR_PLAN');
  const brochureMedia = property.media?.find(m => m.mediaType === 'BROCHURE');
  const layoutMedia = property.media?.find(m => m.mediaType === 'LAYOUT');
  const videoMedia = property.media?.find(m => m.mediaType === 'VIDEO');
  const qrCodeImage = property.media?.find(m => m.mediaType === 'QR_CODE');
  const reraCertificate = property.media?.find(m => m.mediaType === 'RERA_CERTIFICATE');
  
  console.log("Property Images:", propertyImages);
  console.log("Media types available:", property.media?.map(m => m.mediaType));
  
  // If no property images are found, use a default image or placeholder
  const hasImages = propertyImages.length > 0;
  const fallbackImageUrl = "https://via.placeholder.com/800x600?text=Property+Image+Not+Available";

  // Main content
  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Property Image Slider with Enhanced Design */}
      <div className="relative w-full bg-primary-800">
        {hasImages || imageError ? (
          <>
            <div className="relative h-60 md:h-[350px] overflow-hidden">
              <img 
                src={imageError ? fallbackImageUrl : getImageUrl(propertyImages[activeImageIndex])}
                alt={property.name || "Property Image"} 
                className="w-full h-full object-cover object-center"
                onError={handleImageError}
              />
              {/* Darker gradient overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40"></div>
              
              {/* Image counter */}
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {activeImageIndex + 1} / {propertyImages.length}
              </div>
              
            </div>
            
            {/* Left/Right Navigation Arrows - Enhanced Design */}
            {hasImages && propertyImages.length > 1 && !imageError && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1))}
                  className="bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1))}
                  className="bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Image navigation dots */}
            {hasImages && propertyImages.length > 1 && !imageError && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1 pointer-events-none">
                <div className="bg-black/40 px-2 py-1 rounded-full flex space-x-1">
                  {propertyImages.map((_, index) => (
                    <button 
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-all pointer-events-auto ${
                        index === activeImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-60 md:h-[350px] bg-neutral-200 flex items-center justify-center">
            <p className="text-neutral-600 text-sm">No images available</p>
          </div>
        )}
      </div>

      <Container className="pt-4">
        {/* Property Title and Basic Info - Now More Compact */}
        <Card variant="elegant" className="mb-3">
          <Card.Header divided className="pb-2">
            {/* Title moved from image overlay to here */}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-800 mb-1">
              {property.name}
            </h1>
            
            <div className="flex justify-between items-start">
              <div className="flex items-center text-neutral-700 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-bold text-neutral-800">{property.location}</span>
              </div>
            </div>
            
            {/* Price Range with asterisk */}
            <div className="mt-1 flex items-center">
              <div className="text-xl font-bold text-primary-700">
                {formatPriceRange(property.minPrice, property.maxPrice)}*
              </div>
              <span className="ml-1 text-xs text-gray-400 italic">All Inc.</span>
            </div>
          </Card.Header>
          
          {/* Key Details - Single column layout */}
          <div className="bg-neutral-50 p-2 rounded-md border border-neutral-100">
            <div className="space-y-1.5">
              {/* Possession Date */}
              {property.possessionDate && (
                <div className="flex items-center justify-between text-neutral-800">
                  <span className="text-xs text-neutral-900 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Possession
                  </span>
                  <span className="text-xs font-medium">{new Date(property.possessionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              )}
              
              {/* Construction Status */}
              {property.workDone && (
                <div className="flex items-center justify-between text-neutral-800">
                  <span className="text-xs text-neutral-900 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-secondary-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Construction
                  </span>
                  <span className="text-xs font-medium">{property.workDone}%</span>
                </div>
              )}
              
              {/* RERA Number */}
              {property.reraNo && (
                <div className="flex items-center justify-between text-neutral-800">
                  <span className="text-xs text-neutral-900 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    RERA No.
                  </span>
                  <a href={property.reraUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:text-primary-700 transition-colors">
                    {property.reraNo}
                  </a>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons - Fixed alignment issues */}
        <div className="mb-3 grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {brochureMedia && getImageUrl(brochureMedia) && (
            <Button
              variant="outline"
              className="text-xs text-primary-800 border-primary-200 bg-white flex items-center justify-center"
              as="a"
              href={getImageUrl(brochureMedia)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="inline-block">Brochure</span>
            </Button>
          )}
          
          {layoutMedia && getImageUrl(layoutMedia) && (
            <Button
              variant="outline"
              className="text-xs text-primary-800 border-primary-200 bg-white flex items-center justify-center"
              as="a"
              href={getImageUrl(layoutMedia)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="inline-block">Layout</span>
            </Button>
          )}

          {floorPlanImage && getImageUrl(floorPlanImage) && (
            <Button
              variant="outline"
              className="text-xs text-primary-800 border-primary-200 bg-white flex items-center justify-center"
              as="a"
              href={getImageUrl(floorPlanImage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <span className="inline-block">Floor Plan</span>
            </Button>
          )}
          
          {/* Video Tour button */}
          {(videoMedia && getImageUrl(videoMedia)) && (
            <Button
              variant="outline"
              className="text-xs text-primary-800 border-primary-200 bg-white flex items-center justify-center"
              as="a"
              href={getImageUrl(videoMedia)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="inline-block">Video Tour</span>
            </Button>
          )}

          {/* Video URL as fallback */}
          {!videoMedia && property.videoUrl && (
            <Button
              variant="outline"
              className="text-xs text-primary-800 border-primary-200 bg-white flex items-center justify-center"
              as="a"
              href={property.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="inline-block">Video Tour</span>
            </Button>
          )}

          {reraCertificate && getImageUrl(reraCertificate) && (
            <Button
              variant="outline"
              className="text-xs text-primary-800 border-primary-200 bg-white flex items-center justify-center"
              as="a"
              href={getImageUrl(reraCertificate)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="inline-block">RERA</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            className="text-xs text-primary-800 border-primary-200 bg-white flex items-center justify-center"
            onClick={handleLocationClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="inline-block">Location</span>
          </Button>
        </div>

        {/* Main Content Grid - More compact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            {/* Description - Darker text */}
            {property.description && (
              <Card variant="elegant" className="mb-3">
                <h2 className="text-base font-display  text-primary-900 font-bold mb-2">
                  About {property.name}
                </h2>
                <div className="text-sm text-neutral-900 font-medium leading-relaxed ">
                  {property.description}
                </div>
              </Card>
            )}

            {/* BHK Type Section */}
            {flatTypes.length > 0 && (
              <Card variant="elegant" className="mb-3">
                <h2 className="text-base font-display font-semibold text-primary-900 mb-2">
                  Available Flat Types
                </h2>
                
                {/* BHK Type Selection Tabs */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {flatTypes.map(type => {
                    const variants = flatsByType[type].length;
                    return (
                      <button
                        key={type}
                        onClick={() => setActiveFlatType(type)}
                        className={`px-2 py-0.5 rounded transition-all text-xs ${
                          activeFlatType === type 
                            ? 'bg-primary-700 text-white shadow-sm' 
                            : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                        }`}
                      >
                        <span>{type}</span>
                        <span className="text-xs opacity-90 ml-0.5">({variants})</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Variants for the selected BHK type */}
                {activeFlatType && flatsByType[activeFlatType]?.length > 0 && (
                  <div className="overflow-hidden rounded-md border border-neutral-200">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th scope="col" className="px-3 py-1.5 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Area</th>
                          <th scope="col" className="px-3 py-1.5 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Price</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {flatsByType[activeFlatType].map((flat, index) => (
                          <tr key={index} className="hover:bg-neutral-50">
                            <td className="px-3 py-1.5 whitespace-nowrap text-xs text-neutral-900 font-medium">{flat.area} sq ft</td>
                            <td className="px-3 py-1.5 whitespace-nowrap text-xs font-medium text-primary-800">{formatPrice(flat.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Footnote about prices */}
                <div className="text-xs text-neutral-700 italic mt-2">
                  * Prices include GST, stamp duty, and registration charges
                </div>
              </Card>
            )}

            {/* Amenities */}

          </div>

          <div className="lg:col-span-1">
            {/* Property Details */}
            {property.characteristics && property.characteristics.length > 0 && (
              <Card variant="elegant" className="mb-3">
                <h2 className="text-base font-display font-semibold text-primary-900 mb-2">
                  Property Details
                </h2>
                <div className="divide-y divide-neutral-100">
                  {property.characteristics.map((char, index) => (
                    <div key={index} className="p-2 flex justify-between items-center">
                      <div className="text-xs text-neutral-900 font-medium">{char.keyName}</div>
                      <div className="text-xs text-neutral-900 ">{char.valueName}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <Card variant="elegant" className="mb-3">
                <h2 className="text-base font-display font-bold text-primary-900 mb-2">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <div className="w-4 h-4 flex items-center justify-center bg-primary-50 rounded-full mr-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-neutral-900 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}            

            {/* Property QR Code */}
            <Card variant="elegant" className="mb-3">
              <h2 className="text-base font-display font-semibold text-primary-900 mb-2">
                Property QR Code
              </h2>
              <div className="flex flex-col items-center">
                <div className="mb-2 bg-white p-2 rounded-md shadow-sm border border-neutral-200">
                  {qrCodeImage && getImageUrl(qrCodeImage) ? (
                    <a 
                      href={property.reraUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Click to view RERA details"
                    >
                      <img 
                        src={getImageUrl(qrCodeImage)} 
                        alt="Property QR Code"
                        className="w-24 h-24 qr-code-image cursor-pointer"
                        onError={() => {
                          console.error("Failed to load QR code image");
                          // Fall back to generated QR code on error
                          const img = document.querySelector('.qr-code-image');
                          if (img) {
                            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(property.reraUrl || window.location.href)}`;
                          }
                        }}
                      />
                    </a>
                  ) : (
                    <a 
                      href={property.reraUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Click to view RERA details"
                    >
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(property.reraUrl || window.location.href)}`} 
                        alt="Property QR Code" 
                        className="w-24 h-24 cursor-pointer"
                      />
                    </a>
                  )}
                </div>
                
                {/* RERA number below QR code */}
                {property.reraNo && (
                  <div className="text-center mb-1">
                    <div className="font-medium text-xs text-neutral-900">RERA No: {property.reraNo}</div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-xs text-neutral-800 max-w-md mb-1">
                    Scan to view on mobile
                  </div>
                  
                  {/* Added RERA registration information */}
                  <div className="text-xs text-neutral-700 max-w-md text-center">
                    {property.name} Details are available at <a href="https://maharera.mahaonline.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline">https://maharera.mahaonline.gov.in</a> under registered projects.
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Card */}
            <Card variant="default" className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary-800 to-primary-700 text-white py-2 px-3">
                <h2 className="text-base font-semibold">
                  {property.assignedUser ? `Your Property Consultant` : `Your Property Expert`}
                </h2>
              </div>
              <Card.Body className="p-3">
                {property.assignedUser ? (
                  <>
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200 mr-3 border-2 border-neutral-100 shadow-sm flex-shrink-0">
                        {/* Static image of an Indian person */}
                        <img 
                          src="https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=200&h=200&fit=crop&auto=format" 
                          alt={property.assignedUser.name || "Property Consultant"} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            // Fallback to initials if image fails to load
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = `<span class="text-base font-bold text-neutral-600 flex items-center justify-center h-full">
                              ${property.assignedUser.name ? property.assignedUser.name.charAt(0) : 'C'}
                            </span>`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-primary-900">{property.assignedUser.name}</div>
                        <div className="text-primary-700 text-xs">
                          {/* Replace generic role with real estate terms */}
                          {property.assignedUser.role && property.assignedUser.role.toUpperCase().includes('ADMIN') 
                            ? 'Senior Property Advisor' 
                            : property.assignedUser.role && property.assignedUser.role.toUpperCase().includes('EXEC') 
                            ? 'Real Estate Consultant'
                            : 'Property Specialist'}
                        </div>
                        <div className="mt-1 flex items-center text-gray-500 text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          <span>4.9 Rating • 28 Clients</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-2 rounded-md mb-3 text-xs">
                      <p className="text-gray-700">
                        "I'll help you find your dream property and guide you through the entire process from viewing to purchase."
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        fullWidth
                        className="text-xs border-neutral-300 text-neutral-800 hover:bg-neutral-50 shadow-sm py-1.5 flex items-center justify-center"
                        onClick={() => window.location.href = `tel:${property.assignedUser.contactNo}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="inline-block">Call {property.assignedUser.name.split(' ')[0]}</span>
                      </Button>
                      
                      <Button
                        variant="primary"
                        fullWidth
                        className="text-xs py-1.5 flex items-center justify-center"
                        onClick={() => window.open(`https://wa.me/${property.assignedUser.contactNo.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${property.name} property.`, '_blank')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <span className="inline-block">WhatsApp</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200 mr-3 border-2 border-neutral-100 shadow-sm flex-shrink-0">
                        {/* Static image for unassigned case */}
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop&auto=format" 
                          alt="Property Consultant" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<span class="text-base font-bold text-neutral-600 flex items-center justify-center h-full">C</span>';
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-primary-900">Property Experts</div>
                        <div className="text-primary-700 text-xs">Real Estate Advisors</div>
                        <div className="mt-1 flex items-center text-gray-500 text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          <span>4.8 Rating • 200+ Properties</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-2 rounded-md mb-3 text-xs">
                      <p className="text-gray-700">
                        "Our expert team will guide you through this property. Book a visit to get personalized assistance."
                      </p>
                    </div>
                    
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handleBookSiteVisit}
                      className="flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book a Site Visit
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>

      {/* Sticky Footer - Fixed button alignment issues */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-3 py-2 shadow-lg flex space-x-2 z-10 border-t border-neutral-200">
        <Button
          variant="outline"
          className="flex-1 text-xs border-primary-200 text-primary-800 hover:bg-primary-50 flex items-center justify-center"
          onClick={toggleShortlist}
          disabled={checkingShortlist}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 mr-1 inline-block ${inShortlist ? 'text-red-500 fill-red-500' : 'text-primary-600'}`} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            fill={inShortlist ? 'currentColor' : 'none'}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="inline-block">{inShortlist ? 'Shortlisted' : 'Add to Shortlist'}</span>
        </Button>
        
        {userHasBooking && userBookingDetails ? (
          <div className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-neutral-100 rounded-md border border-neutral-200 cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="inline-block">
              Visit Booked | {formatDisplayDate(userBookingDetails.visitDate)} | 
              <span className={`ml-1 font-medium ${getStatusColor(userBookingDetails.status)}`}>
                {userBookingDetails.status}
              </span>
            </span>
          </div>
        ) : checkingBookings ? (
          <div className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-neutral-100 rounded-md border border-neutral-200">
            <svg className="animate-spin h-4 w-4 mr-1 inline-block text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="inline-block">Checking Booking Status...</span>
          </div>
        ) : (
          <Button
            variant="primary"
            className="flex-1 text-xs flex items-center justify-center"
            onClick={handleBookSiteVisit}
            disabled={userHasBooking || checkingBookings}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="inline-block">Book Site Visit</span>
          </Button>
        )}
      </div>
      
      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setBookingModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Book a Site Visit</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Schedule a visit to {property.name}. Our representative will guide you through the property.
                      </p>
                      
                      {locationPrompt && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-sm text-amber-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            To get the property location, you need to book a site visit first.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <form onSubmit={submitBooking} className="mt-4">
                  <div className="mb-4">
                    <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700">
                      Select Visit Date
                    </label>
                    <input
                      type="date"
                      id="visitDate"
                      name="visitDate"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Limit to next 30 days
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">You can only book a visit within the next 30 days</p>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Schedule Visit'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setBookingModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get amenity icon - keeping it here for future enhancements
const getAmenityIcon = (amenity) => {
  // Implementation can be added when needed
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
};

export default PropertyDetail; 