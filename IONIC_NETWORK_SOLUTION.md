# Ionic Framework 网络连接解决方案

## 问题分析

使用Ionic Framework创建的APK无法连接后端API的常见原因：

1. **Ionic环境检测**：需要正确检测Ionic/Capacitor环境
2. **网络安全策略**：Android需要特殊的网络配置
3. **API地址配置**：移动端需要动态API地址检测
4. **CORS配置**：后端需要允许Ionic应用访问

## Ionic专用解决方案

### 1. 更新API配置以支持Ionic

更新 `src/config/api.ts` 中的Ionic检测逻辑：

```typescript
// 检测是否为Ionic/Capacitor环境
export const isIonicApp = (): boolean => {
  return !!(
    window.location.protocol === 'ionic:' ||
    window.location.protocol === 'capacitor:' ||
    (window as any).Capacitor ||
    (window as any).Ionic ||
    document.URL.indexOf('http://') === -1 && 
    document.URL.indexOf('https://') === -1
  );
};

export const getApiBaseUrl = (): string => {
  // 1. 环境变量优先
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Ionic/Capacitor移动端环境
  if (isIonicApp()) {
    // 移动端使用缓存的API地址
    const cachedUrl = localStorage.getItem('ionic_api_base_url');
    if (cachedUrl) {
      return cachedUrl;
    }

    // 返回默认地址，同时在后台测试可用地址
    setTimeout(async () => {
      const availableUrl = await getAvailableApiUrl();
      localStorage.setItem('ionic_api_base_url', availableUrl);
      console.log('Ionic: 检测到API地址:', availableUrl);
    }, 100);

    // 默认尝试常见的局域网地址
    return 'http://192.168.1.100:8000'; // 根据您的网络环境调整
  }

  // 3. 浏览器环境
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  // 4. 其他环境
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:8000`;
};
```

### 2. Ionic专用网络测试

创建 `src/utils/ionic-network.ts`：

```typescript
import { getApiBaseUrl } from '@/config/api';

export interface NetworkTestResult {
  url: string;
  success: boolean;
  responseTime: number;
  error?: string;
}

export const testIonicNetworkConnection = async (): Promise<NetworkTestResult[]> => {
  const testUrls = [
    'http://192.168.1.100:8000',  // 常见路由器IP
    'http://192.168.1.1:8000',    // 默认网关
    'http://192.168.0.1:8000',    // 另一个常见网关
    'http://192.168.79.13:8000',  // 您之前使用的IP
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

export const findBestApiUrl = async (): Promise<string> => {
  const results = await testIonicNetworkConnection();
  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length === 0) {
    console.warn('Ionic: 没有找到可用的API地址');
    return getApiBaseUrl(); // 返回默认地址
  }

  // 选择响应时间最短的地址
  const bestResult = successfulResults.reduce((prev, current) => 
    prev.responseTime < current.responseTime ? prev : current
  );

  console.log('Ionic: 找到最佳API地址:', bestResult.url);
  return bestResult.url;
};
```

### 3. 使用Ionic CLI构建APK

#### 方法1：使用Ionic CLI（推荐）

```bash
# 安装Ionic CLI
npm install -g @ionic/cli

# 构建项目
ionic build

# 添加Android平台（如果还没有）
ionic capacitor add android

# 同步项目
ionic capacitor sync android

# 构建APK
ionic capacitor build android

# 或者直接运行到设备
ionic capacitor run android
```

#### 方法2：使用Capacitor CLI

```bash
# 构建Web应用
npm run build

# 同步到Android
npx cap sync android

# 构建APK
npx cap build android
```

### 4. Ionic专用网络配置

#### 4.1 更新 capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rental.management',
  appName: 'rental-management-app',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'http://192.168.*',
      'http://10.0.2.2:*',
      'http://localhost:*'
    ]
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
```

#### 4.2 Android网络安全配置

确保 `android/app/src/main/res/xml/network_security_config.xml` 包含：

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
    
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.1</domain>
        <domain includeSubdomains="true">192.168.1.100</domain>
        <domain includeSubdomains="true">192.168.0.1</domain>
        <domain includeSubdomains="true">192.168.79.13</domain>
    </domain-config>
</network-security-config>
```

### 5. Ionic调试工具

在登录页面添加Ionic专用调试：

```typescript
const IonicNetworkDebug = () => {
  const [networkResults, setNetworkResults] = useState<NetworkTestResult[]>([]);
  const [isTestingIonic, setIsTestingIonic] = useState(false);

  const testIonicNetwork = async () => {
    setIsTestingIonic(true);
    try {
      const results = await testIonicNetworkConnection();
      setNetworkResults(results);
      
      const bestUrl = await findBestApiUrl();
      localStorage.setItem('ionic_api_base_url', bestUrl);
      
      console.log('Ionic网络测试完成，最佳地址:', bestUrl);
    } catch (error) {
      console.error('Ionic网络测试失败:', error);
    } finally {
      setIsTestingIonic(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={testIonicNetwork} disabled={isTestingIonic}>
        {isTestingIonic ? '测试中...' : '测试Ionic网络连接'}
      </Button>
      
      {networkResults.length > 0 && (
        <div className="space-y-2">
          {networkResults.map((result, index) => (
            <div key={index} className={`p-2 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="font-mono text-sm">{result.url}</div>
              <div className="text-xs">
                {result.success ? `✅ ${result.responseTime}ms` : `❌ ${result.error}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 6. 后端配置要求

确保后端支持Ionic应用：

```python
# FastAPI CORS配置
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:*",
        "ionic://localhost",
        "capacitor://localhost",
        "http://192.168.*",
        "*"  # 开发环境可以使用，生产环境需要限制
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查端点
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "server": "ionic-compatible"
    }
```

### 7. 构建和部署流程

#### 完整的Ionic APK构建流程：

```bash
# 1. 安装依赖
npm install

# 2. 构建Web应用
ionic build

# 3. 同步到Android
ionic capacitor sync android

# 4. 在Android Studio中打开项目
ionic capacitor open android

# 5. 在Android Studio中构建APK
# 或者使用命令行：
ionic capacitor build android
```

### 8. 故障排除

如果仍然无法连接：

1. **检查Ionic环境**：确认应用正确检测到Ionic环境
2. **测试网络连接**：使用内置的网络测试工具
3. **查看控制台日志**：检查浏览器开发者工具的Console
4. **验证后端配置**：确保后端绑定到0.0.0.0:8000
5. **检查防火墙**：确保端口8000对局域网开放

这个解决方案专门针对Ionic Framework环境进行了优化，应该能够解决您的网络连接问题。
