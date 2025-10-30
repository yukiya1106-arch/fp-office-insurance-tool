/**
 * Chart.js グラフ描画機能
 * Charts Generation using Chart.js
 */

// グローバルチャート設定
Chart.defaults.font.family = "'Inter', 'Noto Sans JP', sans-serif";
Chart.defaults.font.size = 13;
Chart.defaults.color = '#4b5563';

// チャートインスタンスを保存
const chartInstances = {};

/**
 * すべてのチャートを破棄
 */
function destroyAllCharts() {
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
      delete chartInstances[key];
    }
  });
}

/**
 * ライフプランシミュレーションチャート
 * @param {string} canvasId - Canvas要素のID
 * @param {Object} simulations - シミュレーションデータ
 */
function drawLifePlanChart(canvasId, simulations) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas not found: ${canvasId}`);
    return;
  }
  
  // 既存のチャートを破棄
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }
  
  const labels = simulations.normal.map(d => `${d.age}歳`);
  
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '通常ケース（夫婦とも生存）',
          data: simulations.normal.map(d => d.assets),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: '夫死亡時（妻が生存）',
          data: simulations.husbandDeath.map(d => d.assets),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: '妻死亡時（夫が生存）',
          data: simulations.wifeDeath.map(d => d.assets),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
              weight: '600'
            }
          }
        },
        title: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += context.parsed.y.toLocaleString() + '万円';
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString() + '万円';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

/**
 * リスク対応度レーダーチャート
 * @param {string} canvasId - Canvas要素のID
 * @param {Object} riskAnalysis - リスク分析データ
 */
function drawRiskRadarChart(canvasId, riskAnalysis) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas not found: ${canvasId}`);
    return;
  }
  
  // 既存のチャートを破棄
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }
  
  const scores = [
    riskAnalysis.death.score,
    riskAnalysis.disability.score,
    riskAnalysis.medical.score,
    riskAnalysis.criticalIllness.score
  ];
  
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['死亡リスク', '就業不能リスク', '医療費リスク', '3大疾病リスク'],
      datasets: [{
        label: 'リスク対応度',
        data: scores,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 3,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.2,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          callbacks: {
            label: function(context) {
              return context.parsed.r + '%';
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 25,
            callback: function(value) {
              return value + '%';
            },
            backdropColor: 'transparent'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          pointLabels: {
            font: {
              size: 13,
              weight: '600'
            }
          }
        }
      }
    }
  });
}

/**
 * 死亡保障充足度円グラフ（夫）
 * @param {string} canvasId - Canvas要素のID
 * @param {Object} coverageData - 保障充足度データ
 */
function drawDeathCoverageChartHusband(canvasId, coverageData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas not found: ${canvasId}`);
    return;
  }
  
  // 既存のチャートを破棄
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }
  
  const existing = coverageData.husband.existing;
  const shortage = coverageData.husband.shortage;
  
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['現在の保障', '不足額'],
      datasets: [{
        data: [existing, shortage],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
              weight: '600'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              return label + ': ' + value.toLocaleString() + '万円';
            }
          }
        }
      }
    }
  });
}

/**
 * 死亡保障充足度円グラフ（妻）
 * @param {string} canvasId - Canvas要素のID
 * @param {Object} coverageData - 保障充足度データ
 */
function drawDeathCoverageChartWife(canvasId, coverageData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas not found: ${canvasId}`);
    return;
  }
  
  // 既存のチャートを破棄
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }
  
  const existing = coverageData.wife.existing;
  const shortage = coverageData.wife.shortage;
  
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['現在の保障', '不足額'],
      datasets: [{
        data: [existing, shortage],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
              weight: '600'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              return label + ': ' + value.toLocaleString() + '万円';
            }
          }
        }
      }
    }
  });
}

/**
 * 必要保障額の内訳棒グラフ
 * @param {string} canvasId - Canvas要素のID
 * @param {Object} deathBenefitData - 必要保障額データ
 * @param {string} type - 'husband' or 'wife'
 */
function drawDeathBenefitBreakdownChart(canvasId, deathBenefitData, type) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas not found: ${canvasId}`);
    return;
  }
  
  // 既存のチャートを破棄
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }
  
  const data = type === 'husband' ? deathBenefitData.husband : deathBenefitData.wife;
  
  const labels = ['生活費', '教育費', '遺族年金\n(マイナス)', '利用可能資産\n(マイナス)', '退職金\n(マイナス)', '団信\n(マイナス)'];
  const values = [
    data.totalLivingCost,
    data.totalEducationCost,
    -data.totalSurvivorPension,
    -data.availableAssets,
    -data.retirementAllocation,
    -data.danshin
  ];
  
  const colors = values.map(v => v >= 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)');
  const borderColors = values.map(v => v >= 0 ? '#ef4444' : '#10b981');
  
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '金額（万円）',
        data: values,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.8,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return Math.abs(value).toLocaleString() + '万円';
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return Math.abs(value).toLocaleString() + '万円';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}
