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
  Car,
  FileText,
  Edit,
  Trash2,
  User,
  MapPin,
  CreditCard,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import ApiService from '@/services/api';
import { getStatusColor } from '@/constants/contract';
import { API_BASE_URL } from '@/config/api';
import FilePreviewDetail from '@/components/ui/file-preview-detail';
import PaymentSchedule from './payment-schedule';

const ContractDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [contractDetail, setContractDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rentStatus, setRentStatus] = useState<any>(null);

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

  // 获取合同详情数据
  useEffect(() => {
    const fetchContractDetail = async () => {
      if (!id) {
        setError('合同ID不存在');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const contractData = await ApiService.getLease(parseInt(id));
        setContractDetail(contractData);

        // 获取该合同的交易记录，计算已收租金
        try {
          const transactions = await ApiService.getTransactions();

          // 筛选出该合同的租金收入记录
          const contractRentTransactions = transactions.filter((transaction: any) =>
            transaction.lease_id === contractData.id &&
            transaction.transaction_type === '收入' &&
            transaction.category === '租金'
          );

          // 计算已收租金总额
          const receivedRent = contractRentTransactions.reduce((total: number, transaction: any) =>
            total + (transaction.amount || 0), 0
          );

          const totalRent = contractData.total_contract_amount || calculateContractTotal(contractData);
          const unpaidRent = Math.max(0, totalRent - receivedRent);
          const isFullyPaid = unpaidRent === 0 && totalRent > 0;
          const paymentRate = totalRent > 0 ? (receivedRent / totalRent) * 100 : 0;

          const rentStatusData = {
            totalRent,
            receivedRent,
            unpaidRent,
            isFullyPaid,
            paymentRate
          };

          setRentStatus(rentStatusData);
        } catch (transactionError) {
          console.error('获取交易记录失败:', transactionError);
          // 如果获取交易记录失败，使用默认状态
          const totalRent = contractData.total_contract_amount || calculateContractTotal(contractData);
          setRentStatus({
            totalRent,
            receivedRent: 0,
            unpaidRent: totalRent,
            isFullyPaid: false,
            paymentRate: 0
          });
        }

        setError(null);
      } catch (error: any) {
        console.error('获取合同详情失败:', error);
        setError(error.response?.data?.detail || '获取合同详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractDetail();
  }, [id]);

  // 删除合同
  const handleDeleteContract = async () => {
    if (!contractDetail || !window.confirm('确定要删除这个合同吗？此操作不可撤销。')) {
      return;
    }

    try {
      await ApiService.deleteLease(contractDetail.id);
      toast({
        title: '删除成功',
        description: '合同已成功删除',
      });
      navigate('/contracts');
    } catch (error: any) {
      console.error('删除合同失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '删除合同失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 使用统一的状态颜色函数

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
        <Button onClick={() => navigate('/contracts')}>返回合同列表</Button>
      </div>
    );
  }

  // 没有数据
  if (!contractDetail) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">合同信息不存在</p>
        <Button onClick={() => navigate('/contracts')}>返回合同列表</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* 合同基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {contractDetail.lease_type === 'property' ? (
                <Home className="h-8 w-8 text-gray-400" />
              ) : (
                <Car className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl flex items-center">
                {contractDetail.lease_type === 'property' ? '房屋租赁合同' : '车位租赁合同'}
                <Badge className={`ml-2 ${getStatusColor(contractDetail.status)} font-medium px-3 py-1`}>
                  {contractDetail.status}
                </Badge>
              </CardTitle>
              <div className="flex items-center text-gray-500 mt-1">
                <User className="h-4 w-4 mr-1" />
                <span className="text-sm">租客：{contractDetail.tenant?.name || '未知租客'}</span>
              </div>
            </div>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>联系电话: {contractDetail.tenant?.phone || '未填写'}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>电子邮箱: {contractDetail.tenant?.email || '未填写'}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      {contractDetail.lease_type === 'property' ? '房屋' : '车位'}: 
                      {contractDetail.property?.name || contractDetail.parking_space?.name || '未知'}
                    </span>
                  </div>
                  {contractDetail.lease_type === 'parking' && contractDetail.car_number && (
                    <div className="flex items-center text-gray-500">
                      <Car className="h-4 w-4 mr-2" />
                      <span>车牌号: {contractDetail.car_number}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>租赁期限: {new Date(contractDetail.lease_start).toLocaleDateString()} 至 {new Date(contractDetail.lease_end).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>付款方式: {contractDetail.payment_method}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>创建时间: {new Date(contractDetail.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {contractDetail.notes && (
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">合同备注</span>
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <p className="text-gray-700">{contractDetail.notes}</p>
                </div>
              )}

              {/* 合同文件 */}
              {contractDetail.contract_photos && (() => {
                try {
                  const files = JSON.parse(contractDetail.contract_photos);
                  if (Array.isArray(files) && files.length > 0) {
                    return (
                      <div className="border-b pb-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">合同文件</span>
                          <ImageIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {files.map((filePath: string, index: number) => {
                            // 为了兼容旧数据，如果是字符串路径，转换为文件对象格式
                            const fileObj = typeof filePath === 'string' ? {
                              original_name: `合同文件${index + 1}`,
                              saved_name: filePath.split('/').pop() || `file${index + 1}`,
                              file_path: filePath,
                              file_size: undefined, // 旧数据不显示文件大小
                              file_type: filePath.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
                            } : filePath;

                            return (
                              <FilePreviewDetail
                                key={index}
                                file={fileObj}
                                baseUrl={API_BASE_URL}
                                className="w-full"
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                } catch (error) {
                  console.error('解析合同文件失败:', error);
                }
                return null;
              })()}


            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>租金信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-blue-600">¥{contractDetail.monthly_rent}/月</div>

              {/* 租金结清状态 */}
              {rentStatus && (
                <div className="p-3 rounded-lg border-2 border-dashed" style={{
                  backgroundColor: rentStatus.isFullyPaid ? '#f0f9ff' : '#fef3c7',
                  borderColor: rentStatus.isFullyPaid ? '#3b82f6' : '#f59e0b'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">租金结清状态</span>
                    <Badge className={`font-medium px-3 py-1 ${
                      rentStatus.isFullyPaid
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      {rentStatus.isFullyPaid ? '✅ 已结清' : '⏳ 未结清'}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>已收租金:</span>
                      <span className="font-medium text-green-600">¥{rentStatus.receivedRent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>未收租金:</span>
                      <span className={`font-medium ${rentStatus.unpaidRent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ¥{rentStatus.unpaidRent}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>收款进度:</span>
                      <span className="font-medium">{rentStatus.paymentRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">押金</span>
                  <span>¥{contractDetail.deposit_paid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">合同总金额</span>
                  <span className="font-semibold text-green-600">
                    ¥{contractDetail.total_contract_amount || calculateContractTotal(contractDetail)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">付款方式</span>
                  <span>{contractDetail.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">合同状态</span>
                  <Badge className={`${getStatusColor(contractDetail.status)} font-medium px-3 py-1`}>
                    {contractDetail.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">租约到期</span>
                  <span>{new Date(contractDetail.lease_end).toLocaleDateString()}</span>
                </div>
              </div>


            </CardContent>
          </Card>

          {/* 付款计划 */}
          <PaymentSchedule
            leaseId={contractDetail.id}
            contractData={contractDetail}
            readonly={true}
          />
        </div>

      {/* 固定底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg" style={{zIndex: 9999}}>
        <div className="flex flex-col space-y-2 max-w-md mx-auto">
          {/* 续租合同按钮 - 只在合同生效中或即将到期时显示 */}
          {(contractDetail.status === '生效中' || contractDetail.status === '即将到期') && (
            <Button
              onClick={() => navigate(`/contracts/add?renewal=true&originalId=${contractDetail.id}`)}
              className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700"
            >
              <FileText className="h-5 w-5 mr-2" />
              续租合同
            </Button>
          )}

          {/* 主要操作按钮 */}
          <div className="flex space-x-3">
            <Button
              variant="destructive"
              onClick={handleDeleteContract}
              className="flex-1 h-12 text-base font-medium bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              删除合同
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/contracts/edit/${contractDetail.id}`)}
              className="flex-1 h-12 text-base font-medium border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
            >
              <Edit className="h-5 w-5 mr-2" />
              编辑合同
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;
