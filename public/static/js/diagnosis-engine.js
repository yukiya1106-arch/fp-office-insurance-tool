/**
 * 診断エンジン - Insurance Diagnosis Engine
 * 必要保障額計算、リスク分析、商品マッチング
 */

/**
 * メイン診断関数
 * @param {Object} userData - ユーザー入力データ
 * @returns {Object} - 診断結果
 */
function runDiagnosis(userData) {
  // 手取り年収の計算
  const incomeData = calculateHouseholdNetIncome(userData);
  
  // 必要保障額の計算（夫死亡時・妻死亡時）
  const deathBenefit = calculateDeathBenefitNeeds(userData, incomeData);
  
  // ライフプランシミュレーション
  const lifePlanSimulation = calculateLifePlanSimulation(userData, incomeData);
  
  // リスク分析（4つのリスク）
  const riskAnalysis = analyzeRisks(userData, deathBenefit);
  
  // 保障充足度分析
  const coverageAnalysis = analyzeCoverageAdequacy(userData, deathBenefit);
  
  // 商品マッチング
  const recommendedProducts = matchInsuranceProducts(userData, riskAnalysis, coverageAnalysis);
  
  return {
    userData,
    incomeData,
    deathBenefit,
    lifePlanSimulation,
    riskAnalysis,
    coverageAnalysis,
    recommendedProducts
  };
}

/**
 * 必要保障額の計算（夫死亡時・妻死亡時）
 * @param {Object} userData - ユーザーデータ
 * @param {Object} incomeData - 収入データ
 * @returns {Object} - 必要保障額の詳細
 */
function calculateDeathBenefitNeeds(userData, incomeData) {
  const husbandAge = parseInt(userData.husbandAge);
  const wifeAge = parseInt(userData.wifeAge);
  const childrenCount = parseInt(userData.childrenCount);
  
  // 子どもの情報を取得
  const children = [];
  for (let i = 0; i < childrenCount; i++) {
    children.push({
      age: parseInt(userData[`child${i}Age`]) || 0,
      education: userData[`child${i}Education`] || 'all-public',
      independent: userData[`child${i}Independent`] === 'yes',
      customCost: parseInt(userData[`child${i}CustomCost`]) || 0
    });
  }
  
  // 末子が22歳になるまでの年数を計算
  let yearsUntilYoungestGraduate = 0;
  if (children.length > 0) {
    const youngestAge = Math.min(...children.map(c => c.age));
    yearsUntilYoungestGraduate = Math.max(0, 22 - youngestAge);
  } else {
    // 子どもがいない場合は、退職年齢までとする
    const husbandRetirementAge = parseInt(userData.husbandRetirementAge) || 65;
    yearsUntilYoungestGraduate = Math.max(0, husbandRetirementAge - husbandAge);
  }
  
  // 月々の生活費（すでに円単位に変換済み）
  const monthlyExpense = parseInt(userData.monthlyExpense) || 0;
  const annualSpecialExpense = parseInt(userData.annualSpecialExpense) || 0;
  
  // 夫死亡時の必要保障額計算
  const husbandDeath = calculateDeathBenefitForSpouse({
    ...userData,
    incomeData,
    children,
    yearsUntilYoungestGraduate,
    monthlyExpense,
    annualSpecialExpense,
    deceased: 'husband',
    survivorAge: wifeAge
  });
  
  // 妻死亡時の必要保障額計算
  const wifeDeath = calculateDeathBenefitForSpouse({
    ...userData,
    incomeData,
    children,
    yearsUntilYoungestGraduate,
    monthlyExpense,
    annualSpecialExpense,
    deceased: 'wife',
    survivorAge: husbandAge
  });
  
  return {
    husband: husbandDeath,
    wife: wifeDeath,
    children,
    yearsUntilYoungestGraduate
  };
}

/**
 * 配偶者死亡時の必要保障額計算
 * 計算式: 必要保障額 = 総支出額 - 総収入額
 * @param {Object} params - パラメータ
 * @returns {Object} - 計算結果
 */
function calculateDeathBenefitForSpouse(params) {
  const {
    incomeData,
    children,
    monthlyExpense,
    annualSpecialExpense,
    deceased,
    survivorAge
  } = params;
  
  // 現在の年間生活費を計算
  const currentAnnualLivingCost = monthlyExpense * 12 + annualSpecialExpense;
  
  // 子どもの情報取得
  let youngestAge = 0;
  let eldestAge = 0;
  if (children.length > 0) {
    youngestAge = Math.min(...children.map(c => c.age));
    eldestAge = Math.max(...children.map(c => c.age));
  }
  
  // 末子独立までの年数と独立後の配偶者の平均余命を計算
  const yearsUntilYoungestIndependent = children.length > 0 ? Math.max(0, 22 - youngestAge) : 0;
  
  // 配偶者の平均余命（末子独立時点から）
  const survivorAgeAtYoungestIndependence = survivorAge + yearsUntilYoungestIndependent;
  const survivorRemainingYears = Math.max(0, 85 - survivorAgeAtYoungestIndependence); // 85歳まで
  
  // ========================================
  // 総支出額の計算
  // ========================================
  
  // 1. 末子独立までの生活費
  // 現在の年間生活費 × 70～80% × （末子の独立時の年齢 - 末子の現在の年齢）
  const livingCostRatioUntilIndependence = 0.75; // 75%で計算（70-80%の中間値）
  const livingCostUntilIndependence = Math.round(
    (currentAnnualLivingCost * livingCostRatioUntilIndependence * yearsUntilYoungestIndependent) / 10000
  ); // 万円
  
  // 2. 末子独立後の配偶者の生活費
  // 現在の年間生活費 × 90%（-10%）× 配偶者の平均余命（末子が独立する時点）
  const livingCostRatioAfterIndependence = 0.90; // 90%で計算（現状-10%）
  const livingCostAfterIndependence = Math.round(
    (currentAnnualLivingCost * livingCostRatioAfterIndependence * survivorRemainingYears) / 10000
  ); // 万円
  
  // 3. 別途必要となる資金
  // 子どもの教育資金
  let totalEducationCost = 0;
  for (const child of children) {
    let baseCost = 0;
    
    // カスタム入力の場合は直接入力された金額を使用（既に万円単位）
    if (child.education === 'custom' && child.customCost) {
      baseCost = parseInt(child.customCost) || 0;
    } else {
      // 標準の教育方針の場合
      baseCost = diagnosisCriteria.deathBenefitCalculation.educationCosts[child.education] || 1000;
    }
    
    const independentCost = child.independent ? diagnosisCriteria.deathBenefitCalculation.collegeIndependentCost : 0;
    totalEducationCost += baseCost + independentCost;
  }
  
  // 葬儀費用・予備費
  const funeralAndReserveFund = 300; // 300万円
  
  // 4. 総支出額
  const totalExpenses = livingCostUntilIndependence + livingCostAfterIndependence + totalEducationCost + funeralAndReserveFund;
  
  // ========================================
  // 総収入額の計算
  // ========================================
  
  // 1. 遺族年金
  const grossIncome = deceased === 'husband' ? incomeData.husbandGross : incomeData.wifeGross;
  let totalSurvivorPension = 0;
  
  if (children.length > 0) {
    // 子どもがいる場合
    const yearsUntil18 = Math.max(0, 18 - youngestAge);
    const yearsFrom18to22 = Math.max(0, Math.min(22, 22 - youngestAge) - yearsUntil18);
    
    // 末子18歳まで: 遺族基礎年金 + 遺族厚生年金
    const basicPension = diagnosisCriteria.deathBenefitCalculation.survivorPension.basicPension; // 万円
    const employeePension = (grossIncome / 10000) * diagnosisCriteria.deathBenefitCalculation.survivorPension.employeePensionRate; // 円→万円変換
    totalSurvivorPension += (basicPension + employeePension) * yearsUntil18;
    
    // 18歳〜22歳: 遺族厚生年金のみ
    const employeePensionAfter18 = employeePension + diagnosisCriteria.deathBenefitCalculation.survivorPension.noChildAddition;
    totalSurvivorPension += employeePensionAfter18 * yearsFrom18to22;
    
    // 末子独立後: 配偶者が65歳になるまで遺族厚生年金
    const yearsFrom22to65 = Math.max(0, 65 - survivorAgeAtYoungestIndependence);
    totalSurvivorPension += employeePensionAfter18 * yearsFrom22to65;
  } else {
    // 子どもがいない場合: 遺族厚生年金のみ（配偶者が65歳になるまで）
    const employeePension = (grossIncome / 10000) * diagnosisCriteria.deathBenefitCalculation.survivorPension.employeePensionRate; // 円→万円変換
    const totalPension = diagnosisCriteria.deathBenefitCalculation.survivorPension.noChildAddition + employeePension;
    const yearsUntil65 = Math.max(0, 65 - survivorAge);
    totalSurvivorPension = totalPension * yearsUntil65;
  }
  totalSurvivorPension = Math.round(totalSurvivorPension); // 万円
  
  // 2. 死亡退職金（円単位で保存されているので、万円に変換）
  let deathRetirement = 0;
  if (deceased === 'husband') {
    deathRetirement = Math.round((parseInt(params.husbandRetirement) || 0) / 10000);
  } else {
    deathRetirement = Math.round((parseInt(params.wifeRetirement) || 0) / 10000);
  }
  
  // 3. 預貯金（緊急予備資金を除く）（円単位で保存されているので、万円に変換）
  const savings = parseInt(params.savings) || 0;
  const otherAssets = parseInt(params.otherAssets) || 0;
  const emergencyFund = monthlyExpense * diagnosisCriteria.deathBenefitCalculation.emergencyFundMonths;
  const availableAssets = Math.max(0, Math.round((savings + otherAssets - emergencyFund) / 10000)); // 万円
  
  // 4. 遺族自身の今後の収入見込み
  let survivorFutureIncome = 0;
  if (deceased === 'husband') {
    // 妻の収入を計算（末子独立まで + 独立後の退職まで）
    const wifeRetirementAge = parseInt(params.wifeRetirementAge) || 65;
    const wifeAnnualNet = incomeData.wifeNet;
    
    // 末子独立までの収入
    survivorFutureIncome += Math.round((wifeAnnualNet * yearsUntilYoungestIndependent) / 10000);
    
    // 独立後〜退職までの収入
    const yearsAfterIndependenceUntilRetirement = Math.max(0, wifeRetirementAge - survivorAgeAtYoungestIndependence);
    survivorFutureIncome += Math.round((wifeAnnualNet * yearsAfterIndependenceUntilRetirement) / 10000);
    
    // 妻の年金（退職後〜85歳まで）
    const wifePension = parseInt(params.wifePension) || 0;
    const yearsAfterRetirement = Math.max(0, 85 - wifeRetirementAge);
    survivorFutureIncome += Math.round((wifePension * yearsAfterRetirement) / 10000);
  } else {
    // 夫の収入を計算（末子独立まで + 独立後の退職まで）
    const husbandRetirementAge = parseInt(params.husbandRetirementAge) || 65;
    const husbandAnnualNet = incomeData.husbandNet;
    
    // 末子独立までの収入
    survivorFutureIncome += Math.round((husbandAnnualNet * yearsUntilYoungestIndependent) / 10000);
    
    // 独立後〜退職までの収入
    const yearsAfterIndependenceUntilRetirement = Math.max(0, husbandRetirementAge - survivorAgeAtYoungestIndependence);
    survivorFutureIncome += Math.round((husbandAnnualNet * yearsAfterIndependenceUntilRetirement) / 10000);
    
    // 夫の年金（退職後〜85歳まで）
    const husbandPension = parseInt(params.husbandPension) || 0;
    const yearsAfterRetirement = Math.max(0, 85 - husbandRetirementAge);
    survivorFutureIncome += Math.round((husbandPension * yearsAfterRetirement) / 10000);
  }
  
  // 5. 団信（団体信用生命保険）による住宅ローン完済（円単位で保存されているので、万円に変換）
  let danshin = 0;
  if (deceased === 'husband') {
    danshin = Math.round((parseInt(params.husbandLoan) || 0) / 10000);
  } else {
    danshin = Math.round((parseInt(params.wifeLoan) || 0) / 10000);
  }
  
  // 6. 総収入額
  const totalIncome = totalSurvivorPension + deathRetirement + availableAssets + survivorFutureIncome + danshin;
  
  // ========================================
  // 必要保障額の計算
  // ========================================
  const requiredBenefit = Math.max(0, totalExpenses - totalIncome);
  
  return {
    // 総支出額の内訳
    livingCostUntilIndependence,
    livingCostAfterIndependence,
    totalEducationCost,
    funeralAndReserveFund,
    totalExpenses,
    
    // 総収入額の内訳
    totalSurvivorPension,
    deathRetirement,
    availableAssets,
    survivorFutureIncome,
    danshin,
    totalIncome,
    
    // 必要保障額
    requiredBenefit,
    
    // 補足情報
    breakdown: {
      currentAnnualLivingCost: Math.round(currentAnnualLivingCost / 10000),
      yearsUntilYoungestIndependent,
      survivorRemainingYears,
      survivorAgeAtYoungestIndependence,
      livingCostRatioUntilIndependence,
      livingCostRatioAfterIndependence
    }
  };
}

/**
 * ライフプランシミュレーション
 * @param {Object} userData - ユーザーデータ
 * @param {Object} incomeData - 収入データ
 * @returns {Object} - シミュレーション結果
 */
function calculateLifePlanSimulation(userData, incomeData) {
  const husbandAge = parseInt(userData.husbandAge);
  const wifeAge = parseInt(userData.wifeAge);
  // すでに円単位に変換済み
  const savings = parseInt(userData.savings) || 0;
  const otherAssets = parseInt(userData.otherAssets) || 0;
  const monthlyExpense = parseInt(userData.monthlyExpense) || 0;
  const annualSpecialExpense = parseInt(userData.annualSpecialExpense) || 0;
  
  const husbandRetirementAge = parseInt(userData.husbandRetirementAge) || 65;
  const wifeRetirementAge = parseInt(userData.wifeRetirementAge) || 65;
  const husbandRetirement = parseInt(userData.husbandRetirement) || 0;
  const wifeRetirement = parseInt(userData.wifeRetirement) || 0;
  const husbandPension = parseInt(userData.husbandPension) || 0;
  const wifePension = parseInt(userData.wifePension) || 0;
  
  const simulations = {
    normal: [], // 通常ケース（夫婦とも生存）
    husbandDeath: [], // 夫死亡時
    wifeDeath: [] // 妻死亡時
  };
  
  // 85歳までシミュレーション
  const maxAge = 85;
  
  // 通常ケース
  let currentAssets = savings + otherAssets;
  for (let age = husbandAge; age <= maxAge; age++) {
    const currentWifeAge = wifeAge + (age - husbandAge);
    
    // 収入
    let annualIncome = 0;
    if (age < husbandRetirementAge) {
      annualIncome += incomeData.husbandNet;
    } else {
      annualIncome += husbandPension;
      if (age === husbandRetirementAge) {
        currentAssets += husbandRetirement;
      }
    }
    
    if (currentWifeAge < wifeRetirementAge) {
      annualIncome += incomeData.wifeNet;
    } else {
      annualIncome += wifePension;
      if (currentWifeAge === wifeRetirementAge) {
        currentAssets += wifeRetirement;
      }
    }
    
    // 支出
    const annualExpense = monthlyExpense * 12 + annualSpecialExpense;
    
    // 資産推移
    currentAssets += annualIncome - annualExpense;
    
    simulations.normal.push({
      age,
      wifeAge: currentWifeAge,
      assets: Math.round(currentAssets / 10000) // 万円
    });
  }
  
  // 夫死亡時シミュレーション（現在夫が死亡したと仮定）
  currentAssets = savings + otherAssets;
  const husbandDeathAge = husbandAge;
  for (let age = wifeAge; age <= maxAge; age++) {
    // 収入（妻のみ）
    let annualIncome = 0;
    if (age < wifeRetirementAge) {
      annualIncome = incomeData.wifeNet;
    } else {
      annualIncome = wifePension;
      if (age === wifeRetirementAge) {
        currentAssets += wifeRetirement;
      }
    }
    
    // 遺族年金（万円単位で計算）
    const survivorPension = (diagnosisCriteria.deathBenefitCalculation.survivorPension.noChildAddition + 
                            (incomeData.husbandGross / 10000) * diagnosisCriteria.deathBenefitCalculation.survivorPension.employeePensionRate) * 10000; // 万円→円変換
    annualIncome += survivorPension;
    
    // 支出（70%に削減）
    const annualExpense = (monthlyExpense * 12 + annualSpecialExpense) * 0.7;
    
    // 資産推移
    currentAssets += annualIncome - annualExpense;
    
    simulations.husbandDeath.push({
      age,
      assets: Math.round(currentAssets / 10000) // 万円
    });
  }
  
  // 妻死亡時シミュレーション（現在妻が死亡したと仮定）
  currentAssets = savings + otherAssets;
  for (let age = husbandAge; age <= maxAge; age++) {
    // 収入（夫のみ）
    let annualIncome = 0;
    if (age < husbandRetirementAge) {
      annualIncome = incomeData.husbandNet;
    } else {
      annualIncome = husbandPension;
      if (age === husbandRetirementAge) {
        currentAssets += husbandRetirement;
      }
    }
    
    // 遺族年金（妻の収入が20%以上の場合のみ考慮）
    const wifeIncomeRatio = incomeData.householdNet === 0 ? 0 : incomeData.wifeNet / incomeData.householdNet;
    if (wifeIncomeRatio >= 0.2) {
      const survivorPension = (diagnosisCriteria.deathBenefitCalculation.survivorPension.noChildAddition + 
                              (incomeData.wifeGross / 10000) * diagnosisCriteria.deathBenefitCalculation.survivorPension.employeePensionRate) * 10000; // 万円→円変換
      annualIncome += survivorPension;
    }
    
    // 支出（生活費削減率は妻の収入比率による）
    let livingCostRatio = 0.70;
    if (wifeIncomeRatio >= 0.4) livingCostRatio = 0.90;
    else if (wifeIncomeRatio >= 0.3) livingCostRatio = 0.85;
    else if (wifeIncomeRatio >= 0.2) livingCostRatio = 0.75;
    
    const annualExpense = (monthlyExpense * 12 + annualSpecialExpense) * livingCostRatio;
    
    // 資産推移
    currentAssets += annualIncome - annualExpense;
    
    simulations.wifeDeath.push({
      age,
      assets: Math.round(currentAssets / 10000) // 万円
    });
  }
  
  return simulations;
}

/**
 * リスク分析（4つのリスク）
 * @param {Object} userData - ユーザーデータ
 * @param {Object} deathBenefit - 必要保障額
 * @returns {Object} - リスク分析結果
 */
function analyzeRisks(userData, deathBenefit) {
  const husbandAge = parseInt(userData.husbandAge);
  const wifeAge = parseInt(userData.wifeAge);
  const existingDeathBenefit = parseInt(userData.existingDeathBenefit) || 0;
  const existingMedical = userData.existingMedical;
  const existingCancer = userData.existingCancer;
  const existingDisability = userData.existingDisability;
  const additionalBenefit = userData.additionalBenefit;
  
  // 1. 死亡リスク
  const deathRiskScore = calculateDeathRiskScore(deathBenefit.husband.requiredBenefit, existingDeathBenefit);
  
  // 2. 就業不能リスク
  const disabilityRiskScore = calculateDisabilityRiskScore(userData, existingDisability);
  
  // 3. 医療費リスク
  const medicalRiskScore = calculateMedicalRiskScore(existingMedical, additionalBenefit, userData);
  
  // 4. 3大疾病リスク
  const criticalIllnessRiskScore = calculateCriticalIllnessRiskScore(userData, existingCancer);
  
  return {
    death: {
      score: deathRiskScore,
      level: getRiskLevel(deathRiskScore),
      priority: deathRiskScore < 50 ? 'high' : deathRiskScore < 80 ? 'medium' : 'low'
    },
    disability: {
      score: disabilityRiskScore,
      level: getRiskLevel(disabilityRiskScore),
      priority: disabilityRiskScore < 50 ? 'high' : disabilityRiskScore < 80 ? 'medium' : 'low'
    },
    medical: {
      score: medicalRiskScore,
      level: getRiskLevel(medicalRiskScore),
      priority: medicalRiskScore < 50 ? 'high' : medicalRiskScore < 80 ? 'medium' : 'low'
    },
    criticalIllness: {
      score: criticalIllnessRiskScore,
      level: getRiskLevel(criticalIllnessRiskScore),
      priority: criticalIllnessRiskScore < 50 ? 'high' : criticalIllnessRiskScore < 80 ? 'medium' : 'low'
    }
  };
}

/**
 * 死亡リスクスコア計算
 */
function calculateDeathRiskScore(requiredBenefit, existingBenefit) {
  if (requiredBenefit === 0) return 100;
  // existingBenefitは円単位で保存されているので、万円に変換
  const coverageRatio = (existingBenefit / 10000) / requiredBenefit;
  return Math.min(100, Math.round(coverageRatio * 100));
}

/**
 * 就業不能リスクスコア計算
 */
function calculateDisabilityRiskScore(userData, existingDisability) {
  const riskConcerns = userData.riskConcerns || [];
  const concerns = userData.concerns || [];
  const hasMentalRisk = riskConcerns.includes('mental');
  const hasLongAbsenceRisk = riskConcerns.includes('long-absence');
  const hasIncomeLossConcern = concerns.includes('income-loss');
  
  if (existingDisability === 'comprehensive') return 90;
  if (existingDisability === 'basic') return 60;
  
  // リスク懸念や心配事がある場合はスコアを下げる
  if (hasMentalRisk || hasLongAbsenceRisk || hasIncomeLossConcern) return 20;
  return 40;
}

/**
 * 医療費リスクスコア計算
 */
function calculateMedicalRiskScore(existingMedical, additionalBenefit, userData) {
  const concerns = userData?.concerns || [];
  let score = 50;
  
  if (existingMedical === 'comprehensive') {
    score = 90;
  } else if (existingMedical === 'basic') {
    score = 70;
  }
  
  // 付加給付による調整
  if (additionalBenefit === 'corporate') {
    score += 10; // 大企業・公務員は医療費負担が少ない
  }
  
  // 医療費の心配がある場合はスコアを下げる
  if (concerns.includes('medical-cost')) {
    score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * 3大疾病リスクスコア計算
 */
function calculateCriticalIllnessRiskScore(userData, existingCancer) {
  const healthStatus = userData.healthStatus;
  
  let score = 50;
  
  if (existingCancer === 'comprehensive') {
    score = 85;
  } else if (existingCancer === 'basic') {
    score = 65;
  }
  
  // 健康状態による調整
  if (healthStatus === 'poor') {
    score -= 10;
  }
  
  return Math.max(0, score);
}

/**
 * リスクレベル判定
 */
function getRiskLevel(score) {
  if (score >= 80) return 'low';
  if (score >= 50) return 'medium';
  return 'high';
}

/**
 * 保障充足度分析
 */
function analyzeCoverageAdequacy(userData, deathBenefit) {
  // 円単位で保存されている
  const existingDeathBenefit = parseInt(userData.existingDeathBenefit) || 0;
  const wifeExistingDeathBenefit = parseInt(userData.wifeExistingDeathBenefit) || 0;
  
  return {
    husband: {
      required: deathBenefit.husband.requiredBenefit,
      existing: Math.round(existingDeathBenefit / 10000),
      shortage: Math.max(0, deathBenefit.husband.requiredBenefit - Math.round(existingDeathBenefit / 10000)),
      coverageRatio: deathBenefit.husband.requiredBenefit === 0 ? 100 : 
                     Math.min(100, Math.round((existingDeathBenefit / 10000) / deathBenefit.husband.requiredBenefit * 100))
    },
    wife: {
      required: deathBenefit.wife.requiredBenefit,
      existing: Math.round(wifeExistingDeathBenefit / 10000),
      shortage: Math.max(0, deathBenefit.wife.requiredBenefit - Math.round(wifeExistingDeathBenefit / 10000)),
      coverageRatio: deathBenefit.wife.requiredBenefit === 0 ? 100 : 
                     Math.min(100, Math.round((wifeExistingDeathBenefit / 10000) / deathBenefit.wife.requiredBenefit * 100))
    }
  };
}

/**
 * 保険商品マッチング（価値観・心配事を考慮）
 */
function matchInsuranceProducts(userData, riskAnalysis, coverageAnalysis) {
  const husbandAge = parseInt(userData.husbandAge);
  const smoking = userData.smoking;
  const husbandOccupation = userData.husbandOccupation;
  // 円単位で保存されているので、万円に変換
  const savings = parseInt(userData.savings) || 0;
  const otherAssets = parseInt(userData.otherAssets) || 0;
  const totalAssets = (savings + otherAssets) / 10000; // 万円
  
  // 心配事と価値観を取得
  const concerns = userData.concerns || [];
  const values = userData.values || [];
  const riskConcerns = userData.riskConcerns || []; // 旧リスク懸念（後方互換性）
  
  const products = {
    highPriority: [],
    mediumPriority: [],
    lowPriority: []
  };
  
  // 1. 死亡保障（収入保障保険）
  // 条件: 死亡リスクが高い OR 「家族の生活」「収入が途絶える」が心配
  if (riskAnalysis.death.priority === 'high' || 
      concerns.includes('family-life') || 
      concerns.includes('income-loss')) {
    const incomeProducts = smoking === 'non-smoker' ? 
      insuranceDatabase.income.nonSmoker : 
      insuranceDatabase.income.smoker;
    
    // 「安心重視」なら最優先、「コスト重視」なら中優先
    if (values.includes('coverage-priority')) {
      products.highPriority.push(...incomeProducts.map(p => ({...p, category: '収入保障保険', reason: '万が一のときの家族の生活を守る'})));
    } else if (values.includes('cost-priority')) {
      products.mediumPriority.push(...incomeProducts.map(p => ({...p, category: '収入保障保険', reason: 'コストを抑えつつ必要保障を確保'})));
    } else {
      products.highPriority.push(...incomeProducts.map(p => ({...p, category: '収入保障保険', reason: '万が一のときの家族の生活を守る'})));
    }
  }
  
  // 2. 就業不能保険
  // 条件: 就業不能リスクが高中 OR 「収入が途絶える」が心配
  if (riskAnalysis.disability.priority === 'high' || 
      riskAnalysis.disability.priority === 'medium' ||
      concerns.includes('income-loss')) {
    const disabilityProducts = husbandAge < diagnosisCriteria.disabilityInsuranceAgeThreshold ? 
      insuranceDatabase.disability.under40 : 
      insuranceDatabase.disability.over40;
    products.highPriority.push(...disabilityProducts.map(p => ({...p, category: '就業不能保険', reason: '働けなくなったときの収入を保障'})));
  }
  
  // 3. 医療・がん保険
  // 条件: 医療リスクが高中 OR 「医療費が心配」
  if (riskAnalysis.medical.priority === 'high' || 
      riskAnalysis.medical.priority === 'medium' ||
      concerns.includes('medical-cost')) {
    
    // 「安心重視」なら高優先、それ以外は中優先
    if (values.includes('coverage-priority')) {
      products.highPriority.push(...insuranceDatabase.medical.map(p => ({...p, category: '医療・がん保険', reason: '高額な医療費に備える'})));
    } else {
      products.mediumPriority.push(...insuranceDatabase.medical.map(p => ({...p, category: '医療・がん保険', reason: '高額な医療費に備える'})));
    }
  }
  
  // 4. 変額保険（資産形成）
  // 条件: 資産100万円以上 OR 「貯蓄性も欲しい」「資産を残したい」
  if (totalAssets >= 100 || 
      values.includes('savings') || 
      values.includes('inheritance')) {
    
    if (husbandOccupation === 'self-employed') {
      // 自営業: 保障メイン
      products.mediumPriority.push(...insuranceDatabase.variableProtection.map(p => ({...p, category: '変額保険（保障メイン）', reason: '保障と資産形成を両立'})));
    } else {
      // 会社員: 運用メイン
      if (values.includes('savings')) {
        products.mediumPriority.push(...insuranceDatabase.variableInvestment.map(p => ({...p, category: '変額保険（運用メイン）', reason: '保険料控除を活用した資産形成'})));
      } else {
        products.lowPriority.push(...insuranceDatabase.variableInvestment.map(p => ({...p, category: '変額保険（運用メイン）', reason: '保険料控除を活用した資産形成'})));
      }
    }
  }
  
  // 5. 一時払い終身保険
  // 条件: 50歳以上 & 資産500万円以上 OR 「老後の心配」「資産を残したい」
  if ((husbandAge >= diagnosisCriteria.seniorAgeThreshold && totalAssets >= diagnosisCriteria.minAssetsForLumpSum) ||
      (concerns.includes('retirement') && totalAssets >= 300) ||
      values.includes('inheritance')) {
    products.mediumPriority.push(...insuranceDatabase.lumpSum.map(p => ({...p, category: '一時払い終身保険', reason: '相続対策と資産運用を両立'})));
  }
  
  // 6. 介護保険
  // 条件: 50歳以上 OR 「老後の心配」
  if (husbandAge >= diagnosisCriteria.seniorAgeThreshold || 
      concerns.includes('retirement') ||
      riskConcerns.includes('nursing-care')) {
    products.mediumPriority.push(...insuranceDatabase.nursingCare.map(p => ({...p, category: '介護保険', reason: '介護費用に備える'})));
  }
  
  // 優先度の調整（価値観による）
  // 「柔軟性重視」の場合、すべての商品を中優先に
  if (values.includes('flexibility')) {
    products.mediumPriority.push(...products.highPriority);
    products.highPriority = [];
  }
  
  return products;
}
