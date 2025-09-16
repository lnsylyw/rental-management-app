import React from 'react';
import LoginForm from '@/components/auth/login-form';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';

const LoginPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
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