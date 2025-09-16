import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  MapPin, 
  Edit, 
  Trash2, 
  Loader2, 
  Building,
  Calendar,
  DollarSign,
  Info
} from 'lucide-react';
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
  updated_at: string;
}

const ParkingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [parkingDetail, setParkingDetail] = useState<ParkingSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // 获取车位详情数据
  useEffect(() => {
    const fetchParkingDetail = async () => {
      if (!id) {
        setError('车位ID不存在');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('获取车位详情，ID:', id);
        const data = await ApiService.getParkingSpace(parseInt(id));
        console.log('车位详情数据:', data);
        setParkingDetail(data);
        setError(null);
      } catch (error: any) {
        console.error('获取车位详情失败:', error);
        setError(error.response?.data?.detail || '获取车位详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingDetail();
  }, [id]);

  // 删除车位
  const handleDelete = async () => {
    if (!parkingDetail || !window.confirm('确定要删除这个车位吗？此操作不可撤销。')) {
      return;
    }

    try {
      setDeleting(true);
      await ApiService.deleteParkingSpace(parkingDetail.id);
      toast({
        title: '删除成功',
        description: '车位已成功删除',
      });
      navigate('/parking');
    } catch (error: any) {
      console.error('删除车位失败:', error);
      toast({
        title: '删除失败',
        description: error.response?.data?.detail || '删除车位失败，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
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
        return <Building className="h-5 w-5 text-blue-600" />;
      case '机械车位':
        return <Car className="h-5 w-5 text-purple-600" />;
      default:
        return <Car className="h-5 w-5 text-green-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>加载车位详情中...</span>
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
              <Car className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">获取车位详情失败</h3>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/parking')}>
              返回车位列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!parkingDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="text-gray-500 mb-4">
              <Car className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">车位不存在</h3>
            </div>
            <Button onClick={() => navigate('/parking')}>
              返回车位列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4 sm:px-6">
      {/* 车位头部信息 */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* 车位名称和状态 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-shrink-0 mr-3">
                {getParkingTypeIcon(parkingDetail.parking_type)}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {parkingDetail.name}
              </h1>
                <div className="flex items-start text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base break-words">{parkingDetail.location}</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getStatusBadge(parkingDetail.status)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 车位详细信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Building className="h-5 w-5 mr-2 text-purple-600" />
            车位信息
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">编号</h4>
              <p className="text-sm sm:text-base font-semibold text-gray-900">{parkingDetail.space_number}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">类型</h4>
              <p className="text-sm sm:text-base font-semibold text-gray-900">{parkingDetail.parking_type}</p>
            </div>
            {parkingDetail.zone && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">区域</h4>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{parkingDetail.zone}</p>
              </div>
            )}
            {parkingDetail.floor && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">楼层</h4>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{parkingDetail.floor}F</p>
              </div>
            )}
          </div>
          
          {/* 车位描述 */}
          {parkingDetail.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-2">车位描述</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {parkingDetail.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 租金信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            租金信息
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* 月租金独占一行 */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
              <h4 className="text-xs font-medium text-gray-500 mb-1">月租金</h4>
              <p className="text-2xl font-bold text-purple-600">¥{parkingDetail.monthly_rent}</p>
            </div>
            
            {/* 付款方式和租期在同一行 */}
            <div className="flex space-x-4">
              <div className="bg-gray-50 p-4 rounded-lg flex-1">
                <h4 className="text-xs font-medium text-gray-500 mb-1">付款方式</h4>
                <p className="text-sm font-medium text-gray-900">{parkingDetail.payment_method}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex-1">
                <h4 className="text-xs font-medium text-gray-500 mb-1">最短租期</h4>
                <p className="text-sm font-medium text-gray-900">{parkingDetail.min_lease_months}个月</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* 时间信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2 text-gray-600" />
            时间信息
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">创建时间</h4>
              <p className="text-sm sm:text-base text-gray-900">
                {new Date(parkingDetail.created_at).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">最后更新</h4>
              <p className="text-sm sm:text-base text-gray-900">
                {new Date(parkingDetail.updated_at).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 固定底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg" style={{zIndex: 9999}}>
        <div className="flex space-x-3 max-w-md mx-auto">
          <Button
            variant="destructive"
            onClick={handleDelete}
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
                删除车位
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/parking/${parkingDetail.id}/edit`)}
            className="flex-1 h-12 text-base font-medium border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
          >
            <Edit className="h-5 w-5 mr-2" />
            编辑车位
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParkingDetail;
