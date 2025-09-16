import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Home, Car, FileText, Upload, Image as ImageIcon, Calendar } from 'lucide-react';
import ApiService from '@/services/api';
import { PAYMENT_METHODS, getLeaseMonths, DEFAULT_PAYMENT_METHOD, calculateContractStatus } from '@/constants/contract';
import { API_BASE_URL } from '@/config/api';
import FilePreview from '@/components/ui/file-preview';
import PaymentScheduleEditor from './payment-schedule-editor';

// 定义表单数据类型
interface FormData {
  tenantId: string;
  leaseType: string;
  propertyId: string;
  parkingSpaceId: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: string;
  depositPaid: string;
  totalContractAmount: string;
  paymentMethod: string;
  carNumber: string;
  carModel: string;
  status: string;
  notes: string;
  contractPhotos: string;
}

interface ContractFormProps {
  editMode?: boolean;
  contractData?: any;
  isRenewal?: boolean; // 是否为续租
  originalContractId?: number; // 原合同ID（续租时使用）
}

const ContractForm = ({ editMode = false, contractData = null, isRenewal = false, originalContractId }: ContractFormProps) => {
  // 初始化表单数据（续租模式下使用空值，由useEffect填充）
  const getInitialFormData = (): FormData => {
    if (editMode && contractData) {
      // 编辑模式：使用现有合同数据
      return {
        tenantId: contractData.tenant_id?.toString() || '',
        leaseType: contractData.lease_type || 'property',
        propertyId: contractData.property_id?.toString() || '',
        parkingSpaceId: contractData.parking_space_id?.toString() || '',
        leaseStart: contractData.lease_start?.split('T')[0] || '',
        leaseEnd: contractData.lease_end?.split('T')[0] || '',
        monthlyRent: contractData.monthly_rent?.toString() || '',
        depositPaid: contractData.deposit_paid?.toString() || '',
        totalContractAmount: contractData.total_contract_amount?.toString() || '',
        paymentMethod: contractData.payment_method || DEFAULT_PAYMENT_METHOD,
        carNumber: contractData.car_number || '',
        carModel: contractData.car_model || '',
        status: contractData.status || '生效中',
        notes: contractData.notes || '',
        contractPhotos: contractData.contract_photos || '',
      };
    } else {
      // 新建模式或续租模式：使用默认值
      return {
        tenantId: '',
        leaseType: 'property',
        propertyId: '',
        parkingSpaceId: '',
        leaseStart: '',
        leaseEnd: '',
        monthlyRent: '',
        depositPaid: '',
        totalContractAmount: '',
        paymentMethod: DEFAULT_PAYMENT_METHOD,
        carNumber: '',
        carModel: '',
        status: '生效中',
        notes: '',
        contractPhotos: '',
      };
    }
  };

  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const isPrefilledRef = useRef(false); // 跟踪是否已经预填充

  // 包装setFormData以添加调试信息
  const debugSetFormData = (newData: FormData | ((prev: FormData) => FormData)) => {
    console.log('🔧 setFormData被调用:', newData);
    console.trace('调用堆栈:');
    setFormData(newData);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);

  // 照片上传相关状态
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // 获取租客、房屋和车位列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantsData, propertiesData, parkingData] = await Promise.all([
          ApiService.getTenants(),
          ApiService.getProperties(), // 获取所有房屋，不限制状态
          ApiService.getParkingSpaces() // 获取所有车位，不限制状态
        ]);

        setTenants(tenantsData || []);

        if ((isRenewal || editMode) && contractData) {
          // 续租模式或编辑模式：包含原合同的房屋/车位 + 可用的房屋/车位
          const availableProperties = (propertiesData || []).filter((property: any) =>
            property.status === '可用' || property.id === contractData.property_id
          );
          const availableParkingSpaces = (parkingData || []).filter((parking: any) =>
            parking.status === '可用' || parking.id === contractData.parking_space_id
          );

          setProperties(availableProperties);
          setParkingSpaces(availableParkingSpaces);
        } else {
          // 新增模式：只显示可用的房屋和车位
          const availableProperties = (propertiesData || []).filter((property: any) =>
            property.status === '可用'
          );
          const availableParkingSpaces = (parkingData || []).filter((parking: any) =>
            parking.status === '可用'
          );

          setProperties(availableProperties);
          setParkingSpaces(availableParkingSpaces);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        toast({
          title: '数据加载失败',
          description: '无法加载相关数据',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [toast, isRenewal, contractData?.property_id, contractData?.parking_space_id]);

  // 续租时预填充表单数据和计算日期（合并到一个useEffect中避免冲突）
  useEffect(() => {
    if (isRenewal && contractData && contractData.tenant_id) {
      console.log('续租模式：开始预填充和日期计算', contractData);

      // 预填充基本信息
      const baseFormData = {
        tenantId: contractData.tenant_id?.toString() || '',
        leaseType: contractData.lease_type || 'property',
        propertyId: contractData.property_id?.toString() || '',
        parkingSpaceId: contractData.parking_space_id?.toString() || '',
        monthlyRent: contractData.monthly_rent?.toString() || '',
        depositPaid: contractData.deposit_paid?.toString() || '',
        totalContractAmount: contractData.total_contract_amount?.toString() || '',
        paymentMethod: contractData.payment_method || DEFAULT_PAYMENT_METHOD,
        carNumber: contractData.car_number || '',
        carModel: contractData.car_model || '',
        status: '生效中',
        notes: contractData.notes || `续租合同（原合同ID: ${originalContractId}）`,
        contractPhotos: contractData.contract_photos || ''
      };

      // 计算日期
      let calculatedDates = { leaseStart: '', leaseEnd: '' };

      if ((contractData.original_lease_start || contractData.lease_start) &&
          (contractData.original_lease_end || contractData.lease_end)) {
        try {
          const originalStartDateStr = contractData.original_lease_start || contractData.lease_start;
          const originalEndDateStr = contractData.original_lease_end || contractData.lease_end;

          if (originalStartDateStr && originalEndDateStr) {
            const leaseMonths = getLeaseMonths(contractData.payment_method || DEFAULT_PAYMENT_METHOD);

            // 直接操作日期字符串，避免时区转换
            const addMonthsToDateString = (dateStr: string, months: number): string => {
              const datePart = dateStr.split('T')[0];
              const [year, month, day] = datePart.split('-').map(Number);

              let newYear = year;
              let newMonth = month + months;

              while (newMonth > 12) {
                newYear++;
                newMonth -= 12;
              }

              const newMonthStr = newMonth.toString().padStart(2, '0');
              const dayStr = day.toString().padStart(2, '0');

              return `${newYear}-${newMonthStr}-${dayStr}`;
            };

            calculatedDates.leaseStart = addMonthsToDateString(originalStartDateStr, leaseMonths);
            calculatedDates.leaseEnd = addMonthsToDateString(originalEndDateStr, leaseMonths);

            console.log('日期计算详情:', {
              originalStart: originalStartDateStr,
              originalEnd: originalEndDateStr,
              leaseMonths,
              newStart: calculatedDates.leaseStart,
              newEnd: calculatedDates.leaseEnd
            });
          }
        } catch (error) {
          console.error('日期计算错误:', error);
        }
      }

      // 合并所有数据并更新表单
      const finalFormData = {
        ...baseFormData,
        ...calculatedDates
      };

      console.log('最终表单数据:', finalFormData);
      debugSetFormData(finalFormData);
      isPrefilledRef.current = true; // 标记已预填充
    }
  }, [isRenewal, contractData?.tenant_id, originalContractId]);

  // 调试：监控表单数据变化
  useEffect(() => {
    console.log('当前表单数据:', formData);
  }, [formData]);

  // 初始化已有的合同照片（编辑模式）
  useEffect(() => {
    if (editMode && contractData?.contract_photos) {
      try {
        const photos = JSON.parse(contractData.contract_photos);
        if (Array.isArray(photos)) {
          // 将照片路径转换为完整的照片对象
          const photoObjects = photos.map((path: string, index: number) => ({
            original_name: `合同照片${index + 1}`,
            saved_name: path.split('/').pop() || `photo${index + 1}`,
            file_path: path,
            file_size: 0
          }));
          setUploadedPhotos(photoObjects);
        }
      } catch (error) {
        console.error('解析合同照片失败:', error);
      }
    }
  }, [editMode, contractData]);

  // 计算合同总金额
  const calculateTotalContractAmount = (monthlyRent: string, leaseStart: string, leaseEnd: string): string => {
    if (!monthlyRent || !leaseStart || !leaseEnd) return '';

    try {
      const rent = parseFloat(monthlyRent);
      const startDate = new Date(leaseStart);
      const endDate = new Date(leaseEnd);

      if (isNaN(rent) || startDate >= endDate) return '';

      // 计算月数差
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    (endDate.getMonth() - startDate.getMonth());

      const totalAmount = rent * Math.max(1, months);
      return totalAmount.toString();
    } catch (error) {
      console.error('计算合同总金额失败:', error);
      return '';
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    debugSetFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // 当月租金、开始日期或结束日期变化时，自动计算合同总金额
      if (name === 'monthlyRent' || name === 'leaseStart' || name === 'leaseEnd') {
        const totalAmount = calculateTotalContractAmount(
          name === 'monthlyRent' ? value : prev.monthlyRent,
          name === 'leaseStart' ? value : prev.leaseStart,
          name === 'leaseEnd' ? value : prev.leaseEnd
        );
        newData.totalContractAmount = totalAmount;
      }

      return newData;
    });
  };

  // 处理照片上传
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 检查文件数量限制
    if (uploadedPhotos.length + files.length > 10) {
      toast({
        title: '上传限制',
        description: '最多只能上传10张照片',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingPhotos(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await ApiService.uploadContractPhotos(formData);

      const result = response;

      // 更新上传的照片列表
      setUploadedPhotos(prev => [...prev, ...result.files]);

      toast({
        title: '上传成功',
        description: `成功上传 ${result.files.length} 张照片`,
      });

    } catch (error) {
      console.error('照片上传失败:', error);
      toast({
        title: '上传失败',
        description: '照片上传失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhotos(false);
      // 清空文件输入框
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // 删除照片
  const handleDeletePhoto = async (filename: string) => {
    console.log('开始删除文件:', filename);

    if (!window.confirm('确定要删除这个文件吗？')) {
      return;
    }

    try {
      console.log('调用API删除文件:', filename);
      await ApiService.deleteContractPhoto(filename);

      // 从列表中移除照片
      setUploadedPhotos(prev => prev.filter(photo => photo.saved_name !== filename));

      console.log('文件删除成功:', filename);
      toast({
        title: '删除成功',
        description: '文件已删除',
      });

    } catch (error: any) {
      console.error('删除文件失败:', error);

      // 如果是404错误（文件不存在），直接从列表中移除
      if (error.response?.status === 404) {
        console.log('文件不存在，直接从列表中移除:', filename);
        setUploadedPhotos(prev => prev.filter(photo => photo.saved_name !== filename));
        toast({
          title: '删除成功',
          description: '文件已删除',
        });
      } else {
        // 其他错误显示错误信息
        toast({
          title: '删除失败',
          description: '删除文件失败，请重试',
          variant: 'destructive',
        });
      }
    }
  };

  // 处理选择框变化
  const handleSelectChange = (name: string, value: string) => {
    console.log(`🔄 handleSelectChange被调用: ${name} = ${value}, 已预填充: ${isPrefilledRef.current}`);

    // 在续租模式下，如果已经预填充且新值为空，则不更新（避免Select初始化时的空值覆盖）
    if (isRenewal && isPrefilledRef.current && !value) {
      console.log(`⚠️ 跳过空值更新: ${name} (续租模式且已预填充)`);
      return;
    }

    debugSetFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 如果是续租模式且修改了付款方式，重新计算日期
    if (isRenewal && name === 'paymentMethod' && contractData &&
        (contractData.original_lease_start || contractData.lease_start) &&
        (contractData.original_lease_end || contractData.lease_end)) {
      try {
        const originalStartDateStr = contractData.original_lease_start || contractData.lease_start;
        const originalEndDateStr = contractData.original_lease_end || contractData.lease_end;

        const leaseMonths = getLeaseMonths(value);

        // 直接操作日期字符串，避免时区转换
        const addMonthsToDateString = (dateStr: string, months: number): string => {
          const datePart = dateStr.split('T')[0];
          const [year, month, day] = datePart.split('-').map(Number);

          let newYear = year;
          let newMonth = month + months;

          while (newMonth > 12) {
            newYear++;
            newMonth -= 12;
          }

          const newMonthStr = newMonth.toString().padStart(2, '0');
          const dayStr = day.toString().padStart(2, '0');

          return `${newYear}-${newMonthStr}-${dayStr}`;
        };

        const newStartDateStr = addMonthsToDateString(originalStartDateStr, leaseMonths);
        const newEndDateStr = addMonthsToDateString(originalEndDateStr, leaseMonths);

        debugSetFormData(prev => ({
          ...prev,
          leaseStart: newStartDateStr,
          leaseEnd: newEndDateStr,
          [name]: value
        }));
      } catch (error) {
        console.error('付款方式变化时日期计算错误:', error);
      }
    }
  };

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    const requiredFields = ['tenantId', 'leaseStart', 'leaseEnd', 'monthlyRent'];
    // 押金不再是必填字段，可以为0
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
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
    
    if (missingFields.length > 0) {
      toast({
        title: '输入错误',
        description: '请填写所有必填字段',
        variant: 'destructive',
      });
      return;
    }

    // 验证日期
    const startDate = new Date(formData.leaseStart);
    const endDate = new Date(formData.leaseEnd);
    if (endDate <= startDate) {
      toast({
        title: '日期错误',
        description: '结束日期必须晚于开始日期',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 准备提交数据
      const submitData = {
        tenant_id: parseInt(formData.tenantId),
        lease_type: formData.leaseType,
        property_id: formData.leaseType === 'property' ? parseInt(formData.propertyId) : null,
        parking_space_id: formData.leaseType === 'parking' ? parseInt(formData.parkingSpaceId) : null,
        lease_start: formData.leaseStart,
        lease_end: formData.leaseEnd,
        monthly_rent: parseFloat(formData.monthlyRent),
        deposit_paid: parseFloat(formData.depositPaid) || 0, // 押金可以为0
        total_contract_amount: parseFloat(formData.totalContractAmount) || 0,
        payment_method: formData.paymentMethod,
        car_number: formData.leaseType === 'parking' ? formData.carNumber : null,
        car_model: formData.leaseType === 'parking' ? (formData.carModel || null) : null,
        status: calculateContractStatus(formData.leaseStart, formData.leaseEnd), // 自动计算状态
        notes: formData.notes || null,
        contract_photos: uploadedPhotos.length > 0 ? JSON.stringify(uploadedPhotos.map(photo => photo.file_path)) : null,
      };

      if (editMode && contractData?.id) {
        await ApiService.updateLease(contractData.id, submitData);
        toast({
          title: '更新成功',
          description: '合同信息已更新',
        });
      } else {
        const newLease = await ApiService.createLease(submitData);

        // 自动生成付款计划
        try {
          await ApiService.generatePaymentSchedules(newLease.id);
          console.log('付款计划已自动生成');
        } catch (error) {
          console.warn('自动生成付款计划失败:', error);
          // 不影响合同创建，只是记录警告
        }

        // 如果是续租，可以将原合同状态设为已到期
        if (isRenewal && originalContractId) {
          try {
            await ApiService.updateLease(originalContractId, { status: '已到期' });
          } catch (error) {
            console.warn('更新原合同状态失败:', error);
          }
        }

        toast({
          title: isRenewal ? '续租成功' : '添加成功',
          description: isRenewal ? '续租合同已创建，付款计划已自动生成' : '新合同已添加到系统，付款计划已自动生成',
        });
      }
      
      navigate('/contracts');
    } catch (error: any) {
      console.error('提交合同信息失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '提交合同信息失败，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 pb-16">
      <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              {isRenewal ? '续租信息' : '合同基本信息'}
            </CardTitle>
            {isRenewal && contractData && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium text-blue-800">续租合同信息</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>原合同ID: {originalContractId}</p>
                  <p>原租期: {contractData.original_lease_start ? new Date(contractData.original_lease_start).toLocaleDateString() : '未知'} 至 {contractData.original_lease_end ? new Date(contractData.original_lease_end).toLocaleDateString() : '未知'}</p>
                  <p>新租期将在原合同基础上延续，开始和结束日期都按付款方式月数顺延</p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 租客选择 */}
            <div className="space-y-2">
              <Label htmlFor="tenantId">租客 *</Label>
              <Select 
                value={formData.tenantId.toString()} 
                onValueChange={(value) => handleSelectChange('tenantId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择租客" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{tenant.name}</span>
                        <span className="text-sm text-gray-500">{tenant.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 租赁类型选择 */}
            <div className="space-y-2">
              <Label htmlFor="leaseType">租赁类型 *</Label>
              <Select
                value={formData.leaseType}
                onValueChange={(value) => {
                  // 根据租赁类型设置默认付款方式
                  const defaultPaymentMethod = value === 'parking' ? '年付' : DEFAULT_PAYMENT_METHOD;
                  setFormData(prev => ({
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
              <>
                <div className="space-y-2">
                  <Label htmlFor="parkingSpaceId">租用车位 *</Label>
                  <Select
                    value={formData.parkingSpaceId ? formData.parkingSpaceId.toString() : ''}
                    onValueChange={(value) => {
                      handleSelectChange('parkingSpaceId', value);
                      // 当选择车位时，自动设置车位的付款方式和月租金
                      const selectedParking = parkingSpaces.find(p => p.id.toString() === value);
                      if (selectedParking) {
                        setFormData(prev => ({
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

                {/* 车位租赁特有字段 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carNumber">车牌号 *</Label>
                    <Input
                      id="carNumber"
                      name="carNumber"
                      placeholder="请输入车牌号"
                      value={formData.carNumber}
                      onChange={handleInputChange}
                      required={formData.leaseType === 'parking'}
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
              </>
            )}
          </CardContent>
        </Card>

        {/* 租赁信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {formData.leaseType === 'property' ? (
                <Home className="h-5 w-5 mr-2" />
              ) : (
                <Car className="h-5 w-5 mr-2" />
              )}
              租赁详情
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 租期 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leaseStart">租期开始 *</Label>
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
                <Label htmlFor="leaseEnd">租期结束 *</Label>
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

            {/* 租金和押金 */}
            <div className={`grid gap-4 ${formData.leaseType === 'parking' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">月租金 (元) *</Label>
                <Input
                  id="monthlyRent"
                  name="monthlyRent"
                  type="number"
                  placeholder="例如：3000"
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
            </div>

            {/* 合同总金额 */}
            <div className="space-y-2">
              <Label htmlFor="totalContractAmount">合同总金额 (元)</Label>
              <Input
                id="totalContractAmount"
                name="totalContractAmount"
                type="number"
                placeholder="系统自动计算"
                value={formData.totalContractAmount}
                onChange={handleInputChange}
                className="border-blue-200 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">
                💡 根据月租金和租期自动计算，也可手动修改
              </p>
            </div>

            {/* 付款方式和状态 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">付款方式</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择付款方式" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.filter(method => {
                      // 车位租赁只显示年付和半年付
                      if (formData.leaseType === 'parking') {
                        return method.value === '年付' || method.value === '半年付';
                      }
                      // 房屋租赁只显示押付方式，不包括年付和半年付
                      return method.value !== '年付' && method.value !== '半年付';
                    }).map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 合同状态现在自动根据租赁时间计算，不需要手动选择 */}
              <div className="space-y-2">
                <Label htmlFor="status">合同状态</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <span className="text-sm text-gray-600">
                    状态将根据租赁时间自动计算
                    {formData.leaseStart && formData.leaseEnd && (
                      <>：<span className="font-medium">{calculateContractStatus(formData.leaseStart, formData.leaseEnd)}</span></>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 备注 */}
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="请输入备注信息..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 付款计划设置 */}
        {editMode && contractData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                付款计划管理
              </CardTitle>
              <p className="text-sm text-gray-600">
                管理合同的分期付款计划，可以根据付款方式自动生成或手动调整。
              </p>
            </CardHeader>
            <CardContent>
              <PaymentScheduleEditor
                leaseId={contractData.id}
                contractData={contractData}
              />
            </CardContent>
          </Card>
        )}

        {/* 合同文件上传 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              合同文件存档
            </CardTitle>
            <p className="text-sm text-gray-600">
              上传签署的合同文件，留作存档。支持JPG、PNG、PDF等格式，最多10个文件。
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 文件上传区域 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="contract-files"
                multiple
                accept="image/*,.pdf"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={isUploadingPhotos}
              />
              <label
                htmlFor="contract-files"
                className={`cursor-pointer flex flex-col items-center space-y-2 ${
                  isUploadingPhotos ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {isUploadingPhotos ? '上传中...' : '点击选择文件或拖拽到此处'}
                </span>
                <span className="text-xs text-gray-500">
                  支持 JPG、PNG、GIF、PDF 等格式，图片最大 10MB，PDF最大 50MB
                </span>
              </label>
            </div>

            {/* 已上传的文件列表 */}
            {uploadedPhotos.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  已上传文件 ({uploadedPhotos.length}/10)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {uploadedPhotos.map((file) => (
                    <FilePreview
                      key={file.saved_name}
                      file={file}
                      baseUrl={API_BASE_URL}
                      onDelete={handleDeletePhoto}
                      showDelete={true}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 提交按钮 - 固定在底部 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50">
          <div className="max-w-md mx-auto flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/contracts')}
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
                  提交中...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">📋</span>
                  {editMode ? '更新合同' : (isRenewal ? '创建续租合同' : '创建合同')}
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;
