import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Edit, Clock, CheckCircle, AlertTriangle, Calendar, MapPin, User, FileText, Tool, DollarSign } from 'lucide-react';

// 模拟维修请求数据
const mockMaintenanceRequest = {
  id: 2,
  title: '空调不制冷',
  description: '客厅空调开机后不制冷，可能需要加氟利昂。制冷效果很差，开了一整天房间还是很热。',
  status: '进行中',
  priority: '紧急',
  property: '城市公寓 2室1厅',
  propertyAddress: '北京市海淀区西二旗大街128号城市公寓B座502',
  tenant: '李四',
  tenantPhone: '13812345678',
  reportDate: '2023-06-03',
  scheduledDate: '2023-06-05',
  completedDate: null,
  cost: null,
  notes: '已联系空调维修师傅，预约6月5日上午10点上门维修',
  timeline: [
    {
      date: '2023-06-03 14:25',
      action: '租客报修',
      description: '李四报修客厅空调不制冷问题',
      user: '李四',
    },
    {
      date: '2023-06-03 16:40',
      action: '受理报修',
      description: '已受理报修请求，安排维修人员',
      user: '管理员',
    },
    {
      date: '2023-06-04 09:15',
      action: '预约维修',
      description: '已联系空调维修师傅，预约6月5日上午10点上门维修',
      user: '管理员',
    },
  ],
  images: [
    'https://images.unsplash.com/photo-1580595999172-187725572ebc?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1586149773869-6d8f9d0a6818?w=500&h=350&fit=crop',
  ],
};

const MaintenanceDetail = () => {
  const [status, setStatus] = useState(mockMaintenanceRequest.status);
  const [comment, setComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 获取状态对应的图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '待处理':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case '进行中':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      case '已完成':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
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

  // 获取状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '待处理':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case '进行中':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case '已完成':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleStatusUpdate = () => {
    if (!comment && status !== mockMaintenanceRequest.status) {
      toast({
        title: '请添加备注',
        description: '更新状态时需要添加备注说明',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);

    // 模拟更新请求
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: '状态已更新',
        description: `维修请求状态已更新为"${status}"`,
      });
      setComment('');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => navigate('/maintenance')}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        返回列表
      </Button>

      {/* 维修请求标题和状态 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            status === '待处理' ? 'bg-yellow-100' : 
            status === '进行中' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {getStatusIcon(status)}
          </div>
          <h1 className="text-2xl font-bold">{mockMaintenanceRequest.title}</h1>
          <Badge className={getPriorityColor(mockMaintenanceRequest.priority)}>
            {mockMaintenanceRequest.priority}
          </Badge>
        </div>
        <div className="mt-2 md:mt-0 flex items-center space-x-2">
          <Badge className={getStatusColor(status)} variant="secondary">
            {status}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/maintenance/${mockMaintenanceRequest.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 维修详情 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>维修详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">问题描述</h3>
              <p className="text-sm">{mockMaintenanceRequest.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">报修日期</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{mockMaintenanceRequest.reportDate}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">预约日期</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    {mockMaintenanceRequest.scheduledDate || '未安排'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">房屋信息</h3>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{mockMaintenanceRequest.property}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  {mockMaintenanceRequest.propertyAddress}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">租客信息</h3>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{mockMaintenanceRequest.tenant}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  {mockMaintenanceRequest.tenantPhone}
                </p>
              </div>
            </div>

            {mockMaintenanceRequest.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">备注</h3>
                <div className="flex items-start">
                  <FileText className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                  <span className="text-sm">{mockMaintenanceRequest.notes}</span>
                </div>
              </div>
            )}

            {mockMaintenanceRequest.completedDate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">完成日期</h3>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{mockMaintenanceRequest.completedDate}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">维修费用</h3>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">
                      {mockMaintenanceRequest.cost ? `¥${mockMaintenanceRequest.cost}` : '未记录'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 问题图片 */}
            {mockMaintenanceRequest.images && mockMaintenanceRequest.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">问题图片</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mockMaintenanceRequest.images.map((image, index) => (
                    <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                      <img 
                        src={image} 
                        alt={`维修问题图片 ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 状态更新和时间线 */}
        <div className="space-y-6">
          {/* 状态更新 */}
          <Card>
            <CardHeader>
              <CardTitle>更新状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">状态</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="待处理">待处理</SelectItem>
                    <SelectItem value="进行中">进行中</SelectItem>
                    <SelectItem value="已完成">已完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">备注</label>
                <Textarea 
                  placeholder="添加状态更新的备注信息" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleStatusUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? '更新中...' : '更新状态'}
              </Button>
            </CardContent>
          </Card>

          {/* 时间线 */}
          <Card>
            <CardHeader>
              <CardTitle>处理记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMaintenanceRequest.timeline.map((event, index) => (
                  <div key={index} className="relative pl-6">
                    {index !== mockMaintenanceRequest.timeline.length - 1 && (
                      <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-600"></div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{event.action}</h4>
                        <span className="text-xs text-gray-500">{event.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">操作人: {event.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetail;