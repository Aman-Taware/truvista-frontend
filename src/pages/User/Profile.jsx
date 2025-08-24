import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import userApi from '../../api/userApi';
import { formatPrice } from '../../utils/format';

/**
 * User Profile Page - Modern & Elegant Design
 * Displays user information with improved layout and readability
 */
const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    id: '',
    name: '',
    email: '',
    contactNo: '',
    preferredFlatType: '',
    minBudget: null,
    maxBudget: null
  });
  
  // Add a ref to track if we've already performed the initial profile fetch
  const initialFetchDone = useRef(false);
  const fetchInProgress = useRef(false);
  
  // Helper function to compare objects deeply
  const isEqual = (obj1, obj2) => {
    if (!obj1 || !obj2) return false;
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };
  
  // Extract profile data from user object (already in AuthContext)
  const updateProfileFromUser = useCallback(() => {
    if (user) {
      setProfileData({
        id: user.id || '',
        name: user.name || '',
        email: user.email || '',
        contactNo: user.contactNo || '',
        preferredFlatType: user.preferredFlatType || '',
        minBudget: user.minBudget || null,
        maxBudget: user.maxBudget || null
      });
      initialFetchDone.current = true;
    }
  }, [user]);
  
  // Effect to update profile data when user changes
  useEffect(() => {
    updateProfileFromUser();
  }, [updateProfileFromUser]);
  
  // Fetch profile data only if needed
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Load user profile data when component mounts
    const fetchUserProfile = async () => {
      // Skip if we've already fetched the profile once
      // or if we already have user data from the AuthContext
      if (initialFetchDone.current || fetchInProgress.current) return;
      
      try {
        fetchInProgress.current = true;
        setLoading(true);
        
        // Call the API and get the response
        const response = await userApi.getProfile();
        
        // Note: Due to the axios interceptor in api/index.js,
        // the response is already pre-processed to response.data
        if (response) {
          // Extract user data directly from response (not response.data)
          const userData = {
            id: response.id,
            name: response.name,
            email: response.email,
            contactNo: response.contactNo,
            role: response.role, // Keep this for the backend but don't display it
            preferredFlatType: response.preferredFlatType,
            minBudget: response.minBudget,
            maxBudget: response.maxBudget
          };
          
          // Update state with user profile data
          setProfileData(userData);
          
          // Mark that we've completed the initial fetch
          initialFetchDone.current = true;
        } else {
          showNotification({
            type: 'warning',
            message: 'Profile data may be incomplete. Please check your information.'
          });
        }
      } catch (error) {
        if (error.message === 'Duplicate request cancelled') {
          console.log('Duplicate profile fetch prevented');
          return;
        }
        
        console.error('Error fetching profile:', error);
        showNotification({
          type: 'error',
          message: 'Failed to load profile data. Please try again.'
        });
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };
    
    // Only fetch if we don't already have the user data
    if (!user) {
      fetchUserProfile();
    }
  }, [showNotification, user]);
  
  // Format the budget range from min and max budgets
  const formatBudgetRange = () => {
    if (!profileData.minBudget && !profileData.maxBudget) {
      return 'Not specified';
    }
    
    if (profileData.minBudget && !profileData.maxBudget) {
      return `From ${formatPrice(profileData.minBudget)}`;
    }
    
    if (!profileData.minBudget && profileData.maxBudget) {
      return `Up to ${formatPrice(profileData.maxBudget)}`;
    }
    
    return `${formatPrice(profileData.minBudget)} - ${formatPrice(profileData.maxBudget)}`;
  };

  // Loading state with elegant spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4 shadow-md"></div>
          <p className="text-neutral-800 font-medium text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Page Header - Modern Design */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Your Profile</h1>
            <p className="text-neutral-700 mt-1">View your personal information</p>
          </div>
          
          {/* Main Profile Card - Modern Design */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Profile Header with Gradient */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md mr-4 flex-shrink-0">
                  {profileData.name ? (
                    <span className="text-2xl font-bold text-primary-600">
                      {profileData.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profileData.name || 'Your Profile'}</h2>
                  <p className="text-white text-sm opacity-90">{profileData.email || 'No email provided'}</p>
                </div>
              </div>
            </div>
            
            {/* Profile Content - View Only Mode */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-neutral-900">Personal Information</h3>
              </div>
              
              {/* Profile details in elegant grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Full Name</h4>
                  <p className="text-neutral-900 font-medium">{profileData.name || 'Not provided'}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Email Address</h4>
                  <p className="text-neutral-900 font-medium">{profileData.email || 'Not provided'}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Contact Number</h4>
                  <p className="text-neutral-900 font-medium">{profileData.contactNo || 'Not provided'}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Preferred Flat Type</h4>
                  <p className="text-neutral-900 font-medium">{profileData.preferredFlatType || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Budget Range</h4>
                  <p className="text-neutral-900 font-medium">{formatBudgetRange()}</p>
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    as={Link}
                    to="/user/shortlist"
                    variant="outline"
                    size="sm"
                  >
                    View Shortlist
                  </Button>
                  <Button 
                    as={Link}
                    to="/user/bookings"
                    variant="outline"
                    size="sm"
                  >
                    Manage Bookings
                  </Button>
                  <Button 
                    as={Link}
                    to="/properties"
                    variant="primary"
                    size="sm"
                  >
                    Browse Properties
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage; 