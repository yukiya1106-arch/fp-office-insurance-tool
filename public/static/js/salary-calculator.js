/**
 * 手取り年収計算ロジック
 * 職業形態に応じた控除率を適用して、額面年収から手取り年収を算出
 */

/**
 * 職業形態別の控除率データ
 * 所得税、住民税、社会保険料等を考慮した実質的な控除率
 */
const DEDUCTION_RATES = {
  employee: {
    // 会社員: 20-33%控除（社会保険料約15% + 所得税・住民税約5-18%）
    ranges: [
      { max: 3000000, rate: 0.20 },    // 300万以下: 20%控除
      { max: 5000000, rate: 0.23 },    // 500万以下: 23%控除
      { max: 7000000, rate: 0.26 },    // 700万以下: 26%控除
      { max: 10000000, rate: 0.30 },   // 1000万以下: 30%控除
      { max: Infinity, rate: 0.33 }    // 1000万超: 33%控除
    ]
  },
  selfEmployed: {
    // 自営業: 18-32%控除（国民年金・国保約15% + 所得税・住民税約3-17%）
    ranges: [
      { max: 3000000, rate: 0.18 },
      { max: 5000000, rate: 0.21 },
      { max: 7000000, rate: 0.24 },
      { max: 10000000, rate: 0.28 },
      { max: Infinity, rate: 0.32 }
    ]
  },
  partTime: {
    // パート・アルバイト: 15-20%控除
    ranges: [
      { max: 1500000, rate: 0.15 },    // 150万以下: 15%控除
      { max: 3000000, rate: 0.18 },    // 300万以下: 18%控除
      { max: Infinity, rate: 0.20 }    // 300万超: 20%控除
    ]
  },
  housewife: {
    // 専業主婦/主夫: 0%控除（収入なし）
    ranges: [
      { max: Infinity, rate: 0 }
    ]
  },
  other: {
    // その他: 平均的な20%控除を適用
    ranges: [
      { max: Infinity, rate: 0.20 }
    ]
  }
};

/**
 * 職業形態を正規化
 * @param {string} occupation - 職業形態
 * @returns {string} 正規化された職業形態キー
 */
function normalizeOccupation(occupation) {
  const normalized = occupation.toLowerCase().replace(/[・\s]/g, '');
  
  if (normalized.includes('会社員') || normalized.includes('正社員')) {
    return 'employee';
  } else if (normalized.includes('自営') || normalized.includes('個人事業')) {
    return 'selfEmployed';
  } else if (normalized.includes('パート') || normalized.includes('アルバイト')) {
    return 'partTime';
  } else if (normalized.includes('専業主婦') || normalized.includes('専業主夫')) {
    return 'housewife';
  } else {
    return 'other';
  }
}

/**
 * 手取り年収を計算
 * @param {number} grossIncome - 額面年収（円）
 * @param {string} occupation - 職業形態
 * @returns {object} { netIncome: 手取り年収, deductionRate: 控除率, deductionAmount: 控除額 }
 */
function calculateNetIncome(grossIncome, occupation) {
  if (!grossIncome || grossIncome <= 0) {
    return {
      netIncome: 0,
      deductionRate: 0,
      deductionAmount: 0
    };
  }
  
  const occupationType = normalizeOccupation(occupation);
  const rateTable = DEDUCTION_RATES[occupationType];
  
  // 収入額に応じた控除率を取得
  let deductionRate = 0;
  for (const range of rateTable.ranges) {
    if (grossIncome <= range.max) {
      deductionRate = range.rate;
      break;
    }
  }
  
  const deductionAmount = Math.round(grossIncome * deductionRate);
  const netIncome = grossIncome - deductionAmount;
  
  return {
    netIncome,
    deductionRate,
    deductionAmount
  };
}

/**
 * 世帯の手取り年収を計算
 * @param {object} data - { husbandIncome, husbandOccupation, wifeIncome, wifeOccupation }
 * @returns {object} 詳細な計算結果
 */
function calculateHouseholdNetIncome(data) {
  const husband = calculateNetIncome(data.husbandIncome || 0, data.husbandOccupation || 'employee');
  const wife = calculateNetIncome(data.wifeIncome || 0, data.wifeOccupation || 'housewife');
  
  return {
    husband: {
      grossIncome: data.husbandIncome || 0,
      netIncome: husband.netIncome,
      deductionRate: husband.deductionRate,
      deductionAmount: husband.deductionAmount
    },
    wife: {
      grossIncome: data.wifeIncome || 0,
      netIncome: wife.netIncome,
      deductionRate: wife.deductionRate,
      deductionAmount: wife.deductionAmount
    },
    household: {
      grossIncome: (data.husbandIncome || 0) + (data.wifeIncome || 0),
      netIncome: husband.netIncome + wife.netIncome,
      totalDeduction: husband.deductionAmount + wife.deductionAmount
    }
  };
}

/**
 * 金額をフォーマット（3桁区切り）
 * @param {number} amount - 金額
 * @returns {string} フォーマットされた金額
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * パーセンテージをフォーマット
 * @param {number} rate - 割合（0-1）
 * @returns {string} フォーマットされたパーセンテージ
 */
function formatPercentage(rate) {
  return `${(rate * 100).toFixed(1)}%`;
}

// グローバルに公開
window.SalaryCalculator = {
  calculateNetIncome,
  calculateHouseholdNetIncome,
  formatCurrency,
  formatPercentage
};
