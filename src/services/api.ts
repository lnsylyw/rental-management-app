import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '@/config/api';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器，添加认证令牌
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地存储的令牌
      localStorage.removeItem('token');
      // 重定向到登录页面
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API服务类
class ApiService {
  // 用户认证
  static async login(username: string, password: string): Promise<any> {
    console.log('开始登录请求:', { 
      username, 
      timestamp: new Date().toISOString(),
      url: `${API_BASE_URL}/auth/token`,
      currentHost: window.location.hostname,
      detectedApiUrl: API_BASE_URL
    });
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
      console.log('发送登录请求...');
      const response = await apiClient.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('登录响应状态:', response.status);
      console.log('登录响应数据:', response.data);
      
      // 保存令牌到本地存储
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        console.log('令牌已保存到本地存储');
      } else {
        console.error('响应中没有access_token');
      }
      
      console.log('登录成功完成');
      return response.data;
    } catch (error: any) {
      console.error('登录请求失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw error;
    }
  }
  
  static async register(userData: any): Promise<any> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }
  
  static async getCurrentUser(): Promise<any> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
  
  static logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
  
  // 房屋管理
  static async getProperties(params?: any): Promise<any> {
    const response = await apiClient.get('/properties/', { params });
    return response.data;
  }
  
  // 获取房屋统计数据
  static async getPropertyStatistics(): Promise<any> {
    const properties = await this.getProperties();
    
    // 计算统计数据
    const total = properties.length;
    const rented = properties.filter((p: any) => p.status === '已出租').length;
    const available = properties.filter((p: any) => p.status === '可用').length;
    
    return {
      total,
      rented,
      available
    };
  }
  
  static async getProperty(id: number): Promise<any> {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  }
  
  static async createProperty(propertyData: any): Promise<any> {
    const response = await apiClient.post('/properties/', propertyData);
    return response.data;
  }
  
  static async updateProperty(id: number, propertyData: any): Promise<any> {
    const response = await apiClient.put(`/properties/${id}`, propertyData);
    return response.data;
  }
  
  static async deleteProperty(id: number): Promise<any> {
    const response = await apiClient.delete(`/properties/${id}`);
    return response.data;
  }
  
  // 租客管理
  static async getTenants(params?: any): Promise<any> {
    const response = await apiClient.get('/tenants/', { params });
    return response.data;
  }

  // 获取所有租客（包括没有合同的）
  static async getAllTenantsWithOptionalLeases(params?: any): Promise<any> {
    const response = await apiClient.get('/tenants/all-tenants', { params });
    return response.data;
  }
  
  static async getTenant(id: number): Promise<any> {
    const response = await apiClient.get(`/tenants/${id}`);
    return response.data;
  }
  
  // 检查租客是否已存在
  static async checkTenantExists(params: { name?: string; phone?: string; id_card?: string }): Promise<any> {
    const response = await apiClient.get('/tenants/check-exists', { params });
    return response.data;
  }

  static async createTenant(tenantData: any): Promise<any> {
    const response = await apiClient.post('/tenants/', tenantData);
    return response.data;
  }
  
  static async updateTenant(id: number, tenantData: any): Promise<any> {
    const response = await apiClient.put(`/tenants/${id}`, tenantData);
    return response.data;
  }

  static async deleteTenant(id: number): Promise<any> {
    const response = await apiClient.delete(`/tenants/${id}`);
    return response.data;
  }

  // 车位管理
  static async getParkingSpaces(params?: any): Promise<any> {
    const response = await apiClient.get('/parking/', { params });
    return response.data;
  }

  static async getParkingSpace(id: number): Promise<any> {
    const response = await apiClient.get(`/parking/${id}`);
    return response.data;
  }

  static async createParkingSpace(parkingData: any): Promise<any> {
    const response = await apiClient.post('/parking/', parkingData);
    return response.data;
  }

  static async updateParkingSpace(id: number, parkingData: any): Promise<any> {
    const response = await apiClient.put(`/parking/${id}`, parkingData);
    return response.data;
  }

  static async deleteParkingSpace(id: number): Promise<any> {
    const response = await apiClient.delete(`/parking/${id}`);
    return response.data;
  }

  // 车位租客管理
  static async getParkingTenants(params?: any): Promise<any> {
    const response = await apiClient.get('/parking-tenants/', { params });
    return response.data;
  }

  static async getParkingTenant(id: number): Promise<any> {
    const response = await apiClient.get(`/parking-tenants/${id}/`);
    return response.data;
  }

  static async createParkingTenant(tenantData: any): Promise<any> {
    const response = await apiClient.post('/parking-tenants/', tenantData);
    return response.data;
  }

  static async updateParkingTenant(id: number, tenantData: any): Promise<any> {
    const response = await apiClient.put(`/parking-tenants/${id}/`, tenantData);
    return response.data;
  }

  static async deleteParkingTenant(id: number): Promise<any> {
    const response = await apiClient.delete(`/parking-tenants/${id}/`);
    return response.data;
  }

  // 租赁合同管理
  static async getLeases(params?: any): Promise<any> {
    const response = await apiClient.get('/leases/', { params });
    return response.data;
  }

  static async getLease(id: number): Promise<any> {
    const response = await apiClient.get(`/leases/${id}`);
    return response.data;
  }

  static async createLease(leaseData: any): Promise<any> {
    const response = await apiClient.post('/leases/', leaseData);
    return response.data;
  }

  static async updateLease(id: number, leaseData: any): Promise<any> {
    const response = await apiClient.put(`/leases/${id}`, leaseData);
    return response.data;
  }

  static async deleteLease(id: number): Promise<any> {
    const response = await apiClient.delete(`/leases/${id}`);
    return response.data;
  }

  static async getLeasesWithRentStatus(): Promise<any> {
    const response = await apiClient.get('/leases/rent-status');
    return response.data;
  }

  // 合同照片上传
  static async uploadContractPhotos(formData: FormData): Promise<any> {
    const response = await apiClient.post('/upload/contract-photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async deleteContractPhoto(filename: string): Promise<any> {
    const response = await apiClient.delete(`/upload/contract-photos/${filename}`);
    return response.data;
  }

  // 财务管理
  static async getTransactions(params?: any): Promise<any> {
    const response = await apiClient.get('/transactions/', { params });
    return response.data;
  }
  
  static async getTransaction(id: number): Promise<any> {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  }
  
  static async createTransaction(transactionData: any): Promise<any> {
    const response = await apiClient.post('/transactions/', transactionData);
    return response.data;
  }
  
  static async updateTransaction(id: number, transactionData: any): Promise<any> {
    const response = await apiClient.put(`/transactions/${id}`, transactionData);
    return response.data;
  }

  static async deleteTransaction(id: number): Promise<any> {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  }
  
  static async getFinancialStatistics(params?: any): Promise<any> {
    const response = await apiClient.get('/transactions/statistics/summary/', { params });
    return response.data;
  }

  // 付款计划管理
  static async getPaymentSchedules(params?: any): Promise<any> {
    const response = await apiClient.get('/payment-schedules/', { params });
    return response.data;
  }

  static async getPaymentSchedule(id: number): Promise<any> {
    const response = await apiClient.get(`/payment-schedules/${id}`);
    return response.data;
  }

  static async createPaymentSchedule(scheduleData: any): Promise<any> {
    const response = await apiClient.post('/payment-schedules/', scheduleData);
    return response.data;
  }

  static async updatePaymentSchedule(id: number, scheduleData: any): Promise<any> {
    const response = await apiClient.put(`/payment-schedules/${id}`, scheduleData);
    return response.data;
  }

  static async deletePaymentSchedule(id: number): Promise<any> {
    const response = await apiClient.delete(`/payment-schedules/${id}`);
    return response.data;
  }

  // 维修管理
  static async getMaintenanceRequests(params?: any): Promise<any> {
    const response = await apiClient.get('/maintenance/', { params });
    return response.data;
  }
  
  static async getMaintenanceRequest(id: number): Promise<any> {
    const response = await apiClient.get(`/maintenance/${id}/`);
    return response.data;
  }
  
  static async createMaintenanceRequest(maintenanceData: any): Promise<any> {
    const response = await apiClient.post('/maintenance/', maintenanceData);
    return response.data;
  }
  
  static async updateMaintenanceRequest(id: number, maintenanceData: any): Promise<any> {
    const response = await apiClient.put(`/maintenance/${id}/`, maintenanceData);
    return response.data;
  }
  
  static async deleteMaintenanceRequest(id: number): Promise<any> {
    const response = await apiClient.delete(`/maintenance/${id}/`);
    return response.data;
  }

  static async generatePaymentSchedules(leaseId: number): Promise<any> {
    const response = await apiClient.post(`/payment-schedules/generate/${leaseId}`);
    return response.data;
  }
  
  static async updateMaintenanceStatus(id: number, status: string): Promise<any> {
    const response = await apiClient.patch(`/maintenance/${id}/status/?status=${status}`);
    return response.data;
  }
  
  // 通知管理
  static async getNotifications(params?: any): Promise<any> {
    const response = await apiClient.get('/notifications/', { params });
    return response.data;
  }
  
  static async getNotification(id: number): Promise<any> {
    const response = await apiClient.get(`/notifications/${id}/`);
    return response.data;
  }
  
  static async markNotificationAsRead(id: number): Promise<any> {
    const response = await apiClient.patch(`/notifications/${id}/read/`);
    return response.data;
  }
  
  static async markAllNotificationsAsRead(): Promise<any> {
    const response = await apiClient.patch('/notifications/read-all/');
    return response.data;
  }
  
  static async deleteNotification(id: number): Promise<any> {
    const response = await apiClient.delete(`/notifications/${id}/`);
    return response.data;
  }
  
  static async getUnreadNotificationCount(): Promise<any> {
    const response = await apiClient.get('/notifications/count/unread');
    return response.data;
  }

  // 图片上传管理
  static async uploadPropertyImages(files: File[], propertyId: number, imageType: string = 'interior'): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiClient.post(`/upload/property-images/${propertyId}?image_type=${imageType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async deletePropertyImage(filename: string): Promise<any> {
    const response = await apiClient.delete(`/upload/properties/${filename}`);
    return response.data;
  }

  static async getParkingStatistics(): Promise<any> {
    const response = await apiClient.get('/parking/statistics/overview');
    return response.data;
  }
}

export default ApiService;
