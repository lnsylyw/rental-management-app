import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, User, Home, Calendar, DollarSign } from 'lucide-react';
import ApiService from '@/services/api';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface DepositRecord {
  id: number;
  tenant_name: string;
  property_name: string;
  property_address: string;
  amount: number;
  transaction_date: string;
  description?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  lease_contract_number?: string;
}

const DepositStatus = () => {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchDepositRecords();
  }, []);

  useEffect(() => {
    // 搜索过滤
    const filtered = deposits.filter(deposit =>
      deposit.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.property_address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDeposits(filtered);
    
    // 计算总金额
    const total = filtered.reduce((sum, deposit) => sum + deposit.amount, 0);
    setTotalAmount(total);
  }, [deposits, searchTerm]);

  const fetchDepositRecords = async () => {
    try {
      setLoading(true);
      // 获取所有押金收入交易
      const transactions = await ApiService.getTransactions();

      // 检查响应数据结构
      if (!transactions || !Array.isArray(transactions)) {
        console.error('API响应数据格式错误:', transactions);
        setDeposits([]);
        return;
      }

      // 过滤出押金收入交易
      const depositTransactions = transactions.filter((transaction: any) =>
        transaction.category === '押金' && transaction.transaction_type === '收入'
      );

      // 转换数据格式
      const depositRecords: DepositRecord[] = depositTransactions.map((transaction: any) => ({
        id: transaction.id,
        tenant_name: transaction.tenant_name || '未知租户',
        property_name: transaction.property_name || '未知房屋',
        property_address: transaction.property_address || '',
        amount: transaction.amount,
        transaction_date: transaction.transaction_date,
        description: transaction.description,
        lease_start_date: transaction.lease_start_date,
        lease_end_date: transaction.lease_end_date,
      }));

      setDeposits(depositRecords);
    } catch (error) {
      console.error('获取押金记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['租户姓名', '房屋名称', '房屋地址', '押金金额', '收取日期', '备注'];
    const csvContent = [
      headers.join(','),
      ...filteredDeposits.map(deposit => [
        deposit.tenant_name,
        deposit.property_name,
        deposit.property_address,
        deposit.amount,
        format(new Date(deposit.transaction_date), 'yyyy-MM-dd'),
        deposit.description || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `押金收取情况_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-1">
      {/* 统计卡片 - 移动端优化 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex flex-col items-center text-center">
            <DollarSign className="h-6 w-6 mb-2 opacity-90" />
            <p className="text-sm opacity-90 mb-1">押金总额</p>
            <p className="text-xl font-bold leading-tight">¥{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex flex-col items-center text-center">
            <User className="h-6 w-6 mb-2 opacity-90" />
            <p className="text-sm opacity-90 mb-1">收取笔数</p>
            <p className="text-xl font-bold leading-tight">{filteredDeposits.length}笔</p>
          </div>
        </div>
      </div>

      {/* 搜索和导出 - 移动端优化 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">押金记录</h2>
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            导出
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索租户或房屋..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-xl"
          />
        </div>
      </div>
      {/* 记录列表 - 移动端卡片风格 */}
      {filteredDeposits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium mb-2">
            {searchTerm ? '没有找到匹配的押金记录' : '暂无押金收取记录'}
          </p>
          <p className="text-sm text-gray-400">
            {searchTerm ? '尝试调整搜索条件' : '押金收取记录将在这里显示'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeposits.map((deposit) => (
            <div key={deposit.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* 卡片头部 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{deposit.tenant_name || '未知租户'}</p>
                      <p className="text-xs text-gray-600">{deposit.property_name || '未知房屋'}</p>
                      {deposit.lease_contract_number && (
                        <p className="text-xs text-blue-600">合同: {deposit.lease_contract_number}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">¥{deposit.amount.toLocaleString()}</p>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                      押金收入
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 卡片内容 */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Home className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">房屋地址</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {deposit.property_address || '未知地址'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">收取日期</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(deposit.transaction_date), 'yyyy年MM月dd日', { locale: zhCN })}
                    </p>
                  </div>
                </div>

                {deposit.description && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">备注</p>
                    <p className="text-sm text-gray-700">{deposit.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepositStatus;
