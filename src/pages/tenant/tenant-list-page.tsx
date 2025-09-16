import TenantList from '@/components/tenant/tenant-list';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import BottomNavigation from '@/components/ui/bottom-navigation';
import { Users } from 'lucide-react';
import NotificationIcon from '@/components/notification/notification-icon';

const TenantListPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* 顶部导航栏 */}
        <PageHeader
          title="租客管理"
          icon={Users}
          backgroundColor="bg-green-600"
          backPath="/dashboard"
        >
          <NotificationIcon className="text-white hover:bg-green-700" />
        </PageHeader>

        {/* 主内容区 */}
        <AnimatedContainer animation="fadeInVariants" delay={0.2}>
          <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING}`}>
            <TenantList />
          </main>
        </AnimatedContainer>

        {/* 底部导航栏 */}
        <BottomNavigation />
      </div>
    </PageTransition>
  );
};

export default TenantListPage;