import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpRight, ArrowDownRight, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

const TransactionList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState('本月');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 获取房屋数据、租赁合同数据和车位数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesData, leasesData, parkingSpacesData] = await Promise.all([
          ApiService.getProperties(),
          ApiService.getLeases(),
          ApiService.getParkingSpaces()
        ]);
        setProperties(propertiesData || []);
        setLeases(leasesData || []);
        setParkingSpaces(parkingSpacesData || []);
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchData();
  }, []);

  // 获取交易列表数据
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        // 根据日期筛选构建查询参数
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

        // 调试：检查第二条记录的完整信息
        if (data && data.length >= 2) {
          console.log('第二条记录完整信息:', data[1]);
        }



        // 按交款日期倒序排序
        const sortedData = (data || []).sort((a: any, b: any) => {
          const dateA = new Date(a.date || a.transaction_date || a.created_at || 0);
          const dateB = new Date(b.date || b.transaction_date || b.created_at || 0);
          return dateB.getTime() - dateA.getTime(); // 倒序排序（最新的在前）
        });



        setTransactions(sortedData);
        setError(null);
      } catch (err: any) {
        console.error('获取交易列表失败:', err);
        setError('获取交易列表失败，请稍后重试');
        toast({
          title: '数据加载失败',
          description: err.message || '无法加载交易数据，请检查网络连接',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [dateFilter, customStartDate, customEndDate, toast]);

  // 获取房屋或车位信息
  const getLocationInfo = (transaction: any) => {
    // 收入交易：通过 lease_id 和租赁合同获取信息
    if (isIncome(transaction) && transaction.lease_id && leases.length) {
      const lease = leases.find(l => l.id === transaction.lease_id);
      if (!lease) return null;

      // 根据租赁类型返回不同信息
      if (lease.lease_type === 'property' && lease.property_id && properties.length) {
        const property = properties.find(p => p.id === lease.property_id);
        return property ? { type: 'property', name: property.name } : null;
      }

      if (lease.lease_type === 'parking' && lease.parking_space_id && parkingSpaces.length) {
        const parkingSpace = parkingSpaces.find(ps => ps.id === lease.parking_space_id);
        return parkingSpace ? { type: 'parking', name: parkingSpace.name } : null;
      }
    }

    // 支出交易：直接通过 property_id 获取房屋信息
    if (isExpense(transaction) && transaction.property_id && properties.length) {
      const property = properties.find(p => p.id === transaction.property_id);
      return property ? { type: 'property', name: property.name } : null;
    }

    return null;
  };

  // 根据搜索词和类型过滤交易
  const filteredTransactions = transactions.filter(transaction => {
    // 搜索词筛选
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.property?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.tenant?.toLowerCase().includes(searchTerm.toLowerCase());

    // 类型筛选 - 需要处理前端显示名称和后端存储名称的映射
    let matchesCategory = categoryFilter === '全部';

    if (!matchesCategory) {
      // 前端显示名称到后端存储名称的映射
      const categoryMapping: { [key: string]: string[] } = {
        '租金收入': ['租金', '租金收入'],
        '押金收入': ['押金', '押金收入'],
        '维修费用': ['维修费', '维修费用'],
        '物业费': ['物业费'],
        '水电费': ['水电费'],
        '税费': ['税费'],
        '保险费': ['保险费'],
        '中介费': ['中介费'],
        '装修费': ['装修费'],
        '采暖费': ['采暖费'],
        '退押金': ['退押金'],
        '其他': ['其他', '其他收入', '其他支出']
      };

      const mappedCategories = categoryMapping[categoryFilter] || [categoryFilter];
      matchesCategory = mappedCategories.includes(transaction.category);
    }

    return matchesSearch && matchesCategory;
  });

  // 根据标签过滤交易
  const getFilteredTransactionsByTab = () => {
    if (activeTab === 'all') return filteredTransactions;
    if (activeTab === 'income') {
      return filteredTransactions.filter(transaction => isIncome(transaction));
    }
    if (activeTab === 'expense') {
      return filteredTransactions.filter(transaction => isExpense(transaction));
    }
    return filteredTransactions;
  };

  // 获取交易类型（兼容不同字段名）
  const getTransactionType = (transaction: any) => {
    return transaction.type || transaction.transaction_type || '';
  };

  // 判断是否为收入
  const isIncome = (transaction: any) => {
    const type = getTransactionType(transaction);
    // 支持多种格式：中文值、英文枚举名、英文小写
    return type === '收入' || type === 'INCOME' || type === 'income';
  };

  // 判断是否为支出
  const isExpense = (transaction: any) => {
    const type = getTransactionType(transaction);
    // 支持多种格式：中文值、英文枚举名、英文小写
    return type === '支出' || type === 'EXPENSE' || type === 'expense';
  };

  // 格式化日期显示 - 显示完整的年月日
  const formatDate = (transaction: any) => {
    const dateStr = transaction.date || transaction.transaction_date || transaction.created_at;
    if (!dateStr) return '未知日期';

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateStr;
    }
  };

  // 获取类型对应的颜色
  const getTypeColor = (transaction: any) => {
    if (isIncome(transaction)) {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (isExpense(transaction)) {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    } else {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // 获取类型对应的图标
  const getTypeIcon = (transaction: any) => {
    if (isIncome(transaction)) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    } else if (isExpense(transaction)) {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    } else {
      return <ArrowUpRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const displayTransactions = getFilteredTransactionsByTab();

  return (
    <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
      {/* 搜索和筛选区 */}
      <div className="space-y-2">
        {/* 第一行：搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="搜索交易记录..."
            className="pl-10 h-10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 第二行：时间和类型筛选 */}
        <div className="flex gap-2">
          {/* 时间筛选 */}
          <Select
            value={dateFilter}
            onValueChange={setDateFilter}
          >
            <SelectTrigger className="flex-1 h-10 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              <SelectValue placeholder="选择时间" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="本月">本月</SelectItem>
              <SelectItem value="上月">上月</SelectItem>
              <SelectItem value="本季度">本季度</SelectItem>
              <SelectItem value="本年">本年</SelectItem>
              <SelectItem value="自定义">自定义</SelectItem>
            </SelectContent>
          </Select>

          {/* 类型筛选 */}
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="flex-1 h-10 text-sm">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="全部">全部</SelectItem>
              {/* 收入类别 */}
              <SelectItem value="租金收入">租金收入</SelectItem>
              <SelectItem value="押金收入">押金收入</SelectItem>
              {/* 支出类别 */}
              <SelectItem value="维修费用">维修费用</SelectItem>
              <SelectItem value="物业费">物业费</SelectItem>
              <SelectItem value="水电费">水电费</SelectItem>
              <SelectItem value="税费">税费</SelectItem>
              <SelectItem value="保险费">保险费</SelectItem>
              <SelectItem value="中介费">中介费</SelectItem>
              <SelectItem value="装修费">装修费</SelectItem>
              <SelectItem value="采暖费">采暖费</SelectItem>
              <SelectItem value="退押金">退押金</SelectItem>
              {/* 通用类别 */}
              <SelectItem value="其他">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 自定义日期范围选择器 - 仅在选择自定义时显示 */}
      {dateFilter === '自定义' && (
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 space-y-3">
              <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                自定义时间范围
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">开始日期</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-10 text-sm"
                    placeholder="选择开始日期"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">结束日期</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-10 text-sm"
                    placeholder="选择结束日期"
                  />
                </div>
              </div>
              {/* 快速选择按钮 - 手机端友好 */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setCustomStartDate(lastWeek.toISOString().split('T')[0]);
                    setCustomEndDate(today.toISOString().split('T')[0]);
                  }}
                >
                  最近7天
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    setCustomStartDate(lastMonth.toISOString().split('T')[0]);
                    setCustomEndDate(today.toISOString().split('T')[0]);
                  }}
                >
                  最近30天
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                >
                  清除
                </Button>
              </div>
            </div>
      )}

      {/* 类型选项卡 */}
      <div className="flex bg-gray-100 rounded-lg p-1 h-10">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-none sm:min-w-[60px] ${
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-none sm:min-w-[60px] ${
                activeTab === 'income'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              收入
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-none sm:min-w-[60px] ${
                activeTab === 'expense'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              支出
            </button>
          </div>

      {/* 交易列表内容 */}
      <div className="space-y-3 mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-2 text-lg text-gray-600">加载中...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              重试
            </Button>
          </div>
        ) : displayTransactions.length > 0 ? (
          displayTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/finance/${transaction.id}`)}
              >
                <CardContent className="p-0">
                  <div className="p-3">
                    {/* 主要信息：图标+标签、描述、金额 */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 min-w-0">
                        {/* 左侧：图标和类型标签 */}
                        <div className="flex flex-col items-center mr-3 flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 ${isIncome(transaction) ? 'bg-green-100' : isExpense(transaction) ? 'bg-red-100' : 'bg-gray-100'}`}>
                            {getTypeIcon(transaction)}
                          </div>
                          <Badge className={`${getTypeColor(transaction)} text-xs`}>
                            {transaction.category}
                          </Badge>
                        </div>

                        {/* 中间：描述和位置信息 */}
                        <div className="flex-1 min-w-0">
                          {/* 交易描述 */}
                          <h3 className="text-sm font-semibold text-gray-900 truncate pr-2 mb-2">
                            {transaction.description}
                          </h3>

                          {/* 位置信息 */}
                          <div>
                            {(() => {
                              const locationInfo = getLocationInfo(transaction);
                              if (!locationInfo) return null;

                              const icon = locationInfo.type === 'property' ? '🏠' : '🚗';
                              const bgColor = locationInfo.type === 'property' ? 'bg-blue-50' : 'bg-green-50';
                              const textColor = locationInfo.type === 'property' ? 'text-blue-600' : 'text-green-600';

                              return (
                                <span className={`text-xs ${textColor} ${bgColor} px-2 py-0.5 rounded-full`}>
                                  {icon} {locationInfo.name}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* 右侧：金额和日期 */}
                      <div className="flex-shrink-0 ml-3 text-right">
                        <div className={`text-base font-bold ${isIncome(transaction) ? 'text-green-600' : isExpense(transaction) ? 'text-red-600' : 'text-gray-600'}`}>
                          {isIncome(transaction) ? '+' : isExpense(transaction) ? '-' : ''}¥{Math.abs(transaction.amount)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(transaction)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">没有找到匹配的交易记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;