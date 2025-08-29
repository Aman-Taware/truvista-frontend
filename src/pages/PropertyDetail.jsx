import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { formatPrice, formatPriceRange } from '../utils/format';
import { usePropertyDetail } from '../hooks/usePropertyDetail';
import AvailableFlats from '../components/property/detail/AvailableFlats';
import PropertyDetails from '../components/property/detail/PropertyDetails';
import PropertyAmenities from '../components/property/detail/PropertyAmenities';
import PropertyDescription from '../components/property/detail/PropertyDescription';
import PropertyQRCode from '../components/property/detail/PropertyQRCode';
import ContactCard from '../components/property/detail/ContactCard';
import StickyFooter from '../components/property/detail/StickyFooter';
import propertyApi from '../api/propertyApi';
import { getImageUrl } from '../utils/media';
import PropertyLocation from '../components/property/detail/PropertyLocation';

/**
 * Property Detail Page - Royal & Elegant Design with Compact Layout
 */
const PropertyDetail = () => {
  const {
    property,
    loading,
    inShortlist,
    checkingShortlist,
    checkingBookings,
    userHasBooking,
    userBookingDetails,
    isSubmitting,
    bookingModalOpen,
    setBookingModalOpen,
    bookingDate,
    setBookingDate,
    bookingNote,
    setBookingNote,
    toggleShortlist,
    handleBookSiteVisit,
    submitBooking,
    handleLocationClick,
    activeImageIndex,
    handleImageChange,
    imageError,
    handleImageError,
    handleWhatsAppInquiry,
    locationPrompt,
    activeFlatType,
    setActiveFlatType,
    flatsByType,
    flatTypes,
  } = usePropertyDetail();



  const images = React.useMemo(() => property?.media?.filter(m => m.type === 'IMAGE') || [], [property]);
  const brochure = React.useMemo(() => property?.media?.find(m => m.type === 'BROCHURE'), [property]);
  const layout = React.useMemo(() => property?.media?.find(m => m.type === 'LAYOUT'), [property]);

  const handleGetDirections = async () => {
    if (!property || !property.latitude || !property.longitude) {
      console.error('Location data is not available for this property.');
      // Optionally, show a toast notification to the user
      return;
    }

    try {
      // Log the request to the backend first
      await propertyApi.requestDirections(property.id);
      
      // Then, open Google Maps in a new tab
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;
      window.open(googleMapsUrl, '_blank');
    } catch (error) {
      console.error('Failed to log or get directions:', error);
      // Optionally, show an error toast to the user
    }
  };

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

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-elegant border border-neutral-200">
          <h2 className="text-xl font-bold text-primary-800 mb-3">Property Not Found</h2>
          <p className="text-neutral-600 text-sm mb-5">We couldn't find the property you're looking for.</p>
          <Button as={Link} to="/properties" variant="primary">View All Properties</Button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-neutral-50 flex flex-col pb-16">
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
                  onClick={() => {
                    const newIndex = activeImageIndex === 0 ? propertyImages.length - 1 : activeImageIndex - 1;
                    console.log('Previous clicked, current:', activeImageIndex, 'new:', newIndex);
                    handleImageChange(newIndex);
                  }}
                  className="bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all z-10"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => {
                    const newIndex = activeImageIndex === propertyImages.length - 1 ? 0 : activeImageIndex + 1;
                    console.log('Next clicked, current:', activeImageIndex, 'new:', newIndex);
                    handleImageChange(newIndex);
                  }}
                  className="bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all z-10"
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
                      onClick={() => {
                        console.log('Dot clicked for index:', index);
                        handleImageChange(index);
                      }}
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

      <Container className="pt-4 flex-grow">
        {/* Property Title and Basic Info - Now More Compact */}
        <Card variant="elegant" className="mb-3">
          <Card.Header divided className="pb-2">
            {/* Title moved from image overlay to here */}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-800 mb-1">
              {property.name}
            </h1>
            
            <div className="flex justify-between items-start">
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-neutral-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location}
                </p>

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

            {/* Location & Landmarks Section */}
            {property.latitude && property.longitude && (
              <div className="mt-8">
                <PropertyLocation property={property} onGetDirections={handleGetDirections} />
              </div>
            )}

        {/* Main Content Grid - More compact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <PropertyDescription name={property.name} description={property.description} />

            <AvailableFlats 
              flatTypes={flatTypes}
              flatsByType={flatsByType}
              activeFlatType={activeFlatType}
              setActiveFlatType={setActiveFlatType}
            />
          </div>

          <div className="lg:col-span-1">
            <PropertyDetails characteristics={property.characteristics} />

            <PropertyAmenities amenities={property.amenities} />

            <PropertyQRCode 
              name={property.name}
              reraNo={property.reraNo}
              reraUrl={property.reraUrl}
              qrCodeImage={qrCodeImage}
            />

            <ContactCard 
              assignedUser={property.assignedUser}
              handleWhatsAppInquiry={handleWhatsAppInquiry}
            />
          </div>
        </div>
      </Container>

      <StickyFooter 
        inShortlist={inShortlist}
        checkingShortlist={checkingShortlist}
        toggleShortlist={toggleShortlist}
        userHasBooking={userHasBooking}
        checkingBookings={checkingBookings}
        userBookingDetails={userBookingDetails}
        handleBookSiteVisit={handleBookSiteVisit}
      />
      
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


export default PropertyDetail; 