import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Plus, Filter, Loader2, Car, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

interface ParkingSpace {
  id: number;
  name: string;
  space_number: string;
  location: string;
  parking_type: string;
  floor?: number;
  zone?: string;
  monthly_rent: number;
  payment_method: string;
  min_lease_months: number;
  status: string;
  description?: string;
  created_at: string;
}

const ParkingList = () => {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // 获取车位列表数据
  useEffect(() => {
    const fetchParkingSpaces = async () => {
      try {
        setIsLoading(true);
        const data = await ApiService.getParkingSpaces();
        console.log('获取到的车位数据:', data);
        setParkingSpaces(data);
        setError(null);
      } catch (err: any) {
        console.error('获取车位列表失败:', err);
        setError('获取车位列表失败，请稍后重试');
        toast({
          title: '数据加载失败',
          description: err.message || '无法加载车位数据，请检查网络连接',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchParkingSpaces();
  }, [toast]);

  // 根据搜索词过滤车位
  const filteredParkingSpaces = parkingSpaces.filter(parking => 
    parking.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    parking.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parking.zone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 根据状态过滤车位
  const getFilteredParkingByStatus = (status: string) => {
    if (status === 'all') return filteredParkingSpaces;
    return filteredParkingSpaces.filter(parking => parking.status === status);
  };

  // 获取状态徽章样式
  const getStatusBadge = (status: string) => {
    switch (status) {
      case '可用':
        return <Badge className="bg-green-100 text-green-800">可用</Badge>;
      case '已出租':
        return <Badge className="bg-blue-100 text-blue-800">已出租</Badge>;
      case '维修中':
        return <Badge className="bg-yellow-100 text-yellow-800">维修中</Badge>;
      case '不可用':
        return <Badge className="bg-red-100 text-red-800">不可用</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // 获取车位类型图标
  const getParkingTypeIcon = (type: string) => {
    switch (type) {
      case '地下车位':
        return <Building className="h-4 w-4 text-blue-600" />;
      case '机械车位':
        return <Car className="h-4 w-4 text-purple-600" />;
      default:
        return <Car className="h-4 w-4 text-green-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索和筛选区 */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="搜索车位..."
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
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => navigate('/parking/add')}
        >
          <Plus className="h-4 w-4 mr-2" />
          添加车位
        </Button>
      </div>

      {/* 标签页 */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">全部 ({filteredParkingSpaces.length})</TabsTrigger>
          <TabsTrigger value="可用">可用 ({getFilteredParkingByStatus('可用').length})</TabsTrigger>
          <TabsTrigger value="已出租">已出租 ({getFilteredParkingByStatus('已出租').length})</TabsTrigger>
          <TabsTrigger value="维修中">维修中 ({getFilteredParkingByStatus('维修中').length})</TabsTrigger>
        </TabsList>
        
        {/* 车位列表内容 */}
        {['all', '可用', '已出租', '维修中'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
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
            ) : getFilteredParkingByStatus(status).length > 0 ? (
              getFilteredParkingByStatus(status).map((parking) => (
                <Card
                  key={parking.id}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow mb-4"
                  onClick={() => navigate(`/parking/${parking.id}`)}
                >
                  <CardContent className="p-4">
                    {/* 头部：车位名称和状态 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0 mr-3">
                          {getParkingTypeIcon(parking.parking_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {parking.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {getStatusBadge(parking.status)}
                      </div>
                    </div>

                    {/* 位置信息 */}
                    <div className="flex items-start text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="break-words">{parking.location}</span>
                    </div>

                    {/* 车位详情 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 text-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="text-gray-500 text-xs sm:text-sm sm:mr-2">编号</span>
                        <span className="text-gray-700 font-medium">{parking.space_number}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="text-gray-500 text-xs sm:text-sm sm:mr-2">类型</span>
                        <span className="text-gray-700 font-medium">{parking.parking_type}</span>
                      </div>
                      {parking.zone && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-gray-500 text-xs sm:text-sm sm:mr-2">区域</span>
                          <span className="text-gray-700 font-medium">{parking.zone}</span>
                        </div>
                      )}
                      {parking.floor && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-gray-500 text-xs sm:text-sm sm:mr-2">楼层</span>
                          <span className="text-gray-700 font-medium">{parking.floor}F</span>
                        </div>
                      )}
                    </div>

                    {/* 描述信息（如果有） */}
                    {parking.description && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {parking.description}
                        </p>
                      </div>
                    )}

                    {/* 价格信息 */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-2 sm:mb-0">
                          <div className="text-xl sm:text-2xl font-bold text-purple-600">
                            ¥{parking.monthly_rent}
                            <span className="text-sm font-normal text-gray-500 ml-1">/月</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 sm:text-right">
                          <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {parking.payment_method}：最短{parking.min_lease_months}个月
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">
                  {status === 'all' ? '暂无车位' : `暂无${status}车位`}
                </h3>
                <p className="text-gray-400 mt-2">
                  {status === 'all' ? '点击上方按钮添加第一个车位' : ''}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ParkingList;
