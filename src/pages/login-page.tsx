import React, { useState } from 'react';
import LoginForm from '@/components/auth/login-form';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import IonicNetworkDebug from '@/components/debug/ionic-network-debug';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const LoginPage = () => {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
        {/* 调试按钮 - 只在移动端显示 */}
        {(window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:') && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="bg-white/80 backdrop-blur-sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* 网络调试面板 */}
        {showDebug && (
          <div className="fixed inset-0 bg-white z-40 overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">网络调试</h2>
              <Button variant="outline" size="sm" onClick={() => setShowDebug(false)}>
                关闭
              </Button>
            </div>
            <IonicNetworkDebug />
          </div>
        )}

        <AnimatedContainer animation="slideInFromTopVariants" delay={0.2}>
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </AnimatedContainer>

        <AnimatedContainer animation="fadeInVariants" delay={0.6}>
          <p className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} 房屋租赁管理系统 - 版权所有
          </p>
        </AnimatedContainer>
      </div>
    </PageTransition>
  );
};

export default LoginPage;