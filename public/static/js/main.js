/**
 * メインJavaScript - フォーム制御と結果表示
 * Main JavaScript - Form Control and Results Display
 */

// グローバル変数
let currentStep = 1;
let userData = {};
let diagnosisResults = null;

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  initializeForm();
  attachEventListeners();
});

/**
 * フォームの初期化
 */
function initializeForm() {
  // 子どもの詳細フォームを初期化
  updateChildrenDetails();
  
  // 手取り年収の計算を初期化
  updateNetIncomeDisplay();
}

/**
 * イベントリスナーの設定
 */
function attachEventListeners() {
  // 次へボタン
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', function() {
      const nextStep = parseInt(this.dataset.next);
      if (validateStep(currentStep)) {
        saveStepData(currentStep);
        goToStep(nextStep);
      }
    });
  });
  
  // 戻るボタン
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', function() {
      const prevStep = parseInt(this.dataset.prev);
      goToStep(prevStep);
    });
  });
  
  // フォーム送信
  document.getElementById('diagnosisForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (validateStep(5)) {
      saveStepData(5);
      runDiagnosisAndDisplay();
    }
  });
  
  // 子どもの人数変更
  document.getElementById('childrenCount').addEventListener('change', updateChildrenDetails);
  
  // 手取り年収の自動計算
  ['husbandIncome', 'husbandOccupation', 'wifeIncome', 'wifeOccupation'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', updateNetIncomeDisplay);
      element.addEventListener('change', updateNetIncomeDisplay);
    }
  });
  
  // 年齢差アラートの自動表示
  ['husbandAge', 'wifeAge'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', checkAgeDifference);
      element.addEventListener('change', checkAgeDifference);
    }
  });
  
  // フォームに戻るボタン
  const backToFormBtn = document.getElementById('backToForm');
  if (backToFormBtn) {
    backToFormBtn.addEventListener('click', function() {
      document.getElementById('resultsContainer').style.display = 'none';
      document.getElementById('formContainer').style.display = 'block';
      window.scrollTo(0, 0);
    });
  }
  
  // PDF保存ボタン
  const printBtn = document.getElementById('printResults');
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      window.print();
    });
  }
}

/**
 * 年齢差をチェックしてアラートを表示
 */
function checkAgeDifference() {
  const husbandAge = parseInt(document.getElementById('husbandAge')?.value) || 0;
  const wifeAge = parseInt(document.getElementById('wifeAge')?.value) || 0;
  
  // 両方の年齢が入力されていない場合は何もしない
  if (husbandAge === 0 || wifeAge === 0) {
    return;
  }
  
  const ageDifference = Math.abs(husbandAge - wifeAge);
  const stepElement = document.querySelector('.form-step[data-step="1"]');
  
  if (!stepElement) return;
  
  // 既存のアラートを削除
  const existingAlert = stepElement.querySelector('.age-difference-alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  // 年齢差が5歳以上の場合、警告を表示
  if (ageDifference >= diagnosisCriteria.ageDifferenceWarning) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'age-difference-alert';
    alertDiv.style.cssText = `
      background-color: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1.5rem;
      display: flex;
      align-items: start;
      gap: 0.75rem;
    `;
    alertDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 1.5rem; margin-top: 0.25rem;"></i>
      <div style="flex: 1;">
        <strong style="color: #92400e; font-size: 1rem;">年齢差に関する注意</strong><br>
        <span style="color: #78350f; font-size: 0.9rem;">
          夫婦の年齢差が${ageDifference}歳あります。配偶者単独期間が長くなる可能性があるため、
          遺族年金や老後資金の準備について特に注意が必要です。
        </span>
      </div>
    `;
    
    // ステップの最後に追加
    stepElement.appendChild(alertDiv);
  }
}

/**
 * 手取り年収の表示を更新
 */
function updateNetIncomeDisplay() {
  const husbandIncome = parseInt(document.getElementById('husbandIncome')?.value) || 0;
  const wifeIncome = parseInt(document.getElementById('wifeIncome')?.value) || 0;
  const husbandOccupation = document.getElementById('husbandOccupation')?.value || 'employee';
  const wifeOccupation = document.getElementById('wifeOccupation')?.value || 'employee';
  
  // 万円を円に変換してから計算
  const incomeData = calculateHouseholdNetIncome({
    husbandIncome: husbandIncome * 10000,
    wifeIncome: wifeIncome * 10000,
    husbandOccupation,
    wifeOccupation
  });
  
  const displayElement = document.getElementById('netIncomeDisplay');
  if (displayElement) {
    displayElement.textContent = formatCurrency(incomeData.householdNet);
  }
}

/**
 * カスタム教育費用入力の表示/非表示を切り替え
 */
function toggleCustomEducationCost(childIndex) {
  const select = document.getElementById(`child${childIndex}Education`);
  const customCostGroup = document.getElementById(`child${childIndex}CustomCostGroup`);
  const customCostInput = document.getElementById(`child${childIndex}CustomCost`);
  
  if (select.value === 'custom') {
    customCostGroup.style.display = 'block';
    customCostInput.required = true;
  } else {
    customCostGroup.style.display = 'none';
    customCostInput.required = false;
    customCostInput.value = '';
  }
}

/**
 * 子どもの詳細フォームを更新
 */
function updateChildrenDetails() {
  const count = parseInt(document.getElementById('childrenCount').value);
  const container = document.getElementById('childrenDetails');
  
  container.innerHTML = '';
  
  for (let i = 0; i < count; i++) {
    const childCard = document.createElement('div');
    childCard.className = 'child-card';
    childCard.innerHTML = `
      <div class="child-card-header">
        <i class="fas fa-child"></i> お子様 ${i + 1}
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label for="child${i}Age">年齢</label>
          <input type="number" id="child${i}Age" name="child${i}Age" required min="0" max="22" placeholder="3">
          <span class="input-hint">歳</span>
        </div>
        <div class="form-group">
          <label for="child${i}Education">教育方針</label>
          <select id="child${i}Education" name="child${i}Education" required onchange="toggleCustomEducationCost(${i})">
            <option value="all-public">全て公立（1,000万円以下）</option>
            <option value="private-from-elementary">小学校から私立（2,000万円〜）</option>
            <option value="private-from-junior-high">中学から私立（1,700万円〜）</option>
            <option value="private-from-high">高校から私立（1,500万円〜）</option>
            <option value="custom">その他（直接入力）</option>
          </select>
        </div>
        <div class="form-group" id="child${i}CustomCostGroup" style="display: none;">
          <label for="child${i}CustomCost">教育資金（直接入力）</label>
          <input type="number" id="child${i}CustomCost" name="child${i}CustomCost" min="0" step="10" placeholder="500">
          <span class="input-hint">万円</span>
        </div>
        <div class="form-group">
          <label for="child${i}Independent">大学時の一人暮らし</label>
          <select id="child${i}Independent" name="child${i}Independent" required>
            <option value="no">なし</option>
            <option value="yes">あり（+440万円）</option>
          </select>
        </div>
      </div>
    `;
    container.appendChild(childCard);
  }
}

/**
 * ステップ検証
 */
function validateStep(step) {
  const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
  if (!stepElement) return false;
  
  const inputs = stepElement.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value) {
      isValid = false;
      input.classList.add('error');
      input.focus();
      
      // エラー表示（簡易的）
      if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
        const errorMsg = document.createElement('span');
        errorMsg.className = 'error-message';
        errorMsg.style.color = 'var(--danger)';
        errorMsg.style.fontSize = 'var(--font-size-sm)';
        errorMsg.textContent = 'この項目は必須です';
        input.parentNode.insertBefore(errorMsg, input.nextSibling);
      }
    } else {
      input.classList.remove('error');
      const errorMsg = input.parentNode.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
    }
  });
  
  // ステップ1の場合、年齢差をチェック
  if (step === 1 && isValid) {
    const husbandAge = parseInt(document.getElementById('husbandAge')?.value) || 0;
    const wifeAge = parseInt(document.getElementById('wifeAge')?.value) || 0;
    const ageDifference = Math.abs(husbandAge - wifeAge);
    
    // 既存のアラートを削除
    const existingAlert = stepElement.querySelector('.age-difference-alert');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    // 年齢差が5歳以上の場合、警告を表示
    if (ageDifference >= diagnosisCriteria.ageDifferenceWarning) {
      const alertDiv = document.createElement('div');
      alertDiv.className = 'age-difference-alert';
      alertDiv.style.cssText = `
        background-color: #fef3c7;
        border: 2px solid #f59e0b;
        border-radius: 8px;
        padding: 1rem;
        margin-top: 1.5rem;
        display: flex;
        align-items: start;
        gap: 0.75rem;
      `;
      alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 1.5rem; margin-top: 0.25rem;"></i>
        <div style="flex: 1;">
          <strong style="color: #92400e; font-size: 1rem;">年齢差に関する注意</strong><br>
          <span style="color: #78350f; font-size: 0.9rem;">
            夫婦の年齢差が${ageDifference}歳あります。配偶者単独期間が長くなる可能性があるため、
            遺族年金や老後資金の準備について特に注意が必要です。
          </span>
        </div>
      `;
      
      // ステップの最後に追加
      stepElement.appendChild(alertDiv);
    }
  }
  
  return isValid;
}

/**
 * ステップデータの保存
 */
function saveStepData(step) {
  const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
  if (!stepElement) return;
  
  // 万円単位の入力フィールド（円に変換が必要）
  const manYenFields = [
    'husbandIncome', 'wifeIncome', 'monthlyExpense', 'annualSpecialExpense',
    'savings', 'otherAssets', 'husbandLoan', 'wifeLoan',
    'husbandRetirement', 'wifeRetirement', 'husbandPension', 'wifePension',
    'existingDeathBenefit', 'wifeExistingDeathBenefit'
  ];
  
  const inputs = stepElement.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      // 心配事（concerns）のチェックボックス
      if (input.name === 'concerns') {
        if (!userData.concerns) {
          userData.concerns = [];
        }
        if (input.checked && !userData.concerns.includes(input.value)) {
          userData.concerns.push(input.value);
        }
      }
      // 価値観（values）のチェックボックス
      else if (input.name === 'values') {
        if (!userData.values) {
          userData.values = [];
        }
        if (input.checked && !userData.values.includes(input.value)) {
          userData.values.push(input.value);
        }
      }
      // 旧リスク懸念（後方互換性のため残す）
      else if (input.name === 'riskConcerns') {
        if (!userData.riskConcerns) {
          userData.riskConcerns = [];
        }
        if (input.checked && !userData.riskConcerns.includes(input.value)) {
          userData.riskConcerns.push(input.value);
        }
      }
    } else {
      // 万円フィールドの場合は円に変換（×10000）
      if (manYenFields.includes(input.name)) {
        const manYenValue = parseInt(input.value) || 0;
        userData[input.name] = manYenValue * 10000; // 円に変換
      } else {
        userData[input.name] = input.value;
      }
    }
  });
  
  // ステップ5の場合は確認画面を更新
  if (step === 4) {
    updateConfirmationScreen();
  }
}

/**
 * ステップ移動
 */
function goToStep(step) {
  // フォームステップの表示切り替え
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');
  
  // プログレスバーの更新
  document.querySelectorAll('.progress-step').forEach(s => s.classList.remove('active', 'completed'));
  for (let i = 1; i < step; i++) {
    document.querySelector(`.progress-step[data-step="${i}"]`).classList.add('completed');
  }
  document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('active');
  
  // プログレスバーの進捗
  const progressFill = document.getElementById('progressFill');
  progressFill.style.width = `${(step / 5) * 100}%`;
  
  currentStep = step;
  
  // トップにスクロール
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 確認画面の更新
 */
function updateConfirmationScreen() {
  const container = document.getElementById('confirmationContent');
  
  // 手取り年収を計算
  const incomeData = calculateHouseholdNetIncome(userData);
  
  const childrenCount = parseInt(userData.childrenCount) || 0;
  let childrenInfo = '';
  for (let i = 0; i < childrenCount; i++) {
    const age = userData[`child${i}Age`] || '-';
    const education = userData[`child${i}Education`] || '-';
    const independent = userData[`child${i}Independent`] || 'no';
    
    let educationLabel = {
      'all-public': '全て公立',
      'private-from-elementary': '小学校から私立',
      'private-from-junior-high': '中学から私立',
      'private-from-high': '高校から私立',
      'custom': 'その他（直接入力）'
    }[education] || education;
    
    // カスタム入力の場合は金額も表示
    if (education === 'custom') {
      const customCost = userData[`child${i}CustomCost`] || '-';
      educationLabel = `その他（${customCost}万円）`;
    }
    
    const independentLabel = independent === 'yes' ? 'あり' : 'なし';
    
    childrenInfo += `
      <div class="confirmation-item">
        <span class="confirmation-label">お子様${i + 1}</span>
        <span class="confirmation-value">${age}歳 / ${educationLabel} / 一人暮らし: ${independentLabel}</span>
      </div>
    `;
  }
  
  container.innerHTML = `
    <div class="confirmation-section">
      <h3 class="confirmation-title"><i class="fas fa-users"></i> 基本情報</h3>
      <div class="confirmation-grid">
        <div class="confirmation-item">
          <span class="confirmation-label">世帯主の年齢</span>
          <span class="confirmation-value">${userData.husbandAge || '-'}歳</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">配偶者の年齢</span>
          <span class="confirmation-value">${userData.wifeAge || '-'}歳</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">お子様の人数</span>
          <span class="confirmation-value">${userData.childrenCount || '0'}人</span>
        </div>
        ${childrenInfo}
        <div class="confirmation-item">
          <span class="confirmation-label">世帯主の職業</span>
          <span class="confirmation-value">${getOccupationLabel(userData.husbandOccupation)}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">配偶者の職業</span>
          <span class="confirmation-value">${getOccupationLabel(userData.wifeOccupation)}</span>
        </div>
      </div>
    </div>
    
    <div class="confirmation-section">
      <h3 class="confirmation-title"><i class="fas fa-yen-sign"></i> 経済状況</h3>
      <div class="confirmation-grid">
        <div class="confirmation-item">
          <span class="confirmation-label">世帯年収（額面）</span>
          <span class="confirmation-value">${formatCurrency(incomeData.householdGross)}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">世帯年収（手取り）</span>
          <span class="confirmation-value">${formatCurrency(incomeData.householdNet)}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">月々の生活費</span>
          <span class="confirmation-value">${Math.round((parseInt(userData.monthlyExpense || 0)) / 10000).toLocaleString()}万円</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">貯蓄額</span>
          <span class="confirmation-value">${Math.round((parseInt(userData.savings || 0)) / 10000).toLocaleString()}万円</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">住宅ローン残高</span>
          <span class="confirmation-value">世帯主: ${Math.round((parseInt(userData.husbandLoan || 0)) / 10000).toLocaleString()}万円<br>配偶者: ${Math.round((parseInt(userData.wifeLoan || 0)) / 10000).toLocaleString()}万円</span>
        </div>
      </div>
    </div>
    
    <div class="confirmation-section">
      <h3 class="confirmation-title"><i class="fas fa-heartbeat"></i> 健康・ライフスタイル</h3>
      <div class="confirmation-grid">
        <div class="confirmation-item">
          <span class="confirmation-label">喫煙状況</span>
          <span class="confirmation-value">${userData.smoking === 'non-smoker' ? '非喫煙者' : '喫煙者'}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">健康状態</span>
          <span class="confirmation-value">${getHealthLabel(userData.healthStatus)}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">付加給付制度</span>
          <span class="confirmation-value">${getAdditionalBenefitLabel(userData.additionalBenefit)}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">リスク懸念</span>
          <span class="confirmation-value">${userData.riskConcerns && userData.riskConcerns.length > 0 ? getRiskConcernsLabel(userData.riskConcerns) : 'なし'}</span>
        </div>
      </div>
    </div>
    
    <div class="confirmation-section">
      <h3 class="confirmation-title"><i class="fas fa-file-contract"></i> 既契約保険</h3>
      <h4 style="margin: 1rem 0 0.5rem 0; color: var(--text-secondary);"><i class="fas fa-male"></i> 世帯主</h4>
      <div class="confirmation-grid">
        <div class="confirmation-item">
          <span class="confirmation-label">死亡保障額</span>
          <span class="confirmation-value">${Math.round((parseInt(userData.existingDeathBenefit || 0)) / 10000).toLocaleString()}万円</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">医療保険</span>
          <span class="confirmation-value">${getInsuranceLabel(userData.existingMedical)}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">がん保険</span>
          <span class="confirmation-value">${getInsuranceLabel(userData.existingCancer)}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">就業不能保険</span>
          <span class="confirmation-value">${getInsuranceLabel(userData.existingDisability)}</span>
        </div>
      </div>
      <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--text-secondary);"><i class="fas fa-female"></i> 配偶者</h4>
      <div class="confirmation-grid">
        <div class="confirmation-item">
          <span class="confirmation-label">死亡保障額</span>
          <span class="confirmation-value">${Math.round((parseInt(userData.wifeExistingDeathBenefit || 0)) / 10000).toLocaleString()}万円</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">医療保険</span>
          <span class="confirmation-value">${getInsuranceLabel(userData.wifeExistingMedical)}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">がん保険</span>
          <span class="confirmation-value">${getInsuranceLabel(userData.wifeExistingCancer)}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">就業不能保険</span>
          <span class="confirmation-value">${getInsuranceLabel(userData.wifeExistingDisability)}</span>
        </div>
      </div>
    </div>
  `;
}

// ヘルパー関数
function getOccupationLabel(value) {
  const labels = {
    'employee': '会社員',
    'self-employed': '自営業',
    'part-time': 'パート',
    'housewife': '専業主婦/主夫',
    'other': 'その他'
  };
  return labels[value] || value;
}

function getHealthLabel(value) {
  const labels = {
    'excellent': '優良体',
    'good': '良好',
    'fair': '普通',
    'poor': '持病あり'
  };
  return labels[value] || value;
}

function getAdditionalBenefitLabel(value) {
  const labels = {
    'corporate': '大企業・公務員',
    'sme': '中小企業',
    'none': '国保・その他'
  };
  return labels[value] || value;
}

function getRiskConcernsLabel(concerns) {
  const labels = {
    'mental': '精神疾患',
    'long-absence': '長期休職',
    'nursing-care': '介護',
    'inheritance': '相続対策'
  };
  return concerns.map(c => labels[c] || c).join(', ');
}

function getInsuranceLabel(value) {
  const labels = {
    'none': '未加入',
    'basic': '基本的な保険',
    'comprehensive': '充実した保険'
  };
  return labels[value] || value;
}

/**
 * 診断を実行して結果を表示
 */
function runDiagnosisAndDisplay() {
  // 診断を実行
  diagnosisResults = runDiagnosis(userData);
  
  // 結果画面を表示
  setTimeout(() => {
    displayResults(diagnosisResults);
  }, 300);
}

/**
 * 結果を表示
 */
function displayResults(results) {
  const resultsContent = document.getElementById('resultsContent');
  
  // 既存のチャートを破棄
  destroyAllCharts();
  
  // 16:9スライド形式のレポートを生成
  resultsContent.innerHTML = generateSlidesHTML(results);
  
  // フォームを非表示、結果を表示
  document.getElementById('formContainer').style.display = 'none';
  document.getElementById('resultsContainer').style.display = 'block';
  
  // チャートを描画（DOMが構築された後）
  setTimeout(() => {
    drawAllCharts(results);
  }, 100);
  
  // トップにスクロール
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// この続きは次のファイルで実装します
