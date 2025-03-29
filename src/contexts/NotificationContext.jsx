import { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NotificationContainer from '../components/ui/NotificationContainer';
import notificationService from '../utils/notificationService';

// Create context
export const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const showNotification = useCallback(({ type = 'info', message, duration = 5000 }) => {
    const id = uuidv4();
    
    // Add notification to array
    setNotifications(prev => [...prev, { id, type, message }]);
    
    // Remove notification after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, duration);
    
    return id;
  }, []);

  // Initialize notification service when component mounts
  useEffect(() => {
    notificationService.initNotificationService(showNotification);
  }, [showNotification]);

  // Remove a specific notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Context value
  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearNotifications
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Custom hook for using the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// For Fast Refresh compatibility, export NotificationContext as the default
export default NotificationContext; 