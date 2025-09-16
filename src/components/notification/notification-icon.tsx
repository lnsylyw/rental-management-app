import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/notification-context';
import NotificationDropdown from './notification-dropdown';
import { motion } from 'framer-motion';

interface NotificationIconProps {
  className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ className }) => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className={className}
        onClick={toggleDropdown}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount}
          </motion.div>
        )}
      </Button>
      
      {isOpen && (
        <NotificationDropdown onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationIcon;