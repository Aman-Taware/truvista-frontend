import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { NotificationContext } from '../../contexts/NotificationContext';
import adminApi from '../../api/adminApi';

/**
 * Property Media Management Page
 * Allows admins to upload and manage media for a specific property
 */
const PropertyMediaManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  const fileInputRef = useRef(null);
  
  // State for property details and media
  const [property, setProperty] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mediaType, setMediaType] = useState('PROPERTY_IMAGE');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Fetch property and media data
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        
        // Fetch property details
        const propertyData = await adminApi.getPropertyById(id);
        setProperty(propertyData);
        
        // Check if property has media
        if (propertyData.media && Array.isArray(propertyData.media)) {
          setMediaItems(propertyData.media);
        }
        
      } catch (error) {
        console.error('Error fetching property data:', error);
        showNotification({
          type: 'error',
          message: 'Failed to load property data'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [id, showNotification]);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // For PDFs, we can't preview them directly, so just show the file name
      setPreviewUrl(null);
    } else {
      setPreviewUrl(null);
    }
  };
  
  // Handle media type selection
  const handleMediaTypeChange = (e) => {
    setMediaType(e.target.value);
    // Clear selected file when changing media type
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification({
        type: 'warning',
        message: 'Please select a file to upload'
      });
      return;
    }
    
    // Validate file based on media type
    if (mediaType === 'LAYOUT' && selectedFile.type !== 'application/pdf') {
      showNotification({
        type: 'error',
        message: 'Layout media must be a PDF file'
      });
      return;
    }
    
    if (mediaType === 'PROPERTY_IMAGE' && !selectedFile.type.startsWith('image/')) {
      showNotification({
        type: 'error',
        message: 'Property image must be an image file'
      });
      return;
    }
    
    try {
      setUploading(true);
      
      const response = await adminApi.uploadMedia(id, selectedFile, mediaType);
      
      if (response) {
        showNotification({
          type: 'success',
          message: 'Media uploaded successfully'
        });
        
        // Add the new media to the list or refresh the list
        if (response.id) {
          setMediaItems(prevItems => [...prevItems, response]);
        } else {
          // Refresh property data to get updated media list
          const propertyData = await adminApi.getPropertyById(id);
          if (propertyData.media && Array.isArray(propertyData.media)) {
            setMediaItems(propertyData.media);
          }
        }
        
        // Clear selected file
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      showNotification({
        type: 'error',
        message: 'Failed to upload media'
      });
    } finally {
      setUploading(false);
    }
  };
  
  // Handle media deletion
  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) {
      return;
    }
    
    try {
      await adminApi.deleteMedia(mediaId);
      
      showNotification({
        type: 'success',
        message: 'Media deleted successfully'
      });
      
      // Remove deleted media from list
      setMediaItems(prevItems => prevItems.filter(item => item.id !== mediaId));
    } catch (error) {
      console.error('Error deleting media:', error);
      showNotification({
        type: 'error',
        message: 'Failed to delete media'
      });
    }
  };
  
  // Get file acceptence criteria based on media type
  const getAcceptAttribute = () => {
    switch(mediaType) {
      case 'PROPERTY_IMAGE':
      case 'QR_CODE':
        return 'image/*';
      case 'LAYOUT':
      case 'BROCHURE':
        return 'application/pdf';
      default:
        return '*/*';
    }
  };
  
  // Get media type display name
  const getMediaTypeDisplayName = (type) => {
    switch(type) {
      case 'PROPERTY_IMAGE': return 'Property Image';
      case 'BROCHURE': return 'Property Brochure';
      case 'LAYOUT': return 'Property Layout';
      case 'QR_CODE': return 'QR Code';
      default: return type;
    }
  };
  
  return (
    <AdminLayout>
      <div className="px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Media Management
              </h1>
              {property && (
                <p className="mt-1 text-sm text-gray-500">
                  Property: {property.name}
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:mt-0 md:ml-4">
              <Link
                to={`/admin/properties/${id}/edit`}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Property
              </Link>
              <Link
                to="/admin/properties"
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Properties
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Upload Form */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Media</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Add new media to this property</p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="space-y-6">
                      {/* Media Type */}
                      <div>
                        <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700">
                          Media Type
                        </label>
                        <select
                          id="mediaType"
                          name="mediaType"
                          value={mediaType}
                          onChange={handleMediaTypeChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="PROPERTY_IMAGE">Property Image</option>
                          <option value="BROCHURE">Brochure</option>
                          <option value="LAYOUT">Layout (PDF)</option>
                          <option value="QR_CODE">QR Code</option>
                        </select>
                      </div>
                      
                      {/* File Input */}
                      <div>
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                          File
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  ref={fileInputRef}
                                  className="sr-only"
                                  accept={getAcceptAttribute()}
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {mediaType === 'LAYOUT' ? 'PDF up to 10MB' : 'PNG, JPG, GIF up to 10MB'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Preview */}
                      {previewUrl && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                          <div className="relative rounded-lg overflow-hidden bg-gray-100 w-full h-36 sm:h-48">
                            <img
                              src={previewUrl}
                              alt="Upload preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Selected File Name */}
                      {selectedFile && !previewUrl && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Selected File</label>
                          <div className="flex items-center p-2 rounded-md bg-gray-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-500 truncate">
                              {selectedFile.name}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Upload Button */}
                      <div>
                        <button
                          type="button"
                          disabled={!selectedFile || uploading}
                          onClick={handleUpload}
                          className={`w-full inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            !selectedFile || uploading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {uploading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </>
                          ) : (
                            'Upload Media'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Media Gallery */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Media Gallery</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">All media for this property</p>
                  </div>
                  <div className="border-t border-gray-200">
                    {mediaItems.length === 0 ? (
                      <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No media</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by uploading media for this property.</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {mediaItems.map((media) => (
                          <li key={media.id} className="px-2 sm:px-4 py-4 sm:px-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                                  {media.mediaType === 'PROPERTY_IMAGE' || media.mediaType === 'QR_CODE' ? (
                                    <img
                                      src={media.url}
                                      alt={`Media ${media.id}`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : media.mediaType === 'LAYOUT' || media.mediaType === 'BROCHURE' ? (
                                    <div className="flex items-center justify-center h-full w-full bg-red-50">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-full w-full bg-gray-200">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {getMediaTypeDisplayName(media.mediaType)}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {media.publicId || `Media ID: ${media.id}`}
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2 mt-3 sm:mt-0">
                                <a
                                  href={media.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  View
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMedia(media.id)}
                                  className="inline-flex items-center justify-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default PropertyMediaManagement; 