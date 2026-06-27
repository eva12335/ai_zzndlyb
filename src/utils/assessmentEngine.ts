/**
 * 画像规则引擎
 * 来源：PRD §7.3 + TECH_DESIGN §3.5.2
 *
 * 纯函数，零随机，相同输入永远相同输出
 * A 侧 44 段文案 + B 侧 44 段文案 = 88 段预写
 */
import type { DimensionScore, DimensionScores, TierA, TierB, Segment, AssessmentResult, AssessQuestion } from '../types/assessment';
import { DIMENSION_NAMES, QUESTION_BANK, calculateScores } from './assessment';

// ═══════════════════════════════════════════
// A 栏四档分类
// ═══════════════════════════════════════════

export function classifyA(scoreA: number): TierA {
  if (scoreA >= 8) return 'excellent';
  if (scoreA >= 6) return 'good';
  if (scoreA >= 4) return 'weak';
  return 'danger';
}

// ═══════════════════════════════════════════
// B 栏四档分类
// ═══════════════════════════════════════════

export function classifyB(scoreB: number): TierB {
  if (scoreB <= 2) return 'clean';
  if (scoreB <= 4) return 'mild';
  if (scoreB <= 6) return 'watch';
  return 'severe';
}

// ═══════════════════════════════════════════
// A 侧标签映射（11维 × 4档 = 44个标签）
// ═══════════════════════════════════════════

const TAG_MAP_A: Record<string, Record<TierA, string>> = {
  '独立动机':     { excellent: '高自驱', good: '有动力', weak: '动力一般', danger: '需外驱' },
  '风险承受':     { excellent: '敢于冒险', good: '风险中性', weak: '偏保守', danger: '风险回避' },
  '坚韧不拔':     { excellent: '极坚韧', good: '有韧性', weak: '容易气馁', danger: '易放弃' },
  '自我控制':     { excellent: '高度自律', good: '自控良好', weak: '需外力', danger: '自律薄弱' },
  '协调家庭社会事业': { excellent: '家庭支持', good: '基本协调', weak: '偶有冲突', danger: '阻力较大' },
  '决策能力':     { excellent: '果断决策', good: '决策稳健', weak: '决策偏慢', danger: '优柔寡断' },
  '适应事业需要': { excellent: '多面手', good: '适应力好', weak: '适应偏慢', danger: '单一专长' },
  '对组织的责任': { excellent: '完全担当', good: '负责可靠', weak: '责任分摊', danger: '回避责任' },
  '市场和客户关系': { excellent: '市场敏锐', good: '获客有方', weak: '获客待练', danger: '市场空白' },
  '谈判技巧':     { excellent: '谈判高手', good: '沟通良好', weak: '谈判待练', danger: '不善谈判' },
  'AI技能运用':   { excellent: 'AI加持', good: 'AI入门', weak: 'AI待学', danger: 'AI空白' },
};

// ═══════════════════════════════════════════
// B 侧标签映射（11维 × 4档 = 44个标签）
// ═══════════════════════════════════════════

const TAG_MAP_B: Record<string, Record<TierB, string>> = {
  '独立动机':     { clean: '依赖倾向低', mild: '偶有依赖', watch: '依赖需关注', severe: '依赖倾向高' },
  '风险承受':     { clean: '无风险回避', mild: '轻微回避', watch: '回避需留意', severe: '风险回避明显' },
  '坚韧不拔':     { clean: '无退缩倾向', mild: '偶有退缩', watch: '退缩需关注', severe: '退缩倾向高' },
  '自我控制':     { clean: '自律无碍', mild: '偶有松懈', watch: '自律需加强', severe: '自律薄弱需关注' },
  '协调家庭社会事业': { clean: '家庭无阻力', mild: '轻微摩擦', watch: '摩擦需关注', severe: '家庭阻力明显' },
  '决策能力':     { clean: '决策无障碍', mild: '偶有犹豫', watch: '犹豫需留意', severe: '犹豫倾向高' },
  '适应事业需要': { clean: '适应无障碍', mild: '适应稍慢', watch: '适应需推动', severe: '适应困难' },
  '对组织的责任': { clean: '责任无回避', mild: '偶有推脱', watch: '推脱需留意', severe: '回避责任明显' },
  '市场和客户关系': { clean: '获客无碍', mild: '获客偶难', watch: '获客需推动', severe: '获客困难' },
  '谈判技巧':     { clean: '谈判无碍', mild: '谈判偶弱', watch: '谈判需练', severe: '谈判弱项优先' },
  'AI技能运用':   { clean: '无AI抵触', mild: '轻微AI焦虑', watch: 'AI需推动', severe: 'AI抵触明显' },
};

// ═══════════════════════════════════════════
// 段位公式：风险态度 × 能力标
// ═══════════════════════════════════════════

export function calculateSegment(scores: DimensionScores): Segment {
  const riskScore = scores['风险承受']?.scoreA ?? 5;
  const aiScore = scores['AI技能运用']?.scoreA ?? 5;
  const motivationScore = scores['独立动机']?.scoreA ?? 5;
  const marketScore = scores['市场和客户关系']?.scoreA ?? 5;

  const riskAttitude = riskScore >= 6 ? '承受' : '回避';
  const aiFlag = aiScore >= 6;
  const motivationFlag = motivationScore >= 6;
  const marketFlag = marketScore >= 6;

  // 全能型
  if (riskAttitude === '承受' && aiFlag && motivationFlag && marketFlag) {
    return '全能型一人公司';
  }
  // AI增强型
  if (aiFlag && motivationFlag) {
    return 'AI增强型个体';
  }
  // 谨慎型技术派
  if (riskAttitude === '回避' && aiFlag && motivationFlag) {
    return '谨慎型技术派';
  }
  // 直觉型探索者
  if (riskAttitude === '承受' && motivationFlag && !aiFlag) {
    return '直觉型探索者';
  }
  // 稳健型实干家
  if (riskAttitude === '回避' && marketFlag) {
    return '稳健型实干家';
  }
  // 兜底
  return '待激活观望者';
}

// ═══════════════════════════════════════════
// CTA 话术（6个段位）
// ═══════════════════════════════════════════

const CTA_MAP: Record<Segment, string> = {
  '谨慎型技术派': '你最大的杠杆在哪？AI 准备好了你的深度分析——',
  '直觉型探索者': '如何用系统替代直觉？AI 帮你画出路线图——',
  'AI增强型个体': '技术杠杆已经在手，下一步是放大规模——',
  '稳健型实干家': '稳扎稳打的你，如何用 AI 再加速一步？——',
  '待激活观望者': '最小可行第一步是什么？AI 帮你找到起点——',
  '全能型一人公司': '万事俱备，如何把产能翻倍？AI 帮你规划——',
};

export function getCTA(segment: Segment): string {
  return CTA_MAP[segment];
}

// ═══════════════════════════════════════════
// 完整评估流水线
// ═══════════════════════════════════════════

export function runAssessmentPipeline(answers: Record<number, 'A' | 'B'>): AssessmentResult {
  const dimensionScores = calculateScores(answers);
  let totalA = 0;
  let totalB = 0;
  const dimensionTiersA: Record<string, TierA> = {};
  const dimensionTiersB: Record<string, TierB> = {};

  for (const dim of DIMENSION_NAMES) {
    const { scoreA, scoreB } = dimensionScores[dim];
    totalA += scoreA;
    totalB += scoreB;
    dimensionTiersA[dim] = classifyA(scoreA);
    dimensionTiersB[dim] = classifyB(scoreB);
  }

  const segment = calculateSegment(dimensionScores);
  const ctaText = getCTA(segment);

  return {
    dimensionScores,
    totalA,
    totalB,
    dimensionTiersA,
    dimensionTiersB,
    segment,
    ctaText,
  };
}

// ═══════════════════════════════════════════
// 获取标签（供 UI 组件使用）
// ═══════════════════════════════════════════

export function getTagA(dimension: string, tier: TierA): string {
  return TAG_MAP_A[dimension]?.[tier] ?? tier;
}

export function getTagB(dimension: string, tier: TierB): string {
  return TAG_MAP_B[dimension]?.[tier] ?? tier;
}
