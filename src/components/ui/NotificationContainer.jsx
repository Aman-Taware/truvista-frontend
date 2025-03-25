import { useContext } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContainer = () => {
  const { notifications } = useContext(NotificationContext);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`p-4 rounded-md shadow-lg ${
              notification.type === 'success'
                ? 'bg-success-500 text-white'
                : notification.type === 'error'
                ? 'bg-error-500 text-white'
                : notification.type === 'warning'
                ? 'bg-secondary-500 text-white'
                : 'bg-primary-500 text-white'
            }`}
          >
            <p className="text-sm">{notification.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer; 