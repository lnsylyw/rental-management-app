import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, Info } from 'lucide-react';
import { getApiBaseUrl } from '@/config/api';

const NetworkDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<string>('');

  useEffect(() => {
    collectDebugInfo();
  }, []);

  const collectDebugInfo = () => {
    const info = {
      // 环境检测
      isCapacitor: window.location.protocol === 'capacitor:' || 
                   window.location.protocol === 'ionic:' ||
                   (window as any).Capacitor !== undefined,
      
      // 当前位置信息
      location: {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        href: window.location.href
      },
      
      // API配置
      apiBaseUrl: getApiBaseUrl(),
      cachedApiUrl: localStorage.getItem('api_base_url'),
      
      // 网络状态
      online: navigator.onLine,
      
      // 用户代理
      userAgent: navigator.userAgent,
      
      // Capacitor信息
      capacitorInfo: (window as any).Capacitor ? {
        platform: (window as any).Capacitor.getPlatform(),
        isNativePlatform: (window as any).Capacitor.isNativePlatform()
      } : null
    };
    
    setDebugInfo(info);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult('');
    
    const apiUrl = getApiBaseUrl();
    
    try {
      console.log(`测试连接到: ${apiUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.text();
        setConnectionResult(`✅ 连接成功！响应: ${data}`);
      } else {
        setConnectionResult(`❌ 连接失败！状态码: ${response.status}`);
      }
    } catch (error: any) {
      console.error('连接测试失败:', error);
      setConnectionResult(`❌ 连接错误: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testLoginAPI = async () => {
    setIsTestingConnection(true);
    setConnectionResult('');
    
    const apiUrl = getApiBaseUrl();
    
    try {
      console.log(`测试登录API: ${apiUrl}/auth/login`);
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'test',
          password: 'test'
        })
      });
      
      const responseText = await response.text();
      setConnectionResult(`登录API测试 - 状态码: ${response.status}, 响应: ${responseText}`);
    } catch (error: any) {
      console.error('登录API测试失败:', error);
      setConnectionResult(`❌ 登录API错误: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            网络调试信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h4 className="font-medium mb-2">环境信息</h4>
              <div className="space-y-1 text-sm">
                <div>运行环境: {debugInfo.isCapacitor ? '移动端(Capacitor)' : '浏览器'}</div>
                <div>在线状态: {debugInfo.online ? '在线' : '离线'}</div>
                <div>协议: {debugInfo.location?.protocol}</div>
                <div>主机: {debugInfo.location?.hostname}</div>
                <div>端口: {debugInfo.location?.port || '默认'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">API配置</h4>
              <div className="space-y-1 text-sm">
                <div>当前API地址: <code className="bg-gray-100 px-1 rounded">{debugInfo.apiBaseUrl}</code></div>
                <div>缓存的API地址: <code className="bg-gray-100 px-1 rounded">{debugInfo.cachedApiUrl || '无'}</code></div>
              </div>
            </div>
            
            {debugInfo.capacitorInfo && (
              <div>
                <h4 className="font-medium mb-2">Capacitor信息</h4>
                <div className="space-y-1 text-sm">
                  <div>平台: {debugInfo.capacitorInfo.platform}</div>
                  <div>原生平台: {debugInfo.capacitorInfo.isNativePlatform ? '是' : '否'}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={testConnection}
              disabled={isTestingConnection}
              variant="outline"
              size="sm"
            >
              {isTestingConnection ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
              测试健康检查
            </Button>
            
            <Button 
              onClick={testLoginAPI}
              disabled={isTestingConnection}
              variant="outline"
              size="sm"
            >
              测试登录API
            </Button>
            
            <Button 
              onClick={collectDebugInfo}
              variant="outline"
              size="sm"
            >
              刷新信息
            </Button>
          </div>
          
          {connectionResult && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-xs">{connectionResult}</pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkDebug;
