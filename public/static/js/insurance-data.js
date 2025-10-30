/**
 * 保険商品データベース
 * Insurance Product Database
 */

const insuranceDatabase = {
  // 収入保障保険
  income: {
    nonSmoker: [
      {
        company: 'FWD生命',
        name: '収入保障保険',
        price: '月額3,000円〜',
        features: [
          '非喫煙者割引あり',
          '健康優良体割引あり',
          '配偶者同時加入割引'
        ],
        recommended: true
      },
      {
        company: 'はなさく生命',
        name: 'かぞくへの保険',
        price: '月額2,800円〜',
        features: [
          '非喫煙者割引あり',
          '保険料が安い',
          'シンプルな保障内容'
        ]
      },
      {
        company: 'ひまわり生命',
        name: '家族のお守り',
        price: '月額3,200円〜',
        features: [
          '非喫煙者割引あり',
          '保険料免除特約充実',
          'がん診断で保険料免除'
        ]
      }
    ],
    smoker: [
      {
        company: 'ひまわり生命',
        name: '家族のお守り（健康チャレンジ）',
        price: '月額4,500円〜',
        features: [
          '喫煙者でも加入可能',
          '保険料改定の可能性あり',
          '充実した保障内容'
        ],
        recommended: true
      }
    ]
  },

  // 就業不能保険
  disability: {
    under40: [
      {
        company: 'あんしん生命',
        name: '家計保障定期保険NEO',
        price: '月額2,500円〜',
        features: [
          '精神疾患も保障',
          '就業不能状態を幅広くカバー',
          '保険料が手頃'
        ],
        recommended: true
      },
      {
        company: 'あいおい生命',
        name: '働く人への保険3',
        price: '月額2,800円〜',
        features: [
          '精神疾患も保障',
          '入院・在宅療養どちらも対象',
          'リハビリ期間も保障'
        ]
      }
    ],
    over40: [
      {
        company: 'チューリッヒ生命',
        name: 'くらすプラス',
        price: '月額3,000円〜（年齢とともに安くなる）',
        features: [
          '年齢とともに保険料が下がる',
          '40歳以上に最適',
          '精神疾患も保障'
        ],
        recommended: true
      }
    ]
  },

  // 変額保険（運用メイン・有期型）
  variableInvestment: [
    {
      company: 'アクサ生命',
      name: 'ユニットリンク',
      price: '月額10,000円〜',
      features: [
        '運用実績が良好',
        '豊富な運用プラン',
        '保険料控除対象'
      ],
      recommended: true
    },
    {
      company: 'チューリッヒ生命',
      name: 'フューチャーリンク',
      price: '月額10,000円〜',
      features: [
        '低コストで運用効率が高い',
        'シンプルな運用プラン',
        '定期的に見直し可能'
      ]
    },
    {
      company: 'マニュライフ生命',
      name: 'こだわり個人年金',
      price: '月額10,000円〜',
      features: [
        '老後資金形成に最適',
        '年金受取り方法が柔軟',
        '運用実績が安定'
      ]
    }
  ],

  // 変額保険（保障メイン・終身型）
  variableProtection: [
    {
      company: 'ひまわり生命',
      name: '将来のおまもり',
      price: '月額15,000円〜',
      features: [
        'フリーランス・個人事業主に最適',
        '保障と運用のバランスが良い',
        '終身保障で安心'
      ],
      recommended: true,
      targetOccupation: ['self-employed']
    },
    {
      company: 'はなさく生命',
      name: '変額保険',
      price: '月額14,000円〜',
      features: [
        '保障重視の設計',
        '運用も可能',
        '保険料控除対象'
      ]
    },
    {
      company: 'あんしん生命',
      name: 'マーケットリンク',
      price: '月額16,000円〜',
      features: [
        '充実した保障内容',
        '運用実績が良好',
        '高額な保障額も設定可能'
      ]
    }
  ],

  // 医療保険・がん保険
  medical: [
    {
      company: 'チューリッヒ生命',
      name: 'プレミアムZ',
      price: '月額3,500円〜',
      features: [
        'コストパフォーマンスが高い',
        '充実した保障内容',
        '先進医療特約あり'
      ],
      recommended: true
    },
    {
      company: 'はなさく生命',
      name: '医療保険',
      price: '月額3,200円〜',
      features: [
        'ホルモン療法も保障',
        '女性特有の疾病に手厚い',
        '保険料が手頃'
      ]
    },
    {
      company: 'ひまわり生命',
      name: '医療保険',
      price: '月額3,800円〜',
      features: [
        'カスタマイズ性が高い',
        '特約が豊富',
        '幅広い保障'
      ]
    }
  ],

  // 介護保険
  nursingCare: [
    {
      company: 'アクサ生命',
      name: 'ユニットリンク介護',
      price: '月額8,000円〜',
      features: [
        '要介護2以上で保障',
        '運用もできる',
        '一時金または年金受取'
      ],
      recommended: true
    }
  ],

  // 一時払い終身保険（50代以降、資産500万円以上）
  lumpSum: [
    {
      company: 'メットライフ生命',
      name: 'ビーウィズユープラス2',
      price: '500万円〜（一時払い）',
      features: [
        '予定利率4〜5%',
        '50代以降に最適',
        '相続対策に有効'
      ],
      recommended: true,
      targetAge: 50,
      minAssets: 500
    },
    {
      company: 'マニュライフ生命',
      name: '未来につなげる終身保険',
      price: '500万円〜（一時払い）',
      features: [
        '予定利率4〜5%',
        '運用実績が良好',
        '相続対策に最適'
      ],
      targetAge: 50,
      minAssets: 500
    }
  ]
};

/**
 * 診断基準
 * Diagnosis Criteria
 */
const diagnosisCriteria = {
  // 年齢差警告の閾値
  ageDifferenceWarning: 5,
  
  // 配偶者単独期間の警告閾値（年）
  singleSpousePeriodWarning: 10,
  
  // 老後リスク警告年齢
  seniorAgeThreshold: 50,
  
  // 就業不能保険の年齢切り替え
  disabilityInsuranceAgeThreshold: 40,
  
  // 一時払い終身保険推奨の最低資産額（万円）
  minAssetsForLumpSum: 500,
  
  // 必要保障額の計算パラメータ
  deathBenefitCalculation: {
    // 遺族の生活費割合
    widowLivingCostRatio: 0.7,
    
    // 緊急予備資金（生活費の何ヶ月分）
    emergencyFundMonths: 6,
    
    // 退職金の遺族老後資金への配分比率
    retirementFundAllocation: 0.5,
    
    // 教育費（教育方針別）
    educationCosts: {
      'all-public': 1000, // 全て公立: 1000万円以下
      'private-from-elementary': 2000, // 小学校から私立: 2000万円〜
      'private-from-junior-high': 1700, // 中学から私立: 1700万円〜
      'private-from-high': 1500 // 高校から私立: 1500万円〜
    },
    
    // 大学時の一人暮らし費用
    collegeIndependentCost: 440, // 440万円
    
    // 遺族年金（概算）
    survivorPension: {
      // 基礎年金（末子18歳まで）
      basicPension: 100, // 年額100万円
      
      // 厚生年金（額面年収の0.6%）
      employeePensionRate: 0.006,
      
      // 子どもがいない場合の加算
      noChildAddition: 60 // 年額60万円
    }
  },
  
  // 付加給付制度による医療費上限
  additionalBenefitLimits: {
    corporate: 25000, // 大企業・公務員: 月額2.5万円
    sme: 80000, // 中小企業: 月額5〜8万円（最大値）
    none: 100000 // 国保・その他: 高額療養費制度のみ（年収約370万円の場合）
  }
};

/**
 * 社会保障制度の説明
 */
const socialSecurityInfo = {
  deathRisk: {
    title: '遺族年金制度',
    description: '世帯主が亡くなった場合、残された家族に支給される年金制度です。',
    details: [
      '遺族基礎年金：子どもがいる場合、末子が18歳になるまで支給（年額約100万円）',
      '遺族厚生年金：会社員の場合、配偶者が生涯受け取れる（年収の0.6%程度）',
      '中高齢寡婦加算：40歳以上65歳未満の妻に加算される場合がある'
    ],
    coverage: '基本的な生活費の一部をカバー',
    gap: '教育費や住宅ローン、十分な生活水準の維持には不足する場合が多い'
  },
  disabilityRisk: {
    title: '障害年金・傷病手当金',
    description: '病気やケガで働けなくなった場合の公的保障制度です。',
    details: [
      '障害年金：一定の障害状態が続く場合、障害等級に応じて年金支給',
      '傷病手当金：会社員が病気やケガで休業した場合、給与の約2/3を最長1年6ヶ月支給',
      '※自営業の方は傷病手当金の対象外'
    ],
    coverage: '収入の50〜66%程度',
    gap: '完全な収入補填はされず、長期化すると生活水準が下がる可能性'
  },
  medicalRisk: {
    title: '高額療養費制度・付加給付',
    description: '医療費が高額になった場合の自己負担を軽減する制度です。',
    details: [
      '高額療養費制度：月額の医療費自己負担額に上限を設定（年収により異なる）',
      '付加給付：大企業や公務員の健康保険組合が独自に設定する上乗せ制度',
      '70歳以上：自己負担割合が1〜2割に軽減'
    ],
    coverage: '入院・手術費用の大部分',
    gap: '差額ベッド代、先進医療、長期入院による収入減には対応しない'
  },
  criticalIllnessRisk: {
    title: '3大疾病の公的保障',
    description: 'がん・急性心筋梗塞・脳卒中に関する公的な支援制度です。',
    details: [
      'がん：高額療養費制度、障害年金（重度の場合）',
      '急性心筋梗塞：高額療養費制度、障害年金、リハビリ医療費助成',
      '脳卒中：高額療養費制度、障害年金、介護保険（40歳以上）'
    ],
    coverage: '医療費の基本部分と一部の生活支援',
    gap: '長期治療費、収入減、先進医療、介護費用などは自己負担'
  },
  
  // 老後の3つのステージ（50歳以上向け）
  retirementStages: {
    title: '老後の3つのステージと必要な備え',
    description: '老後は3つのステージに分けられ、それぞれ異なるリスクと必要資金があります。',
    stages: [
      {
        name: 'アクティブシニア期',
        age: '60〜74歳',
        period: '約15年',
        icon: 'fa-hiking',
        color: '#10b981',
        characteristics: [
          '健康で活動的な時期',
          '趣味・旅行・交流を楽しむ',
          '比較的医療費は少ない',
          '自立した生活が可能'
        ],
        risks: [
          '生活費（月25〜30万円）',
          '趣味・娯楽費用',
          '突然の病気・けが',
          '住宅リフォーム費用'
        ],
        preparation: [
          '公的年金の最適化',
          '退職金の運用計画',
          '医療保険の見直し',
          '健康維持の投資'
        ]
      },
      {
        name: 'ミドルシニア期',
        age: '75〜84歳',
        period: '約10年',
        icon: 'fa-home',
        color: '#f59e0b',
        characteristics: [
          '体力の衰えを感じ始める',
          '通院頻度が増える',
          '自宅中心の生活',
          '家族のサポートが重要に'
        ],
        risks: [
          '医療費の増加',
          '介護費用の発生可能性',
          '認知機能の低下リスク',
          'バリアフリー改修費用'
        ],
        preparation: [
          '介護保険の加入',
          '医療費の備え',
          '家族との連携強化',
          '資産の安全運用'
        ]
      },
      {
        name: 'ケア期',
        age: '85歳〜',
        period: '平均5〜10年',
        icon: 'fa-hand-holding-heart',
        color: '#ef4444',
        characteristics: [
          '介護が必要になる可能性が高い',
          '医療・介護費用が高額化',
          '施設入所の検討',
          '家族への負担増加'
        ],
        risks: [
          '介護費用（月15〜30万円）',
          '施設入所費用（入居一時金数百万円）',
          '医療費の継続的負担',
          '認知症ケア費用'
        ],
        preparation: [
          '介護保険・認知症保険',
          '終身医療保険',
          '資産の流動性確保',
          '成年後見制度の検討'
        ]
      }
    ],
    totalEstimate: {
      title: '老後30年間の必要資金（目安）',
      items: [
        { label: '生活費', amount: '約7,200万円', detail: '月25万円×12ヶ月×30年（公的年金除く）' },
        { label: '医療費', amount: '約500万円', detail: '年平均15万円×30年' },
        { label: '介護費用', amount: '約500万円', detail: '月15万円×3年程度（要介護期間）' },
        { label: '住宅リフォーム', amount: '約300万円', detail: 'バリアフリー化等' },
        { label: '予備費', amount: '約500万円', detail: '突発的な支出' }
      ],
      total: '約9,000万円',
      publicPension: '約7,000万円（夫婦で月20万円×30年）',
      shortage: '約2,000万円'
    },
    recommendation: '50歳以上の方は、老後の3つのステージを見据えた資金計画が重要です。公的年金だけでは不足する可能性が高いため、退職金の運用、終身保険、個人年金保険などでの備えをご検討ください。'
  }
};
