import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, DollarSign, Wallet, User } from 'lucide-react';
import AnimatedContainer from './animated-container';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 导航项配置
  const navigationItems = [
    {
      id: 'dashboard',
      label: '首页',
      icon: Home,
      path: '/dashboard',
      color: 'text-blue-600',
      isCenter: false
    },
    {
      id: 'contracts',
      label: '合同',
      icon: FileText,
      path: '/contracts',
      color: 'text-gray-600',
      isCenter: false
    },
    {
      id: 'payment',
      label: '收付款',
      icon: DollarSign,
      path: '/finance/add',
      color: 'text-white',
      isCenter: true
    },
    {
      id: 'finance',
      label: '财务',
      icon: Wallet,
      path: '/finance?tab=overview',
      color: 'text-amber-600',
      isCenter: false
    },
    {
      id: 'settings',
      label: '我的',
      icon: User,
      path: '/settings',
      color: 'text-gray-600',
      isCenter: false
    }
  ];

  // 检查当前路径是否匹配导航项
  const isActive = (path: string) => {
    // 处理带查询参数的路径
    const [basePath] = path.split('?');
    const currentPath = location.pathname;
    const currentSearch = location.search;

    // 如果路径包含查询参数，需要精确匹配
    if (path.includes('?')) {
      return currentPath === basePath && currentSearch.includes(path.split('?')[1]);
    }

    // 普通路径匹配
    return currentPath === basePath || currentPath.startsWith(basePath + '/');
  };

  return (
    <AnimatedContainer animation="slideInFromBottomVariants">
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
        <div className="container mx-auto grid grid-cols-5 h-16 px-2 relative">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            if (item.isCenter) {
              // 中间的收租按钮 - 大圆形
              return (
                <div key={item.id} className="flex flex-col items-center justify-center relative">
                  <button
                    className="flex flex-col items-center justify-center transition-all transform hover:scale-105 absolute -top-6"
                    onClick={() => navigate(item.path)}
                  >
                    <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-xs mt-1 text-green-600 font-medium">{item.label}</span>
                  </button>
                </div>
              );
            }

            // 普通导航按钮
            return (
              <button
                key={item.id}
                className={`flex flex-col items-center justify-center transition-colors ${
                  active
                    ? item.color
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs mt-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </footer>
    </AnimatedContainer>
  );
};

export default BottomNavigation;
