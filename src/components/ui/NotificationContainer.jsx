import { useContext } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: {
    bg: 'bg-emerald-600',
    border: 'border-emerald-500',
    icon: 'text-emerald-100',
    text: 'text-white',
  },
  error: {
    bg: 'bg-red-600',
    border: 'border-red-500',
    icon: 'text-red-100',
    text: 'text-white',
  },
  warning: {
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    icon: 'text-amber-100',
    text: 'text-white',
  },
  info: {
    bg: 'bg-primary-600',
    border: 'border-primary-500',
    icon: 'text-primary-100',
    text: 'text-white',
  },
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useContext(NotificationContext);

  return (
    // Bottom-right, above everything, but NOT covering the top-right close button area
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => {
          const style = STYLES[notification.type] || STYLES.info;
          const Icon = ICONS[notification.type] || Info;
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border ${style.bg} ${style.border}`}
            >
              <Icon size={18} className={`${style.icon} shrink-0 mt-0.5`} />
              <p className={`text-sm font-medium flex-1 leading-snug ${style.text}`}>
                {notification.message}
              </p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X size={15} className={style.text} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;