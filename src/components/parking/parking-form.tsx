import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

interface ParkingFormProps {
  editMode?: boolean;
}

const ParkingForm = ({ editMode = false }: ParkingFormProps) => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(editMode);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    space_number: '',
    name: '',
    location: '',
    parking_type: '地面车位',
    floor: '',
    zone: '',
    monthly_rent: '',
    payment_method: '半年付',
    min_lease_months: '6',
    status: '可用',
    description: '',
  });

  // 编辑模式下获取车位数据
  useEffect(() => {
    if (editMode && id) {
      const fetchParkingData = async () => {
        try {
          setIsDataLoading(true);
          const data = await ApiService.getParkingSpace(parseInt(id));
          console.log('获取到的车位数据:', data);
          
          setFormData({
            space_number: data.space_number || '',
            name: data.name || '',
            location: data.location || '',
            parking_type: data.parking_type || '地面车位',
            floor: data.floor ? data.floor.toString() : '',
            zone: data.zone || '',
            monthly_rent: data.monthly_rent ? data.monthly_rent.toString() : '',
            payment_method: data.payment_method || '半年付',
            min_lease_months: data.min_lease_months ? data.min_lease_months.toString() : '6',
            status: data.status || '可用',
            description: data.description || '',
          });
          setError(null);
        } catch (error: any) {
          console.error('获取车位数据失败:', error);
          setError('获取车位数据失败');
          toast({
            title: '数据加载失败',
            description: error.response?.data?.detail || '无法加载车位数据',
            variant: 'destructive',
          });
        } finally {
          setIsDataLoading(false);
        }
      };

      fetchParkingData();
    }
  }, [editMode, id, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.name || !formData.location || !formData.monthly_rent) {
      toast({
        title: '输入错误',
        description: '请填写所有必填字段',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // 准备提交数据
      const submitData = {
        space_number: formData.space_number,
        name: formData.name,
        location: formData.location,
        parking_type: formData.parking_type,
        floor: formData.floor ? parseInt(formData.floor) : null,
        zone: formData.zone || null,
        monthly_rent: parseFloat(formData.monthly_rent),
        payment_method: formData.payment_method,
        min_lease_months: parseInt(formData.min_lease_months),
        status: formData.status,
        description: formData.description || null,
      };

      console.log('提交数据:', submitData);

      if (editMode && id) {
        await ApiService.updateParkingSpace(parseInt(id), submitData);
        toast({ title: '更新成功', description: '车位信息已更新' });
      } else {
        await ApiService.createParkingSpace(submitData);
        toast({ title: '添加成功', description: '新车位已添加到系统' });
      }

      navigate('/parking');
    } catch (error: any) {
      console.error('提交失败:', error);
      toast({
        title: '操作失败',
        description: error.response?.data?.detail || '操作失败，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>加载车位数据中...</span>
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
              <h3 className="text-lg font-semibold">加载失败</h3>
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

  return (
    <div className="bg-gray-50 pb-16">
      <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-purple-600" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">车位名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="如：一号车位"
                />
              </div>
              <div>
                <Label htmlFor="parking_type">车位类型</Label>
                <Select value={formData.parking_type} onValueChange={(value) => handleInputChange('parking_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="地面车位">地面车位</SelectItem>
                    <SelectItem value="地下车位">地下车位</SelectItem>
                    <SelectItem value="机械车位">机械车位</SelectItem>
                    <SelectItem value="有顶车位">有顶车位</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location">车位位置 *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="详细位置描述"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="zone">区域/分区</Label>
                <Input
                  id="zone"
                  value={formData.zone}
                  onChange={(e) => handleInputChange('zone', e.target.value)}
                  placeholder="如：A区"
                />
              </div>
              <div>
                <Label htmlFor="space_number">车位编号 *</Label>
                <Input
                  id="space_number"
                  value={formData.space_number}
                  onChange={(e) => handleInputChange('space_number', e.target.value)}
                  placeholder="如：A-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="floor">楼层</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                  placeholder="如：-1（地下一层）"
                />
              </div>

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>租金信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="monthly_rent">月租金 (元) *</Label>
              <Input
                id="monthly_rent"
                type="number"
                step="0.01"
                value={formData.monthly_rent}
                onChange={(e) => handleInputChange('monthly_rent', e.target.value)}
                placeholder="如：300"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_method">付款方式</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="半年付">半年付</SelectItem>
                  <SelectItem value="年付">年付</SelectItem>
                </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="min_lease_months">最短租期</Label>
                <Select value={formData.min_lease_months} onValueChange={(value) => handleInputChange('min_lease_months', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">半年</SelectItem>
                    <SelectItem value="12">一年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>其他信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">车位状态</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="可用">可用</SelectItem>
                  <SelectItem value="已出租">已出租</SelectItem>
                  <SelectItem value="维修中">维修中</SelectItem>
                  <SelectItem value="不可用">不可用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">车位描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="车位的详细描述、特殊说明等..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 提交按钮 - 固定在底部 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50">
          <div className="max-w-md mx-auto flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/parking')}
              className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 hover:border-gray-400"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 text-base font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editMode ? '更新中...' : '添加中...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🚗</span>
                  {editMode ? '更新车位' : '添加车位'}
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ParkingForm;
