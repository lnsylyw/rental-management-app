/**
 * API配置文件
 * 统一管理API基础地址配置
 */

/**
 * 检测是否在Capacitor环境中运行
 */
const isCapacitorApp = (): boolean => {
  return window.location.protocol === 'capacitor:' ||
         window.location.protocol === 'ionic:' ||
         (window as any).Capacitor !== undefined;
};

/**
 * 测试API地址是否可达
 */
const testApiConnection = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时

    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`API连接测试失败: ${url}`, error);
    return false;
  }
};

/**
 * 获取可用的API地址（移动端专用）
 */
const getAvailableApiUrl = async (): Promise<string> => {
  const possibleUrls = [
    'http://192.168.79.13:8000',  // 原始地址
    'http://192.168.79.15:8000',  // 备用地址
    'http://192.168.1.100:8000',  // 常见局域网地址
    'http://10.0.2.2:8000',       // Android模拟器地址
    'http://localhost:8000'       // 本地地址
  ];

  // 并行测试所有地址
  const testPromises = possibleUrls.map(async (url) => {
    const isAvailable = await testApiConnection(url);
    return { url, isAvailable };
  });

  const results = await Promise.all(testPromises);
  const availableUrl = results.find(result => result.isAvailable);

  if (availableUrl) {
    console.log(`找到可用的API地址: ${availableUrl.url}`);
    return availableUrl.url;
  }

  // 如果没有找到可用地址，返回默认地址并记录警告
  console.warn('未找到可用的API地址，使用默认地址');
  return possibleUrls[0];
};

/**
 * 获取API基础地址
 * 优先级：环境变量 > Capacitor环境检测 > 动态检测
 */
export const getApiBaseUrl = (): string => {
  // 1. 优先使用环境变量配置
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // 2. Capacitor移动端环境
  if (isCapacitorApp()) {
    // 移动端使用缓存的API地址，如果没有则使用默认地址
    const cachedUrl = localStorage.getItem('api_base_url');
    if (cachedUrl) {
      return cachedUrl;
    }

    // 返回默认地址，同时在后台测试可用地址
    setTimeout(async () => {
      const availableUrl = await getAvailableApiUrl();
      localStorage.setItem('api_base_url', availableUrl);
      // 如果当前使用的地址与找到的可用地址不同，可以考虑刷新页面或提示用户
      if (availableUrl !== 'http://192.168.79.13:8000') {
        console.log('检测到更好的API地址，已缓存供下次使用');
      }
    }, 100);

    return 'http://192.168.79.13:8000'; // 默认地址
  }

  // 3. 动态检测（兼容旧版本逻辑）
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  // 4. 局域网访问时，使用当前主机的IP，但端口改为8000
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:8000`;
};

// 导出API基础地址
export const API_BASE_URL = getApiBaseUrl();

// 导出认证头获取函数
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * 处理图片URL
 * 如果图片地址以http开头就直接使用，否则加上后端域名
 */
export const processImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '/placeholder.svg?height=400&width=600';

  // 如果是完整的HTTP/HTTPS URL，直接使用
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // 如果是相对路径，且为占位符图片，则直接返回，由前端静态服务器处理
  if (imageUrl === '/placeholder.svg?height=400&width=600') {
    return imageUrl;
  }

  // 如果是相对路径，添加API基础地址
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  // 其他情况，也添加API基础地址（兼容性处理）
  return `${API_BASE_URL}/${imageUrl}`;
};