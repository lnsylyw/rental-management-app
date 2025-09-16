import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';
import Compressor from 'compressorjs';

// 模拟用户数据
const mockUserData = {
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
  role: '管理员',
  company: '阳光房产管理有限公司',
  address: '北京市朝阳区建国路88号',
};

const ProfileSettings = () => {
  const [userData, setUserData] = useState(mockUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件
      const maxSize = 2 * 1024 * 1024; // 2MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (file.size > maxSize) {
        toast({
          title: '文件过大',
          description: `头像文件超过2MB限制`,
          variant: 'destructive',
        });
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: '文件格式不支持',
          description: `头像文件格式不支持，请选择JPG、PNG、GIF或WebP格式`,
          variant: 'destructive',
        });
        return;
      }

      // 压缩图片
      let compressedFile: File = file;
      try {
        compressedFile = await new Promise<File>((resolve, reject) => {
          new Compressor(file, {
            quality: 0.8,
            maxWidth: 800,
            maxHeight: 800,
            success(result) {
              resolve(new File([result], file.name, { type: file.type }));
            },
            error(err) {
              console.error('图片压缩失败:', err);
              reject(err);
            },
          });
        });
      } catch (error) {
        console.error('图片压缩失败，使用原始文件:', error);
        compressedFile = file;
      }

      // 生成预览URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUserData({
            ...userData,
            avatar: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(compressedFile);
    }
  };

  const handleSave = () => {
    setIsLoading(true);
    
    // 模拟保存请求
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      toast({
        title: '保存成功',
        description: '个人资料已更新',
      });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 头像 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback>{userData.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute bottom-0 right-0">
                <label 
                  htmlFor="avatar-upload" 
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium">{userData.name}</h3>
            <p className="text-sm text-gray-500">{userData.role}</p>
          </div>
        </div>

        {/* 个人信息表单 */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">手机号码</Label>
              <Input
                id="phone"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">公司名称</Label>
              <Input
                id="company"
                name="company"
                value={userData.company}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">地址</Label>
            <Input
              id="address"
              name="address"
              value={userData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-2 pt-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setUserData(mockUserData); // 重置为原始数据
                }}
              >
                取消
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? '保存中...' : '保存更改'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
            >
              编辑资料
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;