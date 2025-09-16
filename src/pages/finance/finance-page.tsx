import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinanceOverview from '@/components/finance/finance-overview';
import TransactionList from '@/components/finance/transaction-list';
import DepositStatus from '@/components/finance/deposit-status';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import BottomNavigation from '@/components/ui/bottom-navigation';
import { Wallet } from 'lucide-react';
import NotificationIcon from '@/components/notification/notification-icon';

const FinancePage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  // 根据URL参数设置默认标签页
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'transactions' || tab === 'overview' || tab === 'deposits') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 顶部导航栏 */}
        <PageHeader
          title="财务管理"
          icon={Wallet}
          backgroundColor="bg-amber-600"
          backPath="/dashboard"
        >
          <NotificationIcon className="text-white hover:bg-amber-700" />
        </PageHeader>

        {/* 主内容区 */}
        <AnimatedContainer animation="fadeInVariants" delay={0.2}>
          <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING}`}>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">财务概览</TabsTrigger>
                <TabsTrigger value="transactions">交易记录</TabsTrigger>
                <TabsTrigger value="deposits">押金收取</TabsTrigger>
              </TabsList>
              
              <AnimatedContainer 
                animation="fadeInVariants" 
                delay={0.3} 
                isVisible={activeTab === 'overview'}
              >
                <TabsContent value="overview">
                  <FinanceOverview />
                </TabsContent>
              </AnimatedContainer>
              
              <AnimatedContainer
                animation="fadeInVariants"
                delay={0.3}
                isVisible={activeTab === 'transactions'}
              >
                <TabsContent value="transactions">
                  <TransactionList />
                </TabsContent>
              </AnimatedContainer>

              <AnimatedContainer
                animation="fadeInVariants"
                delay={0.3}
                isVisible={activeTab === 'deposits'}
              >
                <TabsContent value="deposits">
                  <DepositStatus />
                </TabsContent>
              </AnimatedContainer>
            </Tabs>
          </main>
        </AnimatedContainer>

        {/* 底部导航栏 */}
        <BottomNavigation />
      </div>
    </PageTransition>
  );
};

export default FinancePage;