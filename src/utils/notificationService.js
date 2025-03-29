/**
 * Notification Service Utility
 * 
 * This service provides methods to display notifications to the user.
 * It acts as a bridge between components and the notification system,
 * allowing notifications to be shown from anywhere, including non-React code.
 */

// Store reference to the notification function when context becomes available
let notificationFunction = null;

/**
 * Initialize the notification service with the context's showNotification function
 * Called by NotificationContext during initialization
 * 
 * @param {Function} showNotificationFn - The context's notification function
 */
const initNotificationService = (showNotificationFn) => {
  notificationFunction = showNotificationFn;
  console.log('Notification service initialized');
};

/**
 * Show a notification
 * 
 * @param {Object} options - Notification options
 * @param {string} options.type - Type of notification (success, error, info, warning)
 * @param {string} options.message - The message to display
 * @param {number} options.duration - How long to show the notification (ms)
 * @returns {string|null} The notification ID or null if service not initialized
 */
const showNotification = (options) => {
  if (!notificationFunction) {
    console.warn('Notification service not initialized yet');
    return null;
  }
  
  return notificationFunction(options);
};

/**
 * Show a success notification
 * 
 * @param {string} message - The success message
 * @param {number} duration - How long to show the notification (ms)
 * @returns {string|null} The notification ID or null if service not initialized
 */
const showSuccess = (message, duration = 5000) => {
  return showNotification({
    type: 'success',
    message,
    duration
  });
};

/**
 * Show an error notification
 * 
 * @param {string} message - The error message
 * @param {number} duration - How long to show the notification (ms)
 * @returns {string|null} The notification ID or null if service not initialized
 */
const showError = (message, duration = 7000) => {
  return showNotification({
    type: 'error',
    message,
    duration
  });
};

/**
 * Show an info notification
 * 
 * @param {string} message - The info message
 * @param {number} duration - How long to show the notification (ms)
 * @returns {string|null} The notification ID or null if service not initialized
 */
const showInfo = (message, duration = 5000) => {
  return showNotification({
    type: 'info',
    message,
    duration
  });
};

/**
 * Show a warning notification
 * 
 * @param {string} message - The warning message
 * @param {number} duration - How long to show the notification (ms)
 * @returns {string|null} The notification ID or null if service not initialized
 */
const showWarning = (message, duration = 6000) => {
  return showNotification({
    type: 'warning',
    message,
    duration
  });
};

const notificationService = {
  initNotificationService,
  showNotification,
  showSuccess,
  showError,
  showInfo,
  showWarning
};

export default notificationService; 