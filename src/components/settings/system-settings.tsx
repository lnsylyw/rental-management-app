import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bell, Moon, Globe, Shield, Database, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 模拟系统设置数据
const mockSystemSettings = {
  darkMode: false,
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  language: 'zh-CN',
  autoBackup: true,
  dataRetention: '90',
  twoFactorAuth: false,
};

const SystemSettings = () => {
  const [settings, setSettings] = useState(mockSystemSettings);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings({
        ...settings,
        [parent]: {
          ...settings[parent as keyof typeof settings],
          [child]: checked,
        },
      });
    } else {
      setSettings({
        ...settings,
        [name]: checked,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  const handleSave = () => {
    setIsLoading(true);
    
    // 模拟保存请求
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: '保存成功',
        description: '系统设置已更新',
      });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>系统设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 外观设置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">外观</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-4 w-4 text-gray-500" />
              <Label htmlFor="dark-mode">深色模式</Label>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSwitchChange('darkMode', checked)}
            />
          </div>
        </div>

        {/* 网络设置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">网络</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-gray-500" />
                <div>
                  <Label>API服务器配置</Label>
                  <p className="text-sm text-gray-500">配置后端服务器连接地址</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings/network')}
              >
                配置
              </Button>
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">通知</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <Label htmlFor="email-notifications">电子邮件通知</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleSwitchChange('notifications.email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <Label htmlFor="push-notifications">推送通知</Label>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.notifications.push}
                onCheckedChange={(checked) => handleSwitchChange('notifications.push', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <Label htmlFor="sms-notifications">短信通知</Label>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.notifications.sms}
                onCheckedChange={(checked) => handleSwitchChange('notifications.sms', checked)}
              />
            </div>
          </div>
        </div>

        {/* 语言设置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">语言</h3>
          <div className="flex items-center space-x-4">
            <Globe className="h-4 w-4 text-gray-500" />
            <div className="w-full max-w-xs">
              <Select
                value={settings.language}
                onValueChange={(value) => handleSelectChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">简体中文</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="ja-JP">日本語</SelectItem>
                  <SelectItem value="ko-KR">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 安全设置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">安全</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <Label htmlFor="two-factor-auth">两步验证</Label>
            </div>
            <Switch
              id="two-factor-auth"
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => handleSwitchChange('twoFactorAuth', checked)}
            />
          </div>
        </div>

        {/* 数据设置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">数据</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-gray-500" />
              <Label htmlFor="auto-backup">自动备份</Label>
            </div>
            <Switch
              id="auto-backup"
              checked={settings.autoBackup}
              onCheckedChange={(checked) => handleSwitchChange('autoBackup', checked)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <Database className="h-4 w-4 text-gray-500" />
            <div className="w-full max-w-xs">
              <Label htmlFor="data-retention" className="mb-2 block">数据保留期限</Label>
              <Select
                value={settings.dataRetention}
                onValueChange={(value) => handleSelectChange('dataRetention', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择保留期限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30天</SelectItem>
                  <SelectItem value="90">90天</SelectItem>
                  <SelectItem value="180">180天</SelectItem>
                  <SelectItem value="365">1年</SelectItem>
                  <SelectItem value="forever">永久</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setSettings(mockSystemSettings)}
          >
            重置
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;