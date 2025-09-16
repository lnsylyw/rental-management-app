import { useParams } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import PropertyForm from '@/components/property/property-form';

const PropertyFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  return (
    <div className="bg-gray-50">
      {/* 顶部导航栏 */}
      <PageHeader
        title={isEditMode ? '编辑房屋' : '添加房屋'}
        icon={Building2}
        backgroundColor="bg-blue-600"
        backPath="/property"
      />

      {/* 主内容区 */}
      <main className={`container mx-auto ${PAGE_HEADER_TOP_SPACING}`}>
        <PropertyForm editMode={isEditMode} />
      </main>
    </div>
  );
};

export default PropertyFormPage;