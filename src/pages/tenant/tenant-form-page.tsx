import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import TenantForm from '@/components/tenant/tenant-form';
import ApiService from '@/services/api';

const TenantFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [tenantData, setTenantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 编辑模式下获取租客详细信息
  useEffect(() => {
    if (isEditMode && id) {
      const fetchTenantData = async () => {
        try {
          setIsLoading(true);
          const data = await ApiService.getTenant(parseInt(id));
          setTenantData(data);
        } catch (error) {
          console.error('获取租客数据失败:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTenantData();
    }
  }, [isEditMode, id]);

  if (isLoading) {
    return (
      <div className="bg-gray-50">
        <PageHeader
          title="编辑租客"
          icon={Users}
          backgroundColor="bg-green-600"
          backPath="/tenant"
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* 顶部导航栏 */}
      <PageHeader
        title={isEditMode ? '编辑租客' : '添加租客'}
        icon={Users}
        backgroundColor="bg-green-600"
        backPath="/tenant"
      />

      {/* 主内容区 */}
      <main className={`container mx-auto ${PAGE_HEADER_TOP_SPACING}`}>
        <TenantForm editMode={isEditMode} tenantData={tenantData} />
      </main>
    </div>
  );
};

export default TenantFormPage;