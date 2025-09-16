import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Calendar, User, Home, Car, Edit, Trash2, RefreshCw, Filter } from 'lucide-react';
import ApiService from '@/services/api';
import { getStatusColor, calculateContractStatus, shouldUpdateContractStatus } from '@/constants/contract';

const ContractList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 计算合同总金额（临时解决方案）
  const calculateContractTotal = (contract: any): number => {
    if (!contract || !contract.monthly_rent || !contract.lease_start || !contract.lease_end) {
      return 0;
    }

    try {
      const startDate = new Date(contract.lease_start);
      const endDate = new Date(contract.lease_end);
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    (endDate.getMonth() - startDate.getMonth());
      return contract.monthly_rent * Math.max(1, months);
    } catch (error) {
      console.error('计算合同总金额失败:', error);
      return 0;
    }
  };

  // 获取合同列表数据
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setIsLoading(true);
        const contractsData = await ApiService.getLeases();

        // 自动更新合同状态
        const updatedContracts = await Promise.all((contractsData || []).map(async (contract: any) => {
          const calculatedStatus = calculateContractStatus(contract.lease_start, contract.lease_end);

          // 如果需要更新状态，调用API更新
          if (shouldUpdateContractStatus(contract.status, calculatedStatus)) {
            try {
              await ApiService.updateLease(contract.id, { status: calculatedStatus });
              return { ...contract, status: calculatedStatus };
            } catch (error) {
              console.warn(`更新合同 ${contract.id} 状态失败:`, error);
              return contract;
            }
          }

          return contract;
        }));

        setContracts(updatedContracts);
        setError(null);
      } catch (err: any) {
        console.error('获取合同列表失败:', err);

        // 检查是否是认证错误
        if (err.response?.status === 401) {
          setError('请先登录系统');
          toast({
            title: '认证失败',
            description: '请先登录系统',
            variant: 'destructive',
          });
        } else {
          setError('获取合同列表失败，请稍后重试');
          toast({
            title: '数据加载失败',
            description: err.message || '无法加载合同数据，请检查网络连接',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [toast]);

  // 根据搜索词过滤合同
  const filteredContracts = contracts.filter(contract =>
    contract.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.tenant?.phone?.includes(searchTerm) ||
    (contract.lease_type === 'property' && contract.property?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contract.lease_type === 'parking' && contract.parking_space?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contract.lease_type === 'parking' && contract.car_number?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 根据标签过滤合同
  const getFilteredContractsByTab = () => {
    if (activeTab === 'all') return filteredContracts;
    if (activeTab === 'property') return filteredContracts.filter(contract => contract.lease_type === 'property');
    if (activeTab === 'parking') return filteredContracts.filter(contract => contract.lease_type === 'parking');
    if (activeTab === 'active') return filteredContracts.filter(contract => contract.status === '生效中');
    if (activeTab === 'expiring') return filteredContracts.filter(contract => contract.status === '即将到期');
    if (activeTab === 'expired') return filteredContracts.filter(contract => contract.status === '已到期');
    return filteredContracts;
  };

  // 使用统一的状态颜色函数

  // 删除合同
  const handleDeleteContract = async (contractId: number) => {
    if (!window.confirm('确定要删除这个合同吗？此操作不可撤销。')) {
      return;
    }

    try {
      await ApiService.deleteLease(contractId);
      setContracts(contracts.filter(contract => contract.id !== contractId));
      toast({
        title: '删除成功',
        description: '合同已成功删除',
      });
    } catch (error: any) {
      console.error('删除合同失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '删除合同失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    );
  }

  const displayedContracts = getFilteredContractsByTab();

  return (
    <div className="space-y-4">
      {/* 固定搜索和筛选区 */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b shadow-sm p-4">
        <div className="container mx-auto">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="搜索租客姓名、电话、房屋或车牌号..."
                className="pl-8 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
              <span className="sr-only">筛选</span>
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 h-10"
              onClick={() => navigate('/contracts/add')}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加合同
            </Button>
          </div>
        </div>
      </div>

      {/* 合同类型选项卡 - 添加顶部间距 */}
      <div className="pt-20">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* 桌面端标签页 */}
        <TabsList className="hidden md:grid w-full grid-cols-6">
          <TabsTrigger value="all">全部 ({contracts.length})</TabsTrigger>
          <TabsTrigger value="property">房屋 ({contracts.filter(c => c.lease_type === 'property').length})</TabsTrigger>
          <TabsTrigger value="parking">车位 ({contracts.filter(c => c.lease_type === 'parking').length})</TabsTrigger>
          <TabsTrigger value="active">生效中 ({contracts.filter(c => c.status === '生效中').length})</TabsTrigger>
          <TabsTrigger value="expiring">即将到期 ({contracts.filter(c => c.status === '即将到期').length})</TabsTrigger>
          <TabsTrigger value="expired">已到期 ({contracts.filter(c => c.status === '已到期').length})</TabsTrigger>
        </TabsList>

        {/* 手机端标签页 - 分两行显示 */}
        <div className="md:hidden space-y-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">全部 ({contracts.length})</TabsTrigger>
            <TabsTrigger value="property" className="text-xs">房屋 ({contracts.filter(c => c.lease_type === 'property').length})</TabsTrigger>
            <TabsTrigger value="parking" className="text-xs">车位 ({contracts.filter(c => c.lease_type === 'parking').length})</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="text-xs">生效中 ({contracts.filter(c => c.status === '生效中').length})</TabsTrigger>
            <TabsTrigger value="expiring" className="text-xs">即将到期 ({contracts.filter(c => c.status === '即将到期').length})</TabsTrigger>
            <TabsTrigger value="expired" className="text-xs">已到期 ({contracts.filter(c => c.status === '已到期').length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {displayedContracts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {searchTerm ? '没有找到匹配的合同' : '暂无合同数据'}
              </p>
              {!searchTerm && (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/contracts/add')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个合同
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {displayedContracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/contracts/${contract.id}`)}>
                  <CardContent className="p-4">
                    {/* 桌面端布局 */}
                    <div className="hidden md:flex items-center">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-4 bg-gray-100 flex items-center justify-center">
                        {contract.lease_type === 'property' ? (
                          <Home className="h-6 w-6 text-blue-500" />
                        ) : (
                          <Car className="h-6 w-6 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{contract.tenant?.name || '未知租客'}</h3>
                            <Badge variant="outline" className={contract.lease_type === 'property' ? 'border-blue-500 text-blue-700' : 'border-purple-500 text-purple-700'}>
                              {contract.lease_type === 'property' ? '房屋' : '车位'}
                            </Badge>
                            <Badge className={getStatusColor(contract.status)}>
                              {contract.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-600">
                                ¥{contract.monthly_rent}/月
                              </div>
                              <div className="text-xs text-gray-500">
                                总额: ¥{contract.total_contract_amount || calculateContractTotal(contract)}
                              </div>
                            </div>
                            {/* 续租按钮 - 对生效中和即将到期的合同显示 */}
                            {(contract.status === '生效中' || contract.status === '即将到期') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // 阻止事件冒泡到卡片点击事件
                                  navigate(`/contracts/add?renewal=true&originalId=${contract.id}`);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                                title="续租"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/contracts/edit/${contract.id}`)}
                              title="编辑"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContract(contract.id)}
                              className="text-red-600 hover:text-red-700"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {/* 桌面端详细信息 */}
                        <div className="flex items-center text-gray-500 mt-1">
                          <User className="h-4 w-4 mr-1" />
                          <span className="text-sm">{contract.tenant?.phone || '无电话'}</span>
                        </div>
                        <div className="flex items-center text-gray-500 mt-1">
                          {contract.lease_type === 'property' ? (
                            <Home className="h-4 w-4 mr-1" />
                          ) : (
                            <Car className="h-4 w-4 mr-1" />
                          )}
                          <span className="text-sm">
                            {contract.lease_type === 'property'
                              ? (contract.property?.name || '未知房屋')
                              : (contract.parking_space?.name || '未知车位')
                            }
                            {contract.lease_type === 'parking' && contract.car_number && (
                              <span className="ml-2 text-blue-600">({contract.car_number})</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {new Date(contract.lease_start).toLocaleDateString()} 至 {new Date(contract.lease_end).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 手机端布局 */}
                    <div className="md:hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {contract.lease_type === 'property' ? (
                              <Home className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Car className="h-5 w-5 text-purple-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold">{contract.tenant?.name || '未知租客'}</h3>
                            <div className="flex items-center space-x-1 mt-1">
                              <Badge variant="outline" className={`text-xs ${contract.lease_type === 'property' ? 'border-blue-500 text-blue-700' : 'border-purple-500 text-purple-700'}`}>
                                {contract.lease_type === 'property' ? '房屋' : '车位'}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(contract.status)}`}>
                                {contract.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-medium text-green-600">
                            ¥{contract.monthly_rent}/月
                          </div>
                          <div className="text-sm text-gray-500">
                            总额: ¥{contract.total_contract_amount || calculateContractTotal(contract)}
                          </div>
                        </div>
                      </div>

                      {/* 手机端详细信息 */}
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center text-gray-500">
                          <User className="h-4 w-4 mr-2" />
                          <span className="text-sm">{contract.tenant?.phone || '无电话'}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          {contract.lease_type === 'property' ? (
                            <Home className="h-4 w-4 mr-2" />
                          ) : (
                            <Car className="h-4 w-4 mr-2" />
                          )}
                          <span className="text-sm">
                            {contract.lease_type === 'property'
                              ? (contract.property?.name || '未知房屋')
                              : (contract.parking_space?.name || '未知车位')
                            }
                            {contract.lease_type === 'parking' && contract.car_number && (
                              <span className="ml-2 text-blue-600">({contract.car_number})</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            {new Date(contract.lease_start).toLocaleDateString()} 至 {new Date(contract.lease_end).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* 手机端操作按钮 */}
                      <div className="flex justify-end space-x-1 mt-3 pt-3 border-t border-gray-100">
                        {(contract.status === '生效中' || contract.status === '即将到期') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // 阻止事件冒泡到卡片点击事件
                              navigate(`/contracts/add?renewal=true&originalId=${contract.id}`);
                            }}
                            className="text-blue-600 hover:text-blue-700 px-2"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            续租
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡到卡片点击事件
                            navigate(`/contracts/edit/${contract.id}`);
                          }}
                          className="px-2"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡到卡片点击事件
                            handleDeleteContract(contract.id);
                          }}
                          className="text-red-600 hover:text-red-700 px-2"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          删除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default ContractList;
