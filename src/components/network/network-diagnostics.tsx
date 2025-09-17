import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface NetworkStatus {
  url: string;
  status: 'testing' | 'success' | 'failed' | 'pending';
  responseTime?: number;
}

const NetworkDiagnostics: React.FC = () => {
  const [networkStatuses, setNetworkStatuses] = useState<NetworkStatus[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState<string>('');

  const possibleUrls = [
    'http://192.168.79.13:8000',
    'http://192.168.79.15:8000', 
    'http://192.168.1.100:8000',
    'http://10.0.2.2:8000',
    'http://localhost:8000'
  ];

  useEffect(() => {
    // 初始化状态
    setNetworkStatuses(possibleUrls.map(url => ({ url, status: 'pending' })));
    
    // 获取当前使用的API地址
    const cachedUrl = localStorage.getItem('api_base_url') || 'http://192.168.79.13:8000';
    setCurrentApiUrl(cachedUrl);
  }, []);

  const testConnection = async (url: string): Promise<{ success: boolean; responseTime: number }> => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return { success: response.ok, responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { success: false, responseTime };
    }
  };

  const testSingleUrl = async (url: string) => {
    setNetworkStatuses(prev => 
      prev.map(status => 
        status.url === url ? { ...status, status: 'testing' } : status
      )
    );

    const result = await testConnection(url);
    
    setNetworkStatuses(prev => 
      prev.map(status => 
        status.url === url 
          ? { 
              ...status, 
              status: result.success ? 'success' : 'failed',
              responseTime: result.responseTime
            } 
          : status
      )
    );
  };

  const testAllConnections = async () => {
    setIsTestingAll(true);
    
    // 重置所有状态
    setNetworkStatuses(possibleUrls.map(url => ({ url, status: 'testing' })));
    
    // 并行测试所有地址
    const testPromises = possibleUrls.map(async (url) => {
      const result = await testConnection(url);
      return { url, ...result };
    });
    
    const results = await Promise.all(testPromises);
    
    setNetworkStatuses(results.map(result => ({
      url: result.url,
      status: result.success ? 'success' : 'failed',
      responseTime: result.responseTime
    })));
    
    // 找到第一个成功的地址并设置为当前API地址
    const successfulUrl = results.find(result => result.success);
    if (successfulUrl) {
      localStorage.setItem('api_base_url', successfulUrl.url);
      setCurrentApiUrl(successfulUrl.url);
    }
    
    setIsTestingAll(false);
  };

  const setAsCurrentApi = (url: string) => {
    localStorage.setItem('api_base_url', url);
    setCurrentApiUrl(url);
  };

  const getStatusIcon = (status: NetworkStatus['status']) => {
    switch (status) {
      case 'testing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: NetworkStatus['status']) => {
    switch (status) {
      case 'testing':
        return <Badge variant="secondary">测试中</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">可用</Badge>;
      case 'failed':
        return <Badge variant="destructive">失败</Badge>;
      default:
        return <Badge variant="outline">待测试</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          网络连接诊断
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            当前API地址: <strong>{currentApiUrl}</strong>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button 
            onClick={testAllConnections} 
            disabled={isTestingAll}
            className="flex items-center gap-2"
          >
            {isTestingAll ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            测试所有连接
          </Button>
        </div>

        <div className="space-y-2">
          {networkStatuses.map((status) => (
            <div 
              key={status.url} 
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(status.status)}
                <div>
                  <div className="font-medium">{status.url}</div>
                  {status.responseTime && (
                    <div className="text-sm text-gray-500">
                      响应时间: {status.responseTime}ms
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(status.status)}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testSingleUrl(status.url)}
                  disabled={status.status === 'testing'}
                >
                  测试
                </Button>
                
                {status.status === 'success' && status.url !== currentApiUrl && (
                  <Button
                    size="sm"
                    onClick={() => setAsCurrentApi(status.url)}
                  >
                    使用此地址
                  </Button>
                )}
                
                {status.url === currentApiUrl && (
                  <Badge variant="outline">当前使用</Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            如果所有地址都无法连接，请检查：
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>后端服务是否正在运行</li>
              <li>手机和后端服务器是否在同一网络</li>
              <li>防火墙是否阻止了连接</li>
              <li>后端服务器的IP地址是否正确</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default NetworkDiagnostics;
