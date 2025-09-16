import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import ApiService from '@/services/api';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword || !email || !phone) {
      toast({
        title: '输入错误',
        description: '请填写所有必填字段',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '两次输入的密码不一致，请重新输入',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用API服务进行注册
      await ApiService.register({
        username,
        email,
        phone,
        password
      });
      
      toast({
        title: '注册成功',
        description: '您的账号已创建，请登录',
      });
      
      // 注册成功后跳转到登录页面
      navigate('/');
    } catch (error: any) {
      console.error('注册失败:', error);
      
      // 显示错误提示
      toast({
        title: '注册失败',
        description: error.response?.data?.detail || '注册失败，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="bg-blue-600 p-3 rounded-full mb-2">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">创建新账号</CardTitle>
        <CardDescription className="text-center">
          请填写以下信息完成注册
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleRegister}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入电子邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">手机号码</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号码"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? '隐藏密码' : '显示密码'}
                  </span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? '注册中...' : '注册'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-gray-500">
          已有账号？
          <Button
            variant="link"
            className="pl-1 text-blue-600"
            onClick={() => navigate('/')}
          >
            返回登录
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;