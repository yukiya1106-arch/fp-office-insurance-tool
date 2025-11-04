import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>保険診断システム - Insurance Diagnosis System</title>
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
        <!-- Icons -->
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <!-- Chart.js -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
        
        <!-- Main Styles -->
        <link href="/static/css/styles.css" rel="stylesheet">
    </head>
    <body>
        <!-- Header -->
        <header class="app-header">
            <div class="container">
                <div class="header-content">
                    <div class="logo">
                        <span>保険診断システム</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <a href="/static/four_life_risks_social_security_2025.pdf" target="_blank" class="pdf-link" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; background-color: rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 8px; transition: background-color 0.3s;">
                            <i class="fas fa-file-pdf"></i>
                            <span>人生の4つのリスクと社会保障制度</span>
                        </a>
                        <div class="header-subtitle">
                            <i class="fas fa-user-tie"></i> ファイナンシャルプランナー専用
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Container -->
        <main class="main-container">
            <!-- Form Container -->
            <div id="formContainer" class="form-container">
                <!-- Progress Bar -->
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-steps">
                        <div class="progress-step active" data-step="1">
                            <div class="step-circle">1</div>
                            <div class="step-label">基本情報</div>
                        </div>
                        <div class="progress-step" data-step="2">
                            <div class="step-circle">2</div>
                            <div class="step-label">経済状況</div>
                        </div>
                        <div class="progress-step" data-step="3">
                            <div class="step-circle">3</div>
                            <div class="step-label">健康状態</div>
                        </div>
                        <div class="progress-step" data-step="4">
                            <div class="step-circle">4</div>
                            <div class="step-label">既契約保険</div>
                        </div>
                        <div class="progress-step" data-step="5">
                            <div class="step-circle">5</div>
                            <div class="step-label">確認</div>
                        </div>
                    </div>
                </div>

                <!-- Form Steps -->
                <form id="diagnosisForm" class="diagnosis-form">
                    <!-- Step 1: Basic Information -->
                    <div class="form-step active" data-step="1">
                        <h2 class="step-title">
                            <i class="fas fa-users"></i> 基本情報
                        </h2>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="husbandAge">世帯主の年齢</label>
                                <input type="number" id="husbandAge" name="husbandAge" required min="20" max="80" placeholder="35">
                                <span class="input-hint">歳</span>
                            </div>
                            <div class="form-group">
                                <label for="wifeAge">配偶者の年齢</label>
                                <input type="number" id="wifeAge" name="wifeAge" required min="18" max="80" placeholder="33">
                                <span class="input-hint">歳</span>
                            </div>
                            <div class="form-group full-width">
                                <label for="childrenCount">お子様の人数</label>
                                <select id="childrenCount" name="childrenCount" required>
                                    <option value="0">0人</option>
                                    <option value="1">1人</option>
                                    <option value="2" selected>2人</option>
                                    <option value="3">3人</option>
                                    <option value="4">4人以上</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Children Details (dynamically generated) -->
                        <div id="childrenDetails" class="children-details"></div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="husbandOccupation">世帯主の職業形態</label>
                                <select id="husbandOccupation" name="husbandOccupation" required>
                                    <option value="employee">会社員</option>
                                    <option value="self-employed">自営業</option>
                                    <option value="part-time">パート</option>
                                    <option value="other">その他</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="wifeOccupation">配偶者の職業形態</label>
                                <select id="wifeOccupation" name="wifeOccupation" required>
                                    <option value="employee">会社員</option>
                                    <option value="self-employed">自営業</option>
                                    <option value="part-time">パート</option>
                                    <option value="housewife">専業主婦/主夫</option>
                                    <option value="other">その他</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-primary btn-next" data-next="2">
                                次へ <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Step 2: Financial Situation -->
                    <div class="form-step" data-step="2">
                        <h2 class="step-title">
                            <i class="fas fa-yen-sign"></i> 経済状況
                        </h2>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="husbandIncome">世帯主の年収（額面）</label>
                                <input type="number" id="husbandIncome" name="husbandIncome" required min="0" step="1" placeholder="500">
                                <span class="input-hint">万円</span>
                            </div>
                            <div class="form-group">
                                <label for="wifeIncome">配偶者の年収（額面）</label>
                                <input type="number" id="wifeIncome" name="wifeIncome" required min="0" step="1" placeholder="100">
                                <span class="input-hint">万円</span>
                            </div>
                            <div class="form-group info-card">
                                <div class="info-label">世帯年収（手取り）</div>
                                <div class="info-value" id="netIncomeDisplay">-</div>
                            </div>
                            <div class="form-group">
                                <label for="monthlyExpense">月々の生活費</label>
                                <input type="number" id="monthlyExpense" name="monthlyExpense" required min="0" step="1" placeholder="25">
                                <span class="input-hint">万円（住宅費・教育費を除く）</span>
                            </div>
                            <div class="form-group">
                                <label for="savings">貯蓄額</label>
                                <input type="number" id="savings" name="savings" required min="0" step="10" placeholder="300">
                                <span class="input-hint">万円</span>
                            </div>
                            <div class="form-group">
                                <label for="otherAssets">その他の資産</label>
                                <input type="number" id="otherAssets" name="otherAssets" min="0" step="10" placeholder="200">
                                <span class="input-hint">万円（株式、投資信託等）</span>
                            </div>
                            <div class="form-group">
                                <label for="husbandLoan">世帯主の住宅ローン残高</label>
                                <input type="number" id="husbandLoan" name="husbandLoan" min="0" step="10" placeholder="0">
                                <span class="input-hint">万円</span>
                            </div>
                            <div class="form-group">
                                <label for="wifeLoan">配偶者の住宅ローン残高</label>
                                <input type="number" id="wifeLoan" name="wifeLoan" min="0" step="10" placeholder="0">
                                <span class="input-hint">万円</span>
                            </div>
                            <div class="form-group">
                                <label for="annualSpecialExpense">年間の特別支出</label>
                                <input type="number" id="annualSpecialExpense" name="annualSpecialExpense" min="0" step="1" placeholder="60">
                                <span class="input-hint">万円（レジャー、家電購入等）</span>
                            </div>
                        </div>

                        <h3 class="subsection-title">退職・年金情報（世帯主）</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="husbandRetirementAge">退職予定年齢</label>
                                <input type="number" id="husbandRetirementAge" name="husbandRetirementAge" required min="50" max="75" placeholder="65">
                                <span class="input-hint">歳</span>
                            </div>
                            <div class="form-group">
                                <label for="husbandRetirement">退職金見込み額</label>
                                <input type="number" id="husbandRetirement" name="husbandRetirement" min="0" step="10" placeholder="2000">
                                <span class="input-hint">万円</span>
                            </div>
                            <div class="form-group">
                                <label for="husbandPension">公的年金見込み額（年額）</label>
                                <input type="number" id="husbandPension" name="husbandPension" min="0" step="1" placeholder="200">
                                <span class="input-hint">万円</span>
                            </div>
                        </div>

                        <h3 class="subsection-title">退職・年金情報（配偶者）</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="wifeRetirementAge">退職予定年齢</label>
                                <input type="number" id="wifeRetirementAge" name="wifeRetirementAge" min="50" max="75" placeholder="65">
                                <span class="input-hint">歳</span>
                            </div>
                            <div class="form-group">
                                <label for="wifeRetirement">退職金見込み額</label>
                                <input type="number" id="wifeRetirement" name="wifeRetirement" min="0" step="10" placeholder="500">
                                <span class="input-hint">万円</span>
                            </div>
                            <div class="form-group">
                                <label for="wifePension">公的年金見込み額（年額）</label>
                                <input type="number" id="wifePension" name="wifePension" min="0" step="1" placeholder="80">
                                <span class="input-hint">万円</span>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary btn-prev" data-prev="1">
                                <i class="fas fa-arrow-left"></i> 戻る
                            </button>
                            <button type="button" class="btn btn-primary btn-next" data-next="3">
                                次へ <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Step 3: Health & Lifestyle -->
                    <div class="form-step" data-step="3">
                        <h2 class="step-title">
                            <i class="fas fa-heartbeat"></i> 健康・ライフスタイル
                        </h2>
                        
                        <h3 class="subsection-title">
                            <i class="fas fa-male"></i> 世帯主の健康状態
                        </h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="smoking">喫煙状況</label>
                                <select id="smoking" name="smoking" required>
                                    <option value="non-smoker">非喫煙者</option>
                                    <option value="smoker">喫煙者</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="healthStatus">健康状態</label>
                                <select id="healthStatus" name="healthStatus" required>
                                    <option value="excellent">優良体</option>
                                    <option value="good">良好</option>
                                    <option value="fair">普通</option>
                                    <option value="poor">持病あり</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="additionalBenefit">付加給付制度</label>
                                <select id="additionalBenefit" name="additionalBenefit" required>
                                    <option value="corporate">大企業・公務員（上限2.5万円）</option>
                                    <option value="sme">中小企業（上限5〜8万円）</option>
                                    <option value="none">国保・その他（高額療養費のみ）</option>
                                </select>
                            </div>
                        </div>

                        <h3 class="subsection-title" style="margin-top: 2rem;">
                            <i class="fas fa-female"></i> 配偶者の健康状態
                        </h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="wifeSmoking">喫煙状況</label>
                                <select id="wifeSmoking" name="wifeSmoking" required>
                                    <option value="non-smoker">非喫煙者</option>
                                    <option value="smoker">喫煙者</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="wifeHealthStatus">健康状態</label>
                                <select id="wifeHealthStatus" name="wifeHealthStatus" required>
                                    <option value="excellent">優良体</option>
                                    <option value="good">良好</option>
                                    <option value="fair">普通</option>
                                    <option value="poor">持病あり</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="wifeAdditionalBenefit">付加給付制度</label>
                                <select id="wifeAdditionalBenefit" name="wifeAdditionalBenefit" required>
                                    <option value="corporate">大企業・公務員（上限2.5万円）</option>
                                    <option value="sme">中小企業（上限5〜8万円）</option>
                                    <option value="none">国保・その他（高額療養費のみ）</option>
                                </select>
                            </div>
                        </div>

                        <h3 class="subsection-title" style="margin-top: 2rem;">具体的な心配事</h3>
                        <div class="form-group full-width">
                            <label>該当するものをすべて選択してください</label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="concerns" value="income-loss">
                                    <span>収入が途絶えたときの生活費</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="concerns" value="education-cost">
                                    <span>子どもの教育費が払えなくなること</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="concerns" value="medical-cost">
                                    <span>医療費が高額になること</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="concerns" value="retirement">
                                    <span>老後の生活資金</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="concerns" value="family-life">
                                    <span>万が一のときの家族の生活</span>
                                </label>
                            </div>
                        </div>

                        <h3 class="subsection-title" style="margin-top: 2rem;">保険選びの価値観</h3>
                        <div class="form-group full-width">
                            <label>該当するものをすべて選択してください</label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="values" value="cost-priority">
                                    <span>保険料を抑えたい（コスト重視）</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="values" value="coverage-priority">
                                    <span>保障を充実させたい（安心重視）</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="values" value="savings">
                                    <span>貯蓄性も欲しい（資産形成も考慮）</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="values" value="flexibility">
                                    <span>将来の見直しがしやすい柔軟性</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="values" value="inheritance">
                                    <span>家族に資産を残したい</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary btn-prev" data-prev="2">
                                <i class="fas fa-arrow-left"></i> 戻る
                            </button>
                            <button type="button" class="btn btn-primary btn-next" data-next="4">
                                次へ <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Step 4: Existing Insurance -->
                    <div class="form-step" data-step="4">
                        <h2 class="step-title">
                            <i class="fas fa-file-contract"></i> 既契約保険
                        </h2>
                        
                        <h3 class="subsection-title" style="margin-top: 0;">
                            <i class="fas fa-male"></i> 世帯主の既契約保険
                        </h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="existingDeathBenefit">死亡保障額</label>
                                <input type="number" id="existingDeathBenefit" name="existingDeathBenefit" min="0" step="100" placeholder="1000">
                                <span class="input-hint">万円</span>
                            </div>
                            <div class="form-group">
                                <label for="existingMedical">医療保険</label>
                                <select id="existingMedical" name="existingMedical" required>
                                    <option value="none">未加入</option>
                                    <option value="basic">基本的な医療保険</option>
                                    <option value="comprehensive">充実した医療保険</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="existingCancer">がん保険</label>
                                <select id="existingCancer" name="existingCancer" required>
                                    <option value="none">未加入</option>
                                    <option value="basic">基本的ながん保険</option>
                                    <option value="comprehensive">充実したがん保険</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="existingDisability">就業不能保険</label>
                                <select id="existingDisability" name="existingDisability" required>
                                    <option value="none">未加入</option>
                                    <option value="basic">基本的な就業不能保険</option>
                                    <option value="comprehensive">充実した就業不能保険</option>
                                </select>
                            </div>
                        </div>
                        
                        <h3 class="subsection-title" style="margin-top: 2rem;">
                            <i class="fas fa-female"></i> 配偶者の既契約保険
                        </h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="wifeExistingDeathBenefit">死亡保障額</label>
                                <input type="number" id="wifeExistingDeathBenefit" name="wifeExistingDeathBenefit" min="0" step="100" placeholder="500">
                                <span class="input-hint">万円</span>
                            </div>
                            <div class="form-group">
                                <label for="wifeExistingMedical">医療保険</label>
                                <select id="wifeExistingMedical" name="wifeExistingMedical" required>
                                    <option value="none">未加入</option>
                                    <option value="basic">基本的な医療保険</option>
                                    <option value="comprehensive">充実した医療保険</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="wifeExistingCancer">がん保険</label>
                                <select id="wifeExistingCancer" name="wifeExistingCancer" required>
                                    <option value="none">未加入</option>
                                    <option value="basic">基本的ながん保険</option>
                                    <option value="comprehensive">充実したがん保険</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="wifeExistingDisability">就業不能保険</label>
                                <select id="wifeExistingDisability" name="wifeExistingDisability" required>
                                    <option value="none">未加入</option>
                                    <option value="basic">基本的な就業不能保険</option>
                                    <option value="comprehensive">充実した就業不能保険</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary btn-prev" data-prev="3">
                                <i class="fas fa-arrow-left"></i> 戻る
                            </button>
                            <button type="button" class="btn btn-primary btn-next" data-next="5">
                                次へ <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Step 5: Confirmation -->
                    <div class="form-step" data-step="5">
                        <h2 class="step-title">
                            <i class="fas fa-check-circle"></i> 入力内容の確認
                        </h2>
                        <div id="confirmationContent" class="confirmation-content"></div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary btn-prev" data-prev="4">
                                <i class="fas fa-arrow-left"></i> 戻る
                            </button>
                            <button type="submit" class="btn btn-success btn-large">
                                <i class="fas fa-chart-line"></i> 診断を開始
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Results Container (hidden initially) -->
            <div id="resultsContainer" class="results-container" style="display: none;">
                <div class="results-header">
                    <button type="button" class="btn btn-secondary" id="backToForm">
                        <i class="fas fa-arrow-left"></i> フォームに戻る
                    </button>
                    <button type="button" class="btn btn-primary" id="printResults">
                        <i class="fas fa-print"></i> PDF保存
                    </button>
                </div>
                <div id="resultsContent" class="results-content"></div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="app-footer">
            <div class="container">
                <p>&copy; 2025 保険診断システム | v2.0.0</p>
            </div>
        </footer>

        <!-- JavaScript -->
        <script src="/static/js/salary-calculator.js"></script>
        <script src="/static/js/insurance-data.js"></script>
        <script src="/static/js/diagnosis-engine.js"></script>
        <script src="/static/js/charts.js"></script>
        <script src="/static/js/results-display.js"></script>
        <script src="/static/js/main.js"></script>
    </body>
    </html>
  `)
})

export default app
