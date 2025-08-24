import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { NotificationContext } from '../../contexts/NotificationContext';
import adminApi from '../../api/adminApi';
import { FLAT_TYPES, LOCATIONS } from '../../constants/constants';
import { PREDEFINED_CHARACTERISTIC_KEYS } from '../../constants/characteristicConstants';

/**
 * Create Property Page
 * Multi-step form for creating new properties with all related entities
 */
const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  
  // Current step state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // Add state for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState(null);
  
  // Form data state
  const [propertyData, setPropertyData] = useState({
    // Basic Information
    name: '',
    description: '',
    minPrice: '',
    maxPrice: '',
    status: 'UNDER_CONSTRUCTION',
    featured: false,
    assignedUserId: '',
    
    // Property Details
    workDone: '',
    possessionDate: '',
    reraUrl: '',
    reraNo: '',
    videoUrl: '',
    
    // Address
    address: {
      location: '',
      latitude: '',
      longitude: ''
    },
    
    // Flat Configurations
    flats: [{ type: '', area: '', price: '' }],
    
    // Features & Amenities
    characteristics: [{ keyName: '', valueName: '' }],
    amenities: [],
    
    // Media will be handled separately after property creation
    media: []
  });

  // Add state for amenities search and custom entry
  const [amenitiesSearchTerm, setAmenitiesSearchTerm] = useState('');
  const [customAmenity, setCustomAmenity] = useState('');
  const [characteristicSearchTerm, setCharacteristicSearchTerm] = useState('');
  
  // Default amenities list
  const defaultAmenities = [
    'Swimming Pool',
    'Gym',
    'Garden',
    'Children\'s Play Area',
    'Clubhouse',
    'Security',
    '24/7 Water Supply',
    'Power Backup',
    'Elevator',
    'Indoor Games',
    'Sports Facilities',
    'Community Hall',
    'Rain Water Harvesting',
    'Senior Citizen Area',
    'Car Parking',
    'Visitor Parking',
    'Internet/Wi-Fi',
    'Intercom',
    'Air Conditioning',
    'CCTV Surveillance',
    'Fire Safety',
    'Shopping Center'
  ];
  
  // Filtered amenities based on search term
  const filteredAmenities = defaultAmenities.filter(amenity =>
    amenity.toLowerCase().includes(amenitiesSearchTerm.toLowerCase())
  );

  const filteredCharacteristicKeys = PREDEFINED_CHARACTERISTIC_KEYS.filter(key =>
    key.toLowerCase().includes(characteristicSearchTerm.toLowerCase())
  );
  
  // Handle adding custom amenity
  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !propertyData.amenities.includes(customAmenity.trim())) {
      setPropertyData(prev => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()]
      }));
      setCustomAmenity('');
    }
  };

  // Fetch eligible users for property assignment
  useEffect(() => {
    const fetchEligibleUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await adminApi.getEligibleAssignedUsers();
        setEligibleUsers(response || []);
      } catch (error) {
        console.error('Error fetching eligible users:', error);
        showNotification({
          type: 'error',
          message: 'Failed to load eligible users for assignment.'
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchEligibleUsers();
  }, [showNotification]);

  // Form steps configuration
  const steps = [
    { id: 1, name: 'Basic Info', description: 'Property name, price, status', icon: 'info' },
    { id: 2, name: 'Details', description: 'Dates, RERA, etc.', icon: 'details' },
    { id: 3, name: 'Flats', description: 'Available flat types', icon: 'flats' },
    { id: 4, name: 'Features', description: 'Property highlights', icon: 'features' }
  ];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPropertyData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle address field changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  // Handle flat field changes
  const handleFlatChange = (index, field, value) => {
    setPropertyData(prev => {
      const updatedFlats = [...prev.flats];
      updatedFlats[index] = { 
        ...updatedFlats[index], 
        [field]: value 
      };
      return { ...prev, flats: updatedFlats };
    });
  };

  // Add new flat
  const addFlat = () => {
    setPropertyData(prev => ({
      ...prev,
      flats: [...prev.flats, { type: '', area: '', price: '' }]
    }));
  };

  // Remove flat
  const removeFlat = (index) => {
    if (propertyData.flats.length <= 1) {
      setError('At least one flat configuration is required');
      return;
    }
    
    setPropertyData(prev => {
      const updatedFlats = [...prev.flats];
      updatedFlats.splice(index, 1);
      return { ...prev, flats: updatedFlats };
    });
  };

  // Add characteristic
  const addCharacteristic = () => {
    setPropertyData(prev => ({
      ...prev,
      characteristics: [...prev.characteristics, { keyName: '', valueName: '' }]
    }));
  };

  // Remove characteristic
    // Add predefined characteristic
  const addPredefinedCharacteristic = (keyName) => {
    // Check if a characteristic with the same key already exists
    const exists = propertyData.characteristics.some((c) => c.keyName === keyName);

    if (!exists) {
      const newCharacteristic = { keyName, valueName: '' };

      // If the first characteristic is empty, replace it. Otherwise, add a new one.
      if (
        propertyData.characteristics.length === 1 &&
        !propertyData.characteristics[0].keyName &&
        !propertyData.characteristics[0].valueName
      ) {
        setPropertyData((prev) => ({
          ...prev,
          characteristics: [newCharacteristic],
        }));
      } else {
        setPropertyData((prev) => ({
          ...prev,
          characteristics: [...prev.characteristics, newCharacteristic],
        }));
      }
    }
  };

  const removeCharacteristic = (index) => {
    setPropertyData(prev => {
      const updatedCharacteristics = [...prev.characteristics];
      updatedCharacteristics.splice(index, 1);
      return { ...prev, characteristics: updatedCharacteristics };
    });
  };

  // Toggle amenity
  const toggleAmenity = (amenity) => {
    setPropertyData(prev => {
      if (prev.amenities.includes(amenity)) {
        return {
          ...prev,
          amenities: prev.amenities.filter(a => a !== amenity)
        };
      } else {
        return {
          ...prev,
          amenities: [...prev.amenities, amenity]
        };
      }
    });
  };

  // Validate current step
  const validateCurrentStep = () => {
    setError(null);
    
    switch (currentStep) {
      case 1: // Basic Information
        if (!propertyData.name.trim()) {
          setError('Property name is required');
          return false;
        }
        if (!propertyData.description.trim()) {
          setError('Property description is required');
          return false;
        }
        if (!propertyData.minPrice) {
          setError('Minimum price is required');
          return false;
        }
        if (!propertyData.maxPrice) {
          setError('Maximum price is required');
          return false;
        }
        
        // Ensure min price is less than max price
        if (parseFloat(propertyData.minPrice) > parseFloat(propertyData.maxPrice)) {
          setError('Minimum price should be less than maximum price');
          return false;
        }
        break;
        
      case 2: // Property Details
        if (!propertyData.workDone) {
          setError('Work completion percentage is required');
          return false;
        }
        // Other validations can be added as needed
        break;
        
      case 3: // Flat Configurations
        // Check if all flat configuration fields are filled
        for (let i = 0; i < propertyData.flats.length; i++) {
          const flat = propertyData.flats[i];
          if (!flat.type || !flat.area || !flat.price) {
            setError(`Please fill all fields for flat configuration #${i + 1}`);
            return false;
          }
        }
        break;
        
      case 4: // Features & Amenities
        // Validate characteristics
        for (let i = 0; i < propertyData.characteristics.length; i++) {
          const char = propertyData.characteristics[i];
          if (!char.keyName || !char.valueName) {
            setError(`Please fill both key and value for characteristic #${i + 1}`);
            return false;
          }
        }
        break;
    }
    
    return true;
  };

  // Go to next step
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  // Go to previous step
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate current step before submission
    if (!validateCurrentStep()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create data object to send to API
      const { address, ...restOfPropertyData } = propertyData;

      const propertyPayload = {
        ...restOfPropertyData,
        minPrice: parseFloat(propertyData.minPrice),
        maxPrice: parseFloat(propertyData.maxPrice),
        workDone: parseFloat(propertyData.workDone),
        address: {
          ...address,
          latitude: address.latitude ? parseFloat(address.latitude) : null,
          longitude: address.longitude ? parseFloat(address.longitude) : null,
        },
        flats: propertyData.flats.map(flat => ({
          ...flat,
          price: parseFloat(flat.price),
          area: parseFloat(flat.area)
        }))
      };

      // Call API to create property
      const response = await adminApi.createProperty(propertyPayload);
      
      showNotification({
        type: 'success',
        message: 'Property created successfully!'
      });
      
      // Store the created property ID and show confirmation modal
      setCreatedPropertyId(response.id);
      setShowConfirmModal(true);
      
    } catch (err) {
      console.error('Error creating property:', err);
      showNotification({
        type: 'error',
        message: 'Failed to create property. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle confirmation modal result
  const handleConfirmationResult = (action) => {
    setShowConfirmModal(false);
    if (action === 'landmarks') {
      navigate(`/admin/properties/${createdPropertyId}/landmarks`);
    } else if (action === 'media') {
      navigate(`/admin/properties/${createdPropertyId}/media`);
    } else {
      navigate('/admin/properties');
    }
  };
  
  // Get step icon
  const getStepIcon = (icon) => {
    switch(icon) {
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case 'details':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        );
      case 'flats':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        );
      case 'features':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Render form based on current step
  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              {/* Property Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Property Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={propertyData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition duration-150"
                  placeholder="Enter property name"
                  required
                />
              </div>
              
              {/* Property Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={propertyData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition duration-150"
                  placeholder="Detailed property description"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Provide a comprehensive description of the property with key features and selling points.</p>
              </div>
              
              {/* Property Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  id="location"
                  value={propertyData.address.location}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition duration-150"
                  required
                >
                  <option value="">-- Select Location --</option>
                  {LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Latitude and Longitude */}
              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    id="latitude"
                    value={propertyData.address.latitude}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition duration-150"
                    placeholder="e.g., 18.5204"
                    step="any"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    id="longitude"
                    value={propertyData.address.longitude}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition duration-150"
                    placeholder="e.g., 73.8567"
                    step="any"
                  />
                </div>
              </div>
              
              {/* Price Range */}
              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
                    Minimum Price <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      name="minPrice"
                      id="minPrice"
                      value={propertyData.minPrice}
                      onChange={handleChange}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition duration-150"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
                    Maximum Price <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      name="maxPrice"
                      id="maxPrice"
                      value={propertyData.maxPrice}
                      onChange={handleChange}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition duration-150"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Status & Featured */}
              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={propertyData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition duration-150"
                  >
                    <option value="UNDER_CONSTRUCTION">Under Construction</option>
                    <option value="NEARING_POSSESSION">Nearing Possession</option>
                  </select>
                </div>
                
                <div className="flex items-center h-full pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="featured"
                      name="featured"
                      type="checkbox"
                      checked={propertyData.featured}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Feature this property (show on homepage)</span>
                  </label>
                </div>
              </div>
              
              {/* Assigned User */}
              <div>
                <label htmlFor="assignedUserId" className="block text-sm font-medium text-gray-700">
                  Assign to User
                </label>
                <select
                  id="assignedUserId"
                  name="assignedUserId"
                  value={propertyData.assignedUserId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition duration-150"
                  disabled={loadingUsers || eligibleUsers.length === 0}
                >
                  <option value="">-- Select User --</option>
                  {eligibleUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.phoneNumber}
                    </option>
                  ))}
                </select>
                {loadingUsers && (
                  <p className="mt-1 text-xs text-gray-500">Loading users...</p>
                )}
                {!loadingUsers && eligibleUsers.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">No eligible users available</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="bg-white shadow sm:rounded-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Property Details</h2>
            
            <div className="space-y-6">
              {/* Possession Date */}
              <div>
                <label htmlFor="possessionDate" className="block text-sm font-medium text-gray-700">
                  Possession Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="possessionDate"
                  id="possessionDate"
                  value={propertyData.possessionDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">When will the property be ready for possession?</p>
              </div>
              
              {/* Work Done */}
              <div>
                <label htmlFor="workDone" className="block text-sm font-medium text-gray-700">
                  Construction Progress
                </label>
                <input
                  type="text"
                  name="workDone"
                  id="workDone"
                  value={propertyData.workDone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., '80% completed', 'Ready to move'"
                />
                <p className="mt-1 text-xs text-gray-500">Details about construction progress</p>
              </div>
              
              {/* RERA Details */}
              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="reraNo" className="block text-sm font-medium text-gray-700">
                    RERA Number
                  </label>
                  <input
                    type="text"
                    name="reraNo"
                    id="reraNo"
                    value={propertyData.reraNo}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., 'P12345678'"
                  />
                </div>
                
                <div>
                  <label htmlFor="reraUrl" className="block text-sm font-medium text-gray-700">
                    RERA Website URL
                  </label>
                  <input
                    type="url"
                    name="reraUrl"
                    id="reraUrl"
                    value={propertyData.reraUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="https://rera-website.com/project/..."
                  />
                </div>
              </div>
              
              {/* Video URL */}
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
                  Video URL
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  id="videoUrl"
                  value={propertyData.videoUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="mt-1 text-xs text-gray-500">YouTube or other video platform link</p>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="bg-white shadow sm:rounded-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Flat Configurations</h2>
            <p className="mb-4 text-sm text-gray-500">
              Add different flat types and their details
            </p>
            
            {propertyData.flats.map((flat, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-900">Flat #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeFlat(index)}
                    className="text-red-600 hover:text-red-900 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-3">
                  {/* Flat Type */}
                  <div>
                    <label htmlFor={`flat-type-${index}`} className="block text-sm font-medium text-gray-700">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id={`flat-type-${index}`}
                      value={flat.type}
                      onChange={(e) => handleFlatChange(index, 'type', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">-- Select Flat Type --</option>
                      {FLAT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Flat Area */}
                  <div>
                    <label htmlFor={`flat-area-${index}`} className="block text-sm font-medium text-gray-700">
                      Area (sqft) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id={`flat-area-${index}`}
                      value={flat.area}
                      onChange={(e) => handleFlatChange(index, 'area', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  {/* Flat Price */}
                  <div>
                    <label htmlFor={`flat-price-${index}`} className="block text-sm font-medium text-gray-700">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        id={`flat-price-${index}`}
                        value={flat.price}
                        onChange={(e) => handleFlatChange(index, 'price', e.target.value)}
                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addFlat}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Another Flat Type
            </button>
          </div>
        );
        
      case 4:
        return (
          <div className="bg-white shadow sm:rounded-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Features & Amenities</h2>
            
            {/* Property Characteristics */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Property Characteristics</h3>
              <p className="mb-4 text-sm text-gray-500">
                Add key features of the property (e.g. "Floors: 20", "Age: New Construction")
              </p>
              
              {propertyData.characteristics.map((characteristic, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Characteristic #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeCharacteristic(index)}
                      className="text-red-600 hover:text-red-900 text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    {/* Key Name */}
                    <div>
                      <label htmlFor={`characteristic-key-${index}`} className="block text-sm font-medium text-gray-700">
                        Key <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id={`characteristic-key-${index}`}
                        value={characteristic.keyName}
                        onChange={(e) => {
                          const updatedCharacteristics = [...propertyData.characteristics];
                          updatedCharacteristics[index].keyName = e.target.value;
                          setPropertyData({
                            ...propertyData,
                            characteristics: updatedCharacteristics
                          });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g., 'Floors', 'Age', 'Parking'"
                        required
                      />
                    </div>
                    
                    {/* Value Name */}
                    <div>
                      <label htmlFor={`characteristic-value-${index}`} className="block text-sm font-medium text-gray-700">
                        Value <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id={`characteristic-value-${index}`}
                        value={characteristic.valueName}
                        onChange={(e) => {
                          const updatedCharacteristics = [...propertyData.characteristics];
                          updatedCharacteristics[index].valueName = e.target.value;
                          setPropertyData({
                            ...propertyData,
                            characteristics: updatedCharacteristics
                          });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g., '20', 'New Construction', '2 Cars'"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCharacteristic}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Characteristic
              </button>
            </div>
            
            {/* Characteristics Section */}
            <div>
              <h4 className="text-md font-semibold text-neutral-800 mb-2">Characteristics</h4>

              {/* Predefined Characteristics */}
              <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <h5 className="text-sm font-semibold text-neutral-700 mb-2">Suggestions</h5>
                <input
                  type="text"
                  placeholder="Search characteristics..."
                  value={characteristicSearchTerm}
                  onChange={(e) => setCharacteristicSearchTerm(e.target.value)}
                  className="mb-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {filteredCharacteristicKeys.map((keyName, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addPredefinedCharacteristic(keyName)}
                      className="px-3 py-1.5 text-xs font-medium text-primary-800 bg-primary-100 rounded-full hover:bg-primary-200 transition-colors shadow-sm"
                    >
                      {keyName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Amenities</h3>
              <p className="mb-4 text-sm text-gray-500">
                Select or add amenities available in this property
              </p>
              
              {/* Search and Add custom amenity */}
              <div className="mb-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Search amenities */}
                  <div>
                    <label htmlFor="amenity-search" className="block text-sm font-medium text-gray-700">
                      Search Amenities
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="amenity-search"
                        value={amenitiesSearchTerm}
                        onChange={(e) => setAmenitiesSearchTerm(e.target.value)}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Search for amenities..."
                      />
                    </div>
                  </div>
                  
                  {/* Add custom amenity */}
                  <div>
                    <label htmlFor="custom-amenity" className="block text-sm font-medium text-gray-700">
                      Add Custom Amenity
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="custom-amenity"
                        value={customAmenity}
                        onChange={(e) => setCustomAmenity(e.target.value)}
                        className="flex-1 min-w-0 block w-full rounded-none rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter custom amenity"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAmenity}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Selected amenities pills */}
              {propertyData.amenities.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {propertyData.amenities.map((amenity) => (
                      <div key={amenity} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                        >
                          <span className="sr-only">Remove amenity {amenity}</span>
                          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Amenities selection scrollable area */}
              <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
                <div className="max-h-60 overflow-y-auto p-2">
                  <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
                    {filteredAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                            name={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                            type="checkbox"
                            checked={propertyData.amenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`} className="font-medium text-gray-700">
                            {amenity}
                          </label>
                        </div>
                      </div>
                    ))}
                    {filteredAmenities.length === 0 && amenitiesSearchTerm && (
                      <div className="col-span-full py-2 text-sm text-gray-500 text-center">
                        No amenities match your search. You can add it as a custom amenity.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <AdminLayout>
      <div className="px-2 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Property</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new property listing with all details.
          </p>
        </div>
        
        {/* Steps Navigation - Improved mobile responsiveness */}
        <div className="relative mb-8">
          <nav aria-label="Progress" className="overflow-x-auto no-scrollbar">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className={`relative flex items-center ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                  {/* Connector line between steps */}
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center px-8 mx-4">
                      <div className="h-0.5 w-full bg-gray-200">
                        <div
                          className="h-0.5 bg-primary-500 transition-all"
                          style={{ width: currentStep > step.id ? '100%' : '0%' }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step circle with icon */}
                  <div className="relative flex flex-col items-center group">
                    <div 
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        currentStep > step.id
                          ? 'border-primary-500 bg-primary-500 hover:bg-primary-700'
                          : currentStep === step.id
                          ? 'border-primary-500 bg-white'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      } transition-colors duration-200 cursor-pointer z-10`}
                      onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                    >
                      {currentStep > step.id ? (
                        // Completed step icon
                        <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        // Current or upcoming step icon
                        <div className={`${
                          currentStep === step.id ? 'text-primary-500' : 'text-gray-500'
                        } h-4 w-4`}>
                          {getStepIcon(step.icon)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-center font-medium text-gray-700 mt-2 max-w-[60px] whitespace-normal">
                      {step.name}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 border-l-4 border-red-400 bg-red-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Form */}
        {renderForm()}
        
        {/* Media Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">What would you like to do next?</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          You have successfully created a new property listing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => handleConfirmationResult('landmarks')}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Manage Landmarks
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmationResult('media')}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Manage Media
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmationResult('list')}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Go to Properties
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Form Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between mt-8 space-y-4 sm:space-y-0">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className={`inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Previous
          </button>
          
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  Create Property
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreatePropertyPage; 