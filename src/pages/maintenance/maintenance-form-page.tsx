import React from 'react';
import { useParams } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import MaintenanceForm from '@/components/maintenance/maintenance-form';

const MaintenanceFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  return (
    <div className="bg-gray-50">
      {/* 顶部导航栏 */}
      <PageHeader
        title={isEditMode ? '编辑维修请求' : '添加维修请求'}
        icon={Wrench}
        backgroundColor="bg-red-600"
        backPath="/maintenance"
      />

      {/* 主内容区 */}
      <main className={`container mx-auto ${PAGE_HEADER_TOP_SPACING}`}>
        <MaintenanceForm editMode={isEditMode} />
      </main>
    </div>
  );
};

export default MaintenanceFormPage;