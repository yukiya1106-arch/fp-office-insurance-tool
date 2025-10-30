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
                        <i class="fas fa-shield-heart"></i>
                        <span>保険診断システム</span>
                    </div>
                    <div class="header-subtitle">
                        <i class="fas fa-user-tie"></i> ファイナンシャルプランナー専用
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
                                <input type="number" id="husbandIncome" name="husbandIncome" required min="0" step="10" placeholder="5000000">
                                <span class="input-hint">円</span>
                            </div>
                            <div class="form-group">
                                <label for="wifeIncome">配偶者の年収（額面）</label>
                                <input type="number" id="wifeIncome" name="wifeIncome" required min="0" step="10" placeholder="1000000">
                                <span class="input-hint">円</span>
                            </div>
                            <div class="form-group info-card">
                                <div class="info-label">世帯年収（手取り）</div>
                                <div class="info-value" id="netIncomeDisplay">-</div>
                            </div>
                            <div class="form-group">
                                <label for="monthlyExpense">月々の生活費</label>
                                <input type="number" id="monthlyExpense" name="monthlyExpense" required min="0" step="10000" placeholder="250000">
                                <span class="input-hint">円（住宅費・教育費を除く）</span>
                            </div>
                            <div class="form-group">
                                <label for="savings">貯蓄額</label>
                                <input type="number" id="savings" name="savings" required min="0" step="100000" placeholder="3000000">
                                <span class="input-hint">円</span>
                            </div>
                            <div class="form-group">
                                <label for="otherAssets">その他の資産</label>
                                <input type="number" id="otherAssets" name="otherAssets" min="0" step="100000" placeholder="2000000">
                                <span class="input-hint">円（株式、投資信託等）</span>
                            </div>
                            <div class="form-group">
                                <label for="husbandLoan">世帯主の住宅ローン残高</label>
                                <input type="number" id="husbandLoan" name="husbandLoan" min="0" step="100000" placeholder="0">
                                <span class="input-hint">円</span>
                            </div>
                            <div class="form-group">
                                <label for="wifeLoan">配偶者の住宅ローン残高</label>
                                <input type="number" id="wifeLoan" name="wifeLoan" min="0" step="100000" placeholder="0">
                                <span class="input-hint">円</span>
                            </div>
                            <div class="form-group">
                                <label for="annualSpecialExpense">年間の特別支出</label>
                                <input type="number" id="annualSpecialExpense" name="annualSpecialExpense" min="0" step="10000" placeholder="600000">
                                <span class="input-hint">円（レジャー、家電購入等）</span>
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
                                <input type="number" id="husbandRetirement" name="husbandRetirement" min="0" step="100000" placeholder="20000000">
                                <span class="input-hint">円</span>
                            </div>
                            <div class="form-group">
                                <label for="husbandPension">公的年金見込み額（年額）</label>
                                <input type="number" id="husbandPension" name="husbandPension" min="0" step="10000" placeholder="2000000">
                                <span class="input-hint">円</span>
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
                                <input type="number" id="wifeRetirement" name="wifeRetirement" min="0" step="100000" placeholder="5000000">
                                <span class="input-hint">円</span>
                            </div>
                            <div class="form-group">
                                <label for="wifePension">公的年金見込み額（年額）</label>
                                <input type="number" id="wifePension" name="wifePension" min="0" step="10000" placeholder="800000">
                                <span class="input-hint">円</span>
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

                        <div class="form-group full-width">
                            <label>リスク懸念（該当するものをすべて選択）</label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="riskConcerns" value="mental">
                                    <span>精神疾患リスク</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="riskConcerns" value="long-absence">
                                    <span>長期休職の可能性</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="riskConcerns" value="nursing-care">
                                    <span>介護への備え</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="riskConcerns" value="inheritance">
                                    <span>相続対策</span>
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
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="existingDeathBenefit">死亡保障額</label>
                                <input type="number" id="existingDeathBenefit" name="existingDeathBenefit" min="0" step="1000000" placeholder="10000000">
                                <span class="input-hint">円</span>
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
