import { useState, useEffect, useContext } from 'react';
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
  const { user, setUser } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    id: '',
    name: '',
    email: '',
    contactNo: '',
    preferredFlatType: '',
    minBudget: null,
    maxBudget: null
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNo: '',
    preferredFlatType: '',
    minBudget: '',
    maxBudget: ''
  });
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Load user profile data when component mounts
    const fetchUserProfile = async () => {
      try {
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
          
          // Also set form data for editing
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            contactNo: userData.contactNo || '',
            preferredFlatType: userData.preferredFlatType || '',
            minBudget: userData.minBudget || '',
            maxBudget: userData.maxBudget || ''
          });
          
          // Get the existing user data from localStorage
          const existingUserData = localStorage.getItem('user_data') 
            ? JSON.parse(localStorage.getItem('user_data')) 
            : {};
          
          // Log for debugging
          console.log("Profile: Existing user data in localStorage:", existingUserData);
          console.log("Profile: New user data from API:", userData);
          
          // Store additional user data in localStorage for persistence
          // Ensure we preserve the role and other authentication state
          const updatedUserData = {
            ...existingUserData,
            ...userData,
            role: userData.role || existingUserData.role, // Ensure role is preserved
            isAuthenticated: true
          };
          
          console.log("Profile: Updated user data for localStorage:", updatedUserData);
          localStorage.setItem('user_data', JSON.stringify(updatedUserData));
          
          // Also notify AuthContext of the updated user state
          if (user && typeof user === 'object' && user !== updatedUserData) {
            setUser(updatedUserData);
          }
        } else {
          showNotification({
            type: 'warning',
            message: 'Profile data may be incomplete. Please check your information.'
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        showNotification({
          type: 'error',
          message: 'Failed to load profile data. Please try again.'
        });
      }
    };
    
    fetchUserProfile();
  }, [user, showNotification, setUser]);
  
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const updateData = {
        name: formData.name,
        email: formData.email,
        contactNo: formData.contactNo,
        preferredFlatType: formData.preferredFlatType,
        minBudget: formData.minBudget ? Number(formData.minBudget) : null,
        maxBudget: formData.maxBudget ? Number(formData.maxBudget) : null
      };
      
      // Call API to update profile
      await userApi.updateProfile(profileData.id, updateData);
      
      // Update profile data state
      setProfileData({
        ...profileData,
        ...updateData
      });
      
      // Exit edit mode
      setEditing(false);
      
      showNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
      showNotification({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditing(!editing);
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
            <p className="text-neutral-700 mt-1">View and manage your personal information</p>
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
            
            {/* Profile Content */}
            {!editing ? (
              // View Mode
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-neutral-900">Personal Information</h3>
                  <Button 
                    onClick={toggleEditMode}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </Button>
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
            ) : (
              // Edit Mode
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-neutral-900">Edit Profile</h3>
                  <Button 
                    onClick={toggleEditMode}
                    variant="ghost"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Name Field */}
                    <div className="col-span-1 md:col-span-2">
                      <label htmlFor="name" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    {/* Contact Number Field */}
                    <div>
                      <label htmlFor="contactNo" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                        Contact Number
                      </label>
                      <input
                        id="contactNo"
                        name="contactNo"
                        type="tel"
                        value={formData.contactNo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    {/* Preferred Flat Type Field */}
                    <div>
                      <label htmlFor="preferredFlatType" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                        Preferred Flat Type
                      </label>
                      <select
                        id="preferredFlatType"
                        name="preferredFlatType"
                        value={formData.preferredFlatType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Flat Type</option>
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4 BHK">4 BHK</option>
                        <option value="5+ BHK">5+ BHK</option>
                      </select>
                    </div>
                    
                    {/* Min Budget Field */}
                    <div>
                      <label htmlFor="minBudget" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                        Minimum Budget
                      </label>
                      <input
                        id="minBudget"
                        name="minBudget"
                        type="number"
                        value={formData.minBudget}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    {/* Max Budget Field */}
                    <div>
                      <label htmlFor="maxBudget" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                        Maximum Budget
                      </label>
                      <input
                        id="maxBudget"
                        name="maxBudget"
                        type="number"
                        value={formData.maxBudget}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-end">
                    <Button 
                      type="submit"
                      variant="primary"
                      size="md"
                      className="min-w-[120px]"
                      isLoading={loading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage; 