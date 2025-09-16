import React from 'react';
import { FileText } from 'lucide-react';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import NotificationIcon from '@/components/notification/notification-icon';
import ContractDetail from '@/components/contract/contract-detail';

const ContractDetailPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="合同详情"
        icon={FileText}
        backgroundColor="bg-green-600"
        backPath="/contracts"
      >
        <NotificationIcon />
      </PageHeader>

      <PageTransition>
        <AnimatedContainer>
          <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING}`}>
            <ContractDetail />
          </main>
        </AnimatedContainer>
      </PageTransition>
    </div>
  );
};

export default ContractDetailPage;
