import React from 'react';
import { FileText } from 'lucide-react';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import BottomNavigation from '@/components/ui/bottom-navigation';
import NotificationIcon from '@/components/notification/notification-icon';
import ContractList from '@/components/contract/contract-list';

const ContractPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 顶部导航栏 */}
        <PageHeader
          title="合同管理"
          icon={FileText}
          backgroundColor="bg-green-600"
          backPath="/dashboard"
        >
          <NotificationIcon className="text-white hover:bg-green-700" />
        </PageHeader>

        {/* 主内容区 */}
        <AnimatedContainer animation="fadeInVariants" delay={0.2}>
          <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING}`}>
            <ContractList />
          </main>
        </AnimatedContainer>
        
        {/* 底部导航栏 */}
        <BottomNavigation />
      </div>
    </PageTransition>
  );
};

export default ContractPage;
