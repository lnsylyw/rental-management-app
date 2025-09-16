import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Phone,
  Mail,
  Calendar,
  Home,
  FileText,
  Edit,
  Trash2,
  User
} from 'lucide-react';
import ApiService from '@/services/api';

const TenantDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [tenantDetail, setTenantDetail] = useState<any>(null);
  const [tenantLeases, setTenantLeases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取租客详情数据
  useEffect(() => {
    const fetchTenantDetail = async () => {
      if (!id) {
        setError('租客ID不存在');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('获取租客详情，ID:', id);
        
        // 获取租客基本信息
        const tenantData = await ApiService.getTenant(parseInt(id));
        console.log('租客详情数据:', tenantData);
        console.log('租客备注信息:', tenantData?.notes);
        setTenantDetail(tenantData);
        
        // 获取租客的租赁合同
        const leasesData = await ApiService.getLeases({ tenant_id: parseInt(id) });
        console.log('租客租赁合同:', leasesData);
        setTenantLeases(leasesData || []);
        
        setError(null);
      } catch (error: any) {
        console.error('获取租客详情失败:', error);
        setError(error.response?.data?.detail || '获取租客详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantDetail();
  }, [id]);

  // 删除租客
  const handleDeleteTenant = async () => {
    if (!tenantDetail || !window.confirm('确定要删除这个租客吗？此操作不可撤销。')) {
      return;
    }

    try {
      await ApiService.deleteTenant(tenantDetail.id);
      toast({
        title: '删除成功',
        description: '租客已成功删除',
      });
      navigate('/tenant');
    } catch (error: any) {
      console.error('删除租客失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '删除租客失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 获取状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '生效中':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case '即将到期':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case '已到期':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => navigate('/tenant')}>返回租客列表</Button>
      </div>
    );
  }

  // 没有数据
  if (!tenantDetail) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">租客信息不存在</p>
        <Button onClick={() => navigate('/tenant')}>返回租客列表</Button>
      </div>
    );
  }

  // 获取主要租赁合同（最新的生效中合同）
  const primaryLease = tenantLeases.find(lease => lease.status === '生效中') || tenantLeases[0];

  return (
    <div className="space-y-6 pb-32">

      {/* 租客基本信息 */}
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center">
              {tenantDetail.name}
              {primaryLease && (
                <Badge className={`ml-2 ${getStatusColor(primaryLease.status)}`}>
                  {primaryLease.status}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center text-gray-500 mt-1">
              <Phone className="h-4 w-4 mr-1" />
              <span className="text-sm">{tenantDetail.phone || '未填写'}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 基本信息 */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 border-b pb-2">基本信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>邮箱: {tenantDetail.email || '未填写'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>身份证: {tenantDetail.id_card || '未填写'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>性别: {tenantDetail.gender || '未填写'}</span>
                </div>
              </div>
            </div>

            {/* 租赁信息 */}
            {primaryLease && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 border-b pb-2">当前租赁</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Home className="h-4 w-4 mr-2" />
                    <span>
                      {primaryLease.lease_type === 'property' ? '房屋' : '车位'}:
                      {primaryLease.property?.name || primaryLease.parking_space?.name || '未知'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>租期: {new Date(primaryLease.lease_start).toLocaleDateString()} 至 {new Date(primaryLease.lease_end).toLocaleDateString()}</span>
                  </div>
                  {primaryLease.lease_type === 'parking' && primaryLease.car_number && (
                    <div className="flex items-center text-gray-600">
                      <Home className="h-4 w-4 mr-2" />
                      <span>车牌: {primaryLease.car_number}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 租金信息 */}
            {primaryLease && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 border-b pb-2">租金信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="text-2xl font-bold text-blue-600">¥{primaryLease.monthly_rent}/月</div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">押金:</span>
                    <span className="font-medium">¥{primaryLease.deposit_paid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">付款方式:</span>
                    <span className="font-medium">{primaryLease.payment_method}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 备注信息 - 移动端友好 */}
          {tenantDetail.notes && tenantDetail.notes.trim() && (
            <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
              <div className="flex items-start">
                <FileText className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-amber-800 text-sm font-medium mb-1">备注</p>
                  <p className="text-amber-700 text-sm leading-relaxed break-words">{tenantDetail.notes}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 历史合同列表 - 移动端友好 */}
      {tenantLeases.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">历史合同 ({tenantLeases.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenantLeases.map((lease) => (
              <div
                key={lease.id}
                className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all active:bg-blue-100"
                onClick={() => navigate(`/contracts/${lease.id}`)}
              >
                {/* 标题行 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center min-w-0 flex-1">
                    <Home className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">
                      {lease.property?.name || lease.parking_space?.name || '未知'}
                    </span>
                  </div>
                  <Badge className={`${getStatusColor(lease.status)} ml-2 flex-shrink-0`}>
                    {lease.status}
                  </Badge>
                </div>

                {/* 租期行 */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {new Date(lease.lease_start).toLocaleDateString()} - {new Date(lease.lease_end).toLocaleDateString()}
                  </span>
                </div>

                {/* 租金信息行 */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <span className="text-blue-600 font-medium">¥{lease.monthly_rent}/月</span>
                    <span className="text-gray-500">押金¥{lease.deposit_paid}</span>
                  </div>
                  {lease.lease_type === 'parking' && lease.car_number && (
                    <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                      {lease.car_number}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* 固定底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg" style={{zIndex: 9999}}>
        <div className="p-4 max-w-md mx-auto">
          <div className="space-y-3">
            {/* 查看合同按钮 - 只在有合同时显示 */}
            {primaryLease && (
              <Button
                onClick={() => navigate(`/contracts/${primaryLease.id}`)}
                className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-5 w-5 mr-2" />
                查看合同
              </Button>
            )}

            {/* 主要操作按钮 */}
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={handleDeleteTenant}
                className="flex-1 h-12 text-base font-medium bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                删除租客
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/tenant/${tenantDetail.id}/edit`)}
                className="flex-1 h-12 text-base font-medium border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              >
                <Edit className="h-5 w-5 mr-2" />
                编辑租客
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDetail;
