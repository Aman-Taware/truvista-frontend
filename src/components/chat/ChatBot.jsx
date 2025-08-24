import React, { useState, useRef, useEffect, useContext } from 'react';
import { X, MessageSquare, Search, MapPin, Home, DollarSign, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import { LOCATIONS, FLAT_TYPES, PRICE_RANGES } from '../../constants/constants';
import { formatPrice, formatPriceRange } from '../../utils/format';
import propertyApi from '../../api/propertyApi';
import CachedImage from '../CachedImage';
import useAuth from '../../hooks/useAuth';
import { NotificationContext } from '../../contexts/NotificationContext';
import AuthModal from '../auth/AuthModal';

/**
 * ChatBot component for the homepage
 * Provides a conversational interface for users to search properties
 * Using guided options only (no free text input)
 * Displays search results directly within the chat interface
 */
const ChatBot = ({ onClose }) => {
  // Chat state
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      text: 'Hello! I\'m Truvista Assistant. I can help you find your dream property. Which location are you interested in?',
      options: LOCATIONS
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Auth state
  const { user } = useAuth();
  const { showNotification } = useContext(NotificationContext);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPropertyId, setPendingPropertyId] = useState(null);
  
  // Filter state (same filters as Properties.jsx)
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    flatType: '',
    ready: false
  });
  
  // Current conversation state - start with location instead of initial
  const [currentStep, setCurrentStep] = useState('location');
  
  // Search results state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentResultPage, setCurrentResultPage] = useState(0);
  const resultsPerPage = 1; // Show one property at a time in the carousel
  
  // Chat container ref for scrolling
  const chatContainerRef = useRef(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle click on option buttons
  const handleOptionClick = (option) => {
    // Add user selection to chat
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: option
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate bot typing
    setIsTyping(true);
    
    // Process the selected option
    setTimeout(() => {
      processUserInput(option);
      setIsTyping(false);
    }, 1000);
  };
  
  // Process user input and determine next step
  const processUserInput = (input) => {
    switch (currentStep) {
      case 'location':
        // Save location
        setSearchFilters(prev => ({...prev, location: input}));
        
        // Ask for flat type next
        askForFlatType();
        setCurrentStep('flatType');
        break;
        
      case 'flatType':
        // Save flat type
        setSearchFilters(prev => ({...prev, flatType: input}));
        
        // Ask for budget next
        askForBudget();
        setCurrentStep('budget');
        break;
        
      case 'budget':
        // Process budget input
        processBudgetInput(input);
        
        // Show summary and immediately perform search instead of asking for confirmation
        const { location, flatType } = searchFilters;
        
        // Add user's selection to messages
        setMessages(prev => [...prev, {
          id: messages.length + 2,
          type: 'bot',
          text: `Searching for ${flatType || 'properties'} in ${location || 'all locations'} within your budget range...`,
        }]);
        
        // Directly perform search instead of going to summary step
        performSearch();
        break;
        
      case 'summary':
        if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('search')) {
          // Trigger search with filters
          performSearch();
        } else if (input.toLowerCase().includes('no') || input.toLowerCase().includes('change')) {
          // Ask what they want to change
          askWhatToChange();
          setCurrentStep('change');
        } else {
          // Handle other responses
          setMessages(prev => [...prev, {
            id: messages.length + 2,
            type: 'bot',
            text: 'Would you like me to search properties with these filters?',
            options: ['Yes, search now', 'No, let me change something']
          }]);
        }
        break;
        
      case 'change':
        if (input.toLowerCase().includes('location')) {
          askForLocation();
          setCurrentStep('location');
        } else if (input.toLowerCase().includes('budget') || input.toLowerCase().includes('price')) {
          askForBudget();
          setCurrentStep('budget');
        } else if (input.toLowerCase().includes('flat') || input.toLowerCase().includes('type')) {
          askForFlatType();
          setCurrentStep('flatType');
        } else {
          // If input is unclear, show summary again
          showSearchSummary();
          setCurrentStep('summary');
        }
        break;
        
      case 'no_results':
        if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('change')) {
          // User wants to change filters after no results
          askWhatToChange();
          setCurrentStep('change');
        } else if (input.toLowerCase().includes('no') || input.toLowerCase().includes('end')) {
          // User wants to end the search
          setMessages(prev => [...prev, {
            id: messages.length + 2,
            type: 'bot',
            text: 'I understand. Is there anything else I can help you with?',
            options: ['Start a new search', 'No, thanks']
          }]);
          setCurrentStep('end');
        } else {
          // Unrecognized input, ask again
          setMessages(prev => [...prev, {
            id: messages.length + 2,
            type: 'bot',
            text: 'Would you like to try with different filters?',
            options: ['Yes, change filters', 'No, end search']
          }]);
        }
        break;
        
      case 'end':
        if (input.toLowerCase().includes('start') || input.toLowerCase().includes('new search')) {
          // Start a new conversation
          startNewConversation();
        } else {
          // End the conversation
          setMessages(prev => [...prev, {
            id: messages.length + 2,
            type: 'bot',
            text: 'Thank you for using Truvista Assistant. Feel free to chat again when you\'re looking for your dream property!'
          }]);
        }
        break;
        
      case 'retry_search':
        if (input.toLowerCase().includes('try again')) {
          performSearch();
        } else if (input.toLowerCase().includes('start over')) {
          startNewConversation();
        } else {
          // Unrecognized input, try again
          setMessages(prev => [...prev, {
            id: messages.length + 2,
            type: 'bot',
            text: 'Would you like to try searching again or start over with a new search?',
            options: ['Try again', 'Start over']
          }]);
        }
        break;
        
      default:
        // Default response for unknown states
        setMessages(prev => [...prev, {
          id: messages.length + 2,
          type: 'bot',
          text: 'I\'m not sure how to help with that. Let\'s start over. Which location are you interested in?',
          options: LOCATIONS
        }]);
        setCurrentStep('location');
    }
  };
  
  // Helper function to ask for location
  const askForLocation = () => {
    setMessages(prev => [...prev, {
      id: messages.length + 2,
      type: 'bot',
      text: 'Which location are you interested in?',
      options: LOCATIONS
    }]);
  };
  
  // Helper function to ask for flat type
  const askForFlatType = () => {
    setMessages(prev => [...prev, {
      id: messages.length + 2,
      type: 'bot',
      text: 'Great! What type of flat are you looking for?',
      options: FLAT_TYPES
    }]);
  };
  
  // Helper function to ask for budget
  const askForBudget = () => {
    setMessages(prev => [...prev, {
      id: messages.length + 2,
      type: 'bot',
      text: 'What\'s your budget range?',
      options: PRICE_RANGES.map(range => range.label)
    }]);
  };
  
  // Helper function to process budget input
  const processBudgetInput = (input) => {
    // Find matching price range
    const selectedRange = PRICE_RANGES.find(range => 
      range.label.toLowerCase() === input.toLowerCase()
    );
    
    if (selectedRange) {
      setSearchFilters(prev => ({
        ...prev,
        minPrice: selectedRange.min,
        maxPrice: selectedRange.max
      }));
    } else {
      // If no match, set default budget range
      setSearchFilters(prev => ({
        ...prev,
        minPrice: PRICE_RANGES[0].min,
        maxPrice: PRICE_RANGES[PRICE_RANGES.length - 1].max
      }));
    }
  };
  
  // Helper function to show search summary
  const showSearchSummary = () => {
    const { location, minPrice, maxPrice, flatType } = searchFilters;
    
    const summaryText = `I'll search for ${flatType || 'properties'} in ${location || 'all locations'}${
      minPrice && maxPrice ? ` with a budget range of ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}` : ''
    }. Would you like to proceed with this search?`;
    
    setMessages(prev => [...prev, {
      id: messages.length + 2,
      type: 'bot',
      text: summaryText,
      options: ['Yes, search now', 'No, let me change something']
    }]);
  };
  
  // Helper function to ask what to change
  const askWhatToChange = () => {
    setMessages(prev => [...prev, {
      id: messages.length + 2,
      type: 'bot',
      text: 'What would you like to change?',
      options: ['Location', 'Flat Type', 'Budget']
    }]);
  };
  
  // Helper function to perform search
  const performSearch = async () => {
    setSearchFilters(prev => ({...prev, ready: true}));
    setIsSearching(true);
    
    // Notify user that search is happening
    setMessages(prev => [...prev, {
      id: messages.length + 2,
      type: 'bot',
      text: 'Searching for properties based on your preferences...',
      isSearching: true
    }]);
    
    try {
      // Parse flat type
      const flatTypeFormatted = searchFilters.flatType ? 
        searchFilters.flatType.replace(/\s+/g, '') : null;
      
      // Prepare API filters with fixed pagination and sorting
      const apiFilters = {
        location: searchFilters.location || null,
        flatTypes: flatTypeFormatted,
        minPrice: searchFilters.minPrice || null,
        maxPrice: searchFilters.maxPrice || null,
        page: 0, // 0-based indexing in Spring Boot pagination
        size: 3,
        sortBy: 'featured',
        sortDirection: 'desc'
      };
      
      // Call API
      const response = await propertyApi.searchProperties(apiFilters);
      
      if (response.success) {
        const properties = response.data.content || [];
        setSearchResults(properties);
        setCurrentResultPage(0);
        
        // Show results in chat
        if (properties.length > 0) {
          setMessages(prev => [...prev, {
            id: messages.length + 3,
            type: 'bot',
            text: `I found ${response.data.totalElements} properties matching your criteria. Here are the top matches:`,
            properties: properties,
            totalElements: response.data.totalElements
          }]);
        } else {
          // No properties found - directly ask which filter they want to change
          setMessages(prev => [...prev, {
            id: messages.length + 3,
            type: 'bot',
            text: `I couldn't find any properties matching your criteria. Would you like to try with different filters?`,
            options: ['Yes, change filters', 'No, end search']
          }]);
          setCurrentStep('no_results');
        }
      } else {
        // Handle error
        setMessages(prev => [...prev, {
          id: messages.length + 3,
          type: 'bot',
          text: 'Sorry, I encountered an issue while searching for properties. Please try again.',
          options: ['Try again', 'Start over']
        }]);
        setCurrentStep('retry_search');
      }
    } catch (error) {
      console.error('Error searching properties:', error);
      // Handle error
      setMessages(prev => [...prev, {
        id: messages.length + 3,
        type: 'bot',
        text: 'Sorry, I encountered an error while searching for properties. Please try again.',
        options: ['Try again', 'Start over']
      }]);
      setCurrentStep('retry_search');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle property click in results
  const handlePropertyClick = (propertyId) => {
    if (!user) {
      // User is not logged in, show notification and auth modal
      showNotification({ 
        type: 'error', 
        message: 'Please log in to view property details' 
      });
      setPendingPropertyId(propertyId);
      setShowAuthModal(true);
      return;
    }
    
    // User is logged in, navigate to property details
    window.location.href = `/properties/${propertyId}`;
  };
  
  // Handle auth modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    
    // If user is now authenticated and there was a pending property ID, navigate to it
    if (user && pendingPropertyId) {
      window.location.href = `/properties/${pendingPropertyId}`;
      setPendingPropertyId(null);
    }
  };
  
  // Navigation for property carousel
  const goToPrevProperty = () => {
    setCurrentResultPage(prev => (prev > 0 ? prev - 1 : prev));
  };
  
  const goToNextProperty = () => {
    setCurrentResultPage(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
  };
  
  // Start a new conversation
  const startNewConversation = () => {
    setMessages([
      { 
        id: 1, 
        type: 'bot', 
        text: 'Hello! I\'m Truvista Assistant. I can help you find your dream property. Which location are you interested in?',
        options: LOCATIONS
      }
    ]);
    setSearchFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      flatType: '',
      ready: false
    });
    setSearchResults([]);
    setCurrentStep('location');
  };
  
  // Render chat message
  const renderMessage = (message) => {
    const isBot = message.type === 'bot';
    
    return (
      <div 
        key={message.id} 
        className={`mb-4 ${isBot ? '' : 'flex justify-end'}`}
      >
        <div className={`
          max-w-[90%] sm:max-w-[80%] rounded-lg p-3 shadow-sm
          ${isBot 
            ? 'bg-white border border-neutral-200' 
            : 'bg-primary-600 text-white'
          }
        `}>
          {isBot && (
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary-100 text-primary-700 mr-2">
                <MessageSquare size={14} />
              </div>
              <span className="text-xs font-medium text-primary-800">Truvista Assistant</span>
            </div>
          )}
          
          <p className="text-sm">{message.text}</p>
          
          {/* Options buttons */}
          {isBot && message.options && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-1.5 rounded-full transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          
          {/* Property carousel */}
          {isBot && message.properties && message.properties.length > 0 && (
            <div className="mt-4 relative">
              {/* Show current property */}
              {searchResults.length > 0 && (
                <div>
                  <PropertyCard 
                    property={searchResults[currentResultPage]} 
                    onPropertyClick={handlePropertyClick}
                  />
                  
                  {/* Pagination info */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-neutral-500">
                      {currentResultPage + 1} of {searchResults.length} properties
                    </div>
                    
                    {/* Navigation buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={goToPrevProperty}
                        disabled={currentResultPage === 0}
                        className={`p-1 rounded-full ${
                          currentResultPage === 0 
                            ? 'text-neutral-300 cursor-not-allowed' 
                            : 'text-primary-600 hover:bg-primary-50'
                        }`}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      <button 
                        onClick={goToNextProperty}
                        disabled={currentResultPage >= searchResults.length - 1}
                        className={`p-1 rounded-full ${
                          currentResultPage >= searchResults.length - 1
                            ? 'text-neutral-300 cursor-not-allowed' 
                            : 'text-primary-600 hover:bg-primary-50'
                        }`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Total results info & link */}
                  {message.totalElements > searchResults.length && (
                    <div className="mt-2 text-center">
                      <button 
                        onClick={() => {
                          if (!user) {
                            // User is not logged in, show notification and auth modal
                            showNotification({ 
                              type: 'error', 
                              message: 'Please log in to view all matching properties' 
                            });
                            setShowAuthModal(true);
                            return;
                          }
                          
                          // User is logged in, navigate to properties page with filters
                          window.location.href = `/properties?location=${searchFilters.location || ''}&flatType=${searchFilters.flatType || ''}&minPrice=${searchFilters.minPrice || ''}&maxPrice=${searchFilters.maxPrice || ''}`;
                        }}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        View all {message.totalElements} matching properties →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Searching indicator */}
          {isBot && message.isSearching && (
            <div className="mt-3 flex items-center">
              <div className="animate-spin mr-2">
                <Search size={14} className="text-primary-500" />
              </div>
              <span className="text-sm text-neutral-600">Searching...</span>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Compact property card component for the chatbot
  const PropertyCard = ({ property, onPropertyClick }) => {
    const [imageError, setImageError] = useState(false);
    
    // Handle image loading errors
    const handleImageError = () => {
      console.error(`Failed to load property image for property ID: ${property.id}`);
      setImageError(true);
    };
    
    // Get proper image URL or fallback
    const getImageUrl = () => {
      if (imageError) {
        return 'https://via.placeholder.com/800x600?text=Property+Image+Not+Available';
      }
      
      if (!property.imageUrl) {
        return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&h=600&fit=crop'; 
      }
  
      // If URL starts with a relative path, convert to absolute
      if (property.imageUrl.startsWith('/')) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        return `${baseUrl}${property.imageUrl}`;
      }
      
      return property.imageUrl;
    };
    
    return (
      <div className="bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200">
        {/* Property image */}
        <div 
          onClick={() => onPropertyClick(property.id)} 
          className="relative cursor-pointer h-36 overflow-hidden"
        >
          <CachedImage 
            src={getImageUrl()} 
            alt={property.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105" 
            onError={handleImageError}
            fallbackSrc="https://via.placeholder.com/800x600?text=Property+Image+Not+Available"
          />
          
          {/* Featured badge */}
          {(property.featured || property.isFeatured) && (
            <div className="absolute top-2 right-2">
              <div className="bg-secondary-500/80 text-primary-900 px-2 py-0.5 text-[10px] font-medium rounded-full">
                Featured
              </div>
            </div>
          )}
        </div>
        
        {/* Property details */}
        <div className="p-3">
          <h3 className="font-medium text-sm text-primary-800 mb-1 line-clamp-1 cursor-pointer" 
              onClick={() => onPropertyClick(property.id)}>
            {user ? property.name : '******'}
          </h3>
          
          <div className="flex items-center mb-2">
            <MapPin size={12} className="text-primary-600 mr-1" />
            <span className="text-xs text-neutral-700 truncate">{property.location}</span>
          </div>
          
          <div className="text-sm font-bold text-primary-700 mb-1">
            {formatPriceRange(property.minPrice, property.maxPrice)}*
          </div>
          
          {property.flatTypes && property.flatTypes.length > 0 && (
            <div className="flex items-center mt-1">
              <Home size={12} className="text-primary-600 mr-1" />
              <span className="text-xs font-medium">{property.flatTypes.join(', ')}</span>
            </div>
          )}
          
          <button
            onClick={() => onPropertyClick(property.id)}
            className="w-full mt-2 text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-md transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className={`fixed z-50 bottom-6 right-6 w-14 h-14 shadow-xl rounded-full flex items-center justify-center transition-all duration-300 
          ${isOpen ? 'bg-primary-700 rotate-45' : 'bg-primary-600 hover:bg-primary-700'}`}
      >
        {isOpen ? (
          <X className="text-white" size={24} />
        ) : (
          <MessageSquare className="text-white" size={24} />
        )}
      </button>
      
      {/* Chat Window */}
      <div 
        className={`fixed z-40 bottom-6 right-6 w-[350px] sm:w-[380px] max-w-[calc(100vw-40px)] bg-neutral-50 rounded-xl shadow-2xl transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
        style={{ maxHeight: 'calc(100vh - 100px)' }}
      >
        {/* Chat header */}
        <div className="bg-primary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-1.5 bg-white/20 rounded-md mr-3">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-semibold text-white ">Truvista Assistant</h3>
          </div>
          <button onClick={onClose || toggleChat} className="p-1 hover:bg-white/20 rounded-md">
            <X size={18} />
          </button>
        </div>
        
        {/* Chat messages */}
        <div 
          ref={chatContainerRef}
          className="p-4 overflow-y-auto"
          style={{ maxHeight: 'calc(75vh - 140px)', minHeight: '300px' }}
        >
          {messages.map(renderMessage)}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <MessageSquare size={14} className="text-primary-600" />
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
        
        {/* New conversation button */}
        <div className="px-4 py-3 border-t border-neutral-200 flex justify-center">
          <button 
            className="flex items-center text-xs px-4 py-2 rounded-full bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition-colors"
            onClick={startNewConversation}
          >
            <RefreshCw size={12} className="mr-2" /> New Conversation
          </button>
        </div>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose} 
      />
    </>
  );
};

export default ChatBot; 