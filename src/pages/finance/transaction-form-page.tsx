import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import TransactionForm from '@/components/finance/transaction-form';
import ApiService from '@/services/api';

const TransactionFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [transactionData, setTransactionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 编辑模式下获取交易详细信息
  useEffect(() => {
    if (isEditMode && id) {
      const fetchTransactionData = async () => {
        try {
          setIsLoading(true);
          console.log('获取交易数据，ID:', id);
          const data = await ApiService.getTransaction(parseInt(id));
          console.log('获取到的交易数据:', data);
          setTransactionData(data);
        } catch (error) {
          console.error('获取交易数据失败:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTransactionData();
    }
  }, [isEditMode, id]);

  if (isLoading) {
    return (
      <div className="bg-gray-50">
        <PageHeader
          title="编辑交易"
          icon={Wallet}
          backgroundColor="bg-amber-600"
          backPath="/finance?tab=transactions"
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <span className="ml-2 text-lg text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* 顶部导航栏 */}
      <PageHeader
        title={isEditMode ? '编辑交易' : '添加交易'}
        icon={Wallet}
        backgroundColor="bg-amber-600"
        backPath="/finance?tab=transactions"
      />

      {/* 主内容区 */}
      <main className={`container mx-auto ${PAGE_HEADER_TOP_SPACING}`}>
        <TransactionForm editMode={isEditMode} transactionData={transactionData} />
      </main>
    </div>
  );
};

export default TransactionFormPage;