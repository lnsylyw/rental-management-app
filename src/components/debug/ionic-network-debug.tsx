import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, Info, Smartphone } from 'lucide-react';
import { getApiBaseUrl } from '@/config/api';

interface NetworkTestResult {
  url: string;
  success: boolean;
  responseTime: number;
  error?: string;
}

const IonicNetworkDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [networkResults, setNetworkResults] = useState<NetworkTestResult[]>([]);
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [connectionResult, setConnectionResult] = useState<string>('');

  useEffect(() => {
    collectIonicDebugInfo();
  }, []);

  const collectIonicDebugInfo = () => {
    const info = {
      // Ionic/Capacitor环境检测
      isIonic: window.location.protocol === 'ionic:' || 
               window.location.protocol === 'capacitor:' ||
               (window as any).Capacitor !== undefined ||
               (window as any).Ionic !== undefined ||
               (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1),
      
      // 当前位置信息
      location: {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        href: window.location.href,
        origin: window.location.origin
      },
      
      // API配置
      apiBaseUrl: getApiBaseUrl(),
      cachedApiUrl: localStorage.getItem('ionic_api_base_url') || localStorage.getItem('api_base_url'),
      
      // 网络状态
      online: navigator.onLine,
      
      // 设备信息
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      
      // Capacitor/Ionic信息
      capacitorInfo: (window as any).Capacitor ? {
        platform: (window as any).Capacitor.getPlatform(),
        isNativePlatform: (window as any).Capacitor.isNativePlatform(),
        plugins: Object.keys((window as any).Capacitor.Plugins || {})
      } : null,
      
      ionicInfo: (window as any).Ionic ? {
        version: (window as any).Ionic.version || 'unknown'
      } : null
    };
    
    setDebugInfo(info);
  };

  const testIonicNetworkConnection = async (): Promise<NetworkTestResult[]> => {
    const testUrls = [
      'http://192.168.1.100:8000',  // 常见路由器IP
      'http://192.168.1.1:8000',    // 默认网关
      'http://192.168.0.1:8000',    // 另一个常见网关
      'http://192.168.79.13:8000',  // 您之前使用的IP
      'http://192.168.79.15:8000',  // 备用IP
      'http://10.0.2.2:8000',       // Android模拟器
      'http://localhost:8000',      // 本地测试
    ];

    const results: NetworkTestResult[] = [];

    for (const url of testUrls) {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        results.push({
          url,
          success: response.ok,
          responseTime,
          error: response.ok ? undefined : `HTTP ${response.status}`
        });

      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        results.push({
          url,
          success: false,
          responseTime,
          error: error.message
        });
      }
    }

    return results;
  };

  const testAllConnections = async () => {
    setIsTestingConnection(true);
    setConnectionResult('');
    
    try {
      console.log('开始Ionic网络连接测试...');
      const results = await testIonicNetworkConnection();
      setNetworkResults(results);
      
      const successfulResults = results.filter(r => r.success);
      
      if (successfulResults.length > 0) {
        // 选择响应时间最短的地址
        const bestResult = successfulResults.reduce((prev, current) => 
          prev.responseTime < current.responseTime ? prev : current
        );
        
        localStorage.setItem('ionic_api_base_url', bestResult.url);
        setConnectionResult(`✅ 找到可用地址: ${bestResult.url} (${bestResult.responseTime}ms)`);
        console.log('Ionic: 最佳API地址:', bestResult.url);
      } else {
        setConnectionResult('❌ 没有找到可用的API地址，请检查后端服务器状态');
      }
    } catch (error: any) {
      console.error('Ionic网络测试失败:', error);
      setConnectionResult(`❌ 网络测试错误: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testCustomUrl = async () => {
    if (!customApiUrl) return;
    
    setIsTestingConnection(true);
    try {
      const response = await fetch(`${customApiUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        localStorage.setItem('ionic_api_base_url', customApiUrl);
        setConnectionResult(`✅ 自定义地址连接成功: ${customApiUrl}`);
      } else {
        setConnectionResult(`❌ 自定义地址连接失败: HTTP ${response.status}`);
      }
    } catch (error: any) {
      setConnectionResult(`❌ 自定义地址错误: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testLoginAPI = async () => {
    setIsTestingConnection(true);
    const apiUrl = getApiBaseUrl();
    
    try {
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
      setConnectionResult(`登录API测试 - 状态码: ${response.status}, 响应: ${responseText.substring(0, 200)}`);
    } catch (error: any) {
      setConnectionResult(`❌ 登录API错误: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-4 p-4 max-h-screen overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Ionic网络调试
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 环境信息 */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              环境信息
            </h4>
            <div className="space-y-1 text-sm bg-gray-50 p-3 rounded">
              <div>运行环境: {debugInfo.isIonic ? '✅ Ionic/Capacitor' : '❌ 浏览器'}</div>
              <div>在线状态: {debugInfo.online ? '✅ 在线' : '❌ 离线'}</div>
              <div>协议: <code>{debugInfo.location?.protocol}</code></div>
              <div>地址: <code>{debugInfo.location?.href}</code></div>
              {debugInfo.capacitorInfo && (
                <div>Capacitor平台: <code>{debugInfo.capacitorInfo.platform}</code></div>
              )}
            </div>
          </div>
          
          {/* API配置 */}
          <div>
            <h4 className="font-medium mb-2">API配置</h4>
            <div className="space-y-1 text-sm bg-blue-50 p-3 rounded">
              <div>当前API: <code className="bg-white px-1 rounded">{debugInfo.apiBaseUrl}</code></div>
              <div>缓存API: <code className="bg-white px-1 rounded">{debugInfo.cachedApiUrl || '无'}</code></div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={testAllConnections}
              disabled={isTestingConnection}
              variant="default"
              size="sm"
            >
              {isTestingConnection ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
              测试所有地址
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
              onClick={collectIonicDebugInfo}
              variant="outline"
              size="sm"
            >
              刷新信息
            </Button>
          </div>
          
          {/* 自定义API地址 */}
          <div className="space-y-2">
            <Label htmlFor="custom-api">自定义API地址</Label>
            <div className="flex gap-2">
              <Input
                id="custom-api"
                placeholder="http://192.168.1.100:8000"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={testCustomUrl} disabled={isTestingConnection} size="sm">
                测试
              </Button>
            </div>
          </div>
          
          {/* 连接结果 */}
          {connectionResult && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-xs">{connectionResult}</pre>
              </AlertDescription>
            </Alert>
          )}
          
          {/* 网络测试结果 */}
          {networkResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">连接测试结果</h4>
              <div className="space-y-1 max-h-40 overflow-auto">
                {networkResults.map((result, index) => (
                  <div key={index} className={`p-2 rounded text-sm ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="font-mono">{result.url}</div>
                    <div className="text-xs flex items-center gap-1">
                      {result.success ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{result.responseTime}ms</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-red-600" />
                          <span>{result.error}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IonicNetworkDebug;
