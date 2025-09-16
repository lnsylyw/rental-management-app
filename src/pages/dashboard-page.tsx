import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Wallet, Wrench, Car } from 'lucide-react';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import AnimatedList from '@/components/ui/animated-list';
import AnimatedCard from '@/components/ui/animated-card';
import NotificationIcon from '@/components/notification/notification-icon';
import BottomNavigation from '@/components/ui/bottom-navigation';
import { useNotifications } from '@/contexts/notification-context';
import ApiService from '@/services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [propertyStats, setPropertyStats] = useState({
    total: 0,
    rented: 0,
    available: 0
  });
  const [parkingStats, setParkingStats] = useState({
    total: 0,
    rented: 0,
    available: 0,
    maintenance: 0
  });
  const [tenantStats, setTenantStats] = useState({
    total: 0
  });
  const [financialStats, setFinancialStats] = useState({
    monthlyIncome: 0,
    monthlyExpense: 0,
    netIncome: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // 获取房屋、车位、租客和财务统计数据
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const [propertyStats, parkingStats, tenants, monthlyFinancialStats] = await Promise.all([
          ApiService.getPropertyStatistics(),
          ApiService.getParkingStatistics(),
          ApiService.getAllTenantsWithOptionalLeases(),
          ApiService.getFinancialStatistics({ year: currentYear, month: currentMonth })
        ]);

        setPropertyStats(propertyStats);
        setParkingStats(parkingStats);
        setTenantStats({ total: tenants.length });
        setFinancialStats({
          monthlyIncome: monthlyFinancialStats.total_income || 0,
          monthlyExpense: monthlyFinancialStats.total_expense || 0,
          netIncome: monthlyFinancialStats.net_income || 0
        });
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // 模拟系统通知
  useEffect(() => {
    // 添加一些示例通知
    const demoNotifications = [
      {
        title: '租金到期提醒',
        message: '3号房屋的租金将在3天后到期，请及时提醒租客。',
        type: 'warning',
        time: '刚刚'
      },
      {
        title: '新维修请求',
        message: '7号房屋报告了水管漏水问题，需要尽快处理。',
        type: 'error',
        time: '10分钟前'
      },
      {
        title: '租客入住',
        message: '新租客张先生已成功入住5号房屋。',
        type: 'success',
        time: '今天 09:30'
      },
      {
        title: '系统更新',
        message: '系统已更新到最新版本，新增了多项功能。',
        type: 'info',
        time: '昨天'
      }
    ];

    // 添加通知到通知中心 - 仅在组件首次挂载时执行一次
    const addDemoNotifications = () => {
      demoNotifications.forEach(notification => {
        addNotification({
          title: notification.title,
          message: notification.message,
          type: notification.type as any,
          link: notification.time // 使用 link 属性来存储时间信息
        });
      });
    };

    // 仅在组件首次挂载时执行
    addDemoNotifications();
    
    // 不再显示欢迎提示框
  }, []); // 空依赖数组，确保效果只运行一次

  const handleNotifications = () => {
    navigate('/notifications');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* 顶部导航栏 */}
        <AnimatedContainer animation="slideInFromTopVariants">
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6" />
                <h1 className="text-xl font-bold">房屋租赁管理系统</h1>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationIcon className="text-white hover:bg-blue-700" />
              </div>
            </div>
          </header>
        </AnimatedContainer>

        {/* 主内容区 */}
        <main className="container mx-auto p-4 mt-6">
          <AnimatedContainer animation="fadeInVariants" delay={0.2}>
            <h2 className="text-2xl font-bold mb-6">欢迎回来，管理员</h2>
          </AnimatedContainer>

          {/* 快捷操作按钮 - 小圆形按钮 */}
          <AnimatedContainer animation="fadeInVariants" delay={0.3}>
            <div className="grid grid-cols-5 gap-4 mb-8 max-w-full">
              <AnimatedContainer animation="scaleVariants" delay={0.4}>
                <div className="flex flex-col items-center">
                  <button
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => navigate('/property')}
                    title="房屋管理"
                  >
                    <Building2 className="h-6 w-6 sm:h-7 sm:w-7" />
                  </button>
                  <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">房屋管理</p>
                </div>
              </AnimatedContainer>

              <AnimatedContainer animation="scaleVariants" delay={0.5}>
                <div className="flex flex-col items-center">
                  <button
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => navigate('/parking')}
                    title="车位管理"
                  >
                    <Car className="h-6 w-6 sm:h-7 sm:w-7" />
                  </button>
                  <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">车位管理</p>
                </div>
              </AnimatedContainer>

              <AnimatedContainer animation="scaleVariants" delay={0.6}>
                <div className="flex flex-col items-center">
                  <button
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => navigate('/tenant')}
                    title="租客管理"
                  >
                    <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                  </button>
                  <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">租客管理</p>
                </div>
              </AnimatedContainer>

              <AnimatedContainer animation="scaleVariants" delay={0.7}>
                <div className="flex flex-col items-center">
                  <button
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => navigate('/maintenance')}
                    title="维修管理"
                  >
                    <Wrench className="h-6 w-6 sm:h-7 sm:w-7" />
                  </button>
                  <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">维修管理</p>
                </div>
              </AnimatedContainer>

              <AnimatedContainer animation="scaleVariants" delay={0.8}>
                <div className="flex flex-col items-center">
                  <button
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-600 hover:bg-amber-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => navigate('/finance')}
                    title="财务管理"
                  >
                    <Wallet className="h-6 w-6 sm:h-7 sm:w-7" />
                  </button>
                  <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">财务管理</p>
                </div>
              </AnimatedContainer>
            </div>
          </AnimatedContainer>

          {/* 通知提醒区 */}
          <AnimatedContainer animation="fadeInVariants" delay={0.9}>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">最新通知</h3>
                <Button variant="link" className="text-blue-600" onClick={handleNotifications}>
                  查看全部
                </Button>
              </div>
              <AnimatedCard>
                <CardContent className="p-4">
                  <AnimatedList>
                    {[
                      {
                        id: 1,
                        title: '租金到期提醒',
                        message: '3号房屋的租金将在3天后到期，请及时提醒租客。',
                        time: '刚刚',
                        type: 'warning'
                      },
                      {
                        id: 2,
                        title: '新维修请求',
                        message: '7号房屋报告了水管漏水问题，需要尽快处理。',
                        time: '10分钟前',
                        type: 'error'
                      }
                    ].map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                          <span className="text-xs text-gray-400 mt-1">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </AnimatedList>
                </CardContent>
              </AnimatedCard>
            </div>
          </AnimatedContainer>

          {/* 数据概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <AnimatedContainer animation="slideInFromLeftVariants" delay={1.0}>
              <AnimatedCard>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">房屋总数</CardTitle>
                  <Building2 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '加载中...' : propertyStats.total}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    其中 {isLoading ? '...' : propertyStats.rented} 已出租，{isLoading ? '...' : propertyStats.available} 空置
                  </p>
                </CardContent>
              </AnimatedCard>
            </AnimatedContainer>

            <AnimatedContainer animation="slideInFromLeftVariants" delay={1.1}>
              <AnimatedCard>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">租客总数</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '加载中...' : tenantStats.total}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    实际租客数量
                  </p>
                </CardContent>
              </AnimatedCard>
            </AnimatedContainer>

            <AnimatedContainer animation="slideInFromLeftVariants" delay={1.2}>
              <AnimatedCard>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">本月收入</CardTitle>
                  <Wallet className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{financialStats.monthlyIncome.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    本月收入统计
                  </p>
                </CardContent>
              </AnimatedCard>
            </AnimatedContainer>

            <AnimatedContainer animation="slideInFromLeftVariants" delay={1.3}>
              <AnimatedCard onClick={() => navigate('/maintenance')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">待处理维修</CardTitle>
                  <Wrench className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-gray-500 mt-1">
                    1 个紧急维修请求
                  </p>
                </CardContent>
              </AnimatedCard>
            </AnimatedContainer>

            {/* 车位统计数据卡片 */}
            <AnimatedContainer animation="slideInFromLeftVariants" delay={1.4}>
              <AnimatedCard onClick={() => navigate('/parking')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">车位总数</CardTitle>
                  <Car className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '加载中...' : parkingStats.total}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    其中 {isLoading ? '...' : parkingStats.rented} 已出租，{isLoading ? '...' : parkingStats.available} 空置
                  </p>
                </CardContent>
              </AnimatedCard>
            </AnimatedContainer>


          </div>
        </main>
        
        {/* 底部导航栏 */}
        <BottomNavigation />

        {/* 底部版权信息 - 添加底部padding以避免被导航栏遮挡 */}
        <AnimatedContainer animation="fadeInVariants" delay={1.4}>
          <footer className="mt-6 py-4 border-t pb-16">
            <div className="container mx-auto text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} 房屋租赁管理系统 - 版权所有
            </div>
          </footer>
        </AnimatedContainer>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;