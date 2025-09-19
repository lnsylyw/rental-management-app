import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, AlertCircle } from 'lucide-react';

const SimpleNetworkTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testBasicFetch = async () => {
    setIsLoading(true);
    setTestResult('开始测试...\n');
    
    try {
      // 测试1: 基本的fetch请求
      setTestResult(prev => prev + '测试1: 基本fetch请求\n');
      
      const response = await fetch('http://192.168.79.13:8000/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      setTestResult(prev => prev + `响应状态: ${response.status}\n`);
      setTestResult(prev => prev + `响应OK: ${response.ok}\n`);
      
      if (response.ok) {
        const text = await response.text();
        setTestResult(prev => prev + `响应内容: ${text}\n`);
      }
      
    } catch (error: any) {
      setTestResult(prev => prev + `错误: ${error.message}\n`);
      setTestResult(prev => prev + `错误类型: ${error.name}\n`);
      setTestResult(prev => prev + `错误堆栈: ${error.stack}\n`);
    }
    
    setIsLoading(false);
  };

  const testWithoutHTTP = async () => {
    setIsLoading(true);
    setTestResult('测试不带http://前缀...\n');
    
    try {
      const response = await fetch('192.168.79.13:8000/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      setTestResult(prev => prev + `响应状态: ${response.status}\n`);
      
    } catch (error: any) {
      setTestResult(prev => prev + `错误: ${error.message}\n`);
    }
    
    setIsLoading(false);
  };

  const testXMLHttpRequest = async () => {
    setIsLoading(true);
    setTestResult('测试XMLHttpRequest...\n');
    
    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          setTestResult(prev => prev + `XHR状态: ${xhr.status}\n`);
          setTestResult(prev => prev + `XHR响应: ${xhr.responseText}\n`);
          setIsLoading(false);
          resolve();
        }
      };
      
      xhr.onerror = function() {
        setTestResult(prev => prev + `XHR错误\n`);
        setIsLoading(false);
        resolve();
      };
      
      try {
        xhr.open('GET', 'http://192.168.79.13:8000/health', true);
        xhr.send();
      } catch (error: any) {
        setTestResult(prev => prev + `XHR异常: ${error.message}\n`);
        setIsLoading(false);
        resolve();
      }
    });
  };

  const testEnvironment = () => {
    setTestResult('环境信息:\n');
    setTestResult(prev => prev + `协议: ${window.location.protocol}\n`);
    setTestResult(prev => prev + `主机: ${window.location.hostname}\n`);
    setTestResult(prev => prev + `端口: ${window.location.port}\n`);
    setTestResult(prev => prev + `完整URL: ${window.location.href}\n`);
    setTestResult(prev => prev + `用户代理: ${navigator.userAgent}\n`);
    setTestResult(prev => prev + `在线状态: ${navigator.onLine}\n`);
    setTestResult(prev => prev + `Capacitor: ${(window as any).Capacitor ? '存在' : '不存在'}\n`);
    setTestResult(prev => prev + `Ionic: ${(window as any).Ionic ? '存在' : '不存在'}\n`);
  };

  const clearResult = () => {
    setTestResult('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          简单网络测试
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testBasicFetch} 
            disabled={isLoading}
            variant="default"
            size="sm"
          >
            测试HTTP请求
          </Button>
          
          <Button 
            onClick={testWithoutHTTP} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            测试无前缀
          </Button>
          
          <Button 
            onClick={testXMLHttpRequest} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            测试XHR
          </Button>
          
          <Button 
            onClick={testEnvironment} 
            disabled={isLoading}
            variant="secondary"
            size="sm"
          >
            环境信息
          </Button>
          
          <Button 
            onClick={clearResult} 
            variant="ghost"
            size="sm"
          >
            清除
          </Button>
        </div>

        {testResult && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-xs font-mono bg-gray-50 p-2 rounded mt-2 max-h-60 overflow-auto">
                {testResult}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <strong>测试说明:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><strong>测试HTTP请求</strong>: 使用fetch API测试完整的HTTP请求</li>
            <li><strong>测试无前缀</strong>: 测试不带http://前缀的请求</li>
            <li><strong>测试XHR</strong>: 使用XMLHttpRequest测试</li>
            <li><strong>环境信息</strong>: 显示当前运行环境的详细信息</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleNetworkTest;
