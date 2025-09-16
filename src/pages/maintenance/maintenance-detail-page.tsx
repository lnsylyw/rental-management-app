import React from 'react';
import { useParams } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import BottomNavigation from '@/components/ui/bottom-navigation';
import MaintenanceDetail from '@/components/maintenance/maintenance-detail';

const MaintenanceDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <PageHeader
        title="维修详情"
        icon={Wrench}
        backgroundColor="bg-red-600"
        backPath="/maintenance"
      />

      {/* 主内容区 */}
      <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING}`}>
        <MaintenanceDetail />
      </main>

      {/* 底部导航栏 */}
      <BottomNavigation />
    </div>
  );
};

export default MaintenanceDetailPage;