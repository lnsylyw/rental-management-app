import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationToast from './notification-toast';
import { useToast } from '@/hooks/use-toast';

const NotificationToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts && toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <NotificationToast
              id={toast.id}
              title={typeof toast.title === 'string' ? toast.title : ''}
              message={typeof toast.description === 'string' ? toast.description : String(toast.description || '')}
              type={toast.variant === 'destructive' ? 'error' : 'info'}
              duration={5000}
              onClose={(id) => dismiss(id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToastContainer;