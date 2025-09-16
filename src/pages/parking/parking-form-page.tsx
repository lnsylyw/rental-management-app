import React from 'react';
import { useParams } from 'react-router-dom';
import { Car } from 'lucide-react';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import ParkingForm from '@/components/parking/parking-form';

const ParkingFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  return (
    <div className="bg-gray-50">
      {/* 顶部导航栏 */}
      <PageHeader
        title={isEditMode ? '编辑车位' : '添加车位'}
        icon={Car}
        backgroundColor="bg-purple-600"
        backPath="/parking"
      />

      {/* 主内容区 */}
      <main className={`container mx-auto ${PAGE_HEADER_TOP_SPACING}`}>
        <ParkingForm editMode={isEditMode} />
      </main>
    </div>
  );
};

export default ParkingFormPage;
