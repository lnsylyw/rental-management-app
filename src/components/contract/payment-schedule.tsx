import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import ApiService from '@/services/api';

interface PaymentScheduleProps {
  leaseId: number;
  contractData?: any;
  readonly?: boolean; // 是否为只读模式
}

interface PaymentSchedule {
  id: number;
  period_number: number;
  period_start_date: string;
  period_end_date: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  status: string;
  notes?: string;
}

const PaymentSchedule: React.FC<PaymentScheduleProps> = ({ leaseId, contractData, readonly = false }) => {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // 获取付款计划
  const fetchPaymentSchedules = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getPaymentSchedules({ lease_id: leaseId });
      setSchedules(data || []);
    } catch (error: any) {
      console.error('获取付款计划失败:', error);
      toast({
        title: '获取失败',
        description: '无法获取付款计划',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 生成付款计划
  const handleGenerateSchedules = async () => {
    try {
      setIsGenerating(true);
      await ApiService.generatePaymentSchedules(leaseId);
      toast({
        title: '生成成功',
        description: '付款计划已生成',
      });
      await fetchPaymentSchedules();
    } catch (error: any) {
      console.error('生成付款计划失败:', error);
      toast({
        title: '生成失败',
        description: error.response?.data?.detail || '生成付款计划失败',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 更新付款状态
  const handleUpdatePayment = async (scheduleId: number, paidAmount: number) => {
    try {
      await ApiService.updatePaymentSchedule(scheduleId, {
        paid_amount: paidAmount,
      });
      toast({
        title: '更新成功',
        description: '付款状态已更新',
      });
      await fetchPaymentSchedules();
    } catch (error: any) {
      console.error('更新付款状态失败:', error);
      toast({
        title: '更新失败',
        description: '更新付款状态失败',
        variant: 'destructive',
      });
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '已付款':
        return 'bg-green-100 text-green-800';
      case '逾期':
        return 'bg-red-100 text-red-800';
      case '未付款':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '已付款':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case '逾期':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case '未付款':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  useEffect(() => {
    fetchPaymentSchedules();
  }, [leaseId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            付款计划
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">加载中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            付款计划
          </div>
          {schedules.length === 0 && !readonly && (
            <Button
              onClick={handleGenerateSchedules}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isGenerating ? '生成中...' : '生成付款计划'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无付款计划</p>
            <p className="text-sm text-gray-400">
              {readonly
                ? '该合同尚未设置付款计划，请在编辑合同页面进行设置'
                : '点击"生成付款计划"按钮，系统将根据合同信息自动生成分期付款计划'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 付款计划概览 - 移动端优化 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
              <div className="bg-blue-50 p-2 sm:p-4 rounded-lg text-center">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs sm:text-sm text-blue-600">总期数</p>
                <p className="text-sm sm:text-lg font-semibold text-blue-800">{schedules.length}</p>
              </div>
              <div className="bg-green-50 p-2 sm:p-4 rounded-lg text-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs sm:text-sm text-green-600">已付</p>
                <p className="text-sm sm:text-lg font-semibold text-green-800">
                  {schedules.filter(s => s.status === '已付款').length}
                </p>
              </div>
              <div className="bg-red-50 p-2 sm:p-4 rounded-lg text-center">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mx-auto mb-1" />
                <p className="text-xs sm:text-sm text-red-600">逾期</p>
                <p className="text-sm sm:text-lg font-semibold text-red-800">
                  {schedules.filter(s => s.status === '逾期').length}
                </p>
              </div>
            </div>

            {/* 付款计划列表 - 移动端优化 */}
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* 头部信息 */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                        {getStatusIcon(schedule.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm sm:text-base">第 {schedule.period_number} 期</h4>
                            <Badge className={`${getStatusColor(schedule.status)} text-xs`}>
                              {schedule.status}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 break-words">
                            {formatDate(schedule.period_start_date)} - {formatDate(schedule.period_end_date)}
                          </p>
                          <p className="text-xs text-gray-400">
                            截止: {formatDate(schedule.due_date)}
                          </p>
                        </div>
                      </div>

                      {/* 金额信息 */}
                      <div className="text-right ml-2">
                        <span className="font-semibold text-sm sm:text-lg text-blue-600">
                          ¥{schedule.amount.toLocaleString()}
                        </span>
                        {schedule.paid_amount > 0 && (
                          <p className="text-xs sm:text-sm text-green-600">
                            已付: ¥{schedule.paid_amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 - 只读模式下不显示 */}
                    {schedule.status !== '已付款' && !readonly && (
                      <div className="pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => handleUpdatePayment(schedule.id, schedule.amount)}
                          className="bg-green-600 hover:bg-green-700 text-xs w-full sm:w-auto"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          标记为已付款
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSchedule;
