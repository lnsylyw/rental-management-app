import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Plus, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

const MaintenanceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 获取维修请求列表数据
  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        setIsLoading(true);
        const data = await ApiService.getMaintenanceRequests();
        setMaintenanceRequests(data);
        setError(null);
      } catch (err: any) {
        console.error('获取维修请求列表失败:', err);
        setError('获取维修请求列表失败，请稍后重试');
        toast({
          title: '数据加载失败',
          description: err.message || '无法加载维修请求数据，请检查网络连接',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaintenanceRequests();
  }, [toast]);

  // 根据搜索词过滤维修请求
  const filteredRequests = maintenanceRequests.filter(request => 
    request.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.property?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.tenant?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 根据标签过滤维修请求
  const getFilteredRequestsByTab = () => {
    if (activeTab === 'all') return filteredRequests;
    if (activeTab === 'pending') return filteredRequests.filter(request => request.status === '待处理');
    if (activeTab === 'inProgress') return filteredRequests.filter(request => request.status === '进行中');
    if (activeTab === 'completed') return filteredRequests.filter(request => request.status === '已完成');
    return filteredRequests;
  };

  // 获取优先级对应的颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '紧急':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case '普通':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case '低':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // 获取状态对应的图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '待处理':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case '进行中':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case '已完成':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const displayRequests = getFilteredRequestsByTab();

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
                placeholder="搜索维修请求..."
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
              className="bg-red-600 hover:bg-red-700 h-10"
              onClick={() => navigate('/maintenance/add')}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加请求
            </Button>
          </div>
        </div>
      </div>

      {/* 状态选项卡 - 添加顶部间距 */}
      <div className="pt-20">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="pending">待处理</TabsTrigger>
          <TabsTrigger value="inProgress">进行中</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
        </TabsList>
        
        {/* 维修请求列表内容 */}
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
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
          ) : displayRequests.length > 0 ? (
            displayRequests.map((request) => (
              <Card 
                key={request.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/maintenance/${request.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${
                      request.status === '待处理' ? 'bg-yellow-100' : 
                      request.status === '进行中' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{request.title}</h3>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mt-1">{request.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-gray-500">
                          <span className="text-sm">{request.property}</span>
                          {request.tenant && (
                            <span className="ml-2 text-sm">({request.tenant})</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="ml-2">
                            {request.status}
                          </Badge>
                          <span className="text-sm text-gray-500 ml-2">{request.reportDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">没有找到匹配的维修请求</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default MaintenanceList;