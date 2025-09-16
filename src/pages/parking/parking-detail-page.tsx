import React from 'react';
import { Car } from 'lucide-react';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import ParkingDetail from '@/components/parking/parking-detail';

const ParkingDetailPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 顶部导航栏 */}
        <PageHeader
          title="车位详情"
          icon={Car}
          backgroundColor="bg-purple-600"
          backPath="/parking"
        />

        {/* 主内容区 */}
        <AnimatedContainer animation="fadeInVariants" delay={0.2}>
          <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING}`}>
            <ParkingDetail />
          </main>
        </AnimatedContainer>
      </div>
    </PageTransition>
  );
};

export default ParkingDetailPage;
