/**
 * 利润诊断建议（规则引擎）
 * 来源：PRD §6.5 + TECH_DESIGN §3.9
 *
 * 净利润 < 0 时自动触发，三类根因：
 *   unitLoss  - 毛利 ≤ 0（定价 ≤ 成本）
 *   scaleGap  - 毛利 > 0 但毛利 < 固定成本
 *   extraBurden - 毛利 > FC 但净利 < 0（税费/获客侵蚀）
 */
import Decimal from 'decimal.js';
// ═══════════════════════════════════════════
// 类型（util 内自包含，降低跨模块耦合）
// ═══════════════════════════════════════════

export type RootCause = 'unitLoss' | 'scaleGap' | 'extraBurden';

export interface SuggestionItem {
  action: string;
  expectedImpact: string;
  difficulty: 'low' | 'medium';
  category: 'price' | 'cost' | 'volume' | 'tax' | 'acquisition';
}

export interface ProfitDiagnostic {
  rootCause: RootCause;
  rootCauseLabel: string;
  diagnosis: string;
  suggestions: SuggestionItem[];
  assessmentTip: string | null;
}

export interface DiagnosticInput {
  mode: 'product' | 'service';
  unitPrice: Decimal;
  unitVariableCost: Decimal;
  volume: Decimal;
  fixedCost: Decimal;
  tokenCost: Decimal;
  acquisitionCost: Decimal;
  netProfit: Decimal;
  assessmentScores?: Record<string, { scoreA: number; scoreB: number }>;
}

// ═══════════════════════════════════════════
// 诊断模板
// ═══════════════════════════════════════════

const DIAGNOSIS_LABELS: Record<RootCause, string> = {
  unitLoss: '单位亏损',
  scaleGap: '规模不足',
  extraBurden: '额外负担',
};

export function diagnoseProfit(input: DiagnosticInput): ProfitDiagnostic | null {
  const { unitPrice: U, unitVariableCost: VC, volume: V, fixedCost, tokenCost, acquisitionCost, netProfit } = input;

  // 净利润 ≥ 0 → 无需诊断
  if (netProfit.gte(0)) return null;

  const contributionMargin = U.minus(VC);
  const totalGrossProfit = contributionMargin.times(V);
  const totalFC = fixedCost.plus(tokenCost);

  let rootCause: RootCause;
  if (contributionMargin.lte(0)) {
    rootCause = 'unitLoss';
  } else if (totalGrossProfit.lt(totalFC)) {
    rootCause = 'scaleGap';
  } else {
    rootCause = 'extraBurden';
  }

  const diagnosis = buildDiagnosis(rootCause, input, totalGrossProfit, totalFC);
  const suggestions = buildSuggestions(rootCause, input, totalFC);
  const assessmentTip = buildAssessmentTip(rootCause, input.assessmentScores);

  return {
    rootCause,
    rootCauseLabel: DIAGNOSIS_LABELS[rootCause],
    diagnosis,
    suggestions,
    assessmentTip,
  };
}

// ═══════════════════════════════════════════
// 诊断文案
// ═══════════════════════════════════════════

function buildDiagnosis(
  cause: RootCause,
  input: DiagnosticInput,
  totalGrossProfit: Decimal,
  totalFC: Decimal,
): string {
  const { unitPrice: U, unitVariableCost: VC, volume: V } = input;

  switch (cause) {
    case 'unitLoss':
      return input.mode === 'product'
        ? `定价 ¥${U} ≤ 变动成本 ¥${VC}，每卖一件亏损 ¥${VC.minus(U).toFixed(2)}。`
        : `时薪 ¥${U}/h 不足以覆盖成本，每工作一小时都在贴钱。`;

    case 'scaleGap': {
      const gap = totalFC.minus(totalGrossProfit).toFixed(0);
      return `毛利 ¥${totalGrossProfit.toFixed(0)} 不够覆盖固定成本 ¥${totalFC.toFixed(0)}，每月净亏 ¥${totalFC.minus(totalGrossProfit).toFixed(0)}。缺口 ¥${gap}/月。`;
    }

    case 'extraBurden':
      return `毛利已覆盖固定成本，但获客支出或税费侵蚀利润，导致净利为负。`;
  }
}

// ═══════════════════════════════════════════
// 建议生成
// ═══════════════════════════════════════════

function buildSuggestions(
  cause: RootCause,
  input: DiagnosticInput,
  totalFC: Decimal,
): SuggestionItem[] {
  const { unitPrice: U, unitVariableCost: VC, volume: V, fixedCost, acquisitionCost } = input;
  const cm = U.minus(VC);

  switch (cause) {
    case 'unitLoss': {
      const minPrice = VC.plus(0.01).toFixed(2);
      return [
        { action: `提价至 ≥ ¥${minPrice}（至少高于变动成本）`, expectedImpact: '消除单位亏损', difficulty: 'low', category: 'price' },
        { action: `降低变动成本（换供应商、缩减材料）`, expectedImpact: `若降至 ¥${U.minus(0.01).toFixed(2)} 以下则扭亏`, difficulty: 'medium', category: 'cost' },
      ];
    }

    case 'scaleGap': {
      const bev = totalFC.div(cm).ceil().toNumber();
      const currentV = V.toNumber();
      const increase = ((bev - currentV) / currentV * 100).toFixed(0);
      return [
        { action: `月销量从 ${currentV} 增至 ${bev} 件（+${increase}%）`, expectedImpact: '预计扭亏为盈', difficulty: 'medium', category: 'volume' },
        { action: `降低固定成本至 ¥${input.fixedCost} 以下`, expectedImpact: `减少月支出 ¥${totalFC.minus(totalFC.times(0.7)).toFixed(0)}`, difficulty: 'medium', category: 'cost' },
        { action: `提价 10%-20%`, expectedImpact: `盈亏平衡量降至 ${totalFC.div(cm.times(1.2)).ceil().toNumber()} 件`, difficulty: 'low', category: 'price' },
      ];
    }

    case 'extraBurden': {
      const suggestions: SuggestionItem[] = [
        { action: `优化获客渠道，降低获客成本`, expectedImpact: `当前月获客 ¥${acquisitionCost.toFixed(0)}`, difficulty: 'medium', category: 'acquisition' },
        { action: `更换主体类型节省税费`, expectedImpact: '个体户所得税率 5% 起', difficulty: 'low', category: 'tax' },
      ];
      return suggestions;
    }
  }
}

// ═══════════════════════════════════════════
// 测评增强（11维 × 3根因 = 33条）
// ═══════════════════════════════════════════

const ASSESSMENT_TIPS: Record<string, Partial<Record<RootCause, string>>> = {
  '风险承受': {
    unitLoss: '你的风险承受力较强，可考虑激进提价 30%-50% 测试市场反应。',
    scaleGap: '风险承受力较强意味着你能承受更长的回本周期，不必急于盈利。',
  },
  '谈判技巧': {
    unitLoss: '谈判力是你的弱项，提价时建议先练习"价值报价"话术再做客户沟通。',
  },
  '市场和客户关系': {
    scaleGap: '获客是你的短板，建议从即刻/小红书等内容渠道做自然引流而非付费投放。',
    extraBurden: '你的获客成本过高可能与渠道选择有关，尝试内容营销替代付费广告。',
  },
};

function buildAssessmentTip(
  cause: RootCause,
  scores?: Record<string, { scoreA: number; scoreB: number }>,
): string | null {
  if (!scores) return null;
  const tips: string[] = [];
  for (const dim of Object.keys(ASSESSMENT_TIPS)) {
    const tipMap = ASSESSMENT_TIPS[dim];
    const tip = tipMap[cause];
    const score = scores[dim];
    if (tip && score) {
      // 仅在对应维度偏低时追加
      if ((cause === 'unitLoss' || cause === 'scaleGap') && score.scoreA < 6) {
        tips.push(`🧭 ${dim}：${tip}`);
      } else if (cause === 'extraBurden' && score.scoreB > 4) {
        tips.push(`🧭 ${dim}：${tip}`);
      }
    }
  }
  return tips.length > 0 ? tips[0] : null;  // 只取最相关的一条
}
