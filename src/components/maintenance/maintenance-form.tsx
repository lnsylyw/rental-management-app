import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import Compressor from 'compressorjs';

interface MaintenanceFormProps {
  editMode?: boolean;
  maintenanceData?: any;
}

const MaintenanceForm = ({ editMode = false, maintenanceData = null }: MaintenanceFormProps) => {
  const [formData, setFormData] = useState({
    title: editMode && maintenanceData ? maintenanceData.title : '',
    description: editMode && maintenanceData ? maintenanceData.description : '',
    priority: editMode && maintenanceData ? maintenanceData.priority : '普通',
    propertyId: editMode && maintenanceData ? maintenanceData.propertyId : '',
    tenantId: editMode && maintenanceData ? maintenanceData.tenantId : 'none',
    scheduledDate: editMode && maintenanceData ? maintenanceData.scheduledDate : '',
    notes: editMode && maintenanceData ? maintenanceData.notes : '',
  });
  
  const [images, setImages] = useState<string[]>(
    editMode && maintenanceData && maintenanceData.images ? maintenanceData.images : []
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 模拟房屋数据
  const mockProperties = [
    { id: 1, title: '阳光花园 3室2厅', address: '北京市朝阳区阳光花园小区5号楼2单元301' },
    { id: 2, title: '城市公寓 2室1厅', address: '北京市海淀区西二旗大街128号城市公寓B座502' },
    { id: 3, title: '滨江花园 4室2厅', address: '北京市朝阳区东三环滨江花园12号楼1单元801' },
    { id: 4, title: '金融街公寓 1室1厅', address: '北京市西城区金融街23号公寓楼1208' },
    { id: 5, title: '望京新城 3室1厅', address: '北京市朝阳区望京新城5区12号楼3单元502' },
  ];

  // 模拟租客数据
  const mockTenants = [
    { id: 1, name: '张三', property: '阳光花园 3室2厅' },
    { id: 2, name: '李四', property: '城市公寓 2室1厅' },
    { id: 3, name: '王五', property: '望京新城 3室1厅' },
    { id: 4, name: '赵六', property: '金融街公寓 1室1厅' },
    { id: 5, name: '钱七', property: '阳光花园 3室2厅' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // 验证文件
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    for (const file of fileArray) {
      if (file.size > maxSize) {
        toast({
          title: '文件过大',
          description: `文件 ${file.name} 超过5MB限制`,
          variant: 'destructive',
        });
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: '文件格式不支持',
          description: `文件 ${file.name} 格式不支持，请选择JPG、PNG、GIF或WebP格式`,
          variant: 'destructive',
        });
        return;
      }
    }

    // 压缩图片
    const compressedFiles: File[] = [];
    for (const file of fileArray) {
      try {
        const compressedFile = await new Promise<File>((resolve, reject) => {
          new Compressor(file, {
            quality: 0.8, // 压缩质量
            maxWidth: 1920, // 最大宽度
            maxHeight: 1080, // 最大高度
            success(result) {
              resolve(new File([result], file.name, { type: file.type }));
            },
            error(err) {
              reject(err);
            },
          });
        });
        compressedFiles.push(compressedFile);
      } catch (error) {
        console.error('图片压缩失败:', error);
        toast({
          title: '图片压缩失败',
          description: `文件 ${file.name} 压缩失败，请重试`,
          variant: 'destructive',
        });
        return;
      }
    }

    // 生成预览URL
    const newImages = compressedFiles.map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.title || !formData.description || !formData.propertyId) {
      toast({
        title: '输入错误',
        description: '请填写所有必填字段',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    // 模拟提交请求
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: editMode ? '更新成功' : '添加成功',
        description: editMode ? '维修请求已更新' : '新维修请求已添加到系统',
      });
      navigate('/maintenance');
    }, 1500);
  };

  return (
    <div className="bg-gray-50 pb-16">
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{editMode ? '编辑维修请求' : '添加维修请求'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                name="title"
                placeholder="请输入维修请求标题"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* 问题描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">问题描述 *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="请详细描述维修问题"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>
            
            {/* 优先级 */}
            <div className="space-y-2">
              <Label>优先级</Label>
              <RadioGroup 
                defaultValue={formData.priority} 
                className="flex space-x-4"
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="紧急" id="urgent" />
                  <Label htmlFor="urgent" className="text-red-600 font-medium">紧急</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="普通" id="normal" />
                  <Label htmlFor="normal" className="text-yellow-600 font-medium">普通</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="低" id="low" />
                  <Label htmlFor="low" className="text-green-600 font-medium">低</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* 关联房屋 */}
            <div className="space-y-2">
              <Label htmlFor="propertyId">关联房屋 *</Label>
              <Select 
                value={formData.propertyId} 
                onValueChange={(value) => handleSelectChange('propertyId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择房屋" />
                </SelectTrigger>
                <SelectContent>
                  {mockProperties.map(property => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 关联租客 */}
            <div className="space-y-2">
              <Label htmlFor="tenantId">关联租客</Label>
              <Select 
                value={formData.tenantId} 
                onValueChange={(value) => handleSelectChange('tenantId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择租客" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无</SelectItem>
                  {mockTenants.map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id.toString()}>
                      {tenant.name} ({tenant.property})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 预约日期 */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">预约日期</Label>
              <Input
                id="scheduledDate"
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleInputChange}
              />
            </div>
            
            {/* 备注 */}
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="请输入备注信息"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            {/* 上传图片 */}
            <div className="space-y-2">
              <Label>问题图片</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                    <img 
                      src={image} 
                      alt={`维修问题图片 ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="aspect-video rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    capture="environment"
                    multiple
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <Upload className="h-6 w-6 text-gray-500 mb-1" />
                    <span className="text-xs text-gray-500">上传图片</span>
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                支持 JPG、PNG 格式，每张不超过 2MB
              </p>
            </div>
            
            {/* 提交按钮 - 固定在底部 */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50">
              <div className="max-w-md mx-auto flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/maintenance')}
                  className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 hover:border-gray-400"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 text-base font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      保存中...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">🔧</span>
                      {editMode ? '更新请求' : '提交请求'}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default MaintenanceForm;