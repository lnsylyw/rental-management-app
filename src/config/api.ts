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
    // 在移动端使用固定的后端地址
    return 'http://192.168.79.13:8000';
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