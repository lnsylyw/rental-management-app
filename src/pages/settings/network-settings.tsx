import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save, RefreshCw, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import NetworkDiagnostics from '@/components/network/network-diagnostics';

const NetworkSettings: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'failed'>('unknown');

  useEffect(() => {
    // 加载当前API地址
    const currentUrl = localStorage.getItem('api_base_url') || 'http://192.168.79.13:8000';
    setApiUrl(currentUrl);
  }, []);

  const testConnection = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleTestConnection = async () => {
    if (!apiUrl.trim()) {
      toast.error('请输入API地址');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('unknown');

    try {
      const isConnected = await testConnection(apiUrl);
      setConnectionStatus(isConnected ? 'success' : 'failed');
      
      if (isConnected) {
        toast.success('连接测试成功！');
      } else {
        toast.error('连接测试失败，请检查地址和网络');
      }
    } catch (error) {
      setConnectionStatus('failed');
      toast.error('连接测试出错');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveSettings = () => {
    if (!apiUrl.trim()) {
      toast.error('请输入API地址');
      return;
    }

    // 验证URL格式
    try {
      new URL(apiUrl);
    } catch (error) {
      toast.error('请输入有效的URL地址');
      return;
    }

    localStorage.setItem('api_base_url', apiUrl);
    toast.success('API地址已保存');
    
    // 建议用户重启应用以使设置生效
    setTimeout(() => {
      toast.info('建议重启应用以使新设置生效');
    }, 1000);
  };

  const handleReset = () => {
    const defaultUrl = 'http://192.168.79.13:8000';
    setApiUrl(defaultUrl);
    localStorage.setItem('api_base_url', defaultUrl);
    setConnectionStatus('unknown');
    toast.success('已重置为默认地址');
  };

  const commonUrls = [
    'http://192.168.79.13:8000',
    'http://192.168.79.15:8000',
    'http://192.168.1.100:8000',
    'http://10.0.2.2:8000',
    'http://localhost:8000'
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            网络设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">API服务器地址</Label>
            <Input
              id="api-url"
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://192.168.1.100:8000"
              className="font-mono"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isTestingConnection ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              测试连接
            </Button>

            <Button 
              onClick={handleSaveSettings}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              保存设置
            </Button>

            <Button 
              onClick={handleReset}
              variant="outline"
            >
              重置默认
            </Button>
          </div>

          {connectionStatus !== 'unknown' && (
            <Alert className={connectionStatus === 'success' ? 'border-green-500' : 'border-red-500'}>
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                {connectionStatus === 'success' 
                  ? '✅ 连接成功！服务器响应正常。'
                  : '❌ 连接失败！请检查地址和网络连接。'
                }
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>常用地址快速选择</Label>
            <div className="grid grid-cols-1 gap-2">
              {commonUrls.map((url) => (
                <Button
                  key={url}
                  variant="ghost"
                  className="justify-start font-mono text-sm"
                  onClick={() => setApiUrl(url)}
                >
                  {url}
                </Button>
              ))}
            </div>
          </div>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>使用说明：</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>确保手机和服务器在同一网络环境中</li>
                <li>服务器地址格式：http://IP地址:端口号</li>
                <li>保存设置后建议重启应用</li>
                <li>如果不确定服务器地址，请使用下方的网络诊断工具</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <NetworkDiagnostics />
    </div>
  );
};

export default NetworkSettings;
