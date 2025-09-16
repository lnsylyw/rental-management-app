import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import ApiService from '@/services/api';
import Compressor from 'compressorjs';
import { calculateContractStatus } from '@/constants/contract';

interface TenantFormProps {
  editMode?: boolean;
  tenantData?: any;
}

const TenantForm = ({ editMode = false, tenantData = null }: TenantFormProps) => {
  const [formData, setFormDataOriginal] = useState({
    name: editMode && tenantData ? tenantData.name : '',
    phone: editMode && tenantData ? tenantData.phone : '',
    email: editMode && tenantData ? tenantData.email : '',
    idCard: editMode && tenantData ? tenantData.id_card || tenantData.idCard : '',
    gender: editMode && tenantData ? tenantData.gender : '男',
    // 租赁类型字段 - 仅在添加模式时使用
    leaseType: !editMode ? 'property' : (tenantData?.lease_type || 'property'),
    propertyId: !editMode ? '' : (tenantData?.property_id || ''),
    parkingSpaceId: !editMode ? '' : (tenantData?.parking_space_id || ''),
    // 车位租客特有字段 - 仅在添加模式时使用
    carNumber: !editMode ? '' : (tenantData?.car_number || ''),
    carModel: !editMode ? '' : (tenantData?.car_model || ''),
    leaseStart: !editMode ? '' : (tenantData?.lease_start || ''),
    leaseEnd: !editMode ? '' : (tenantData?.lease_end || ''),
    monthlyRent: !editMode ? '' : (tenantData?.monthly_rent || ''),
    depositPaid: !editMode ? '' : (tenantData?.deposit_paid || ''),
    paymentMethod: !editMode ? '押一付三' : (tenantData?.payment_method || '押一付三'),
    notes: editMode && tenantData ? (tenantData.notes || '') : '',
  });

  const [avatar, setAvatar] = useState<string | null>(
    editMode && tenantData && tenantData.avatar ? tenantData.avatar : null
  );

  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 包装setFormData函数
  const setFormData = setFormDataOriginal;

  // 获取房屋和车位列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesData, parkingData] = await Promise.all([
          ApiService.getProperties({ status: '可用' }),
          ApiService.getParkingSpaces({ status: '可用' })
        ]);

        // 过滤出可用的房屋和车位
        const availableProperties = (propertiesData || []).filter((property: any) =>
          property.status === '可用'
        );
        const availableParkingSpaces = (parkingData || []).filter((parking: any) =>
          parking.status === '可用'
        );

        setProperties(availableProperties);
        setParkingSpaces(availableParkingSpaces);
      } catch (error) {
        console.error('获取房屋和车位数据失败:', error);
        toast({
          title: '数据加载失败',
          description: '无法加载房屋和车位数据',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 计算合同总金额
  const calculateTotalContractAmount = (monthlyRent: string, leaseStart: string, leaseEnd: string): number => {
    if (!monthlyRent || !leaseStart || !leaseEnd) return 0;

    try {
      const rent = parseFloat(monthlyRent);
      const startDate = new Date(leaseStart);
      const endDate = new Date(leaseEnd);

      if (isNaN(rent) || startDate >= endDate) return 0;

      // 计算月数差
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    (endDate.getMonth() - startDate.getMonth());

      return rent * Math.max(1, months);
    } catch (error) {
      console.error('计算合同总金额失败:', error);
      return 0;
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 验证文件
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
      toast({
        title: '文件过大',
        description: `头像文件 ${file.name} 超过2MB限制`,
        variant: 'destructive',
      });
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: '文件格式不支持',
        description: `头像文件 ${file.name} 格式不支持，请选择JPG、PNG、GIF或WebP格式`,
        variant: 'destructive',
      });
      return;
    }

    // 压缩头像
    try {
      const compressedFile = await new Promise<File>((resolve, reject) => {
        new Compressor(file, {
          quality: 0.6, // 压缩质量
          maxWidth: 600, // 最大宽度
          maxHeight: 600, // 最大高度
          success(result) {
            resolve(new File([result], file.name, { type: file.type }));
          },
          error(err) {
            reject(err);
          },
        });
      });

      // 生成预览URL
      setAvatar(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error('头像压缩失败:', error);
      toast({
        title: '头像压缩失败',
        description: `头像文件 ${file.name} 压缩失败，请重试`,
        variant: 'destructive',
      });
      return;
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    const basicRequiredFields = ['name', 'idCard'];
    const missingFields = basicRequiredFields.filter(field => !formData[field as keyof typeof formData]);

    // 仅在添加模式下验证租赁相关字段
    if (!editMode) {
      const leaseRequiredFields = ['leaseStart', 'leaseEnd', 'monthlyRent'];
      // 押金不再是必填字段，可以为0
      missingFields.push(...leaseRequiredFields.filter(field => !formData[field as keyof typeof formData]));

      // 根据租赁类型验证相应的关联字段
      if (formData.leaseType === 'property' && !formData.propertyId) {
        missingFields.push('propertyId');
      }
      if (formData.leaseType === 'parking' && !formData.parkingSpaceId) {
        missingFields.push('parkingSpaceId');
      }
      if (formData.leaseType === 'parking' && !formData.carNumber) {
        missingFields.push('carNumber');
      }
    }

    if (missingFields.length > 0) {
      toast({
        title: '输入错误',
        description: '请填写所有必填字段',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 准备租客基本信息
      const tenantDataPayload: any = {
        ...(editMode && tenantData ? tenantData : {}), // 在编辑模式下保留原始数据
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        id_card: formData.idCard,
        gender: formData.gender || '男',
        notes: formData.notes || null,
      };

      let tenant;
      if (editMode && tenantDataPayload?.id) {
        // 更新租客基本信息
        tenant = await ApiService.updateTenant(tenantDataPayload.id, tenantDataPayload);
      } else {
        // 创建新租客前先检查是否已存在
        const existsCheck = await ApiService.checkTenantExists({
          name: tenantDataPayload.name,
          id_card: tenantDataPayload.id_card
        });

        if (existsCheck.exists) {
          // 租客已存在，使用现有租客
          tenant = existsCheck.tenant;
          toast({
            title: '提示',
            description: `租客 ${tenant.name} 已存在，将使用现有租客信息创建合同`,
            variant: 'default',
          });
        } else {
          // 租客不存在，创建新租客
          tenant = await ApiService.createTenant(tenantDataPayload);
        }
      }

      // 仅在添加模式下创建租赁合同
      if (!editMode) {
        // 准备租赁合同信息
        const leaseData = {
          tenant_id: tenant.id,
          lease_type: formData.leaseType,
          property_id: formData.leaseType === 'property' ? parseInt(formData.propertyId) : null,
          parking_space_id: formData.leaseType === 'parking' ? parseInt(formData.parkingSpaceId) : null,
          lease_start: formData.leaseStart,
          lease_end: formData.leaseEnd,
          monthly_rent: parseFloat(formData.monthlyRent),
          deposit_paid: parseFloat(formData.depositPaid) || 0, // 押金可以为0
          total_contract_amount: calculateTotalContractAmount(formData.monthlyRent, formData.leaseStart, formData.leaseEnd),
          payment_method: formData.paymentMethod,
          car_number: formData.leaseType === 'parking' ? formData.carNumber : null,
          car_model: formData.leaseType === 'parking' ? (formData.carModel || null) : null,
          status: calculateContractStatus(formData.leaseStart, formData.leaseEnd), // 自动计算状态
          notes: null,
        };

        await ApiService.createLease(leaseData);
      }

      toast({
        title: editMode ? '更新成功' : '添加成功',
        description: editMode ? '租客信息已更新' : '新租客已添加到系统',
      });
      navigate('/tenant');
    } catch (error: any) {
      console.error('提交租客信息失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '提交租客信息失败，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 pb-16">
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 基本信息 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 头像上传 */}
              <div className="flex flex-col items-center space-y-2 mb-4">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
                  {avatar ? (
                    <>
                      <img 
                        src={avatar} 
                        alt="租客头像" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 h-6 w-6"
                        onClick={removeAvatar}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        capture="user"
                        onChange={handleAvatarUpload}
                      />
                      <label htmlFor="avatar-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                        <Upload className="h-6 w-6 text-gray-500 mb-1" />
                        <span className="text-xs text-gray-500">上传头像</span>
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  支持 JPG、PNG 格式，不超过 2MB
                </p>
              </div>

              {/* 租赁类型选择 - 仅在添加模式下显示 */}
              {!editMode && (
                <div className="space-y-2">
                  <Label htmlFor="leaseType">租赁类型 *</Label>
                  <Select
                    value={formData.leaseType}
                    onValueChange={(value) => {
                      // 根据租赁类型设置默认付款方式
                      const defaultPaymentMethod = value === 'parking' ? '年付' : '押一付三';
                      setFormData((prev: any) => ({
                        ...prev,
                        leaseType: value,
                        paymentMethod: defaultPaymentMethod
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择租赁类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property">房屋租赁</SelectItem>
                      <SelectItem value="parking">车位租赁</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="请输入租客姓名"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">性别</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号码</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="请输入手机号码（可选）"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">电子邮箱</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="请输入电子邮箱"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idCard">身份证号 *</Label>
                  <Input
                    id="idCard"
                    name="idCard"
                    placeholder="请输入身份证号"
                    value={formData.idCard}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                

              </div>
              


              {/* 车位租客特有字段 - 仅在添加模式下或编辑模式且为车位租客时显示 */}
              {(!editMode && formData.leaseType === 'parking') || (editMode && tenantData?.lease_type === 'parking') ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carNumber">车牌号 *</Label>
                    <Input
                      id="carNumber"
                      name="carNumber"
                      placeholder="请输入车牌号"
                      value={formData.carNumber}
                      onChange={handleInputChange}
                      required={!editMode && formData.leaseType === 'parking'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carModel">车型</Label>
                    <Input
                      id="carModel"
                      name="carModel"
                      placeholder="请输入车型"
                      value={formData.carModel}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
          
          {/* 租赁信息 - 仅在添加模式下显示 */}
          {!editMode && (
            <Card>
              <CardHeader>
                <CardTitle>租赁信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 根据租赁类型显示不同的选择器 */}
                {formData.leaseType === 'property' ? (
                  <div className="space-y-2">
                    <Label htmlFor="propertyId">租住房屋 *</Label>
                    <Select
                      value={formData.propertyId.toString()}
                      onValueChange={(value) => handleSelectChange('propertyId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择房屋" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map(property => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{property.name}</span>
                              <span className="text-sm text-gray-500">{property.address}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="parkingSpaceId">租用车位 *</Label>
                    <Select
                      value={formData.parkingSpaceId ? formData.parkingSpaceId.toString() : ''}
                      onValueChange={(value) => {
                        handleSelectChange('parkingSpaceId', value);
                        // 当选择车位时，自动设置车位的付款方式和月租金
                        const selectedParking = parkingSpaces.find(p => p.id.toString() === value);
                        if (selectedParking) {
                          setFormData((prev: any) => ({
                            ...prev,
                            paymentMethod: selectedParking.payment_method || '年付',
                            monthlyRent: selectedParking.monthly_rent?.toString() || ''
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择车位" />
                      </SelectTrigger>
                      <SelectContent>
                        {parkingSpaces.map(parking => (
                          <SelectItem key={parking.id} value={parking.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{parking.name}</span>
                              <span className="text-sm text-gray-500">{parking.location} - {parking.parking_type}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaseStart">租期开始日期 *</Label>
                    <Input
                      id="leaseStart"
                      name="leaseStart"
                      type="date"
                      value={formData.leaseStart}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="leaseEnd">租期结束日期 *</Label>
                    <Input
                      id="leaseEnd"
                      name="leaseEnd"
                      type="date"
                      value={formData.leaseEnd}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">月租金 (元) *</Label>
                  <Input
                    id="monthlyRent"
                    name="monthlyRent"
                    type="number"
                    placeholder="例如：5800"
                    value={formData.monthlyRent}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* 押金字段 - 所有租赁类型都显示 */}
                <div className="space-y-2">
                  <Label htmlFor="depositPaid">押金 (元)</Label>
                  <Input
                    id="depositPaid"
                    name="depositPaid"
                    type="number"
                    placeholder={formData.leaseType === 'parking' ? "车位租赁通常无押金，填0" : "例如：6000，无押金填0"}
                    value={formData.depositPaid}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.leaseType === 'parking'
                      ? "车位租赁通常无押金，请填写0"
                      : "如果没有押金，请填写0"
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">付款方式</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => {
                      if (value) { // 只有当value不为空时才更新
                        handleSelectChange('paymentMethod', value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择付款方式" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.leaseType === 'parking' ? (
                        // 车位租赁只显示年付和半年付
                        <>
                          <SelectItem value="半年付">半年付</SelectItem>
                          <SelectItem value="年付">年付</SelectItem>
                        </>
                      ) : (
                        // 房屋租赁显示传统付款方式
                        <>
                          <SelectItem value="押一付一">押一付一</SelectItem>
                          <SelectItem value="押一付三">押一付三</SelectItem>
                          <SelectItem value="押二付六">押二付六</SelectItem>
                          <SelectItem value="押一付六">押一付六</SelectItem>
                          <SelectItem value="押一付十二">押一付十二</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* 备注信息 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>备注信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="请输入备注信息"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
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
              onClick={() => navigate('/tenant')}
              className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 hover:border-gray-400"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 text-base font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">👤</span>
                  {editMode ? '更新租客' : '添加租客'}
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TenantForm;