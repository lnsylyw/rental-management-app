// 合同相关常量定义

// 付款方式选项
export const PAYMENT_METHODS = [
  { value: '押一付一', label: '押一付一', months: 1 },
  { value: '押一付三', label: '押一付三', months: 3 },
  { value: '押一付六', label: '押一付六', months: 6 },
  { value: '押一付十二', label: '押一付十二', months: 12 },
  { value: '半年付', label: '半年付', months: 6 },
  { value: '年付', label: '年付', months: 12 },
] as const;

// 合同状态选项
export const CONTRACT_STATUS = [
  { value: '未生效', label: '未生效', color: 'bg-blue-100 text-blue-800' },
  { value: '生效中', label: '生效中', color: 'bg-green-100 text-green-800' },
  { value: '即将到期', label: '即将到期', color: 'bg-amber-100 text-amber-800' },
  { value: '已到期', label: '已到期', color: 'bg-red-100 text-red-800' },
  { value: '已终止', label: '已终止', color: 'bg-gray-100 text-gray-800' },
] as const;

// 租赁类型选项
export const LEASE_TYPES = [
  { value: 'property', label: '房屋租赁' },
  { value: 'parking', label: '车位租赁' },
] as const;

// 根据付款方式获取租期月数
export const getLeaseMonths = (paymentMethod: string): number => {
  const method = PAYMENT_METHODS.find(m => m.value === paymentMethod);
  return method?.months || 3; // 默认3个月
};

// 根据合同状态获取颜色样式
export const getStatusColor = (status: string): string => {
  const statusConfig = CONTRACT_STATUS.find(s => s.value === status);
  return statusConfig?.color || 'bg-blue-100 text-blue-800';
};

// 默认付款方式
export const DEFAULT_PAYMENT_METHOD = '押一付三';

// 默认合同状态
export const DEFAULT_CONTRACT_STATUS = '生效中';

// 根据租赁时间计算合同状态
export const calculateContractStatus = (leaseStart: string, leaseEnd: string): string => {
  // 输入验证
  if (!leaseStart || !leaseEnd) {
    console.warn('calculateContractStatus: 缺少必要的日期参数');
    return '生效中'; // 默认状态
  }

  try {
    const now = new Date();
    const startDate = new Date(leaseStart);
    const endDate = new Date(leaseEnd);

    // 验证日期是否有效
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('calculateContractStatus: 无效的日期格式', { leaseStart, leaseEnd });
      return '生效中'; // 默认状态
    }

    // 如果开始时间还没到，合同未生效（但这种情况很少）
    if (now < startDate) {
      return '未生效';
    }

    // 如果已经过了结束时间，合同已到期
    if (now > endDate) {
      return '已到期';
    }

    // 计算距离到期还有多少天
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // 如果距离到期不足30天，标记为即将到期
    if (daysDiff <= 30) {
      return '即将到期';
    }

    // 否则合同生效中
    return '生效中';
  } catch (error) {
    console.error('calculateContractStatus: 计算状态时发生错误', error);
    return '生效中'; // 默认状态
  }
};

// 检查合同是否需要更新状态
export const shouldUpdateContractStatus = (currentStatus: string, calculatedStatus: string): boolean => {
  // 如果当前状态是"已终止"，不自动更新（手动终止的合同）
  if (currentStatus === '已终止') {
    return false;
  }

  // 其他情况下，如果计算出的状态与当前状态不同，则需要更新
  return currentStatus !== calculatedStatus;
};
