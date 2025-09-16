import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/contexts/notification-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 处理标记为已读
  const handleMarkAsRead = async (id: string) => {
    setIsLoading(true);
    await markAsRead(id);
    setIsLoading(false);
  };
  
  // 处理全部标记为已读
  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    await markAllAsRead();
    setIsLoading(false);
  };
  
  // 格式化时间显示
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 小于1分钟
    if (diff < 60 * 1000) {
      return '刚刚';
    }
    
    // 小于1小时
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分钟前`;
    }
    
    // 小于24小时
    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    }
    
    // 小于30天
    if (diff < 30 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
    }
    
    // 大于30天，显示具体日期
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 mt-2 z-50 w-80"
    >
      <Card className="p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">通知</h3>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              全部已读
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 mb-2 rounded-md ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-3 right-3"></div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无通知
              </div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-3 text-center">
          <Button variant="link" size="sm" className="text-blue-600" onClick={onClose}>
            查看全部通知
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default NotificationDropdown;