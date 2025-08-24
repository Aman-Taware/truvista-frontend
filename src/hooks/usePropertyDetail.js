import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import propertyApi from '../api/propertyApi';
import bookingApi from '../api/bookingApi';
import shortlistApi from '../api/shortlistApi';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';

export const usePropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showNotification: showToast } = useContext(NotificationContext);

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inShortlist, setInShortlist] = useState(false);
  const [shortlistEntryId, setShortlistEntryId] = useState(null);
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

  // Memoized calculations for derived flat data
  const flatsByType = useMemo(() => {
    if (!property || !property.flats) return {};
    return property.flats.reduce((acc, flat) => {
      if (!acc[flat.type]) {
        acc[flat.type] = [];
      }
      acc[flat.type].push(flat);
      return acc;
    }, {});
  }, [property]);

  const flatTypes = useMemo(() => Object.keys(flatsByType), [flatsByType]);

  // Effect to set the default active flat type once data is loaded
  useEffect(() => {
    if (flatTypes.length > 0 && !activeFlatType) {
      setActiveFlatType(flatTypes[0]);
    }
  }, [flatTypes, activeFlatType]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Reset state on ID change to prevent showing stale data
    setProperty(null);
    setInShortlist(false);
    setUserHasBooking(false);
    setUserBookingDetails(null);
    setLoading(true);

    const fetchAllDetails = async () => {
      try {
        // 1. Fetch Property Details first
        const propertyData = await propertyApi.getPropertyById(id);
        setProperty(propertyData);

        // 2. Check Shortlist and Booking Status (only if user and property exist)
        if (user && propertyData) {
          setCheckingShortlist(true);
          setCheckingBookings(true);

          // Run checks in parallel for efficiency now that we have the property ID
          const [shortlistResponse, bookingsResponse] = await Promise.all([
            shortlistApi.getShortlist(),
            bookingApi.getUserBookings(),
          ]);

          // Process shortlist status
          const shortlistItem = shortlistResponse.find(
            (item) => item.propertyId.toString() === propertyData.id.toString()
          );

          if (shortlistItem) {
            setInShortlist(true);
            setShortlistEntryId(shortlistItem.id); // Store the unique ID of the shortlist entry
          } else {
            setInShortlist(false);
            setShortlistEntryId(null);
          }

          // Process booking status
          // The API returns an array of objects with a direct 'propertyId'
          const propertyBooking = bookingsResponse.find(
            (b) => b.propertyId.toString() === propertyData.id.toString()
          );
          if (propertyBooking) {
            setUserHasBooking(true);
            setUserBookingDetails(propertyBooking);
          } else {
            setUserHasBooking(false);
            setUserBookingDetails(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch property page details:', error);
        showToast({ type: 'error', message: 'Failed to load property details.' });
      } finally {
        setLoading(false);
        setCheckingShortlist(false);
        setCheckingBookings(false);
      }
    };

    fetchAllDetails();

    // Cleanup function to reset state when the component unmounts or ID changes
    return () => {
      setProperty(null);
      setInShortlist(false);
      setUserHasBooking(false);
      setUserBookingDetails(null);
    };
  }, [id, user, showToast]);

  const toggleShortlist = async () => {
    if (!user) {
      showToast({ type: 'error', message: 'Please log in to shortlist properties.' });
      return;
    }
    setCheckingShortlist(true);
    try {
      if (inShortlist) {
        await shortlistApi.removeFromShortlist(shortlistEntryId); // Use the correct ID for deletion
        showToast({ type: 'success', message: 'Removed from shortlist.' });
        setShortlistEntryId(null); // Clear the ID after removal
      } else {
        await shortlistApi.addToShortlist(id);
        showToast({ type: 'success', message: 'Added to shortlist.' });
        // After adding, we must refetch the shortlist to get the new entry's ID
        const newShortlist = await shortlistApi.getShortlist();
        const newShortlistItem = newShortlist.find(
          (item) => item.propertyId.toString() === id.toString()
        );
        if (newShortlistItem) {
          setShortlistEntryId(newShortlistItem.id);
        }
      }
      setInShortlist(!inShortlist);
    } catch (error) {
      console.error('Failed to toggle shortlist:', error);
      showToast({ type: 'error', message: 'Failed to update shortlist.' });
    } finally {
      setCheckingShortlist(false);
    }
  };

  const handleBookSiteVisit = () => {
    if (!user) {
      showToast({ type: 'error', message: 'Please log in to book a site visit.' });
      return;
    }
    setBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setBookingModalOpen(false);
    setBookingDate('');
    setBookingNote('');
  };

  const submitBooking = async () => {
    if (!bookingDate) {
      showToast({ type: 'error', message: 'Please select a date for the site visit.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const formattedDate = new Date(bookingDate).toISOString().split('T')[0];
      await bookingApi.createBooking(id, { visitDate: formattedDate, notes: bookingNote });
      showToast({ type: 'success', message: 'Site visit booked successfully!' });
      handleCloseModal();
      setUserHasBooking(true); // Immediately update UI
      // Refetch bookings to get the full details
      const response = await bookingApi.getUserBookings();
      const propertyBooking = response.find(booking => booking.property && String(booking.property.id) === String(id));
      if (propertyBooking) {
        setUserBookingDetails(propertyBooking);
      }
    } catch (error) {
      console.error('Failed to book site visit:', error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      showToast({ type: 'error', message: `Booking failed: ${errorMessage}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    property,
    loading,
    activeImageIndex,
    setActiveImageIndex,
    inShortlist,
    toggleShortlist,
    activeFlatType,
    setActiveFlatType,
    flatsByType,
    flatTypes,
    imageError,
    setImageError,
    checkingShortlist,
    bookingModalOpen,
    handleBookSiteVisit,
    handleCloseModal,
    bookingDate,
    setBookingDate,
    bookingNote,
    setBookingNote,
    isSubmitting,
    submitBooking,
    userHasBooking,
    userBookingDetails,
    checkingBookings,
    locationPrompt,
    setLocationPrompt,
  };
};