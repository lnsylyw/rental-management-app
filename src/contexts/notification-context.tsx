import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiService from '@/services/api';
// 不再需要导入 useToast

// 通知类型定义
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showToast: (notification: { title: string; message: string; type: NotificationType }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  // 移除未使用的 isLoading 状态
  // 移除未使用的 toast

  // 获取通知列表
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await ApiService.getNotifications();
      
      // 将API返回的数据转换为应用所需的格式
      const formattedNotifications: Notification[] = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        message: item.message,
        type: item.type as NotificationType,
        read: item.read,
        createdAt: new Date(item.created_at),
        link: item.link
      }));
      
      setNotifications(formattedNotifications);
    } catch (error: any) {
      console.error('获取通知失败:', error);
      // 移除toast提示
    }
  }, []);

  // 获取未读通知数量
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await ApiService.getUnreadNotificationCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
    }
  }, []);

  // 初始化加载通知
  useEffect(() => {
    // 检查用户是否已登录
    const token = localStorage.getItem('token');
    if (token) {
      // 立即获取通知
      const getInitialData = async () => {
        await fetchNotifications();
        await fetchUnreadCount();
      };
      
      getInitialData();
      
      // 设置定时器，定期检查新通知
      const intervalId = setInterval(() => {
        // 再次检查token是否存在，避免用户登出后继续请求
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          fetchUnreadCount();
        }
      }, 60000); // 每分钟检查一次
      
      return () => clearInterval(intervalId);
    } else {
      // 用户未登录，设置空通知列表
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []); // 移除依赖项，只在组件挂载时执行一次

  // 添加新通知（本地添加，实际应用中可能由服务器推送）
  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // 标记通知为已读
  const markAsRead = async (id: string) => {
    try {
      await ApiService.markNotificationAsRead(parseInt(id));
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      // 更新未读数量
      fetchUnreadCount();
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      // 移除toast提示
    }
  };

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
      // 移除toast提示
    }
  };

  // 删除通知
  const removeNotification = async (id: string) => {
    try {
      await ApiService.deleteNotification(parseInt(id));
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      // 更新未读数量
      fetchUnreadCount();
    } catch (error) {
      console.error('删除通知失败:', error);
      // 移除toast提示
    }
  };

  // 清空所有通知（本地操作，实际应用中可能需要与服务器同步）
  const clearAllNotifications = () => {
    // 这里可以添加批量删除通知的API调用
    setNotifications([]);
    setUnreadCount(0);
  };

  // 添加showToast函数（但实际上不会显示任何提示）
  const showToast = useCallback(() => {
    // 空函数，不执行任何操作
    console.log('Toast功能已禁用');
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        showToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// 自定义Hook，用于在组件中使用通知上下文
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
