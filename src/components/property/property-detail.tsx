import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from '@/services/api';
import { processImageUrl, API_BASE_URL } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Home, 
  Users, 
  Wallet, 
  Wrench, 
  Edit,
  Trash2,
  Bed,
  Bath,
  Maximize2,
  Wifi,
  Car,
  Thermometer,
  Building,
  Compass,
  Palette,
  Loader2,
  Plus
} from 'lucide-react';
import Compressor from 'compressorjs';

interface PropertyDetail {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  area: number;
  rooms: number;
  living_rooms: number;
  bathrooms: number;
  floor?: number;
  total_floors?: number;
  orientation?: string;
  decoration_status?: string;
  has_elevator: boolean;
  has_parking: boolean;
  monthly_rent: number;
  deposit: number;
  payment_method: string;
  min_lease_months: number;
  status: string;
  property_type?: string;  // 添加房屋类型字段
  description?: string;
  images?: Array<{
    id: number;
    image_url: string;
    image_type: string;
    description?: string;
    sort_order: number;
    is_cover: boolean;
  }>;
  features?: Array<{
    id: number;
    feature_name: string;
    feature_value?: string;
  }>;
  facilities?: Array<{
    id: number;
    facility_name: string;
    facility_category: string;
    is_available: boolean;
    description?: string;
  }>;
}

const PropertyDetail = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0); // 缩略图起始索引
  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false); // 删除状态
  const [uploading, setUploading] = useState(false); // 上传状态
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 缩略图翻页功能
  const THUMBNAILS_PER_PAGE = 3; // 每页显示3张缩略图
  
  const handleThumbnailPrev = () => {
    console.log('触发上一页，当前索引:', thumbnailStartIndex);
    setThumbnailStartIndex(prev => {
      // 如果当前在最后一页，需要特殊处理
      const lastPageStart = Math.max(0, images.length - THUMBNAILS_PER_PAGE);
      if (prev >= lastPageStart && images.length > THUMBNAILS_PER_PAGE) {
        // 从最后一页回退到倒数第二页
        const prevPageStart = Math.max(0, lastPageStart - THUMBNAILS_PER_PAGE);
        console.log('从最后一页回退到:', prevPageStart);
        return prevPageStart;
      } else {
        // 正常回退
        const newIndex = Math.max(0, prev - THUMBNAILS_PER_PAGE);
        console.log('正常回退到:', newIndex);
        return newIndex;
      }
    });
  };

  const handleThumbnailNext = (totalImages: number) => {
    console.log('触发下一页，当前索引:', thumbnailStartIndex, '总图片数:', totalImages);
    setThumbnailStartIndex(prev => {
      const nextIndex = prev + THUMBNAILS_PER_PAGE;
      const lastPageStart = Math.max(0, totalImages - THUMBNAILS_PER_PAGE);
      console.log('计算结果 - nextIndex:', nextIndex, 'lastPageStart:', lastPageStart);
      
      if (nextIndex >= lastPageStart) {
        console.log('跳到最后一页:', lastPageStart);
        return lastPageStart;
      }
      console.log('正常翻页:', nextIndex);
      return nextIndex;
    });
  };

  // 页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 获取房屋详情数据
  useEffect(() => {
    const fetchPropertyDetail = async () => {
      if (!id) {
        setError('房屋ID不存在');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('获取房屋详情，ID:', id);
        const data = await ApiService.getProperty(parseInt(id));
        console.log('房屋详情数据:', data);
        setPropertyDetail(data);
        setError(null);
      } catch (error: any) {
        console.error('获取房屋详情失败:', error);
        setError(error.response?.data?.detail || '获取房屋详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [id]);

  // 获取状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '已出租':
      case 'RENTED':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case '可用':
      case 'AVAILABLE':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case '维修中':
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // 获取朝向显示文本
  const getOrientationText = (orientation?: string) => {
    if (!orientation) return '未知';
    const orientationMap: { [key: string]: string } = {
      'PropertyOrientation.SOUTH': '南向',
      'PropertyOrientation.NORTH': '北向',
      'PropertyOrientation.EAST': '东向',
      'PropertyOrientation.WEST': '西向',
      'PropertyOrientation.SOUTH_NORTH': '南北通透',
      'PropertyOrientation.EAST_WEST': '东西通透',
    };
    return orientationMap[orientation] || orientation;
  };

  // 获取装修状态显示文本
  const getDecorationText = (decoration?: string) => {
    if (!decoration) return '未知';
    const decorationMap: { [key: string]: string } = {
      'DecorationStatus.ROUGH': '毛坯',
      'DecorationStatus.SIMPLE': '简装',
      'DecorationStatus.FINE': '精装',
      'DecorationStatus.LUXURY': '豪装',
    };
    return decorationMap[decoration] || decoration;
  };

  // 获取设施图标
  const getFacilityIcon = (facilityName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '宽带': <Wifi className="h-3 w-3 mr-1" />,
      '空调': <Thermometer className="h-3 w-3 mr-1" />,
      '车位': <Car className="h-3 w-3 mr-1" />,
    };
    return iconMap[facilityName] || null;
  };

  // 删除房屋
  const handleDeleteProperty = async () => {
    if (!propertyDetail || !id) return;
    
    // 确认删除
    if (!window.confirm(`确定要删除房屋"${propertyDetail.name}"吗？此操作不可撤销。`)) {
      return;
    }
    
    try {
      setDeleting(true);
      console.log('删除房屋，ID:', id);
      
      await ApiService.deleteProperty(parseInt(id));
      
      console.log('房屋删除成功');
      // 删除成功后跳转到房屋列表
      navigate('/property', { 
        replace: true,
        state: { message: `房屋"${propertyDetail.name}"已成功删除` }
      });
      
    } catch (error: any) {
      console.error('删除房屋失败:', error);
      alert(`删除房屋失败: ${error.response?.data?.detail || error.message || '未知错误'}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>加载房屋详情中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Home className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">获取房屋详情失败</h3>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/property')}>
              返回房屋列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!propertyDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="text-gray-500 mb-4">
              <Home className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">房屋不存在</h3>
            </div>
            <Button onClick={() => navigate('/property')}>
              返回房屋列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 获取房屋照片列表（排除房证照片），如果没有图片则使用默认图片
  const houseImages = propertyDetail.images && propertyDetail.images.length > 0
    ? propertyDetail.images
        .filter(img => img.image_type !== 'certificate') // 排除房证照片
        .sort((a, b) => a.sort_order - b.sort_order)
    : [];

  // 如果没有房屋照片，使用默认图片
  const images = houseImages.length > 0 ? houseImages : [{
    id: 0,
    image_url: '/placeholder.svg?height=400&width=600',
    image_type: 'interior',
    description: '暂无图片',
    sort_order: 1,
    is_cover: true
  }];

  // 调试信息
  console.log('🖼️ 图片数据调试:', {
    totalImages: propertyDetail.images?.length || 0,
    houseImages: houseImages.length,
    finalImages: images.length,
    imageUrls: images.map(img => img.image_url)
  });

  return (
    <div className="space-y-6">

      {/* 房屋图片展示 */}
      <div className="space-y-2">
        <div className="relative h-80 rounded-lg overflow-hidden">
          <img
            src={processImageUrl(images[activeImage]?.image_url || '')}
            alt={images[activeImage]?.description || propertyDetail.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error(`房屋 ${propertyDetail.id} 主图片加载失败:`, images[activeImage]?.image_url);
              e.currentTarget.src = '/placeholder.svg?height=400&width=600';
            }}
          />
          {/* 房屋类型标签 - 左上角 */}
          <Badge className="absolute top-4 left-4 bg-gray-800 text-white hover:bg-gray-700">
            {propertyDetail.property_type || '住宅'}
          </Badge>
          {/* 出租状态标签 - 右上角 */}
          <Badge className={`absolute top-4 right-4 ${getStatusColor(propertyDetail.status)}`}>
            {propertyDetail.status === 'RENTED' ? '已出租' : 
             propertyDetail.status === 'AVAILABLE' ? '可用' : 
             propertyDetail.status === 'MAINTENANCE' ? '维修中' : propertyDetail.status}
          </Badge>
        </div>
        {images.length > 1 && (
          <div className="relative">
            {/* 缩略图容器 - 只在这个区域内滑动 */}
            <div 
              className="grid grid-cols-3 gap-2 mb-4 select-none"
              style={{ touchAction: 'none' }} // 禁用所有默认触摸行为
              onTouchStart={(e) => {
                console.log('🔥 TouchStart 触发, 图片数量:', images.length);
                const touch = e.touches[0];
                const element = e.currentTarget;
                element.dataset.startX = touch.clientX.toString();
                element.dataset.startY = touch.clientY.toString();
                element.dataset.startTime = Date.now().toString();
                element.dataset.isDragging = 'false'; // 初始化拖拽状态
                console.log('TouchStart 坐标:', touch.clientX, touch.clientY);
              }}
              onTouchEnd={(e) => {
                console.log('🔥 TouchEnd 触发');
                try {
                  const element = e.currentTarget;
                  const startX = parseFloat(element.dataset.startX || '0');
                  const startY = parseFloat(element.dataset.startY || '0');
                  const startTime = parseInt(element.dataset.startTime || '0');
                  
                  if (e.changedTouches && e.changedTouches.length > 0) {
                    const endX = e.changedTouches[0].clientX;
                    const endY = e.changedTouches[0].clientY;
                    const endTime = Date.now();
                    
                    const deltaX = endX - startX;
                    const deltaY = Math.abs(endY - startY);
                    const deltaTime = endTime - startTime;
                    
                    console.log('TouchEnd 数据:', {
                      startX, startY, endX, endY, deltaX, deltaY, deltaTime,
                      absDelataX: Math.abs(deltaX),
                      threshold: Math.abs(deltaX) > 50,
                      horizontal: Math.abs(deltaX) > deltaY,
                      timeOk: deltaTime < 1000
                    });
                    
                    // 检查是否为有效滑动：水平距离 > 垂直距离，距离 > 50px，时间 < 1秒
                    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 50 && deltaTime < 1000) {
                      console.log('🎯 触发滑动翻页');
                      element.dataset.isDragging = 'true'; // 标记为拖拽操作
                      if (deltaX < 0) {
                        console.log('👈 向左滑动，显示下一页');
                        handleThumbnailNext(images.length);
                      } else {
                        console.log('👉 向右滑动，显示上一页');
                        handleThumbnailPrev();
                      }
                      // 延迟重置拖拽状态，避免立即触发点击
                      setTimeout(() => {
                        element.dataset.isDragging = 'false';
                      }, 100);
                    } else {
                      console.log('❌ 滑动条件不满足');
                      element.dataset.isDragging = 'false';
                    }
                  } else {
                    console.log('❌ 没有 changedTouches 数据');
                  }
                } catch (error) {
                  console.error('TouchEnd 处理错误:', error);
                }
              }}
              onMouseDown={(e) => {
                console.log('🖱️ MouseDown 触发');
                const element = e.currentTarget;
                element.dataset.startX = e.clientX.toString();
                element.dataset.isDragging = 'false'; // 初始化为false
                element.dataset.startTime = Date.now().toString();
                console.log('MouseDown 坐标:', e.clientX);
              }}
              onMouseMove={(e) => {
                if (e.currentTarget.dataset.isDragging === 'true') {
                  e.preventDefault(); // 防止选中文本
                }
              }}
              onMouseUp={(e) => {
                console.log('🖱️ MouseUp 触发');
                const element = e.currentTarget;
                if (element.dataset.isDragging === 'true') {
                  const startX = parseFloat(element.dataset.startX || '0');
                  const startTime = parseInt(element.dataset.startTime || '0');
                  const endX = e.clientX;
                  const endTime = Date.now();
                  const diff = startX - endX;
                  const deltaTime = endTime - startTime;
                  
                  console.log('MouseUp 数据:', {
                    startX, endX, diff, absDiff: Math.abs(diff),
                    deltaTime, threshold: Math.abs(diff) > 50,
                    timeOk: deltaTime < 1000
                  });
                  
                  if (Math.abs(diff) > 50 && deltaTime < 1000) {
                    console.log('🎯 触发鼠标拖拽翻页');
                    element.dataset.isDragging = 'true'; // 标记为拖拽操作
                    if (diff > 0) {
                      console.log('👈 向左拖拽，显示下一页');
                      handleThumbnailNext(images.length);
                    } else {
                      console.log('👉 向右拖拽，显示上一页');
                      handleThumbnailPrev();
                    }
                    // 延迟重置拖拽状态
                    setTimeout(() => {
                      element.dataset.isDragging = 'false';
                    }, 100);
                  } else {
                    console.log('❌ 拖拽条件不满足');
                    element.dataset.isDragging = 'false';
                  }
                } else {
                  element.dataset.isDragging = 'false';
                }
              }}
              onMouseLeave={(e) => {
                console.log('🖱️ MouseLeave 触发');
                e.currentTarget.dataset.isDragging = 'false';
              }}
            >
              {images
                .slice(thumbnailStartIndex, thumbnailStartIndex + THUMBNAILS_PER_PAGE)
                .map((image, relativeIndex) => {
                  const actualIndex = thumbnailStartIndex + relativeIndex;
                  return (
                    <div 
                      key={image.id}
                      className={`h-20 rounded-md overflow-hidden cursor-pointer border-2 ${activeImage === actualIndex ? 'border-blue-600' : 'border-transparent'}`}
                      onClick={(e) => {
                        // 检查是否刚刚进行了拖拽操作
                        const container = e.currentTarget.parentElement;
                        const isDragging = container?.dataset.isDragging === 'true';

                        if (!isDragging) {
                          e.stopPropagation();
                          setActiveImage(actualIndex);
                        }
                      }}
                    >
                      <img
                        src={processImageUrl(image.image_url)}
                        alt={image.description || `图片 ${actualIndex + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                        onError={() => {
                          console.error(`缩略图加载失败: ${image.image_url}`);
                          console.error('处理后的URL:', processImageUrl(image.image_url));
                        }}
                      />
                    </div>
                  );
                })}
              {/* 填充空白位置，确保布局稳定 */}
              {Array.from({ length: THUMBNAILS_PER_PAGE - Math.min(THUMBNAILS_PER_PAGE, images.length - thumbnailStartIndex) }).map((_, index) => (
                <div key={`placeholder-${index}`} className="h-20 rounded-md bg-gray-100"></div>
              ))}
            </div>
            
            {/* 滑动指示器 */}
            {images.length > THUMBNAILS_PER_PAGE && (
              <div className="flex justify-center mt-2 space-x-1">
                {Array.from({ length: Math.ceil(images.length / THUMBNAILS_PER_PAGE) }).map((_, pageIndex) => {
                  // 修复蓝点定位逻辑
                  const totalPages = Math.ceil(images.length / THUMBNAILS_PER_PAGE);
                  const lastPageStartIndex = Math.max(0, images.length - THUMBNAILS_PER_PAGE);
                  
                  let currentPageIndex;
                  if (thumbnailStartIndex >= lastPageStartIndex) {
                    // 当前在最后一页
                    currentPageIndex = totalPages - 1;
                  } else {
                    // 当前在其他页 - 修复计算逻辑
                    // 对于每页3张图片：索引0-2是第0页，索引3-5是第1页，但索引2应该是第1页
                    if (thumbnailStartIndex === 0) {
                      currentPageIndex = 0; // 第一页
                    } else if (thumbnailStartIndex < lastPageStartIndex) {
                      // 中间页：索引3对应第1页，索引2也应该对应第1页
                      currentPageIndex = Math.ceil(thumbnailStartIndex / THUMBNAILS_PER_PAGE);
                    } else {
                      currentPageIndex = Math.floor(thumbnailStartIndex / THUMBNAILS_PER_PAGE);
                    }
                  }
                  
                  // 添加调试日志
                  if (pageIndex === 0) {
                    console.log('🔵 蓝点计算调试:', {
                      thumbnailStartIndex,
                      totalPages,
                      lastPageStartIndex,
                      currentPageIndex,
                      imagesLength: images.length,
                      THUMBNAILS_PER_PAGE
                    });
                  }
                  
                  const isActive = currentPageIndex === pageIndex;
                  
                  return (
                    <div
                      key={pageIndex}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                        isActive ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      onClick={() => {
                        if (pageIndex === totalPages - 1) {
                          // 最后一页：显示最后几张图片
                          setThumbnailStartIndex(lastPageStartIndex);
                        } else {
                          // 其他页：正常计算
                          setThumbnailStartIndex(pageIndex * THUMBNAILS_PER_PAGE);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 房屋基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{propertyDetail.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{propertyDetail.address}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-2 text-blue-600" />
                <span>{propertyDetail.rooms}室{propertyDetail.living_rooms}厅</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-2 text-blue-600" />
                <span>{propertyDetail.bathrooms}卫</span>
              </div>
              <div className="flex items-center">
                <Maximize2 className="h-4 w-4 mr-2 text-blue-600" />
                <span>{propertyDetail.area}平方米</span>
              </div>
              {propertyDetail.floor && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-blue-600" />
                  <span>{propertyDetail.floor}/{propertyDetail.total_floors}层</span>
                </div>
              )}
            </div>

            {/* 房屋属性 */}
            <div className="space-y-3 pt-2">
              {/* 朝向和装修状态 */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {propertyDetail.orientation && (
                  <div className="flex items-center">
                    <Compass className="h-4 w-4 mr-2 text-green-600" />
                    <span>{getOrientationText(propertyDetail.orientation)}</span>
                  </div>
                )}
                {propertyDetail.decoration_status && (
                  <div className="flex items-center">
                    <Palette className="h-4 w-4 mr-2 text-purple-600" />
                    <span>{getDecorationText(propertyDetail.decoration_status)}</span>
                  </div>
                )}
              </div>
              
              {/* 电梯和车位分列显示 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-orange-600" />
                  <span>{propertyDetail.has_elevator ? '有电梯' : '无电梯'}</span>
                </div>
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-2 text-indigo-600" />
                  <span>{propertyDetail.has_parking ? '有停车位' : '无停车位'}</span>
                </div>
              </div>
            </div>
            
            {propertyDetail.description && (
              <div className="pt-2">
                <h4 className="font-medium mb-2">房屋描述</h4>
                <p className="text-gray-600">{propertyDetail.description}</p>
              </div>
            )}
            
            {/* 房屋特色 */}
            {propertyDetail.features && propertyDetail.features.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">房屋特色</h4>
                <div className="flex flex-wrap gap-2">
                  {propertyDetail.features.map((feature) => (
                    <Badge key={feature.id} variant="outline">
                      {feature.feature_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 配套设施 */}
            {propertyDetail.facilities && propertyDetail.facilities.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">配套设施</h4>
                <div className="flex flex-wrap gap-2">
                  {propertyDetail.facilities
                    .filter(facility => facility.is_available)
                    .filter(facility => facility.facility_name !== '电梯' && facility.facility_name !== '车位')
                    .map((facility) => (
                    <Badge key={facility.id} variant="outline" className="flex items-center">
                      {getFacilityIcon(facility.facility_name)}
                      {facility.facility_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>租金信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold text-blue-600">¥{propertyDetail.monthly_rent}/月</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">押金</span>
                <span>¥{propertyDetail.deposit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">付款方式</span>
                <span>{propertyDetail.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">最短租期</span>
                <span>{propertyDetail.min_lease_months}个月</span>
              </div>
            </div>
            
            {propertyDetail.status === 'RENTED' ? (
              <div className="pt-2 border-t">
                <h4 className="font-medium mb-2">当前租客</h4>
                <div className="text-center text-gray-500 py-4">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>租客信息需要从租客管理模块获取</p>
                </div>
              </div>
            ) : (
              <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
                添加租客
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 租金记录、维修记录和房证照片 */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments">租金记录</TabsTrigger>
          <TabsTrigger value="maintenance">维修记录</TabsTrigger>
          <TabsTrigger value="certificates">房证照片</TabsTrigger>
        </TabsList>
        
        {/* 租金记录内容 */}
        <TabsContent value="payments" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4" />
              <p>暂无租金记录</p>
              <p className="text-sm">租金记录需要从财务管理模块获取</p>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>
              <Wallet className="h-4 w-4 mr-2" />
              添加租金记录
            </Button>
          </div>
        </TabsContent>
        
        {/* 维修记录内容 */}
        <TabsContent value="maintenance" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <Wrench className="h-12 w-12 mx-auto mb-4" />
              <p>暂无维修记录</p>
              <p className="text-sm">维修记录需要从维修管理模块获取</p>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>
              <Wrench className="h-4 w-4 mr-2" />
              添加维修记录
            </Button>
          </div>
        </TabsContent>

        {/* 房证照片内容 */}
        <TabsContent value="certificates" className="space-y-4 mt-4">
          {(() => {
            // 筛选出房证照片（image_type为certificate的图片）
            const certificateImages = propertyDetail.images?.filter(img => img.image_type === 'certificate') || [];
            
            return certificateImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificateImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-[4/3] relative">
                      <img 
                        src={processImageUrl(image.image_url)} 
                        alt={image.description || '房证照片'} 
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          // 可以添加大图预览功能
                          window.open(processImageUrl(image.image_url), '_blank');
                        }}
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-600 truncate">
                        {image.description || '房证照片'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Home className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无房证照片</p>
                  <p className="text-sm">请上传房产证、土地证等相关证件照片</p>
                  <p className="text-xs mt-2 text-gray-400">点击下方按钮上传照片，支持拍照或从相册选择</p>
                </CardContent>
              </Card>
            );
          })()}
          <div className="flex justify-end">
            <div className="relative">
              <input
                type="file"
                id="certificate-upload-detail"
                className="hidden"
                accept="image/*,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;

                  const fileArray = Array.from(files);
                  
                  // 验证文件
                  const maxSize = 10 * 1024 * 1024; // 10MB
                  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                  
                  for (const file of fileArray) {
                    if (file.size > maxSize) {
                      alert(`文件 ${file.name} 超过5MB限制`);
                      return;
                    }
                    
                    if (!allowedTypes.includes(file.type)) {
                      alert(`文件 ${file.name} 格式不支持，请选择JPG、PNG、GIF或WebP格式`);
                      return;
                    }
                  }

                  // 压缩图片
                  const compressedFiles: File[] = [];
                  for (const file of fileArray) {
                    try {
                      const compressedFile = await new Promise<File>((resolve, reject) => {
                        new Compressor(file, {
                          quality: 0.8,
                          maxWidth: 1920,
                          maxHeight: 1080,
                          success(result) {
                            resolve(new File([result], file.name, { type: file.type }));
                          },
                          error(err) {
                            console.error('图片压缩失败:', err);
                            reject(err);
                          }
                        });
                      });
                      compressedFiles.push(compressedFile);
                    } catch (error) {
                      console.error('压缩图片时出错:', error);
                      // 如果压缩失败，使用原始文件
                      compressedFiles.push(file);
                    }
                  }

                  try {
                    // 设置上传状态
                    setUploading(true);
                    
                    // 上传房证照片
                    const formData = new FormData();
                    compressedFiles.forEach(file => {
                      formData.append('files', file);
                    });

                    const token = localStorage.getItem('token');
                    const headers: Record<string, string> = {};
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    const response = await fetch(`${API_BASE_URL}/upload/property-images/${propertyDetail.id}?image_type=certificate`, {
                      method: 'POST',
                      headers,
                      body: formData,
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.detail || '上传失败');
                    }

                    const uploadResult = await response.json();
                    
                    // 将上传的图片关联到当前房屋
                    if (uploadResult.files && uploadResult.files.length > 0 && propertyDetail?.id) {
                      try {
                        // 获取当前房屋的所有图片
                        const currentImagesResponse = await fetch(`${API_BASE_URL}/properties/${propertyDetail.id}`, {
                          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });
                        
                        let existingImages = [];
                        if (currentImagesResponse.ok) {
                          const currentProperty = await currentImagesResponse.json();
                          existingImages = currentProperty.images || [];
                        }
                        
                        // 添加新上传的房证照片到现有图片列表
                        const newImages = uploadResult.files.map((file: any) => ({
                          image_url: file.url,
                          image_type: 'certificate',
                          description: file.description || '房证照片',
                          sort_order: 999,
                          is_cover: false
                        }));
                        
                        // 合并现有图片和新图片
                        const allImages = [...existingImages, ...newImages];
                        
                        // 更新房屋图片
                        const updateResponse = await fetch(`${API_BASE_URL}/properties/${propertyDetail.id}/images`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                          },
                          body: JSON.stringify({
                            images: allImages
                          })
                        });
                        
                        if (!updateResponse.ok) {
                          throw new Error('更新房屋图片失败');
                        }
                      } catch (error) {
                        console.error('关联图片到房屋失败:', error);
                        throw error;
                      }
                    }
                    
                    // 上传成功后刷新页面数据
                    alert(`成功上传 ${compressedFiles.length} 张房证照片`);
                    window.location.reload(); // 刷新页面显示新上传的房证照片
                    
                  } catch (error: any) {
                    console.error('房证照片上传失败:', error);
                    alert(`上传失败: ${error.message || '未知错误'}`);
                  } finally {
                    // 重置上传状态
                    setUploading(false);
                  }

                  // 清空文件输入
                  e.target.value = '';
                }}
              />
              <Button asChild disabled={uploading}>
                <label htmlFor="certificate-upload-detail" className="cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      上传房证照片
                    </>
                  )}
                </label>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 固定底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg" style={{zIndex: 9999}}>
        <div className="flex space-x-3 max-w-md mx-auto">
          <Button
            variant="destructive"
            onClick={handleDeleteProperty}
            disabled={deleting}
            className="flex-1 h-12 text-base font-medium bg-red-500 hover:bg-red-600"
          >
            {deleting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                删除中...
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5 mr-2" />
                删除房屋
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/property/${propertyDetail.id}/edit`)}
            className="flex-1 h-12 text-base font-medium border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
          >
            <Edit className="h-5 w-5 mr-2" />
            编辑房屋
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;