import React from 'react';
import { useNotifications } from '@/contexts/notification-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationList: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  const unreadNotifications = notifications.filter(notification => !notification.read);
  const readNotifications = notifications.filter(notification => notification.read);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">通知中心</h2>
        <Button variant="outline" onClick={markAllAsRead}>
          全部标记为已读
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            全部 ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            未读 ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            已读 ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AnimatePresence>
            {notifications.length > 0 ? (
              <motion.div className="space-y-3">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={notification.read ? 'bg-white' : 'bg-blue-50'}>
                      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getNotificationIcon(notification.type)}
                          <CardTitle className="text-base">{notification.title}</CardTitle>
                        </div>
                        <div className="text-xs text-gray-500">{notification.createdAt.toLocaleString()}</div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <div className="flex justify-end gap-2 mt-3">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification.id)}
                            >
                              标记为已读
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeNotification(notification.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">暂无通知</h3>
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <AnimatePresence>
            {unreadNotifications.length > 0 ? (
              <motion.div className="space-y-3">
                {unreadNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-blue-50">
                      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getNotificationIcon(notification.type)}
                          <CardTitle className="text-base">{notification.title}</CardTitle>
                        </div>
                        <div className="text-xs text-gray-500">{notification.createdAt.toLocaleString()}</div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <div className="flex justify-end gap-2 mt-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            标记为已读
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeNotification(notification.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">没有未读通知</h3>
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="read" className="mt-4">
          <AnimatePresence>
            {readNotifications.length > 0 ? (
              <motion.div className="space-y-3">
                {readNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-white">
                      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getNotificationIcon(notification.type)}
                          <CardTitle className="text-base">{notification.title}</CardTitle>
                        </div>
                        <div className="text-xs text-gray-500">{notification.createdAt.toLocaleString()}</div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <div className="flex justify-end gap-2 mt-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeNotification(notification.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">没有已读通知</h3>
              </div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationList;