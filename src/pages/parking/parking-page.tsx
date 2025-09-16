import React from 'react';
import { Car } from 'lucide-react';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import BottomNavigation from '@/components/ui/bottom-navigation';
import NotificationIcon from '@/components/notification/notification-icon';
import ParkingList from '@/components/parking/parking-list';

const ParkingPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 顶部导航栏 */}
        <PageHeader
          title="车位管理"
          icon={Car}
          backgroundColor="bg-purple-600"
          backPath="/dashboard"
        >
          <NotificationIcon className="text-white hover:bg-purple-700" />
        </PageHeader>

        {/* 主内容区 */}
        <AnimatedContainer animation="fadeInVariants" delay={0.2}>
          <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING}`}>
            <ParkingList />
          </main>
        </AnimatedContainer>

        {/* 底部导航栏 */}
        <BottomNavigation />
      </div>
    </PageTransition>
  );
};

export default ParkingPage;
