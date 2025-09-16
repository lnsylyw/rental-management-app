import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Plus, Edit, Trash2, Save } from 'lucide-react';
import ApiService from '@/services/api';

interface PaymentScheduleEditorProps {
  leaseId: number;
  contractData?: any;
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

const PaymentScheduleEditor: React.FC<PaymentScheduleEditorProps> = ({ leaseId, contractData }) => {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<PaymentSchedule>>({});
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

  // 开始编辑
  const handleStartEdit = (schedule: PaymentSchedule) => {
    setEditingSchedule(schedule.id);
    setEditForm({
      period_start_date: schedule.period_start_date.split('T')[0],
      period_end_date: schedule.period_end_date.split('T')[0],
      due_date: schedule.due_date.split('T')[0],
      amount: schedule.amount,
      paid_amount: schedule.paid_amount,
      notes: schedule.notes || ''
    });
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingSchedule) return;
    
    try {
      await ApiService.updatePaymentSchedule(editingSchedule, editForm);
      toast({
        title: '更新成功',
        description: '付款计划已更新',
      });
      setEditingSchedule(null);
      setEditForm({});
      await fetchPaymentSchedules();
    } catch (error: any) {
      console.error('更新付款计划失败:', error);
      toast({
        title: '更新失败',
        description: '更新付款计划失败',
        variant: 'destructive',
      });
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setEditForm({});
  };

  // 删除付款计划
  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('确定要删除这个付款计划吗？')) return;
    
    try {
      await ApiService.deletePaymentSchedule(scheduleId);
      toast({
        title: '删除成功',
        description: '付款计划已删除',
      });
      await fetchPaymentSchedules();
    } catch (error: any) {
      console.error('删除付款计划失败:', error);
      toast({
        title: '删除失败',
        description: '删除付款计划失败',
        variant: 'destructive',
      });
    }
  };

  // 标记为已付款
  const handleMarkAsPaid = async (scheduleId: number, amount: number) => {
    try {
      await ApiService.updatePaymentSchedule(scheduleId, {
        paid_amount: amount,
        status: '已付款'
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
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">付款计划管理</h3>
        {schedules.length === 0 && (
          <Button
            onClick={handleGenerateSchedules}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isGenerating ? '生成中...' : '生成付款计划'}
          </Button>
        )}
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">暂无付款计划</p>
          <p className="text-sm text-gray-400">
            点击"生成付款计划"按钮，系统将根据合同信息自动生成分期付款计划
          </p>
        </div>
      ) : (
        <div className="space-y-3">
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
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="border">
              <CardContent className="p-3 sm:p-4">
                {editingSchedule === schedule.id ? (
                  // 编辑模式 - 移动端优化
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-medium text-sm sm:text-base">编辑第 {schedule.period_number} 期</h4>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 text-xs">
                          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} className="text-xs">
                          取消
                        </Button>
                      </div>
                    </div>

                    {/* 日期字段 - 移动端垂直布局 */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs sm:text-sm">开始日期</Label>
                        <Input
                          type="date"
                          className="text-sm"
                          value={editForm.period_start_date || ''}
                          onChange={(e) => setEditForm({...editForm, period_start_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">结束日期</Label>
                        <Input
                          type="date"
                          className="text-sm"
                          value={editForm.period_end_date || ''}
                          onChange={(e) => setEditForm({...editForm, period_end_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">缴费截止日期</Label>
                        <Input
                          type="date"
                          className="text-sm"
                          value={editForm.due_date || ''}
                          onChange={(e) => setEditForm({...editForm, due_date: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* 金额字段 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs sm:text-sm">应付金额</Label>
                        <Input
                          type="number"
                          className="text-sm"
                          value={editForm.amount || ''}
                          onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">已付金额</Label>
                        <Input
                          type="number"
                          className="text-sm"
                          value={editForm.paid_amount || ''}
                          onChange={(e) => setEditForm({...editForm, paid_amount: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">备注</Label>
                      <Input
                        className="text-sm"
                        value={editForm.notes || ''}
                        onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                        placeholder="输入备注..."
                      />
                    </div>
                  </div>
                ) : (
                  // 显示模式 - 移动端优化
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

                    {/* 操作按钮 - 移动端优化 */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(schedule)}
                        className="text-xs flex-1 sm:flex-none"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        编辑
                      </Button>
                      {schedule.status !== '已付款' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(schedule.id, schedule.amount)}
                          className="bg-green-600 hover:bg-green-700 text-xs flex-1 sm:flex-none"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          已付
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-xs"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentScheduleEditor;
