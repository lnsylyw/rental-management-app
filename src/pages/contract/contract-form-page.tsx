import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import ContractForm from '@/components/contract/contract-form';
import ApiService from '@/services/api';

const ContractFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [contractData, setContractData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const isEditMode = !!id;
  const isRenewal = searchParams.get('renewal') === 'true';
  const originalContractId = searchParams.get('originalId');

  // 获取合同数据（编辑模式）
  useEffect(() => {
    if (isEditMode && id) {
      const fetchContractData = async () => {
        try {
          setIsLoading(true);
          const data = await ApiService.getLease(parseInt(id));
          setContractData(data);
        } catch (error) {
          console.error('获取合同数据失败:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchContractData();
    }
  }, [isEditMode, id]);

  // 获取原合同数据（续租模式）
  useEffect(() => {
    if (isRenewal && originalContractId) {
      const fetchOriginalContractData = async () => {
        try {
          setIsLoading(true);
          const data = await ApiService.getLease(parseInt(originalContractId));
          // 为续租预填充数据，保留原始日期用于计算，但表单中的日期会被自动计算覆盖
          setContractData({
            ...data,
            // 保留原始日期用于计算新日期
            original_lease_start: data.lease_start,
            original_lease_end: data.lease_end,
            // 清空表单日期，让自动计算填充
            lease_start: '',
            lease_end: '',
            status: '生效中',
            notes: `续租合同（原合同ID: ${originalContractId}）`
          });
        } catch (error) {
          console.error('获取原合同数据失败:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOriginalContractData();
    }
  }, [isRenewal, originalContractId]);

  const getPageTitle = () => {
    if (isRenewal) return '续租合同';
    if (isEditMode) return '编辑合同';
    return '添加合同';
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="bg-gray-50">
          <PageHeader
            title={getPageTitle()}
            icon={FileText}
            backgroundColor="bg-green-600"
            backPath="/contracts"
          />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="bg-gray-50">
        {/* 顶部导航栏 */}
        <PageHeader
          title={getPageTitle()}
          icon={FileText}
          backgroundColor="bg-green-600"
          backPath="/contracts"
        />

        {/* 主内容区 */}
        <AnimatedContainer animation="fadeInVariants" delay={0.2}>
          <main className={`container mx-auto ${PAGE_HEADER_TOP_SPACING}`}>
            <ContractForm 
              editMode={isEditMode}
              contractData={contractData}
              isRenewal={isRenewal}
              originalContractId={originalContractId ? parseInt(originalContractId) : undefined}
            />
          </main>
        </AnimatedContainer>
      </div>
    </PageTransition>
  );
};

export default ContractFormPage;
