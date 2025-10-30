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
      independent: userData[`child${i}Independent`] === 'yes'
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
  
  // 月々の生活費
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
 * @param {Object} params - パラメータ
 * @returns {Object} - 計算結果
 */
function calculateDeathBenefitForSpouse(params) {
  const {
    incomeData,
    children,
    yearsUntilYoungestGraduate,
    monthlyExpense,
    annualSpecialExpense,
    deceased,
    survivorAge
  } = params;
  
  // 遺族の収入比率を計算
  let survivorIncomeRatio;
  if (deceased === 'husband') {
    survivorIncomeRatio = incomeData.householdNet === 0 ? 0 : incomeData.wifeNet / incomeData.householdNet;
  } else {
    survivorIncomeRatio = incomeData.householdNet === 0 ? 0 : incomeData.husbandNet / incomeData.householdNet;
  }
  
  // 生活費削減率を動的計算
  // 配偶者の収入比率が高いほど、生活費削減が少ない
  let livingCostRatio;
  if (survivorIncomeRatio >= 0.4) {
    livingCostRatio = 0.90; // 収入比率40%以上: 生活費90%
  } else if (survivorIncomeRatio >= 0.3) {
    livingCostRatio = 0.85; // 収入比率30〜40%: 生活費85%
  } else if (survivorIncomeRatio >= 0.2) {
    livingCostRatio = 0.75; // 収入比率20〜30%: 生活費75%
  } else {
    livingCostRatio = 0.70; // 収入比率20%未満: 生活費70%
  }
  
  // 1. 生活費総額
  const annualLivingCost = (monthlyExpense * 12 + annualSpecialExpense) * livingCostRatio;
  const totalLivingCost = Math.round(annualLivingCost * yearsUntilYoungestGraduate / 10000); // 万円
  
  // 2. 教育費
  let totalEducationCost = 0;
  for (const child of children) {
    const baseCost = diagnosisCriteria.deathBenefitCalculation.educationCosts[child.education] || 1000;
    const independentCost = child.independent ? diagnosisCriteria.deathBenefitCalculation.collegeIndependentCost : 0;
    totalEducationCost += baseCost + independentCost;
  }
  
  // 3. 遺族年金
  const grossIncome = deceased === 'husband' ? incomeData.husbandGross : incomeData.wifeGross;
  let totalSurvivorPension = 0;
  
  if (children.length > 0) {
    // 子どもがいる場合
    const youngestAge = Math.min(...children.map(c => c.age));
    const yearsUntil18 = Math.max(0, 18 - youngestAge);
    const yearsFrom18to22 = Math.max(0, Math.min(22 - youngestAge, 22 - 18));
    
    // 末子18歳まで: 基礎年金 + 厚生年金
    const basicPension = diagnosisCriteria.deathBenefitCalculation.survivorPension.basicPension;
    const employeePension = grossIncome * diagnosisCriteria.deathBenefitCalculation.survivorPension.employeePensionRate;
    totalSurvivorPension += (basicPension + employeePension) * yearsUntil18;
    
    // 18歳〜22歳: 厚生年金のみ
    const employeePensionAfter18 = employeePension + diagnosisCriteria.deathBenefitCalculation.survivorPension.noChildAddition;
    totalSurvivorPension += employeePensionAfter18 * yearsFrom18to22;
  } else {
    // 子どもがいない場合
    const employeePension = grossIncome * diagnosisCriteria.deathBenefitCalculation.survivorPension.employeePensionRate;
    const totalPension = diagnosisCriteria.deathBenefitCalculation.survivorPension.noChildAddition + employeePension;
    totalSurvivorPension = totalPension * yearsUntilYoungestGraduate;
  }
  totalSurvivorPension = Math.round(totalSurvivorPension / 10000); // 万円
  
  // 4. 利用可能資産
  const savings = parseInt(params.savings) || 0;
  const otherAssets = parseInt(params.otherAssets) || 0;
  const emergencyFund = monthlyExpense * diagnosisCriteria.deathBenefitCalculation.emergencyFundMonths;
  const availableAssets = Math.round((savings + otherAssets - emergencyFund) / 10000); // 万円
  
  // 5. 退職金（生存配偶者の退職金を老後資金に充当）
  let retirementAllocation = 0;
  if (deceased === 'husband') {
    const wifeRetirement = parseInt(params.wifeRetirement) || 0;
    retirementAllocation = Math.round(wifeRetirement * diagnosisCriteria.deathBenefitCalculation.retirementFundAllocation / 10000);
  } else {
    const husbandRetirement = parseInt(params.husbandRetirement) || 0;
    retirementAllocation = Math.round(husbandRetirement * diagnosisCriteria.deathBenefitCalculation.retirementFundAllocation / 10000);
  }
  
  // 6. 団信（団体信用生命保険）による住宅ローン完済
  let danshin = 0;
  if (deceased === 'husband') {
    danshin = Math.round((parseInt(params.husbandLoan) || 0) / 10000);
  } else {
    danshin = Math.round((parseInt(params.wifeLoan) || 0) / 10000);
  }
  
  // 必要保障額の計算
  const requiredBenefit = Math.max(0, totalLivingCost + totalEducationCost - totalSurvivorPension - availableAssets - retirementAllocation - danshin);
  
  // 最小保障額の設定（妻死亡時の場合）
  let finalRequiredBenefit = requiredBenefit;
  if (deceased === 'wife' && survivorIncomeRatio < 0.2) {
    // 妻の収入が少ない場合、最小限の保障（500万円以下）
    finalRequiredBenefit = Math.min(requiredBenefit, 500);
  }
  
  return {
    totalLivingCost,
    totalEducationCost,
    totalSurvivorPension,
    availableAssets,
    retirementAllocation,
    danshin,
    requiredBenefit: finalRequiredBenefit,
    breakdown: {
      annualLivingCost: Math.round(annualLivingCost / 10000),
      yearsUntilYoungestGraduate,
      livingCostRatio,
      survivorIncomeRatio
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
    
    // 遺族年金
    const survivorPension = (diagnosisCriteria.deathBenefitCalculation.survivorPension.noChildAddition + 
                            incomeData.husbandGross * diagnosisCriteria.deathBenefitCalculation.survivorPension.employeePensionRate) * 10000;
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
                              incomeData.wifeGross * diagnosisCriteria.deathBenefitCalculation.survivorPension.employeePensionRate) * 10000;
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
  const medicalRiskScore = calculateMedicalRiskScore(existingMedical, additionalBenefit);
  
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
  const coverageRatio = (existingBenefit / 10000) / requiredBenefit;
  return Math.min(100, Math.round(coverageRatio * 100));
}

/**
 * 就業不能リスクスコア計算
 */
function calculateDisabilityRiskScore(userData, existingDisability) {
  const riskConcerns = userData.riskConcerns || [];
  const hasMentalRisk = riskConcerns.includes('mental');
  const hasLongAbsenceRisk = riskConcerns.includes('long-absence');
  
  if (existingDisability === 'comprehensive') return 90;
  if (existingDisability === 'basic') return 60;
  
  // リスク懸念がある場合はスコアを下げる
  if (hasMentalRisk || hasLongAbsenceRisk) return 20;
  return 40;
}

/**
 * 医療費リスクスコア計算
 */
function calculateMedicalRiskScore(existingMedical, additionalBenefit) {
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
  
  return Math.min(100, score);
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
  const existingDeathBenefit = parseInt(userData.existingDeathBenefit) || 0;
  
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
      existing: 0, // 妻の既契約保険は通常入力されない
      shortage: deathBenefit.wife.requiredBenefit,
      coverageRatio: 0
    }
  };
}

/**
 * 保険商品マッチング
 */
function matchInsuranceProducts(userData, riskAnalysis, coverageAnalysis) {
  const husbandAge = parseInt(userData.husbandAge);
  const smoking = userData.smoking;
  const husbandOccupation = userData.husbandOccupation;
  const savings = parseInt(userData.savings) || 0;
  const otherAssets = parseInt(userData.otherAssets) || 0;
  const totalAssets = (savings + otherAssets) / 10000; // 万円
  
  const products = {
    highPriority: [],
    mediumPriority: [],
    lowPriority: []
  };
  
  // 死亡保障
  if (riskAnalysis.death.priority === 'high') {
    const incomeProducts = smoking === 'non-smoker' ? 
      insuranceDatabase.income.nonSmoker : 
      insuranceDatabase.income.smoker;
    products.highPriority.push(...incomeProducts.map(p => ({...p, category: '収入保障保険'})));
  }
  
  // 就業不能保険
  if (riskAnalysis.disability.priority === 'high' || riskAnalysis.disability.priority === 'medium') {
    const disabilityProducts = husbandAge < diagnosisCriteria.disabilityInsuranceAgeThreshold ? 
      insuranceDatabase.disability.under40 : 
      insuranceDatabase.disability.over40;
    products.highPriority.push(...disabilityProducts.map(p => ({...p, category: '就業不能保険'})));
  }
  
  // 医療保険
  if (riskAnalysis.medical.priority === 'high' || riskAnalysis.medical.priority === 'medium') {
    products.mediumPriority.push(...insuranceDatabase.medical.map(p => ({...p, category: '医療・がん保険'})));
  }
  
  // 変額保険（資産形成）
  if (totalAssets >= 100) {
    if (husbandOccupation === 'self-employed') {
      products.mediumPriority.push(...insuranceDatabase.variableProtection.map(p => ({...p, category: '変額保険（保障メイン）'})));
    } else {
      products.lowPriority.push(...insuranceDatabase.variableInvestment.map(p => ({...p, category: '変額保険（運用メイン）'})));
    }
  }
  
  // 一時払い終身保険
  if (husbandAge >= diagnosisCriteria.seniorAgeThreshold && totalAssets >= diagnosisCriteria.minAssetsForLumpSum) {
    products.mediumPriority.push(...insuranceDatabase.lumpSum.map(p => ({...p, category: '一時払い終身保険'})));
  }
  
  // 介護保険
  if (husbandAge >= diagnosisCriteria.seniorAgeThreshold) {
    const riskConcerns = userData.riskConcerns || [];
    if (riskConcerns.includes('nursing-care')) {
      products.mediumPriority.push(...insuranceDatabase.nursingCare.map(p => ({...p, category: '介護保険'})));
    }
  }
  
  return products;
}
