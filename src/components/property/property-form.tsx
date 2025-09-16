// Copyright (c) 2025 云福阁. All rights reserved.
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2, Star } from 'lucide-react';
import ApiService from '@/services/api';
import { processImageUrl, API_BASE_URL, getAuthHeaders } from '@/config/api';
import Compressor from 'compressorjs';

interface PropertyFormProps {
  editMode?: boolean;
}

interface UploadedImage {
  id?: number;
  image_url: string;
  image_type: string;
  description: string | null;
  sort_order: number;
  is_cover: boolean;
  file?: File; // 本地文件对象
  uploading?: boolean; // 上传状态
}

const PropertyForm = ({ editMode = false }: PropertyFormProps) => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(editMode);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    property_type: '住宅',
    area: '',
    monthly_rent: '',
    deposit: '',
    payment_method: '押一付三',
    min_lease_months: '12',
    rooms: '3',
    living_rooms: '1',
    bathrooms: '2',
    floor: '',
    total_floors: '',
    orientation: '',
    decoration_status: '',
    has_elevator: false,
    has_parking: false,
    status: '可用',
    description: '',
  });
  
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);





  // 设施分类映射
  const FACILITY_CATEGORY_MAP: Record<string, string> = {
    '冰箱': '家电',
    '洗衣机': '家电',
    '空调': '家电',
    '电视': '家电',
    '微波炉': '家电',
    '抽油烟机': '家电',
    '热水器': '家电',
    '沙发': '家具',
    '衣柜': '家具',
    '床': '家具',
    '宽带': '网络',
    '电梯': '其他',
    '车位': '其他',
  };

  // 上传图片到服务器
  const uploadImages = async (files: File[], imageType: string = 'interior', propertyId?: number): Promise<UploadedImage[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    // 如果没有propertyId，使用URL中的id参数
    let currentPropertyId = propertyId;
    if (!currentPropertyId && id) {
      currentPropertyId = parseInt(id);
    }

    if (!currentPropertyId) {
      throw new Error('需要先保存房屋信息才能上传图片');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload/property-images/${currentPropertyId}?image_type=${imageType}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '上传失败');
      }

      const result = await response.json();
      return result.files.map((file: any, index: number) => ({
        image_url: file.url, // 直接存储相对路径，显示时用processImageUrl处理
        image_type: file.image_type || imageType,
        description: file.description || file.filename,
        sort_order: images.length + index + 1,
        is_cover: imageType === 'interior' && images.filter(img => img.image_type !== 'certificate').length === 0 && index === 0,
      }));
    } catch (error) {
      console.error('图片上传失败:', error);
      throw error;
    }
  };

  // 获取房屋数据（编辑模式）
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!editMode || !id) return;

      try {
        setIsDataLoading(true);
        const data = await ApiService.getProperty(parseInt(id));
        console.log('房屋编辑数据:', data);
        
        setFormData({
          name: data.name || '',
          address: data.address || '',
          city: data.city || '',
          province: data.province || '',
          postal_code: data.postal_code || '',
          property_type: data.property_type || '住宅',
          area: data.area?.toString() || '',
          monthly_rent: data.monthly_rent?.toString() || '',
          deposit: data.deposit?.toString() || '',
          payment_method: data.payment_method || '押一付三',
          min_lease_months: data.min_lease_months?.toString() || '12',
          rooms: data.rooms?.toString() || '3',
          living_rooms: data.living_rooms?.toString() || '1',
          bathrooms: data.bathrooms?.toString() || '2',
          floor: data.floor?.toString() || '',
          total_floors: data.total_floors?.toString() || '',
          orientation: data.orientation || '',
          decoration_status: data.decoration_status || '',
          has_elevator: !!data.has_elevator,
          has_parking: !!data.has_parking,
          status: data.status || '可用',
          description: data.description || '',
        });

        if (data.images && data.images.length > 0) {
          setImages(data.images.map((img: any) => ({
            id: img.id,
            image_url: processImageUrl(img.image_url),
            image_type: img.image_type || 'interior',
            description: img.description,
            sort_order: img.sort_order || 1,
            is_cover: !!img.is_cover && img.image_type !== 'certificate', // 确保房证照片不会被设为封面
          })));
        }

        if (data.features && data.features.length > 0) {
          setFeatures(data.features.map((f: any) => f.feature_name));
        }

        if (data.facilities && data.facilities.length > 0) {
          setFacilities(data.facilities.filter((f: any) => f.is_available).map((f: any) => f.facility_name));
        }

        setError(null);
      } catch (error: any) {
        console.error('获取房屋数据失败:', error);
        setError('获取房屋数据失败，请稍后重试');
        toast({
          title: '数据加载失败',
          description: error.response?.data?.detail || '无法加载房屋数据',
          variant: 'destructive',
        });
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchPropertyData();
  }, [editMode, id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFeatures((prev) =>
      prev.includes(feature) ? prev.filter((i) => i !== feature) : [...prev, feature]
    );
  };

  const handleFacilityToggle = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((i) => i !== facility) : [...prev, facility]
    );
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
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080,
            success(result) {
              resolve(new File([result], file.name, { type: file.type }));
            },
            error(err) {
              console.error('图片压缩失败:', err);
              reject(err);
            }
          });
        });
        compressedFiles.push(compressedFile);
      } catch (error) {
        console.error('压缩图片时出错:', error);
        // 如果压缩失败，使用原始文件
        compressedFiles.push(file);
      }
    }

    if (images.length + fileArray.length > 10) {
      toast({
        title: '图片数量超限',
        description: '最多只能上传10张图片',
        variant: 'destructive',
      });
      return;
    }

    // 添加临时图片显示（显示上传进度）
    const tempImages: UploadedImage[] = fileArray.map((file, index) => ({
      image_url: URL.createObjectURL(file),
      image_type: 'interior',
      description: file.name,
      sort_order: images.length + index + 1,
      is_cover: images.length === 0 && index === 0,
      file,
      uploading: true,
    }));

    setImages(prev => [...prev, ...tempImages]);

    try {
      // 上传图片
      const uploadedImages = await uploadImages(fileArray, 'interior');
      
      // 替换临时图片为真实图片
      setImages(prev => {
        const newImages = [...prev];
        tempImages.forEach((tempImg, index) => {
          const tempIndex = newImages.findIndex(img => img.file === tempImg.file);
          if (tempIndex !== -1) {
            newImages[tempIndex] = uploadedImages[index];
          }
        });
        return newImages;
      });

      toast({
        title: '上传成功',
        description: `成功上传 ${fileArray.length} 张房屋照片`,
      });
    } catch (error: any) {
      // 移除上传失败的临时图片
      setImages(prev => prev.filter(img => !tempImages.some(temp => temp.file === img.file)));
      
      toast({
        title: '上传失败',
        description: error.message || '房屋照片上传失败，请重试',
        variant: 'destructive',
      });
    }

    // 清空文件输入
    e.target.value = '';
  };

  // 房证照片上传处理函数
  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // 验证文件
    const maxSize = 5 * 1024 * 1024; // 5MB
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
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080,
            success(result) {
              resolve(new File([result], file.name, { type: file.type }));
            },
            error(err) {
              console.error('图片压缩失败:', err);
              reject(err);
            },
          });
        });
        compressedFiles.push(compressedFile);
      } catch (error) {
        console.error('压缩图片时出错:', error);
        // 如果压缩失败，使用原始文件
        compressedFiles.push(file);
      }
    }

    if (images.length + compressedFiles.length > 10) {
      toast({
        title: '图片数量超限',
        description: '最多只能上传10张图片',
        variant: 'destructive',
      });
      return;
    }

    // 添加临时房证照片显示（显示上传进度）
    const tempImages: UploadedImage[] = compressedFiles.map((file, index) => ({
      image_url: URL.createObjectURL(file),
      image_type: 'certificate', // 设置为房证类型
      description: file.name.includes('房产证') ? '房产证' : 
                   file.name.includes('土地证') ? '土地证' : 
                   file.name.includes('不动产证') ? '不动产证' : '房证照片',
      sort_order: images.length + index + 1,
      is_cover: false, // 房证照片不能设为封面
      file,
      uploading: true,
    }));

    setImages(prev => [...prev, ...tempImages]);

    try {
      // 上传房证照片，使用certificate类型
      const uploadedImages = await uploadImages(compressedFiles, 'certificate');
      
      // 将上传的图片设置为房证类型
      const certificateImages = uploadedImages.map(img => ({
        ...img,
        image_type: 'certificate',
        description: img.description?.includes('房产证') ? '房产证' : 
                     img.description?.includes('土地证') ? '土地证' : 
                     img.description?.includes('不动产证') ? '不动产证' : '房证照片',
        is_cover: false,
      }));
      
      // 替换临时图片为真实图片
      setImages(prev => {
        const newImages = [...prev];
        tempImages.forEach((tempImg, index) => {
          const tempIndex = newImages.findIndex(img => img.file === tempImg.file);
          if (tempIndex !== -1) {
            newImages[tempIndex] = certificateImages[index];
          }
        });
        return newImages;
      });

      toast({
        title: '上传成功',
        description: `成功上传 ${compressedFiles.length} 张房证照片`,
      });
    } catch (error: any) {
      // 移除上传失败的临时图片
      setImages(prev => prev.filter(img => !tempImages.some(temp => temp.file === img.file)));
      
      toast({
        title: '上传失败',
        description: error.message || '房证照片上传失败，请重试',
        variant: 'destructive',
      });
    }

    // 清空文件输入
    e.target.value = '';
  };

  const removeImage = (targetImageId: number | string) => {
    const targetIndex = images.findIndex(img => (img.id || img.image_url) === targetImageId);
    if (targetIndex === -1) return;

    const newImages = [...images];
    const removedImage = newImages[targetIndex];

    // 如果删除的是封面图，将第一张房屋照片设为封面
    if (removedImage.is_cover) {
      const firstHouseImage = newImages.find((img, i) =>
        i !== targetIndex && img.image_type !== 'certificate'
      );
      if (firstHouseImage) {
        const firstHouseImageIndex = newImages.findIndex(img =>
          (img.id || img.image_url) === (firstHouseImage.id || firstHouseImage.image_url)
        );
        if (firstHouseImageIndex !== -1) {
          newImages[firstHouseImageIndex].is_cover = true;
        }
      }
    }

    newImages.splice(targetIndex, 1);
    setImages(newImages);
  };

  const setCoverImage = (targetImageId: number | string) => {
    const newImages = images.map((img) => ({
      ...img,
      is_cover: (img.id || img.image_url) === targetImageId && img.image_type !== 'certificate',
    }));
    setImages(newImages);
  };

  // 枚举值映射：前端显示值 -> 后端枚举值
  const mapEnumValues = (data: any) => {
    const paymentMethodMap: Record<string, string> = {
      '押一付一': '押一付一',
      '押一付三': '押一付三', 
      '押一付六': '押一付六',
      '押一付十二': '押一付十二',
      '其他': '其他'
    };

    const statusMap: Record<string, string> = {
      '可用': '可用',
      '已出租': '已出租',
      '维修中': '维修中',
      '不可用': '不可用'
    };

    const orientationMap: Record<string, string> = {
      '南向': '南向',
      '北向': '北向',
      '东向': '东向',
      '西向': '西向',
      '东南向': '东南向',
      '西南向': '西南向',
      '东北向': '东北向',
      '西北向': '西北向',
      '南北通透': '南北通透',
      '东西通透': '东西通透'
    };

    const decorationMap: Record<string, string> = {
      '毛坯': '毛坯',
      '简装': '简装',
      '精装': '精装',
      '豪装': '豪装'
    };

    return {
      ...data,
      payment_method: paymentMethodMap[data.payment_method] || data.payment_method,
      status: statusMap[data.status] || data.status,
      orientation: data.orientation ? (orientationMap[data.orientation] || data.orientation) : null,
      decoration_status: data.decoration_status ? (decorationMap[data.decoration_status] || data.decoration_status) : null,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.area || !formData.monthly_rent || !formData.deposit) {
      toast({
        title: '输入错误',
        description: '请填写标有*的必填字段',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 过滤掉正在上传的图片
      const validImages = images.filter(img => !img.uploading);
      
      const submitData = {
        name: formData.name,
        address: formData.address,
        city: formData.city || '北京市',
        province: formData.province || '北京',
        postal_code: formData.postal_code || null,
        property_type: formData.property_type || '住宅',
        area: parseFloat(formData.area),
        monthly_rent: parseFloat(formData.monthly_rent),
        deposit: parseFloat(formData.deposit),
        payment_method: formData.payment_method,
        min_lease_months: parseInt(formData.min_lease_months),
        rooms: parseInt(formData.rooms),
        living_rooms: parseInt(formData.living_rooms),
        bathrooms: parseInt(formData.bathrooms),
        floor: formData.floor ? parseInt(formData.floor) : null,
        total_floors: formData.total_floors ? parseInt(formData.total_floors) : null,
        orientation: formData.orientation || null,
        decoration_status: formData.decoration_status || null,
        has_elevator: formData.has_elevator,
        has_parking: formData.has_parking,
        status: formData.status,
        description: formData.description,
        // 包含关联数据
        images: validImages.map((img: UploadedImage) => ({
          image_url: img.image_url,
          image_type: img.image_type,
          description: img.description,
          sort_order: img.sort_order,
          is_cover: img.is_cover,
        })),
        features: features.map((name) => ({
          feature_name: name,
        })),
        facilities: facilities.map((name) => ({
          facility_name: name,
          facility_category: FACILITY_CATEGORY_MAP[name] || '其他',
          is_available: true,
          description: null,
        })),
      };

      console.log('=== 调试信息开始 ===');
      console.log('formData.orientation:', formData.orientation);
      console.log('formData.decoration_status:', formData.decoration_status);
      console.log('formData.payment_method:', formData.payment_method);
      console.log('formData.status:', formData.status);
      
      // 映射枚举值
      const mappedData = mapEnumValues(submitData);
      console.log('原始提交数据:', submitData);
      console.log('映射后数据:', mappedData);
      console.log('枚举值映射详情:', {
        orientation: `${submitData.orientation} -> ${mappedData.orientation}`,
        decoration_status: `${submitData.decoration_status} -> ${mappedData.decoration_status}`,
        payment_method: `${submitData.payment_method} -> ${mappedData.payment_method}`,
        status: `${submitData.status} -> ${mappedData.status}`
      });
      console.log('=== 调试信息结束 ===');

      // 强制使用中文值
      const finalData = {
        ...mappedData,
        orientation: mappedData.orientation === 'WEST' ? '西向' : mappedData.orientation,
        decoration_status: mappedData.decoration_status === 'FINE' ? '精装' : mappedData.decoration_status,
        payment_method: mappedData.payment_method === 'QUARTERLY' ? '押一付三' : mappedData.payment_method,
        status: mappedData.status === 'AVAILABLE' ? '可用' : mappedData.status,
      };
      
      console.log('最终提交数据:', finalData);

      if (editMode && id) {
        await ApiService.updateProperty(parseInt(id), finalData);
        toast({ title: '更新成功', description: '房屋信息已更新' });
      } else {
        await ApiService.createProperty(finalData);
        toast({ title: '添加成功', description: '新房屋已添加到系统' });
      }

      navigate('/property');
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

  // 房屋特色/设施选项
  const featureOptions = [
    '精装修', '拎包入住', '南北通透', '采光好', '交通便利', 
    '近地铁', '学区房', '商圈', '安静', '新装修'
  ];

  const facilityOptions = [
    '冰箱', '洗衣机', '空调', '热水器', '宽带', '电视', '沙发', 
    '衣柜', '床', '微波炉', '燃气灶', '抽油烟机'
  ];

  // 枚举选项
  const orientationOptions = [
    { value: '南向', label: '南向' },
    { value: '北向', label: '北向' },
    { value: '东向', label: '东向' },
    { value: '西向', label: '西向' },
    { value: '东南向', label: '东南向' },
    { value: '西南向', label: '西南向' },
    { value: '东北向', label: '东北向' },
    { value: '西北向', label: '西北向' },
    { value: '南北通透', label: '南北通透' },
    { value: '东西通透', label: '东西通透' },
  ];

  const decorationOptions = [
    { value: '毛坯', label: '毛坯' },
    { value: '简装', label: '简装' },
    { value: '精装', label: '精装' },
    { value: '豪装', label: '豪装' },
  ];

  const statusOptions = [
    { value: '可用', label: '可用' },
    { value: '已出租', label: '已出租' },
    { value: '维修中', label: '维修中' },
    { value: '不可用', label: '不可用' },
  ];

  const paymentOptions = [
    '押一付一', '押一付三', '押一付六', '押一付十二', '其他'
  ];

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>加载房屋数据中...</span>
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
              <h3 className="text-lg font-semibold">加载失败</h3>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/property')}>返回房屋列表</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pb-16">
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">房屋名称 *</Label>
                  <Input id="name" name="name" placeholder="例如：阳光花园A座1201" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">出租状态</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">详细地址 *</Label>
                <Input id="address" name="address" placeholder="请输入详细地址" value={formData.address} onChange={handleInputChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">城市</Label>
                  <Input id="city" name="city" placeholder="例如：北京市" value={formData.city} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">省份</Label>
                  <Input id="province" name="province" placeholder="例如：北京" value={formData.province} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">邮政编码</Label>
                  <Input id="postal_code" name="postal_code" placeholder="例如：100000" value={formData.postal_code} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_type">房屋类型</Label>
                  <Select value={formData.property_type} onValueChange={(value) => handleSelectChange('property_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择房屋类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="住宅">住宅</SelectItem>
                      <SelectItem value="公寓">公寓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">面积 (平方米) *</Label>
                  <Input id="area" name="area" type="number" placeholder="例如：120" value={formData.area} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rooms">房间数</Label>
                  <Select value={formData.rooms} onValueChange={(value) => handleSelectChange('rooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择房间数" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1室</SelectItem>
                      <SelectItem value="2">2室</SelectItem>
                      <SelectItem value="3">3室</SelectItem>
                      <SelectItem value="4">4室</SelectItem>
                      <SelectItem value="5">5室及以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="living_rooms">客厅数</Label>
                  <Select value={formData.living_rooms} onValueChange={(value) => handleSelectChange('living_rooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择客厅数" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1厅</SelectItem>
                      <SelectItem value="2">2厅</SelectItem>
                      <SelectItem value="3">3厅</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">卫生间数</Label>
                  <Select value={formData.bathrooms} onValueChange={(value) => handleSelectChange('bathrooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择卫生间数" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1卫</SelectItem>
                      <SelectItem value="2">2卫</SelectItem>
                      <SelectItem value="3">3卫及以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orientation">朝向</Label>
                  <Select value={formData.orientation || ''} onValueChange={(value) => handleSelectChange('orientation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择朝向" />
                    </SelectTrigger>
                    <SelectContent>
                      {orientationOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decoration_status">装修状态</Label>
                  <Select value={formData.decoration_status || ''} onValueChange={(value) => handleSelectChange('decoration_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择装修状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {decorationOptions.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">楼层 / 总楼层</Label>
                  <div className="flex space-x-2">
                    <Input id="floor" name="floor" type="number" placeholder="3" value={formData.floor} onChange={handleInputChange} className="flex-1" />
                    <span className="flex items-center">/</span>
                    <Input id="total_floors" name="total_floors" type="number" placeholder="18" value={formData.total_floors} onChange={handleInputChange} className="flex-1" />
                  </div>
                </div>
                
                {/* 电梯和车位选项 */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">其他设施</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="has_elevator" name="has_elevator" checked={formData.has_elevator} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, has_elevator: checked as boolean }))} />
                      <Label htmlFor="has_elevator">有电梯</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="has_parking" name="has_parking" checked={formData.has_parking} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, has_parking: checked as boolean }))} />
                      <Label htmlFor="has_parking">有停车位</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">房屋描述</Label>
                <Textarea id="description" name="description" placeholder="请输入房屋详细描述" value={formData.description} onChange={handleInputChange} rows={5} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>租金信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthly_rent">月租金 (元) *</Label>
                <Input id="monthly_rent" name="monthly_rent" type="number" placeholder="例如：5800" value={formData.monthly_rent} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">押金 (元) *</Label>
                <Input id="deposit" name="deposit" type="number" placeholder="例如：11600" value={formData.deposit} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">付款方式</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleSelectChange('payment_method', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择付款方式" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentOptions.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_lease_months">最短租期 (月)</Label>
                <Input id="min_lease_months" name="min_lease_months" type="number" placeholder="例如：12" value={formData.min_lease_months} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>房屋特色</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featureOptions.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox id={`feature-${feature}`} checked={features.includes(feature)} onCheckedChange={() => handleFeatureToggle(feature)} />
                  <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>配套设施</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {facilityOptions.map((facility) => (
                <div key={facility} className="flex items-center space-x-2">
                  <Checkbox id={`facility-${facility}`} checked={facilities.includes(facility)} onCheckedChange={() => handleFacilityToggle(facility)} />
                  <Label htmlFor={`facility-${facility}`}>{facility}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>房屋图片</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 房屋照片区域 */}
            <div>
              <h4 className="text-sm font-medium mb-3">房屋照片</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.filter(img => img.image_type !== 'certificate').map((image, index) => (
                  <div key={image.id || index} className="relative h-32 rounded-md overflow-hidden border">
                    <img
                      src={processImageUrl(image.image_url)}
                      alt={image.description || `房屋图片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 封面标识 */}
                    {image.is_cover && (
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        封面
                      </div>
                    )}
                    
                    {/* 上传进度 */}
                    {image.uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1" />
                          <span className="text-xs">上传中...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* 操作按钮 */}
                    {!image.uploading && (
                      <div className="absolute top-1 right-1 flex space-x-1">
                        {!image.is_cover && (
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="icon" 
                            className="h-6 w-6 bg-white bg-opacity-80 hover:bg-opacity-100" 
                            onClick={() => setCoverImage(image.id || image.image_url)}
                            title="设为封面"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => removeImage(image.id || image.image_url)}
                          title="删除图片"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* 房屋照片上传按钮 */}
                <div className="h-32 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 transition-colors">
                  <input
                    type="file"
                    id="house-image-upload"
                    className="hidden"
                    accept="image/*,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="house-image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <Upload className="h-6 w-6 text-gray-500 mb-1" />
                    <span className="text-sm text-gray-500">上传房屋照片</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 房证照片区域 */}
            <div>
              <h4 className="text-sm font-medium mb-3">房证照片</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.filter(img => img.image_type === 'certificate').map((image, index) => (
                  <div key={image.id || `cert-${index}`} className="relative h-32 rounded-md overflow-hidden border border-green-200">
                    <img
                      src={processImageUrl(image.image_url)}
                      alt={image.description || `房证照片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 房证标识 */}
                    <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1 rounded flex items-center">
                      <span>房证</span>
                    </div>
                    
                    {/* 上传进度 */}
                    {image.uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1" />
                          <span className="text-xs">上传中...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* 删除按钮 */}
                    {!image.uploading && (
                      <div className="absolute top-1 right-1">
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => removeImage(image.id || image.image_url)}
                          title="删除房证照片"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* 房证照片上传按钮 */}
                <div className="h-32 rounded-md border-2 border-dashed border-green-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-600 transition-colors">
                  <input
                    type="file"
                    id="certificate-upload"
                    className="hidden"
                    accept="image/*,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleCertificateUpload}
                  />
                  <label htmlFor="certificate-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <Upload className="h-6 w-6 text-green-500 mb-1" />
                    <span className="text-sm text-green-600">上传房证照片</span>
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                上传房产证、土地证等相关证件照片，便于管理和查看
              </p>
            </div>

            <p className="text-sm text-gray-500">
              支持 JPG、PNG、GIF、WebP 格式，单张图片不超过 5MB，最多上传 10 张。点击星标按钮设置封面图片。
            </p>
          </CardContent>
        </Card>
        
        {/* 提交按钮 - 固定在底部 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50">
          <div className="max-w-md mx-auto flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/property')}
              className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 hover:border-gray-400"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 text-base font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editMode ? '更新中...' : '添加中...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🏠</span>
                  {editMode ? '更新房屋' : '添加房屋'}
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
