import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Phone, Calendar, Plus, Filter, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

const TenantList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [propertyTenants, setPropertyTenants] = useState<any[]>([]);
  const [parkingTenants, setParkingTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 获取所有租客数据（包括没有合同的租客）
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoading(true);
        const tenantsData = await ApiService.getAllTenantsWithOptionalLeases();

        // 后端已返回去重后的租客数据，每个租客包含最新合同信息
        const tenantsWithLeases = (tenantsData || []).map((tenant: any) => {
          // 如果没有合同信息，返回基本租客信息
          if (!tenant.leases || tenant.leases.length === 0) {
            return {
              ...tenant,
              lease_type: 'property',
              monthly_rent: 0,
              status: '无合同',
              tenant_id: tenant.id,
              lease_id: null
            };
          }

          // 使用最新合同信息 - 后端已确保每个租客只有最新合同
          const latestLease = tenant.leases[0];
          return {
            ...tenant,
            lease_type: latestLease.lease_type,
            monthly_rent: latestLease.monthly_rent,
            lease_start: latestLease.lease_start,
            lease_end: latestLease.lease_end,
            status: latestLease.status,
            tenant_id: tenant.id,
            lease_id: latestLease.id,
            property: latestLease.property,
            parking_space: latestLease.parking_space,
            car_number: latestLease.car_number
          };
        });

        // 分离房屋租客和车位租客
        const propertyTenantsWithType = tenantsWithLeases.filter((item: any) => item.lease_type === 'property');
        const parkingTenantsWithType = tenantsWithLeases.filter((item: any) => item.lease_type === 'parking');

        setPropertyTenants(propertyTenantsWithType);
        setParkingTenants(parkingTenantsWithType);
        setError(null);
      } catch (err: any) {
        console.error('获取租客列表失败:', err);

        // 检查是否是认证错误
        if (err.response?.status === 401) {
          setError('请先登录系统');
          toast({
            title: '认证失败',
            description: '请先登录系统',
            variant: 'destructive',
          });
        } else {
          setError('获取租客列表失败，请稍后重试');
          toast({
            title: '数据加载失败',
            description: err.message || '无法加载租客数据，请检查网络连接',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, [toast]);

  // 合并所有租客数据
  const allTenants = [...propertyTenants, ...parkingTenants];

  // 根据搜索词过滤租客
  const filteredTenants = allTenants.filter(tenant =>
    tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.phone?.includes(searchTerm) ||
    (tenant.lease_type === 'property' && tenant.property?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tenant.lease_type === 'parking' && tenant.parking_space?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tenant.lease_type === 'parking' && tenant.car_number?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 根据标签过滤租客
  const getFilteredTenantsByTab = () => {
    if (activeTab === 'all') return filteredTenants;
    if (activeTab === 'property') return filteredTenants.filter(tenant => tenant.lease_type === 'property');
    if (activeTab === 'parking') return filteredTenants.filter(tenant => tenant.lease_type === 'parking');
    return filteredTenants;
  };

  // 获取状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '正常':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case '即将到期':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case '欠费':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const displayTenants = getFilteredTenantsByTab();

  return (
    <div className="space-y-4">
      {/* 搜索和筛选区 */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="搜索租客..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
          <span className="sr-only">筛选</span>
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate('/tenant/add')}
        >
          <Plus className="h-4 w-4 mr-2" />
          添加租客
        </Button>
      </div>

      {/* 租客类型选项卡 */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">全部租客 ({allTenants.length})</TabsTrigger>
          <TabsTrigger value="property">房屋租客 ({propertyTenants.length})</TabsTrigger>
          <TabsTrigger value="parking">车位租客 ({parkingTenants.length})</TabsTrigger>
        </TabsList>
        
        {/* 租客列表内容 */}
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-lg text-gray-600">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                重试
              </Button>
            </div>
          ) : displayTenants.length > 0 ? (
            displayTenants.map((tenant) => (
              <Card
                key={`${tenant.tenant_id || tenant.id}-${tenant.lease_id || 'no-lease'}`}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/tenant/${tenant.tenant_id || tenant.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-4 bg-gray-100 flex items-center justify-center">
                      {tenant.avatar ? (
                        <img
                          src={tenant.avatar}
                          alt={tenant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{tenant.name}</h3>
                          {tenant.status !== '无合同' && (
                            <>
                              <Badge variant="outline" className={tenant.lease_type === 'property' ? 'border-blue-500 text-blue-700' : 'border-purple-500 text-purple-700'}>
                                {tenant.lease_type === 'property' ? '房屋' : '车位'}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {tenant.status || '生效中'}
                              </Badge>
                            </>
                          )}
                          {tenant.status === '无合同' && (
                            <Badge variant="outline" className="border-gray-400 text-gray-600">
                              无合同
                            </Badge>
                          )}
                        </div>
                        {tenant.status !== '无合同' && (
                          <span className="text-sm font-medium text-green-600">
                            ¥{tenant.monthly_rent}/月
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Phone className="h-4 w-4 mr-1" />
                        <span className="text-sm">{tenant.phone}</span>
                      </div>
                      {tenant.status !== '无合同' && (
                        <>
                          <div className="flex items-center text-gray-500 mt-1">
                            <User className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {tenant.lease_type === 'property'
                                ? (tenant.property?.name || '未知房屋')
                                : (tenant.parking_space?.name || '未知车位')
                              }
                              {tenant.lease_type === 'parking' && tenant.car_number && (
                                <span className="ml-2 text-blue-600">({tenant.car_number})</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              租期: {new Date(tenant.lease_start).toLocaleDateString()} 至 {new Date(tenant.lease_end).toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">没有找到匹配的租客</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenantList;