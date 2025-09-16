import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Shield, AlertTriangle } from 'lucide-react';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: '输入错误',
        description: '请填写所有密码字段',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '新密码和确认密码不一致',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: '密码过短',
        description: '新密码长度至少为8个字符',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    // 模拟密码更改请求
    setTimeout(() => {
      setIsLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: '密码已更新',
        description: '您的密码已成功更改',
      });
    }, 1000);
  };

  const handleResetSessions = () => {
    toast({
      title: '会话已重置',
      description: '所有其他设备已被登出',
    });
  };

  return (
    <div className="space-y-6">
      {/* 修改密码 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            修改密码
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">当前密码</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                密码长度至少为8个字符，包含字母和数字
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认新密码</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? '更新中...' : '更新密码'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 登录会话 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            登录会话
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">当前活跃会话</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">当前设备</p>
                  <p className="text-xs text-gray-500">Windows 10 · Chrome · 北京</p>
                  <p className="text-xs text-gray-500">上次登录: 今天 14:30</p>
                </div>
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  当前
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">iPhone 13</p>
                  <p className="text-xs text-gray-500">iOS 15 · Safari · 上海</p>
                  <p className="text-xs text-gray-500">上次登录: 昨天 18:45</p>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  活跃
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">MacBook Pro</p>
                  <p className="text-xs text-gray-500">macOS · Firefox · 广州</p>
                  <p className="text-xs text-gray-500">上次登录: 3天前</p>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  活跃
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleResetSessions}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              登出所有其他设备
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;