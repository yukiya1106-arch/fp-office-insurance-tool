/**
 * 手取り年収計算ロジック
 * Salary Calculator - Net Income Calculation
 */

/**
 * 職業形態別の控除率を取得
 * @param {string} occupation - 職業形態
 * @param {number} grossIncome - 額面年収
 * @returns {number} - 控除率（0-1の範囲）
 */
function getDeductionRate(occupation, grossIncome) {
  const incomeMillion = grossIncome / 10000; // 万円単位に変換
  
  if (occupation === 'employee') {
    // 会社員: 20-33%控除
    if (incomeMillion <= 300) return 0.20;
    if (incomeMillion <= 500) return 0.23;
    if (incomeMillion <= 800) return 0.27;
    if (incomeMillion <= 1000) return 0.30;
    return 0.33;
  } else if (occupation === 'self-employed') {
    // 自営業: 18-32%控除
    if (incomeMillion <= 300) return 0.18;
    if (incomeMillion <= 500) return 0.21;
    if (incomeMillion <= 800) return 0.25;
    if (incomeMillion <= 1000) return 0.28;
    return 0.32;
  } else if (occupation === 'part-time') {
    // パート: 15-20%控除
    if (incomeMillion <= 100) return 0.15;
    if (incomeMillion <= 200) return 0.17;
    return 0.20;
  } else if (occupation === 'housewife') {
    // 専業主婦/主夫: 収入なし
    return 1.0; // 100%控除（実質0円）
  } else {
    // その他: デフォルト20%控除
    return 0.20;
  }
}

/**
 * 手取り年収を計算
 * @param {number} grossIncome - 額面年収
 * @param {string} occupation - 職業形態
 * @returns {number} - 手取り年収
 */
function calculateNetIncome(grossIncome, occupation) {
  if (occupation === 'housewife' || grossIncome === 0) {
    return 0;
  }
  
  const deductionRate = getDeductionRate(occupation, grossIncome);
  const netIncome = grossIncome * (1 - deductionRate);
  
  return Math.round(netIncome);
}

/**
 * 世帯の手取り年収を計算
 * @param {Object} data - 入力データ
 * @returns {Object} - 計算結果
 */
function calculateHouseholdNetIncome(data) {
  const husbandGross = parseInt(data.husbandIncome) || 0;
  const wifeGross = parseInt(data.wifeIncome) || 0;
  const husbandOccupation = data.husbandOccupation;
  const wifeOccupation = data.wifeOccupation;
  
  const husbandNet = calculateNetIncome(husbandGross, husbandOccupation);
  const wifeNet = calculateNetIncome(wifeGross, wifeOccupation);
  
  return {
    husbandGross,
    husbandNet,
    husbandDeductionRate: getDeductionRate(husbandOccupation, husbandGross),
    wifeGross,
    wifeNet,
    wifeDeductionRate: getDeductionRate(wifeOccupation, wifeGross),
    householdGross: husbandGross + wifeGross,
    householdNet: husbandNet + wifeNet
  };
}

/**
 * 金額をフォーマット（万円表示）
 * @param {number} amount - 金額
 * @returns {string} - フォーマット済み文字列
 */
function formatCurrency(amount) {
  if (amount >= 10000) {
    const man = Math.round(amount / 10000);
    return `${man.toLocaleString()}万円`;
  }
  return `${Math.round(amount).toLocaleString()}円`;
}

/**
 * 手取り率をパーセント表示
 * @param {number} rate - 控除率（0-1）
 * @returns {string} - パーセント文字列
 */
function formatDeductionRate(rate) {
  const netRate = (1 - rate) * 100;
  return `${Math.round(netRate)}%`;
}
