import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Home, Car } from 'lucide-react';
import ApiService from '@/services/api';

interface TransactionFormProps {
  editMode?: boolean;
  transactionData?: any;
}

interface PaymentSchedule {
  id: number;
  lease_id: number;
  period_number: number;
  period_start_date: string;
  period_end_date: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  status: string; // 未付款、已付款、逾期
  notes?: string;
}

interface Contract {
  id: number;
  tenant_id: number;
  property_id?: number;
  parking_space_id?: number;
  lease_type: 'property' | 'parking';
  monthly_rent: number;
  total_contract_amount: number; // 合同总金额（应收租金）
  payment_method: string;
  status: string;
  tenant_name: string;
  tenant_phone: string;
  property_name?: string;
  parking_space_name?: string;
  lease_start: string;
  lease_end: string;
  total_rent_received: number;
  expected_rent: number;
  unpaid_rent: number;
  months_elapsed: number;
  payment_completion_rate: number;
  has_unpaid_rent: boolean;
  payment_schedules?: PaymentSchedule[];
}

const TransactionForm = ({ editMode = false, transactionData = null }: TransactionFormProps) => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    type: editMode && transactionData ? transactionData.transaction_type || transactionData.type : '收入',
    category: editMode && transactionData ? transactionData.category : '',
    amount: editMode && transactionData ? transactionData.amount.toString() : '',
    date: editMode && transactionData ?
      (transactionData.transaction_date || transactionData.date || '').split('T')[0] :
      new Date().toISOString().split('T')[0],
    propertyId: editMode && transactionData ?
      (transactionData.property_id ? `property-${transactionData.property_id}` : 'none') : 'none',
    tenantId: editMode && transactionData ?
      (transactionData.tenant_id ? transactionData.tenant_id.toString() : 'none') : 'none',
    contractId: editMode && transactionData ?
      (transactionData.lease_id ? transactionData.lease_id.toString() : 'none') : 'none',
    leaseId: editMode && transactionData ?
      (transactionData.lease_id ? transactionData.lease_id.toString() : 'none') : 'none',
    paymentScheduleId: editMode && transactionData ?
      (transactionData.payment_schedule_id ? transactionData.payment_schedule_id.toString() : 'none') : 'none',
    description: editMode && transactionData ? transactionData.description || '' : '',
    isRentPayment: false, // 是否为租金收款
    allowAmountEdit: false, // 是否允许编辑金额
  });

  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedPaymentSchedule, setSelectedPaymentSchedule] = useState<PaymentSchedule | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 处理编辑模式的数据映射
  useEffect(() => {
    if (editMode && transactionData) {
      console.log('编辑模式 - 原始交易数据:', transactionData);
      // 后端枚举值到前端显示名称的映射
      const categoryReverseMapping: { [key: string]: string } = {
        '租金': '租金收入',
        '押金': '押金收入',
        '其他': transactionData.transaction_type === '收入' ? '其他收入' : '其他支出',
        '维修费': '维修费用',
        '物业费': '物业费',
        '水电费': '水电费',
        '税费': '税费',
        '保险费': '保险费'
      };

      const mappedCategory = categoryReverseMapping[transactionData.category] || transactionData.category;

      console.log('映射后的类别:', mappedCategory);

      setFormData(prev => ({
        ...prev,
        category: mappedCategory
      }));
    }
  }, [editMode, transactionData]);

  // 获取房屋和车位数据
  useEffect(() => {
    const fetchPropertiesAndParkingSpaces = async () => {
      try {
        const [propertiesData, parkingSpacesData] = await Promise.all([
          ApiService.getProperties(),
          ApiService.getParkingSpaces()
        ]);
        setProperties(propertiesData || []);
        setParkingSpaces(parkingSpacesData || []);
      } catch (error) {
        console.error('获取房屋和车位数据失败:', error);
      }
    };

    fetchPropertiesAndParkingSpaces();
  }, []);

  // 编辑模式下设置付款计划
  useEffect(() => {
    if (editMode && transactionData && selectedContract && selectedContract.payment_schedules) {
      if (transactionData.payment_schedule_id) {
        const schedule = selectedContract.payment_schedules.find(s => s.id === transactionData.payment_schedule_id);
        if (schedule) {
          setSelectedPaymentSchedule(schedule);
        }
      }
    }
  }, [editMode, transactionData, selectedContract]);

  // 获取合同数据
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        // 获取所有合同数据
        const contractsData = await ApiService.getLeases();

        if (contractsData) {
          // 获取交易记录以计算租金状态
          const transactions = await ApiService.getTransactions();

          // 为所有合同获取付款计划并添加标准化的数据结构
          const standardizedContracts = await Promise.all(contractsData.map(async (contract: any) => {
            // 获取该合同的付款计划
            let paymentSchedules: PaymentSchedule[] = [];
            try {
              paymentSchedules = await ApiService.getPaymentSchedules({ lease_id: contract.id });
            } catch (error) {
              console.log(`合同 ${contract.id} 暂无付款计划:`, error);
            }

            // 计算该合同的已收租金
            const contractRentTransactions = transactions.filter((transaction: any) =>
              transaction.lease_id === contract.id &&
              transaction.transaction_type === '收入' &&
              transaction.category === '租金'
            );

            const receivedRent = contractRentTransactions.reduce((total: number, transaction: any) =>
              total + (transaction.amount || 0), 0
            );

            const totalRent = contract.total_contract_amount || 0;
            const unpaidRent = Math.max(0, totalRent - receivedRent);
            const isFullyPaid = unpaidRent === 0 && totalRent > 0;

            return {
              ...contract,
              tenant_name: contract.tenant?.name || '未知租客',
              tenant_phone: contract.tenant?.phone || '',
              property_name: contract.property?.name,
              parking_space_name: contract.parking_space?.name,
              payment_schedules: paymentSchedules,
              // 添加租金状态数据
              total_rent_received: receivedRent,
              expected_rent: totalRent,
              unpaid_rent: unpaidRent,
              is_fully_paid: isFullyPaid,
              months_elapsed: 1,
              payment_completion_rate: totalRent > 0 ? (receivedRent / totalRent) * 100 : 0,
              has_unpaid_rent: unpaidRent > 0
            };
          }));

          // 根据交易类别过滤合同
          let filteredContracts = standardizedContracts;

          if (formData.category === '租金收入') {
            // 租金收入：显示未生效、生效中、即将到期的合同，以及已过期但未收款的合同
            filteredContracts = standardizedContracts.filter((contract: any) =>
              (contract.status === '未生效' || contract.status === '生效中' ||
               contract.status === '即将到期' || (contract.status === '已到期' && !contract.is_fully_paid)) &&
              !contract.is_fully_paid
            );
          } else {
            // 其他交易类型：显示未生效、生效中和即将到期的合同
            filteredContracts = standardizedContracts.filter((contract: any) =>
              contract.status === '未生效' || contract.status === '生效中' || contract.status === '即将到期'
            );
          }

          // 编辑模式下，确保当前交易关联的合同也在列表中
          if (editMode && transactionData && transactionData.lease_id) {
            const currentContract = standardizedContracts.find((contract: any) =>
              contract.id === transactionData.lease_id
            );
            if (currentContract && !filteredContracts.find((c: any) => c.id === currentContract.id)) {
              console.log('编辑模式 - 添加当前交易关联的合同到列表:', currentContract);
              filteredContracts.unshift(currentContract); // 添加到列表开头
            }
          }

          setContracts(filteredContracts);
        } else {
          setContracts([]);
        }
      } catch (error) {
        setContracts([]);
      }
    };

    fetchContracts();
  }, [formData.category]);

  // 处理URL参数预填充
  useEffect(() => {
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const amount = searchParams.get('amount');
    const description = searchParams.get('description');
    const contractId = searchParams.get('contract_id');

    if (type || category || amount || description || contractId) {
      setFormData(prev => ({
        ...prev,
        type: type || prev.type,
        category: category || prev.category,
        amount: amount || prev.amount,
        description: description || prev.description,
        contractId: contractId || prev.contractId,
        isRentPayment: category === '租金收入'
      }));

      // 如果有合同ID，获取合同详情
      if (contractId) {
        const contract = contracts.find(c => c.id.toString() === contractId);
        if (contract) {
          setSelectedContract(contract);
        }
      }
    }
  }, [searchParams, contracts]);

  // 编辑模式下设置选中的合同
  useEffect(() => {
    if (editMode && transactionData && formData.contractId !== 'none' && contracts.length > 0) {
      const contract = contracts.find(c => c.id.toString() === formData.contractId);
      if (contract) {
        console.log('编辑模式 - 设置选中的合同:', contract);
        setSelectedContract(contract);
      }
    }
  }, [editMode, transactionData, formData.contractId, contracts]);

  // 收入和支出类别
  const incomeCategories = ['租金收入', '押金收入', '其他收入'];
  const expenseCategories = ['维修费用', '物业费', '水电费', '税费', '保险费', '中介费', '装修费', '采暖费', '退押金', '其他支出'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      type: value,
      category: '', // 重置类别
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.category || !formData.amount || !formData.date) {
      toast({
        title: '输入错误',
        description: '请填写所有必填字段',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 映射前端类别到后端枚举
      const categoryMapping: { [key: string]: string } = {
        '租金收入': '租金',
        '押金收入': '押金',
        '其他收入': '其他',
        '维修费用': '维修费',
        '物业费': '物业费',
        '水电费': '水电费',
        '税费': '税费',
        '保险费': '保险费',
        '中介费': '中介费',
        '装修费': '装修费',
        '采暖费': '采暖费',
        '退押金': '退押金',
        '其他支出': '其他'
      };

      // 准备提交数据
      let propertyId: number | null = null;
      let relatedInfo = '';

      // 解析关联的房屋或车位
      if (formData.propertyId && formData.propertyId !== 'none') {
        if (formData.propertyId.startsWith('property-')) {
          propertyId = parseInt(formData.propertyId.replace('property-', ''));
          const selectedProperty = properties.find(p => p.id === propertyId);
          if (selectedProperty) {
            relatedInfo = `[房屋: ${selectedProperty.name}]`;
          }
        } else if (formData.propertyId.startsWith('parking-')) {
          const parkingSpaceId = parseInt(formData.propertyId.replace('parking-', ''));
          const selectedParkingSpace = parkingSpaces.find(ps => ps.id === parkingSpaceId);
          if (selectedParkingSpace) {
            relatedInfo = `[车位: ${selectedParkingSpace.name}]`;
            // 如果车位有关联的房屋，使用房屋ID；否则使用第一个房屋ID作为默认值
            if (selectedParkingSpace.property_id) {
              propertyId = selectedParkingSpace.property_id;
            } else if (properties.length > 0) {
              propertyId = properties[0].id; // 使用第一个房屋作为默认关联
            }
          }
        } else {
          // 兼容旧格式，直接是数字ID的情况
          propertyId = parseInt(formData.propertyId);
        }
      } else if (properties.length > 0) {
        // 如果没有选择关联，使用第一个房屋作为默认值（因为property_id是必需的）
        propertyId = properties[0].id;
      }

      // 在描述中添加关联信息（仅对收入类型的交易）
      let finalDescription = formData.description;
      if (relatedInfo && !editMode && formData.type === '收入') {
        // 只在新建模式下且为收入类型时自动添加关联信息，支出类型不添加房间信息
        finalDescription = `${relatedInfo} ${formData.description}`;
      }

      const submitData = {
        transaction_type: formData.type,  // 修正字段名
        category: categoryMapping[formData.category] || formData.category,
        amount: parseFloat(formData.amount),
        transaction_date: formData.date,
        property_id: propertyId,
        tenant_id: formData.tenantId !== 'none' ? parseInt(formData.tenantId) : null,
        lease_id: selectedContract ? selectedContract.id : null, // 关联合同ID
        payment_schedule_id: selectedPaymentSchedule ? selectedPaymentSchedule.id : null, // 关联付款计划ID
        description: finalDescription
      };
      
      if (editMode && transactionData) {
        // 更新交易
        await ApiService.updateTransaction(transactionData.id, submitData);

        // 如果是租金收入，需要处理付款计划状态更新
        if (formData.category === '租金收入') {
          try {
            // 处理原来的付款计划（如果有的话）
            if (transactionData.payment_schedule_id && transactionData.payment_schedule_id !== (selectedPaymentSchedule?.id || null)) {
              // 原来关联了付款计划，但现在改为不关联或关联到其他付款计划
              // 需要从原付款计划中减去原来的金额
              const originalSchedule = selectedContract?.payment_schedules?.find(s => s.id === transactionData.payment_schedule_id);
              if (originalSchedule) {
                const newPaidAmount = Math.max(0, originalSchedule.paid_amount - transactionData.amount);
                const newStatus = newPaidAmount >= originalSchedule.amount ? '已付款' : '未付款';

                await ApiService.updatePaymentSchedule(originalSchedule.id, {
                  paid_amount: newPaidAmount,
                  status: newStatus
                });

                console.log(`原付款计划 ${originalSchedule.id} 已更新: 已付金额 ${newPaidAmount}, 状态 ${newStatus}`);
              }
            }

            // 处理新的付款计划（如果有的话）
            if (selectedPaymentSchedule) {
              let newPaidAmount;
              if (transactionData.payment_schedule_id === selectedPaymentSchedule.id) {
                // 同一个付款计划，只需要调整金额差异
                const amountDiff = parseFloat(formData.amount) - transactionData.amount;
                newPaidAmount = selectedPaymentSchedule.paid_amount + amountDiff;
              } else {
                // 新关联的付款计划，直接加上新金额
                newPaidAmount = selectedPaymentSchedule.paid_amount + parseFloat(formData.amount);
              }

              const newStatus = newPaidAmount >= selectedPaymentSchedule.amount ? '已付款' : '未付款';

              await ApiService.updatePaymentSchedule(selectedPaymentSchedule.id, {
                paid_amount: Math.max(0, newPaidAmount),
                status: newStatus
              });

              console.log(`付款计划 ${selectedPaymentSchedule.id} 已更新: 已付金额 ${Math.max(0, newPaidAmount)}, 状态 ${newStatus}`);
            }
          } catch (error) {
            console.error('更新付款计划失败:', error);
            // 不影响主流程，只记录错误
          }
        }

        toast({
          title: '更新成功',
          description: '交易记录已更新',
        });
      } else {
        // 创建新交易
        await ApiService.createTransaction(submitData);

        // 如果是租金收入且有关联的付款计划，更新付款计划状态
        if (formData.category === '租金收入' && selectedPaymentSchedule && formData.paymentScheduleId !== 'none') {
          try {
            const newPaidAmount = selectedPaymentSchedule.paid_amount + parseFloat(formData.amount);
            const newStatus = newPaidAmount >= selectedPaymentSchedule.amount ? '已付款' : '未付款';

            await ApiService.updatePaymentSchedule(selectedPaymentSchedule.id, {
              paid_amount: newPaidAmount,
              status: newStatus
            });

            console.log(`付款计划 ${selectedPaymentSchedule.id} 已更新: 已付金额 ${newPaidAmount}, 状态 ${newStatus}`);
          } catch (error) {
            console.error('更新付款计划失败:', error);
            // 不影响主流程，只记录错误
          }
        }

        toast({
          title: '添加成功',
          description: '新交易记录已添加到系统',
        });
      }

      navigate('/finance?tab=transactions');
    } catch (error) {
      toast({
        title: '提交失败',
        description: '交易记录提交失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 pb-20 min-h-screen overflow-x-hidden">
      {/* 移动端优化：添加触摸友好的表单 */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4 sm:space-y-6 touch-manipulation">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">{editMode ? '✏️' : '➕'}</span>
              {editMode ? '编辑交易' : '添加交易'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* 交易类型 */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">交易类型 *</Label>
              <RadioGroup
                defaultValue={formData.type}
                className="grid grid-cols-2 gap-2 sm:gap-3"
                onValueChange={handleTypeChange}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border-2 border-green-200 rounded-lg bg-green-50 hover:bg-green-100 transition-colors active:bg-green-200">
                  <RadioGroupItem value="收入" id="income" className="text-green-600" />
                  <Label htmlFor="income" className="text-green-700 font-semibold text-sm sm:text-base cursor-pointer flex-1">
                    💰 收入
                  </Label>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border-2 border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors active:bg-red-200">
                  <RadioGroupItem value="支出" id="expense" className="text-red-600" />
                  <Label htmlFor="expense" className="text-red-700 font-semibold text-sm sm:text-base cursor-pointer flex-1">
                    💸 支出
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* 交易类别 */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="category" className="text-sm sm:text-base font-semibold text-gray-700">交易类别 *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="请选择交易类别" />
                </SelectTrigger>
                <SelectContent>
                  {formData.type === '收入' ? (
                    incomeCategories.map((category, index) => (
                      <SelectItem key={index} value={category} className="text-sm sm:text-base py-2 sm:py-3">
                        {category}
                      </SelectItem>
                    ))
                  ) : (
                    expenseCategories.map((category, index) => (
                      <SelectItem key={index} value={category} className="text-sm sm:text-base py-2 sm:py-3">
                        {category}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 支出类别 - 简单表单 */}
            {formData.type === '支出' && formData.category && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-200">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <Label className="text-red-800 font-bold text-base sm:text-lg">
                    💸 支出记录
                  </Label>
                </div>

                <div className="p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs sm:text-sm text-red-700 font-medium">
                    💡 请填写支出的具体金额和描述信息
                  </p>
                </div>
              </div>
            )}

            {/* 收入类别 - 合同选择 */}
            {formData.type === '收入' && formData.category && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <Label className="text-blue-800 font-bold text-base sm:text-lg">
                    {formData.category === '租金收入' ? '🏠 租金收款' :
                     formData.category === '押金收入' ? '💰 押金收款' :
                     '📋 收入记录'}
                  </Label>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="contractId" className="text-sm sm:text-base font-semibold text-gray-700">
                    选择合同 {formData.category === '租金收入' ? '*' : '(可选)'}
                  </Label>
                  <Select
                    value={formData.contractId}
                    onValueChange={(value) => {
                      handleSelectChange('contractId', value);
                      const contract = contracts.find(c => c.id.toString() === value);
                      setSelectedContract(contract || null);

                      // 重置付款计划选择
                      setSelectedPaymentSchedule(null);
                      setFormData(prev => ({
                        ...prev,
                        paymentScheduleId: 'none'
                      }));

                      if (contract) {
                        const tenantName = contract.tenant_name || (contract as any).tenant?.name || '租客';
                        const propertyType = contract.lease_type === 'property' ? '房屋' : '车位';

                        let suggestedAmount = '';
                        let description = '';

                        // 根据收入类别设置建议金额和描述
                        if (formData.category === '租金收入') {
                          // 使用原有逻辑计算租金，用户可以后续手动选择付款计划
                          const hasUnpaidRent = contract.unpaid_rent && contract.unpaid_rent > 0;
                          const hasReceivedSomeRent = contract.total_rent_received && contract.total_rent_received > 0;
                          suggestedAmount = (hasUnpaidRent ? contract.unpaid_rent : contract.monthly_rent).toString();
                          const isPartialPayment = hasUnpaidRent && hasReceivedSomeRent;
                          description = `${tenantName} - ${propertyType}租金${isPartialPayment ? ' (补缴欠费)' : ''}`;
                        } else if (formData.category === '押金收入') {
                          suggestedAmount = (contract as any).deposit_paid ? (contract as any).deposit_paid.toString() : contract.monthly_rent.toString();
                          description = `${tenantName} - ${propertyType}押金`;
                        } else {
                          // 其他收入类别不自动填充金额
                          description = `${tenantName} - ${propertyType}${formData.category}`;
                        }

                        setFormData(prev => ({
                          ...prev,
                          amount: suggestedAmount,
                          description: description
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base border-2 border-blue-200 focus:border-blue-500">
                      <SelectValue placeholder={
                        formData.category === '租金收入' ? "请选择需要收款的合同" :
                        formData.category === '押金收入' ? "请选择押金相关的合同" :
                        "请选择关联的合同（可选）"
                      } />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 w-full">
                      {contracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id.toString()} className="py-2">
                          <div className="flex items-center space-x-2 w-full">
                            {contract.lease_type === 'property' ? (
                              <Home className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            ) : (
                              <Car className="h-4 w-4 text-purple-500 flex-shrink-0" />
                            )}
                            <span className="font-medium truncate">
                              {contract.tenant_name || (contract as any).tenant?.name || '未知租客'} - {contract.property_name || (contract as any).property?.name ||
                               contract.parking_space_name || (contract as any).parking_space?.name || '未知房屋'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 选中合同的详细信息 */}
                {selectedContract && (
                  <div className="bg-white rounded-xl border-2 border-gray-100 shadow-sm space-y-3 sm:space-y-4 p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 font-medium text-sm sm:text-base">👤 租客</span>
                        <span className="font-bold text-gray-800 text-sm sm:text-base">{selectedContract.tenant_name || '未知'}</span>
                      </div>
                      {/* 月租金 - 只在租金收入时显示 */}
                      {formData.category === '租金收入' && (
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                          <span className="text-gray-600 font-medium text-sm sm:text-base">💰 月租金</span>
                          <span className="font-bold text-green-600 text-sm sm:text-base">¥{selectedContract.monthly_rent}</span>
                        </div>
                      )}

                      {/* 应收租金 - 仅在租金收入时显示，在移动端隐藏 */}
                      {formData.category === '租金收入' && (
                        <div className="hidden sm:flex items-center justify-between p-2 sm:p-3 bg-orange-50 rounded-lg">
                          <span className="text-gray-600 font-medium text-sm sm:text-base">📊 应收租金</span>
                          <span className="font-bold text-orange-600 text-sm sm:text-base">
                            ¥{selectedContract.total_contract_amount || selectedContract.expected_rent || 0}
                          </span>
                        </div>
                      )}

                      {/* 只有租金收入才显示付款方式，在移动端隐藏 */}
                      {formData.category === '租金收入' && (
                        <div className="hidden sm:flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
                          <span className="text-gray-600 font-medium text-sm sm:text-base">📋 付款方式</span>
                          <span className="font-bold text-blue-600 text-sm sm:text-base">{selectedContract.payment_method}</span>
                        </div>
                      )}

                      {/* 租期信息 - 方便匹配交款 */}
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-indigo-50 rounded-lg">
                        <span className="text-gray-600 font-medium text-sm sm:text-base">📅 租期</span>
                        <span className="font-bold text-indigo-600 text-xs sm:text-sm">
                          {new Date(selectedContract.lease_start).toLocaleDateString()} 至 {new Date(selectedContract.lease_end).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 rounded-lg">
                        <span className="text-gray-600 font-medium text-sm sm:text-base">✅ 合同状态</span>
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs sm:text-sm">
                          {selectedContract.status}
                        </Badge>
                      </div>

                      {/* 付款计划选择 - 仅在租金收入且有付款计划时显示 */}
                      {formData.category === '租金收入' && selectedContract && selectedContract.payment_schedules && selectedContract.payment_schedules.length > 0 && (
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="paymentScheduleId" className="text-sm sm:text-base font-medium text-gray-700">
                            选择付款计划 (可选)
                          </Label>
                          <Select
                            value={formData.paymentScheduleId}
                            onValueChange={(value) => {
                              handleSelectChange('paymentScheduleId', value);
                              if (value === 'none') {
                                setSelectedPaymentSchedule(null);
                                // 使用原有的租金计算逻辑
                                const hasUnpaidRent = selectedContract.unpaid_rent && selectedContract.unpaid_rent > 0;
                                const suggestedAmount = (hasUnpaidRent ? selectedContract.unpaid_rent : selectedContract.monthly_rent).toString();
                                setFormData(prev => ({
                                  ...prev,
                                  amount: suggestedAmount
                                }));
                              } else {
                                const schedule = selectedContract.payment_schedules?.find(s => s.id.toString() === value);
                                setSelectedPaymentSchedule(schedule || null);
                                if (schedule) {
                                  const remainingAmount = schedule.amount - schedule.paid_amount;
                                  setFormData(prev => ({
                                    ...prev,
                                    amount: remainingAmount.toString()
                                  }));
                                }
                              }
                            }}
                          >
                            <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base border-2 border-blue-200 focus:border-blue-500">
                              <SelectValue placeholder="请选择付款计划（可选）" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">不关联付款计划</SelectItem>
                              {selectedContract.payment_schedules.map((schedule) => (
                                <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-xs sm:text-sm">
                                      第{schedule.period_number}期 - ¥{schedule.amount}
                                    </span>
                                    <span className="text-xs text-gray-500 hidden sm:block">
                                      {new Date(schedule.period_start_date).toLocaleDateString()} -
                                      {new Date(schedule.period_end_date).toLocaleDateString()}
                                      {schedule.status === '已付款' ? ' (已完成)' :
                                       schedule.paid_amount > 0 ? ` (已付¥${schedule.paid_amount})` : ' (未付款)'}
                                    </span>
                                    <span className="text-xs text-gray-500 sm:hidden">
                                      {schedule.status === '已付款' ? '已完成' :
                                       schedule.paid_amount > 0 ? `已付¥${schedule.paid_amount}` : '未付款'}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* 付款计划信息 - 仅在租金收入且选中付款计划时显示 */}
                      {formData.category === '租金收入' && selectedPaymentSchedule && (
                        <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">📅 选中的付款计划</span>
                            <span className="text-xs sm:text-sm text-indigo-600">第{selectedPaymentSchedule.period_number}期</span>
                          </div>
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                            <div className="hidden sm:flex justify-between">
                              <span className="text-gray-600">期间:</span>
                              <span className="font-medium">
                                {new Date(selectedPaymentSchedule.period_start_date).toLocaleDateString()} -
                                {new Date(selectedPaymentSchedule.period_end_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">应付金额:</span>
                              <span className="font-medium text-indigo-600">¥{selectedPaymentSchedule.amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">已付金额:</span>
                              <span className="font-medium">¥{selectedPaymentSchedule.paid_amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">剩余金额:</span>
                              <span className="font-medium text-red-600">¥{selectedPaymentSchedule.amount - selectedPaymentSchedule.paid_amount}</span>
                            </div>
                            <div className="hidden sm:flex justify-between">
                              <span className="text-gray-600">截止日期:</span>
                              <span className="font-medium">{new Date(selectedPaymentSchedule.due_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      )}



                      {/* 租金收取状态 - 仅在租金收入时显示 */}
                      {formData.category === '租金收入' && selectedContract.total_rent_received !== undefined && (
                        <>
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-gray-600 font-medium">💰 已收租金</span>
                            <span className="font-bold text-blue-600">¥{selectedContract.total_rent_received}</span>
                          </div>
                          {selectedContract.unpaid_rent > 0 && (
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <span className="text-gray-600 font-medium">⚠️ 未收租金</span>
                              <span className="font-bold text-red-600">¥{selectedContract.unpaid_rent}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-600 font-medium">📈 收款进度</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(selectedContract.payment_completion_rate || 0, 100)}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-green-600 text-sm">
                                {(selectedContract.payment_completion_rate || 0).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* 押金收入显示押金相关信息 */}
                      {formData.category === '押金收入' && (
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <span className="text-gray-600 font-medium">💰 合同押金</span>
                          <span className="font-bold text-yellow-600">¥{selectedContract.monthly_rent || 0}</span>
                        </div>
                      )}
                    </div>


                  </div>
                )}
              </div>
            )}

            {/* 金额 */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="amount" className="text-sm sm:text-base font-semibold text-gray-700 flex items-center">
                💰 金额 (元) *
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  placeholder="请输入金额"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  disabled={false}
                  className="h-10 sm:h-12 text-base sm:text-lg font-semibold border-2 border-gray-200 focus:border-blue-500 pl-6 sm:pl-8"
                />
                <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">¥</span>
              </div>

              {selectedContract && formData.type === '收入' && (
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs sm:text-sm text-blue-700 font-medium">
                    {formData.category === '租金收入'
                      ? '💡 金额已根据合同自动填充，支持部分收款，请根据实际情况修改'
                      : formData.category === '押金收入'
                      ? '💡 金额已根据合同押金自动填充，可根据实际情况修改'
                      : '💡 已关联合同信息，请输入实际收入金额'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* 日期 */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="date" className="text-sm sm:text-base font-semibold text-gray-700 flex items-center">
                📅 交易日期 *
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-500"
              />
            </div>
            
            {/* 关联信息 - 对于租金收入，这些信息已通过合同自动关联 */}
            {formData.category !== '租金收入' && (
              <>
                {/* 关联房屋/车位 */}
                <div className="space-y-2">
                  <Label htmlFor="propertyId" className="text-sm sm:text-base font-semibold text-gray-700">关联房屋/车位</Label>
                  <Select
                    value={formData.propertyId}
                    onValueChange={(value) => handleSelectChange('propertyId', value)}
                  >
                    <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="选择房屋或车位（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无</SelectItem>

                      {/* 房屋选项 */}
                      {properties.length > 0 && (
                        <>
                          <SelectItem value="property-header" disabled className="font-semibold text-blue-600">
                            🏠 房屋
                          </SelectItem>
                          {properties.map((property) => (
                            <SelectItem key={`property-${property.id}`} value={`property-${property.id}`}>
                              <div className="flex items-center space-x-2">
                                <Home className="h-4 w-4 text-blue-500" />
                                <span>{property.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}

                      {/* 车位选项 */}
                      {parkingSpaces.length > 0 && (
                        <>
                          <SelectItem value="parking-header" disabled className="font-semibold text-purple-600">
                            🚗 车位
                          </SelectItem>
                          {parkingSpaces.map((parkingSpace) => (
                            <SelectItem key={`parking-${parkingSpace.id}`} value={`parking-${parkingSpace.id}`}>
                              <div className="flex items-center space-x-2">
                                <Car className="h-4 w-4 text-purple-500" />
                                <span>{parkingSpace.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            {/* 描述 */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="description" className="text-sm sm:text-base font-semibold text-gray-700 flex items-center">
                📝 交易描述
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="请输入交易描述（可选）"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="text-sm sm:text-base border-2 border-gray-200 focus:border-blue-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* 提交按钮 - 固定在底部 */}
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t shadow-lg z-50">
          <div className="max-w-md mx-auto flex space-x-2 sm:space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/finance?tab=transactions')}
              className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold border-2 border-gray-300 hover:border-gray-400 active:bg-gray-100"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={`flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg transition-all duration-200 active:scale-95 ${
                formData.type === '收入'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                  <span className="text-xs sm:text-sm">保存中...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-1 sm:mr-2">{formData.type === '收入' ? '💰' : '💸'}</span>
                  <span className="text-xs sm:text-sm">{editMode ? '更新交易' : '添加交易'}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;