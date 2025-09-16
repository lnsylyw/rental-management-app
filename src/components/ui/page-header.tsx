import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AnimatedContainer from './animated-container';

// 页面头部标准高度常量
export const PAGE_HEADER_HEIGHT = 'h-16'; // 64px
export const PAGE_HEADER_TOP_SPACING = 'pt-20'; // 80px (64px + 16px margin)

interface PageHeaderProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  backPath?: string;
  backgroundColor?: string;
  textColor?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon: Icon,
  backPath = '/dashboard',
  backgroundColor = 'bg-blue-600',
  textColor = 'text-white',
  children
}) => {
  const navigate = useNavigate();

  return (
    <AnimatedContainer animation="slideInFromTopVariants">
      <header className={`fixed top-0 left-0 right-0 z-50 ${PAGE_HEADER_HEIGHT} ${backgroundColor} ${textColor} p-4 shadow-md`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`mr-2 ${textColor} hover:bg-black hover:bg-opacity-10`}
              onClick={() => navigate(backPath)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              {Icon && <Icon className="h-5 w-5 mr-2" />}
              <h1 className="text-xl font-bold">{title}</h1>
            </div>
          </div>
          {children && (
            <div className="flex items-center space-x-4">
              {children}
            </div>
          )}
        </div>
      </header>
    </AnimatedContainer>
  );
};

export default PageHeader;
