import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Loader2, Calendar } from 'lucide-react';
import ApiService from '@/services/api';

const FinanceOverview = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 时间筛选相关状态
  const [dateFilter, setDateFilter] = useState('本月');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // 获取交易数据
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);

        // 构建查询参数
        const params: any = {};
        const now = new Date();

        if (dateFilter === '本月') {
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          params.start_date = firstDay.toISOString().split('T')[0];
        } else if (dateFilter === '上月') {
          const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
          params.start_date = firstDay.toISOString().split('T')[0];
          params.end_date = lastDay.toISOString().split('T')[0];
        } else if (dateFilter === '本季度') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const firstDay = new Date(now.getFullYear(), currentQuarter * 3, 1);
          params.start_date = firstDay.toISOString().split('T')[0];
        } else if (dateFilter === '本年') {
          const firstDay = new Date(now.getFullYear(), 0, 1);
          params.start_date = firstDay.toISOString().split('T')[0];
        } else if (dateFilter === '自定义') {
          if (customStartDate) params.start_date = customStartDate;
          if (customEndDate) params.end_date = customEndDate;
        }

        const data = await ApiService.getTransactions(params);
        setTransactions(data || []);
        setError(null);
      } catch (err: any) {
        console.error('获取交易数据失败:', err);
        setError('获取交易数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [dateFilter, customStartDate, customEndDate]);

  // 获取当前筛选时间范围的描述
  const getDateRangeDescription = () => {
    const now = new Date();

    switch (dateFilter) {
      case '本月':
        return `${now.getFullYear()}年${now.getMonth() + 1}月`;
      case '上月':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return `${lastMonth.getFullYear()}年${lastMonth.getMonth() + 1}月`;
      case '本季度':
        const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
        return `${now.getFullYear()}年第${currentQuarter}季度`;
      case '本年':
        return `${now.getFullYear()}年`;
      case '自定义':
        if (customStartDate && customEndDate) {
          return `${customStartDate} 至 ${customEndDate}`;
        } else if (customStartDate) {
          return `${customStartDate} 至今`;
        } else if (customEndDate) {
          return `至 ${customEndDate}`;
        }
        return '自定义时间范围';
      default:
        return '全部时间';
    }
  };

  // 判断交易类型
  const isIncome = (transaction: any) => {
    const type = transaction.type || transaction.transaction_type || '';
    return type === '收入' || type === 'INCOME' || type === 'income';
  };

  const isExpense = (transaction: any) => {
    const type = transaction.type || transaction.transaction_type || '';
    return type === '支出' || type === 'EXPENSE' || type === 'expense';
  };

  // 计算财务统计数据
  const calculateFinanceData = () => {
    const totalIncome = transactions
      .filter(t => isIncome(t))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpense = transactions
      .filter(t => isExpense(t))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netIncome = totalIncome - totalExpense;

    // 按分类统计收入
    const incomeByCategory = transactions
      .filter(t => isIncome(t))
      .reduce((acc, t) => {
        const category = t.category || '其他';
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    // 按分类统计支出
    const expenseByCategory = transactions
      .filter(t => isExpense(t))
      .reduce((acc, t) => {
        const category = t.category || '其他';
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    // 转换为数组格式并计算百分比
    const incomeCategories = Object.entries(incomeByCategory).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    const expenseCategories = Object.entries(expenseByCategory).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpense,
      netIncome,
      incomeCategories,
      expenseCategories
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-lg text-gray-600">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const financeData = calculateFinanceData();
  return (
    <div className="space-y-6">
      {/* 时间筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            时间筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="dateFilter">时间范围</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择时间范围" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="本月">本月</SelectItem>
                    <SelectItem value="上月">上月</SelectItem>
                    <SelectItem value="本季度">本季度</SelectItem>
                    <SelectItem value="本年">本年</SelectItem>
                    <SelectItem value="自定义">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 自定义日期范围 */}
            {dateFilter === '自定义' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="startDate">开始日期</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endDate">结束日期</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 财务概览卡片 */}
      <div className="space-y-4">
        {/* 时间范围提示 */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-700">
            {getDateRangeDescription()} 财务概览
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {transactions.length} 笔交易记录
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总收入</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{financeData.totalIncome.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                共 {transactions.filter(t => isIncome(t)).length} 笔收入
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总支出</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{financeData.totalExpense.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                共 {transactions.filter(t => isExpense(t)).length} 笔支出
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">净收入</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${financeData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {financeData.netIncome >= 0 ? '+' : ''}¥{financeData.netIncome.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {financeData.totalIncome > 0 ? (
                  <>占总收入 <span className="text-blue-600">{((financeData.netIncome / financeData.totalIncome) * 100).toFixed(1)}%</span></>
                ) : (
                  '暂无收入数据'
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 分类统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 收入分类 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-2" />
              收入分类
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financeData.incomeCategories.length > 0 ? (
              <div className="space-y-3">
                {financeData.incomeCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">¥{category.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">暂无收入数据</p>
            )}
          </CardContent>
        </Card>

        {/* 支出分类 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowDownRight className="h-4 w-4 text-red-600 mr-2" />
              支出分类
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financeData.expenseCategories.length > 0 ? (
              <div className="space-y-3">
                {financeData.expenseCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">¥{category.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">暂无支出数据</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceOverview;