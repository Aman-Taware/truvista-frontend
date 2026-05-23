import { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NotificationContainer from '../components/ui/NotificationContainer';
import notificationService from '../utils/notificationService';

// Create context
export const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification — accepts BOTH call styles:
  //   showNotification('message', 'success')           ← positional (used throughout CRM)
  //   showNotification({ message, type, duration })    ← object style (legacy)
  const showNotification = useCallback((messageOrObj, typeArg = 'info', durationArg = 4000) => {
    const isObj = typeof messageOrObj === 'object' && messageOrObj !== null;
    const message = isObj ? messageOrObj.message : messageOrObj;
    const type    = isObj ? (messageOrObj.type || 'info') : typeArg;
    const duration = isObj ? (messageOrObj.duration || 4000) : durationArg;

    if (!message) return;

    const id = uuidv4();

    setNotifications(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);

    return id;
  }, []);

  // Initialize notification service when component mounts
  useEffect(() => {
    notificationService.initNotificationService(showNotification);
  }, [showNotification]);

  // Remove a specific notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearNotifications,
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

export default NotificationContext;