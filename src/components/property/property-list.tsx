import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Search, MapPin, Plus, Filter, Loader2, Bed, Bath, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';
import { processImageUrl } from '@/config/api';

const PropertyList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 获取房屋列表数据
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await ApiService.getProperties();
        console.log('获取到的房屋数据:', data);
        setProperties(data);
        setError(null);
      } catch (err: any) {
        console.error('获取房屋列表失败:', err);
        setError('获取房屋列表失败，请稍后重试');
        toast({
          title: '数据加载失败',
          description: err.message || '无法加载房屋数据，请检查网络连接',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  // 根据搜索词过滤房屋
  const filteredProperties = properties.filter(property => 
    property.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    property.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 获取状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RENTED':
      case '已出租':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'AVAILABLE':
      case '可用':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'MAINTENANCE':
      case '维修中':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // 获取状态显示文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'RENTED':
        return '已出租';
      case 'AVAILABLE':
        return '可用';
      case 'MAINTENANCE':
        return '维修中';
      default:
        return status;
    }
  };



  // 获取房屋封面图片
  const getCoverImage = (property: any) => {
    if (property.images && property.images.length > 0) {
      // 优先选择封面图片
      const coverImage = property.images.find((img: any) => img.is_cover);
      if (coverImage) {
        return processImageUrl(coverImage.image_url);
      }
      // 如果没有封面图片，选择第一张图片
      return processImageUrl(property.images[0].image_url);
    }
    // 如果没有图片，使用占位图
    return '/placeholder.svg?height=200&width=300';
  };

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
                placeholder="搜索房屋..."
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
              className="bg-blue-600 hover:bg-blue-700 h-10"
              onClick={() => navigate('/property/add')}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加房屋
            </Button>
          </div>
        </div>
      </div>

      {/* 房屋列表内容 - 添加顶部间距 */}
      <div className="pt-20 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
          ) : filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <Card 
                key={property.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/property/${property.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/3 h-48 sm:h-auto relative">
                      <img
                        src={getCoverImage(property)}
                        alt={property.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`房屋 ${property.id} 图片加载失败:`, getCoverImage(property));
                          e.currentTarget.src = '/placeholder.svg?height=200&width=300';
                        }}
                      />
                      {/* 房屋类型标签 - 左上角 */}
                      <Badge className="absolute top-2 left-2 bg-gray-800 text-white hover:bg-gray-700 text-xs">
                        {property.property_type || '住宅'}
                      </Badge>
                    </div>
                    <div className="p-4 flex-1 relative">
                      <Badge className={`absolute top-4 right-4 ${getStatusColor(property.status)}`}>
                        {getStatusText(property.status)}
                      </Badge>
                      <h3 className="text-lg font-semibold mb-2 pr-20">{property.name}</h3>
                      <div className="flex items-center text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.address}</span>
                      </div>
                      
                      {/* 房屋基本信息 */}
                      <div className="flex items-center space-x-4 text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.rooms}室{property.living_rooms}厅</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.bathrooms}卫</span>
                        </div>
                        <div className="flex items-center">
                          <Maximize2 className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.area}平方米</span>
                        </div>
                      </div>
                      
                      {/* 租金信息 */}
                      <div className="mt-auto">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">¥{property.monthly_rent}/月</p>
                            <p className="text-sm text-gray-500">押金: ¥{property.deposit}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{property.city}, {property.province}</p>
                            <p>{property.payment_method}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">没有找到匹配的房屋</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default PropertyList;