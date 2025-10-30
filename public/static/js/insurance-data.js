/**
 * 保険商品データベース
 * README.mdの仕様に基づいた商品情報
 */

/**
 * 保険商品データベース構造
 */
const insuranceDatabase = {
  // 収入保障保険
  income: {
    nonSmoker: [
      {
        id: 'fwd-income-ns',
        company: 'FWD生命',
        name: '収入保障保険（非喫煙者優良体）',
        category: 'income',
        price: '月額2,000円〜3,500円',
        features: [
          '非喫煙者割引で保険料が安い',
          '健康体割引あり',
          '就労不能特約の付加可能'
        ],
        recommended: true,
        targetAge: { min: 20, max: 65 },
        smokingStatus: 'nonSmoker'
      },
      {
        id: 'hanasaku-income-ns',
        company: 'はなさく生命',
        name: '収入保障保険（非喫煙者料率）',
        category: 'income',
        price: '月額2,200円〜3,800円',
        features: [
          '非喫煙者は保険料割引',
          'シンプルな保障内容',
          '保険料が手頃'
        ],
        recommended: true,
        targetAge: { min: 20, max: 70 },
        smokingStatus: 'nonSmoker'
      },
      {
        id: 'himawari-income-ns',
        company: 'ひまわり生命',
        name: '収入保障保険',
        category: 'income',
        price: '月額2,500円〜4,000円',
        features: [
          '非喫煙者割引あり',
          '配偶者特約が充実',
          '保障内容のカスタマイズ性が高い'
        ],
        recommended: false,
        targetAge: { min: 20, max: 65 },
        smokingStatus: 'nonSmoker'
      }
    ],
    smoker: [
      {
        id: 'himawari-income-smoker',
        company: 'ひまわり生命',
        name: '収入保障保険（健康チャレンジ）',
        category: 'income',
        price: '月額3,500円〜5,500円',
        features: [
          '喫煙者でも加入可能',
          '健康増進プログラムで保険料が下がる可能性',
          '柔軟な保障設計'
        ],
        recommended: true,
        targetAge: { min: 20, max: 65 },
        smokingStatus: 'smoker'
      }
    ]
  },
  
  // 就業不能保険
  disability: {
    under40: [
      {
        id: 'anshin-disability',
        company: 'あんしん生命',
        name: '就業不能保険',
        category: 'disability',
        price: '月額2,000円〜4,000円',
        features: [
          '精神疾患もカバー',
          '働けない期間の生活費を保障',
          '40歳未満の方におすすめ'
        ],
        recommended: true,
        targetAge: { min: 20, max: 39 }
      },
      {
        id: 'aioi-disability',
        company: 'あいおい生命',
        name: '就業不能保険',
        category: 'disability',
        price: '月額2,200円〜4,200円',
        features: [
          '精神疾患リスクに対応',
          '在宅療養もカバー',
          '手頃な保険料'
        ],
        recommended: true,
        targetAge: { min: 20, max: 39 }
      }
    ],
    over40: [
      {
        id: 'zurich-kurasu-plus',
        company: 'チューリッヒ生命',
        name: 'くらすプラス',
        category: 'disability',
        price: '月額3,000円〜6,000円',
        features: [
          '年齢とともに保険料が安くなる設計',
          '40歳以上の方に最適',
          '長期にわたる就業不能をカバー',
          '更新時の保険料が下がる'
        ],
        recommended: true,
        targetAge: { min: 40, max: 65 }
      }
    ]
  },
  
  // 変額保険
  variable: {
    investmentMain: [
      {
        id: 'axa-unitlink',
        company: 'アクサ生命',
        name: 'ユニットリンク',
        category: 'variable',
        subCategory: 'investmentMain',
        price: '月額10,000円〜（積立額により変動）',
        features: [
          '運用成績に応じて保険金額が変動',
          '10種類以上のファンドから選択可能',
          '死亡保障も付帯',
          '解約返戻金は運用次第'
        ],
        recommended: true,
        targetAge: { min: 20, max: 60 }
      },
      {
        id: 'zurich-future-link',
        company: 'チューリッヒ生命',
        name: 'フューチャーリンク',
        category: 'variable',
        subCategory: 'investmentMain',
        price: '月額8,000円〜',
        features: [
          '低コストで運用可能',
          '自由な運用スイッチング',
          '死亡保障付き'
        ],
        recommended: true,
        targetAge: { min: 20, max: 60 }
      },
      {
        id: 'manulife-pension',
        company: 'マニュライフ生命',
        name: 'こだわり個人年金',
        category: 'variable',
        subCategory: 'investmentMain',
        price: '月額10,000円〜',
        features: [
          '老後資金の準備に最適',
          '変額運用で増やす',
          '年金受取時の柔軟性'
        ],
        recommended: false,
        targetAge: { min: 20, max: 60 }
      }
    ],
    protectionMain: [
      {
        id: 'himawari-future-guard',
        company: 'ひまわり生命',
        name: '将来のおまもり',
        category: 'variable',
        subCategory: 'protectionMain',
        price: '月額15,000円〜',
        features: [
          '終身タイプで生涯保障',
          'フリーランス・個人事業主に特におすすめ',
          '死亡保障がメイン',
          '運用で保障額が増える可能性'
        ],
        recommended: true,
        targetAge: { min: 20, max: 65 },
        occupation: ['selfEmployed']
      },
      {
        id: 'hanasaku-variable',
        company: 'はなさく生命',
        name: '変額保険',
        category: 'variable',
        subCategory: 'protectionMain',
        price: '月額12,000円〜',
        features: [
          '終身保障',
          '保障と運用のバランスが良い',
          'シンプルな設計'
        ],
        recommended: true,
        targetAge: { min: 20, max: 60 }
      },
      {
        id: 'anshin-market-link',
        company: 'あんしん生命',
        name: 'マーケットリンク',
        category: 'variable',
        subCategory: 'protectionMain',
        price: '月額13,000円〜',
        features: [
          '市場連動型',
          '保障重視の設計',
          '柔軟な受取方法'
        ],
        recommended: false,
        targetAge: { min: 20, max: 60 }
      }
    ]
  },
  
  // 医療保険・がん保険
  medical: [
    {
      id: 'zurich-premium-z',
      company: 'チューリッヒ生命',
      name: 'プレミアムZ',
      category: 'medical',
      price: '月額2,500円〜4,000円',
      features: [
        'コストパフォーマンス重視',
        '入院・手術・通院を幅広くカバー',
        '先進医療特約付加可能',
        '短期入院から長期入院まで対応'
      ],
      recommended: true,
      targetAge: { min: 20, max: 75 }
    },
    {
      id: 'hanasaku-medical',
      company: 'はなさく生命',
      name: '医療保険',
      category: 'medical',
      price: '月額2,800円〜4,500円',
      features: [
        'ホルモン療法保障あり',
        '女性疾病特約が充実',
        'がん診断給付金付加可能',
        '乳がん・子宮がん等の保障が手厚い'
      ],
      recommended: true,
      targetAge: { min: 20, max: 75 },
      gender: 'female'
    },
    {
      id: 'himawari-medical',
      company: 'ひまわり生命',
      name: '医療保険',
      category: 'medical',
      price: '月額3,000円〜5,000円',
      features: [
        'カスタマイズ性が高い',
        '特約の選択肢が豊富',
        '三大疾病特約充実',
        '自分に合った保障を設計可能'
      ],
      recommended: false,
      targetAge: { min: 20, max: 80 }
    }
  ],
  
  // 介護保険
  nursing: [
    {
      id: 'axa-unitlink-nursing',
      company: 'アクサ生命',
      name: 'ユニットリンク介護',
      category: 'nursing',
      price: '月額8,000円〜15,000円',
      features: [
        '変額運用で介護資金を準備',
        '要介護認定時に一時金または年金',
        '50代以降の方におすすめ',
        '運用益で保障額が増える可能性'
      ],
      recommended: true,
      targetAge: { min: 40, max: 70 }
    }
  ],
  
  // 一時払い終身保険（50代以降、資産500万以上）
  lumpSum: [
    {
      id: 'metlife-bewithyou-plus2',
      company: 'メットライフ生命',
      name: 'ビーウィズユープラス2',
      category: 'lumpSum',
      price: '一時払い：500万円〜',
      features: [
        '50代以降の資産活用に最適',
        '予定利率4〜5%（2024-2025年）',
        '相続対策としても有効',
        '一時払いで生涯保障'
      ],
      recommended: true,
      targetAge: { min: 50, max: 85 },
      minAssets: 5000000
    },
    {
      id: 'manulife-mirai-tsunageru',
      company: 'マニュライフ生命',
      name: '未来につなげる終身保険',
      category: 'lumpSum',
      price: '一時払い：500万円〜',
      features: [
        '高い予定利率',
        '相続対策に有効',
        '外貨建てオプションあり',
        'ドル建て・豪ドル建て選択可能'
      ],
      recommended: true,
      targetAge: { min: 50, max: 85 },
      minAssets: 5000000
    }
  ]
};

/**
 * 診断基準データ
 */
const diagnosisCriteria = {
  // 年齢差による警告閾値
  ageDifferenceWarning: 5,          // 5歳以上の年齢差で警告
  spouseAlonePeriodWarning: 10,     // 10年以上の単独期間で重要警告
  
  // 就業不能保険の年齢閾値
  disabilityInsuranceAgeThreshold: 40,  // 40歳を境に推奨商品を切り替え
  
  // 老後リスク判定
  seniorRiskAge: 50,                // 50歳以上で老後リスク説明
  
  // 一時払い終身保険の推奨条件
  minAssetsForLumpSum: 500,         // 貯蓄500万円以上で推奨（万円単位）
  
  // 教育費の標準額（万円）
  educationCosts: {
    allPublic: 1000,
    fromElementary: 2000,
    fromJuniorHigh: 1700,
    fromHighSchool: 1500,
    livingAlone: 440
  },
  
  // 遺族年金計算（概算）
  survivorPension: {
    basic: 100,                      // 基礎年金部分（万円/年）
    earningsRate: 0.006,             // 厚生年金（年収の0.6%/年）
    spouseOnly: 60,                  // 配偶者のみの場合の基礎額（万円/年）
    childAge: 18                     // 子どもの基礎年金受給年齢上限
  },
  
  // 必要保障額の計算係数
  deathBenefit: {
    livingExpenseRate: 0.7,          // 遺族の生活費は70%
    emergencyReserveMonths: 6,       // 緊急予備資金（月数）
    retirementFundRate: 0.5,         // 退職金の50%を老後資金として計上
    minBenefit: 0,                   // 最小保障額（万円）
    maxBenefit: 8000                 // 最大保障額（万円、目安）
  }
};

/**
 * 商品マッチングエンジン
 * 顧客情報に基づいて最適な商品を推奨
 */
class InsuranceMatchingEngine {
  constructor(userData) {
    this.userData = userData;
    this.recommendations = [];
  }
  
  /**
   * 推奨商品を生成
   */
  generateRecommendations() {
    this.recommendations = [];
    
    // 死亡保障（収入保障保険）
    this.matchIncomeProtection();
    
    // 就業不能保険
    this.matchDisabilityInsurance();
    
    // 変額保険
    this.matchVariableInsurance();
    
    // 医療保険
    this.matchMedicalInsurance();
    
    // 介護保険
    this.matchNursingInsurance();
    
    // 一時払い終身保険
    this.matchLumpSumInsurance();
    
    return this.recommendations;
  }
  
  /**
   * 収入保障保険のマッチング
   */
  matchIncomeProtection() {
    const { smokingStatus, currentInsurance } = this.userData;
    
    // 既に十分な死亡保障がある場合はスキップ
    if (currentInsurance?.deathBenefit > 5000) return;
    
    const products = smokingStatus === 'nonSmoker' 
      ? insuranceDatabase.income.nonSmoker 
      : insuranceDatabase.income.smoker;
    
    products.forEach(product => {
      if (this.isAgeMatch(product)) {
        this.recommendations.push({
          ...product,
          priority: 'high',
          reason: '死亡保障の不足をカバー'
        });
      }
    });
  }
  
  /**
   * 就業不能保険のマッチング
   */
  matchDisabilityInsurance() {
    const { age, currentInsurance, riskConcerns } = this.userData;
    
    // 既に就業不能保険に加入している場合はスキップ
    if (currentInsurance?.disabilityInsurance) return;
    
    // リスク懸念に精神疾患・長期休職がある場合は優先度高
    const hasMentalRisk = riskConcerns?.includes('mentalDisease') || 
                          riskConcerns?.includes('longTermLeave');
    
    const products = age < diagnosisCriteria.disabilityInsuranceAgeThreshold
      ? insuranceDatabase.disability.under40
      : insuranceDatabase.disability.over40;
    
    products.forEach(product => {
      if (this.isAgeMatch(product)) {
        this.recommendations.push({
          ...product,
          priority: hasMentalRisk ? 'high' : 'medium',
          reason: hasMentalRisk 
            ? '精神疾患・長期休職リスクへの備え' 
            : '働けなくなった時の収入保障'
        });
      }
    });
  }
  
  /**
   * 変額保険のマッチング
   */
  matchVariableInsurance() {
    const { occupation, age } = this.userData;
    
    // フリーランス・個人事業主には保障メインを優先推奨
    if (occupation === '自営業' || occupation === '個人事業主') {
      const protectionProducts = insuranceDatabase.variable.protectionMain
        .filter(p => this.isAgeMatch(p) && 
                     (!p.occupation || p.occupation.includes('selfEmployed')));
      
      protectionProducts.forEach(product => {
        this.recommendations.push({
          ...product,
          priority: 'high',
          reason: '自営業の方の死亡保障と資産形成を両立'
        });
      });
    }
    
    // 運用メインの変額保険も提案
    const investmentProducts = insuranceDatabase.variable.investmentMain
      .filter(p => this.isAgeMatch(p));
    
    investmentProducts.forEach(product => {
      this.recommendations.push({
        ...product,
        priority: 'medium',
        reason: '資産形成と保障を同時に実現'
      });
    });
  }
  
  /**
   * 医療保険のマッチング
   */
  matchMedicalInsurance() {
    const { currentInsurance } = this.userData;
    
    // 既に医療保険に加入している場合はスキップ
    if (currentInsurance?.medicalInsurance && 
        currentInsurance?.cancerInsurance) return;
    
    const products = insuranceDatabase.medical.filter(p => this.isAgeMatch(p));
    
    products.forEach(product => {
      this.recommendations.push({
        ...product,
        priority: 'high',
        reason: '医療費リスクへの備え'
      });
    });
  }
  
  /**
   * 介護保険のマッチング
   */
  matchNursingInsurance() {
    const { age, riskConcerns } = this.userData;
    
    // 40歳以上、または介護への備えを懸念している場合に提案
    if (age < 40 && !riskConcerns?.includes('nursing')) return;
    
    const products = insuranceDatabase.nursing.filter(p => this.isAgeMatch(p));
    
    products.forEach(product => {
      this.recommendations.push({
        ...product,
        priority: age >= diagnosisCriteria.seniorRiskAge ? 'high' : 'medium',
        reason: '将来の介護リスクへの備え'
      });
    });
  }
  
  /**
   * 一時払い終身保険のマッチング
   */
  matchLumpSumInsurance() {
    const { age, savings, otherAssets } = this.userData;
    const totalAssets = (savings || 0) + (otherAssets || 0);
    
    // 50歳以上、かつ資産500万円以上の場合に提案
    if (age < diagnosisCriteria.seniorRiskAge || 
        totalAssets < diagnosisCriteria.minAssetsForLumpSum * 10000) return;
    
    const products = insuranceDatabase.lumpSum.filter(p => this.isAgeMatch(p));
    
    products.forEach(product => {
      this.recommendations.push({
        ...product,
        priority: 'medium',
        reason: '資産活用と相続対策を同時に実現'
      });
    });
  }
  
  /**
   * 年齢条件のマッチング確認
   */
  isAgeMatch(product) {
    if (!product.targetAge) return true;
    const age = this.userData.age || 0;
    return age >= product.targetAge.min && age <= product.targetAge.max;
  }
}

// グローバルに公開
window.InsuranceData = {
  database: insuranceDatabase,
  criteria: diagnosisCriteria,
  MatchingEngine: InsuranceMatchingEngine
};
