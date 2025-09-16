import React from 'react';
import { useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import BottomNavigation from '@/components/ui/bottom-navigation';
import TenantDetail from '@/components/tenant/tenant-detail';

const TenantDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <PageHeader
        title="租客详情"
        icon={Users}
        backgroundColor="bg-green-600"
        backPath="/tenant"
      />

      {/* 主内容区 */}
      <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING}`}>
        <TenantDetail />
      </main>
    </div>
  );
};

export default TenantDetailPage;