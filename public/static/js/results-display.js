/**
 * 結果表示機能
 * Results Display Functions
 */

/**
 * 16:9スライド形式のHTMLを生成
 */
function generateSlidesHTML(results) {
  const slides = [];
  
  // スライド1: サマリー
  slides.push(generateSummarySlide(results));
  
  // スライド2: 死亡リスク分析
  slides.push(generateDeathRiskSlide(results));
  
  // スライド3: 就業不能リスク分析
  slides.push(generateDisabilityRiskSlide(results));
  
  // スライド4: 医療費リスク分析
  slides.push(generateMedicalRiskSlide(results));
  
  // スライド5: 3大疾病リスク分析
  slides.push(generateCriticalIllnessRiskSlide(results));
  
  // スライド6: 総合評価とおすすめ商品
  slides.push(generateRecommendationSlide(results));
  
  return slides.join('');
}

/**
 * サマリースライド
 */
function generateSummarySlide(results) {
  const { incomeData, deathBenefit, riskAnalysis } = results;
  
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">保険診断結果サマリー</h1>
        <p class="slide-subtitle">Insurance Diagnosis Report</p>
      </div>
      <div class="slide-content">
        <div class="risk-grid">
          <div class="risk-card">
            <div class="risk-card-header">
              <div class="risk-icon death"><i class="fas fa-heart-broken"></i></div>
              <div>
                <div class="risk-title">死亡リスク</div>
                <div class="risk-coverage ${riskAnalysis.death.level === 'high' ? 'insufficient' : riskAnalysis.death.level === 'medium' ? 'partial' : 'sufficient'}">
                  対応度: ${riskAnalysis.death.score}%
                </div>
              </div>
            </div>
            <div class="risk-content">
              必要保障額: ${deathBenefit.husband.requiredBenefit.toLocaleString()}万円<br>
              優先度: ${getPriorityLabel(riskAnalysis.death.priority)}
            </div>
          </div>
          
          <div class="risk-card">
            <div class="risk-card-header">
              <div class="risk-icon disability"><i class="fas fa-user-injured"></i></div>
              <div>
                <div class="risk-title">就業不能リスク</div>
                <div class="risk-coverage ${riskAnalysis.disability.level === 'high' ? 'insufficient' : riskAnalysis.disability.level === 'medium' ? 'partial' : 'sufficient'}">
                  対応度: ${riskAnalysis.disability.score}%
                </div>
              </div>
            </div>
            <div class="risk-content">
              公的保障: 傷病手当金・障害年金<br>
              優先度: ${getPriorityLabel(riskAnalysis.disability.priority)}
            </div>
          </div>
          
          <div class="risk-card">
            <div class="risk-card-header">
              <div class="risk-icon medical"><i class="fas fa-hospital"></i></div>
              <div>
                <div class="risk-title">医療費リスク</div>
                <div class="risk-coverage ${riskAnalysis.medical.level === 'high' ? 'insufficient' : riskAnalysis.medical.level === 'medium' ? 'partial' : 'sufficient'}">
                  対応度: ${riskAnalysis.medical.score}%
                </div>
              </div>
            </div>
            <div class="risk-content">
              公的保障: 高額療養費制度<br>
              優先度: ${getPriorityLabel(riskAnalysis.medical.priority)}
            </div>
          </div>
          
          <div class="risk-card">
            <div class="risk-card-header">
              <div class="risk-icon critical"><i class="fas fa-disease"></i></div>
              <div>
                <div class="risk-title">3大疾病リスク</div>
                <div class="risk-coverage ${riskAnalysis.criticalIllness.level === 'high' ? 'insufficient' : riskAnalysis.criticalIllness.level === 'medium' ? 'partial' : 'sufficient'}">
                  対応度: ${riskAnalysis.criticalIllness.score}%
                </div>
              </div>
            </div>
            <div class="risk-content">
              公的保障: 高額療養費・障害年金<br>
              優先度: ${getPriorityLabel(riskAnalysis.criticalIllness.priority)}
            </div>
          </div>
        </div>
        
        <div class="chart-grid mt-xl">
          <div class="chart-container">
            <h3 class="chart-title">ライフプランシミュレーション</h3>
            <div class="chart-wrapper">
              <canvas id="lifePlanChart"></canvas>
            </div>
          </div>
          <div class="chart-container">
            <h3 class="chart-title">リスク対応度</h3>
            <div class="chart-wrapper">
              <canvas id="riskRadarChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 死亡リスクスライド
 */
function generateDeathRiskSlide(results) {
  const { deathBenefit, userData, coverageAnalysis } = results;
  const husband = deathBenefit.husband;
  const wife = deathBenefit.wife;
  
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">死亡リスク分析</h1>
        <p class="slide-subtitle">Death Risk Analysis</p>
      </div>
      <div class="slide-content">
        <div class="alert alert-info">
          <i class="fas fa-info-circle"></i>
          <div>
            <strong>${socialSecurityInfo.deathRisk.title}</strong><br>
            ${socialSecurityInfo.deathRisk.description}<br>
            <strong>カバー範囲:</strong> ${socialSecurityInfo.deathRisk.coverage}<br>
            <strong>不足する部分:</strong> ${socialSecurityInfo.deathRisk.gap}
          </div>
        </div>
        
        <h3 class="subsection-title mt-lg">夫死亡時の必要保障額</h3>
        <div class="calculation-details">
          <div class="calculation-row">
            <span class="calculation-label">生活費総額</span>
            <span class="calculation-value positive">+${husband.totalLivingCost.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">教育費総額</span>
            <span class="calculation-value positive">+${husband.totalEducationCost.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">遺族年金（生涯）</span>
            <span class="calculation-value negative">-${husband.totalSurvivorPension.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">利用可能資産</span>
            <span class="calculation-value negative">-${husband.availableAssets.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">妻の退職金（老後資金）</span>
            <span class="calculation-value negative">-${husband.retirementAllocation.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">団信（住宅ローン完済）</span>
            <span class="calculation-value negative">-${husband.danshin.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label"><strong>必要保障額</strong></span>
            <span class="calculation-value"><strong>${husband.requiredBenefit.toLocaleString()}万円</strong></span>
          </div>
        </div>
        
        <div class="chart-grid mt-xl">
          <div class="chart-container">
            <h3 class="chart-title">夫死亡時 - 必要保障額の内訳</h3>
            <div class="chart-wrapper">
              <canvas id="deathBenefitBreakdownChartHusband"></canvas>
            </div>
          </div>
          <div class="chart-container">
            <h3 class="chart-title">夫の保障充足度</h3>
            <div class="chart-wrapper">
              <canvas id="deathCoverageChartHusband"></canvas>
            </div>
            <p class="text-center mt-md">
              <strong>充足率: ${coverageAnalysis.husband.coverageRatio}%</strong><br>
              不足額: <span class="text-danger">${coverageAnalysis.husband.shortage.toLocaleString()}万円</span>
            </p>
          </div>
        </div>
        
        <h3 class="subsection-title mt-lg">妻死亡時の必要保障額</h3>
        <div class="calculation-details">
          <div class="calculation-row">
            <span class="calculation-label">生活費総額</span>
            <span class="calculation-value positive">+${wife.totalLivingCost.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">教育費総額</span>
            <span class="calculation-value positive">+${wife.totalEducationCost.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">遺族年金（生涯）</span>
            <span class="calculation-value negative">-${wife.totalSurvivorPension.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">利用可能資産</span>
            <span class="calculation-value negative">-${wife.availableAssets.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">夫の退職金（老後資金）</span>
            <span class="calculation-value negative">-${wife.retirementAllocation.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">団信（住宅ローン完済）</span>
            <span class="calculation-value negative">-${wife.danshin.toLocaleString()}万円</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label"><strong>必要保障額</strong></span>
            <span class="calculation-value"><strong>${wife.requiredBenefit.toLocaleString()}万円</strong></span>
          </div>
        </div>
        
        <div class="chart-grid mt-xl">
          <div class="chart-container">
            <h3 class="chart-title">妻死亡時 - 必要保障額の内訳</h3>
            <div class="chart-wrapper">
              <canvas id="deathBenefitBreakdownChartWife"></canvas>
            </div>
          </div>
          <div class="chart-container">
            <h3 class="chart-title">妻の保障充足度</h3>
            <div class="chart-wrapper">
              <canvas id="deathCoverageChartWife"></canvas>
            </div>
            <p class="text-center mt-md">
              <strong>充足率: ${coverageAnalysis.wife.coverageRatio}%</strong><br>
              不足額: <span class="text-danger">${coverageAnalysis.wife.shortage.toLocaleString()}万円</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 就業不能リスクスライド
 */
function generateDisabilityRiskSlide(results) {
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">就業不能リスク分析</h1>
        <p class="slide-subtitle">Disability Risk Analysis</p>
      </div>
      <div class="slide-content">
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <strong>${socialSecurityInfo.disabilityRisk.title}</strong><br>
            ${socialSecurityInfo.disabilityRisk.description}<br>
            <strong>カバー範囲:</strong> ${socialSecurityInfo.disabilityRisk.coverage}<br>
            <strong>不足する部分:</strong> ${socialSecurityInfo.disabilityRisk.gap}
          </div>
        </div>
        
        <h3 class="subsection-title mt-lg">公的保障の詳細</h3>
        <div class="risk-grid">
          ${socialSecurityInfo.disabilityRisk.details.map(detail => `
            <div class="alert alert-info">
              <i class="fas fa-check-circle"></i>
              <div>${detail}</div>
            </div>
          `).join('')}
        </div>
        
        <h3 class="subsection-title mt-lg">民間保険による補完</h3>
        <div class="calculation-details">
          <div class="calculation-row">
            <span class="calculation-label">傷病手当金（会社員のみ）</span>
            <span class="calculation-value">給与の約2/3を最長1年6ヶ月</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">障害年金</span>
            <span class="calculation-value">障害等級に応じて支給</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">就業不能保険の必要性</span>
            <span class="calculation-value positive"><strong>長期化リスクへの備えとして重要</strong></span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 医療費リスクスライド
 */
function generateMedicalRiskSlide(results) {
  const { userData } = results;
  const additionalBenefit = userData.additionalBenefit;
  const limit = diagnosisCriteria.additionalBenefitLimits[additionalBenefit] || 100000;
  
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">医療費リスク分析</h1>
        <p class="slide-subtitle">Medical Cost Risk Analysis</p>
      </div>
      <div class="slide-content">
        <div class="alert alert-info">
          <i class="fas fa-hospital"></i>
          <div>
            <strong>${socialSecurityInfo.medicalRisk.title}</strong><br>
            ${socialSecurityInfo.medicalRisk.description}<br>
            <strong>カバー範囲:</strong> ${socialSecurityInfo.medicalRisk.coverage}<br>
            <strong>不足する部分:</strong> ${socialSecurityInfo.medicalRisk.gap}
          </div>
        </div>
        
        <h3 class="subsection-title mt-lg">あなたの医療費自己負担額</h3>
        <div class="calculation-details">
          <div class="calculation-row">
            <span class="calculation-label">付加給付制度</span>
            <span class="calculation-value">${getAdditionalBenefitLabel(additionalBenefit)}</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">月額の医療費自己負担上限</span>
            <span class="calculation-value positive"><strong>${(limit / 10000).toFixed(1)}万円</strong></span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">入院1ヶ月の実質負担</span>
            <span class="calculation-value">${(limit / 10000).toFixed(1)}万円 + 差額ベッド代等</span>
          </div>
        </div>
        
        <h3 class="subsection-title mt-lg">民間医療保険の必要性評価</h3>
        <div class="risk-grid">
          <div class="alert ${additionalBenefit === 'corporate' ? 'alert-success' : 'alert-warning'}">
            <i class="fas ${additionalBenefit === 'corporate' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            <div>
              ${additionalBenefit === 'corporate' ? 
                '<strong>自己負担が少ないため、民間医療保険の優先度は中程度</strong><br>差額ベッド代や先進医療への備えを検討' :
                '<strong>自己負担が大きいため、民間医療保険の加入を推奨</strong><br>長期入院や先進医療への備えが重要'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 3大疾病リスクスライド
 */
function generateCriticalIllnessRiskSlide(results) {
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">3大疾病リスク分析</h1>
        <p class="slide-subtitle">Critical Illness Risk Analysis</p>
      </div>
      <div class="slide-content">
        <div class="alert alert-danger">
          <i class="fas fa-disease"></i>
          <div>
            <strong>${socialSecurityInfo.criticalIllnessRisk.title}</strong><br>
            ${socialSecurityInfo.criticalIllnessRisk.description}<br>
            <strong>カバー範囲:</strong> ${socialSecurityInfo.criticalIllnessRisk.coverage}<br>
            <strong>不足する部分:</strong> ${socialSecurityInfo.criticalIllnessRisk.gap}
          </div>
        </div>
        
        <h3 class="subsection-title mt-lg">3大疾病の公的保障</h3>
        <div class="risk-grid">
          ${socialSecurityInfo.criticalIllnessRisk.details.map(detail => `
            <div class="alert alert-info">
              <i class="fas fa-shield-alt"></i>
              <div>${detail}</div>
            </div>
          `).join('')}
        </div>
        
        <h3 class="subsection-title mt-lg">民間保険による補完</h3>
        <div class="calculation-details">
          <div class="calculation-row">
            <span class="calculation-label">がん保険</span>
            <span class="calculation-value">診断一時金、治療費、先進医療をカバー</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">特定疾病保険</span>
            <span class="calculation-value">3大疾病診断で一時金支給</span>
          </div>
          <div class="calculation-row">
            <span class="calculation-label">医療保険の特約</span>
            <span class="calculation-value">入院・手術・通院を幅広くカバー</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * おすすめ商品スライド
 */
function generateRecommendationSlide(results) {
  const { recommendedProducts } = results;
  
  function generateProductCards(products, priority) {
    if (products.length === 0) {
      return '<p class="text-center">該当商品なし</p>';
    }
    
    return products.map(product => `
      <div class="risk-card">
        <div class="risk-card-header">
          <div class="risk-icon ${priority === 'high' ? 'death' : priority === 'medium' ? 'disability' : 'medical'}">
            ${product.recommended ? '<i class="fas fa-star"></i>' : '<i class="fas fa-check"></i>'}
          </div>
          <div>
            <div class="risk-title">${product.company}</div>
            <div class="risk-subtitle">${product.name}</div>
          </div>
        </div>
        <div class="risk-content">
          <strong>${product.category}</strong><br>
          ${product.price}<br>
          ${product.features.map(f => `<i class="fas fa-check-circle"></i> ${f}`).join('<br>')}
        </div>
      </div>
    `).join('');
  }
  
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">おすすめ保険商品</h1>
        <p class="slide-subtitle">Recommended Insurance Products</p>
      </div>
      <div class="slide-content">
        <h3 class="subsection-title">
          <i class="fas fa-exclamation-circle" style="color: var(--danger);"></i> 
          優先度：高（早急な対応が必要）
        </h3>
        <div class="risk-grid">
          ${generateProductCards(recommendedProducts.highPriority, 'high')}
        </div>
        
        <h3 class="subsection-title mt-xl">
          <i class="fas fa-info-circle" style="color: var(--warning);"></i> 
          優先度：中（検討をおすすめ）
        </h3>
        <div class="risk-grid">
          ${generateProductCards(recommendedProducts.mediumPriority, 'medium')}
        </div>
        
        ${recommendedProducts.lowPriority.length > 0 ? `
          <h3 class="subsection-title mt-xl">
            <i class="fas fa-lightbulb" style="color: var(--info);"></i> 
            優先度：低（余裕があれば検討）
          </h3>
          <div class="risk-grid">
            ${generateProductCards(recommendedProducts.lowPriority, 'low')}
          </div>
        ` : ''}
        
        <div class="alert alert-success mt-xl">
          <i class="fas fa-user-tie"></i>
          <div>
            <strong>次のステップ</strong><br>
            FPとの面談で、あなたに最適な保険プランを詳しくご提案いたします。<br>
            この診断結果をもとに、具体的な保険料や加入手続きについてご説明させていただきます。
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * すべてのチャートを描画
 */
function drawAllCharts(results) {
  // ライフプランシミュレーション
  drawLifePlanChart('lifePlanChart', results.lifePlanSimulation);
  
  // リスク対応度レーダーチャート
  drawRiskRadarChart('riskRadarChart', results.riskAnalysis);
  
  // 死亡保障充足度（夫）
  drawDeathCoverageChartHusband('deathCoverageChartHusband', results.coverageAnalysis);
  
  // 死亡保障充足度（妻）
  drawDeathCoverageChartWife('deathCoverageChartWife', results.coverageAnalysis);
  
  // 必要保障額の内訳（夫）
  drawDeathBenefitBreakdownChart('deathBenefitBreakdownChartHusband', results.deathBenefit, 'husband');
  
  // 必要保障額の内訳（妻）
  drawDeathBenefitBreakdownChart('deathBenefitBreakdownChartWife', results.deathBenefit, 'wife');
}

/**
 * 優先度ラベルを取得
 */
function getPriorityLabel(priority) {
  const labels = {
    'high': '高',
    'medium': '中',
    'low': '低'
  };
  return labels[priority] || priority;
}
