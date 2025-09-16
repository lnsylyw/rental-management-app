import MaintenanceList from '@/components/maintenance/maintenance-list';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import BottomNavigation from '@/components/ui/bottom-navigation';
import { Wrench } from 'lucide-react';
import NotificationIcon from '@/components/notification/notification-icon';

const MaintenancePage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 顶部导航栏 */}
        <PageHeader
          title="维修管理"
          icon={Wrench}
          backgroundColor="bg-red-600"
          backPath="/dashboard"
        >
          <NotificationIcon className="text-white hover:bg-red-700" />
        </PageHeader>

        {/* 主内容区 */}
        <AnimatedContainer animation="fadeInVariants" delay={0.2}>
          <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING} pb-20`}>
            <MaintenanceList />
          </main>
        </AnimatedContainer>
        
        {/* 底部导航栏 */}
        <BottomNavigation />
      </div>
    </PageTransition>
  );
};

export default MaintenancePage;