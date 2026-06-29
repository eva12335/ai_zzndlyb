/**
 * 画像规则引擎
 * 来源：PRD §7.3 + TECH_DESIGN §3.5.2
 *
 * 纯函数，零随机，相同输入永远相同输出
 * A 侧 44 段文案 + B 侧 44 段文案 = 88 段预写
 */
import type { DimensionScores, TierA, TierB, Segment, AssessmentResult } from '../types/assessment';
import { DIMENSION_NAMES, calculateScores } from './assessment';

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
  '创办OPC的动机': { excellent: '高自驱', good: '有动力', weak: '动力待激发', danger: '需外部推动' },
  '风险承受能力':               { excellent: '敢于冒险', good: '风险中性', weak: '偏谨慎', danger: '规避风险' },
  '坚韧不拔/处理危机能力':       { excellent: '极坚韧', good: '有韧性', weak: '韧劲待练', danger: '遇阻易停' },
  '主动性':                     { excellent: '主动进取', good: '积极行动', weak: '可以更主动', danger: '偏被动' },
  '协调家庭·社会·OPC关系的能力': { excellent: '平衡得当', good: '基本协调', weak: '边界偶模糊', danger: '需明确边界' },
  '决策能力':                   { excellent: '果断决策', good: '决策稳健', weak: '决策偏慢', danger: '决策犹豫' },
  '适应OPC需要的能力': { excellent: '多面手', good: '适应力好', weak: '适应待提速', danger: '专注单一角色' },
  '对OPC的承诺':     { excellent: '全情投入', good: '负责可靠', weak: '投入待加强', danger: '承诺需增强' },
  '家庭支持':                   { excellent: '家庭支持', good: '基本理解', weak: '偶尔有顾虑', danger: '需加强沟通' },
  '谈判技巧':                   { excellent: '谈判高手', good: '沟通良好', weak: '可以多练习', danger: '沟通待提升' },
  'AI &自媒体运用':              { excellent: 'AI加持', good: 'AI入门', weak: 'AI待学', danger: 'AI待入门' },
};

// ═══════════════════════════════════════════
// B 侧标签映射（11维 × 4档 = 44个标签）
// ═══════════════════════════════════════════

const TAG_MAP_B: Record<string, Record<TierB, string>> = {
  '创办OPC的动机': { clean: '依赖倾向低', mild: '偶有依赖', watch: '依赖需关注', severe: '依赖倾向高' },
  '风险承受能力':               { clean: '无风险回避', mild: '轻微回避', watch: '回避需留意', severe: '风险回避明显' },
  '坚韧不拔/处理危机能力':       { clean: '无退缩倾向', mild: '偶有退缩', watch: '退缩需关注', severe: '退缩倾向高' },
  '主动性':                     { clean: '主动无碍', mild: '偶有迟疑', watch: '被动需关注', severe: '被动倾向高' },
  '协调家庭·社会·OPC关系的能力': { clean: '家庭无阻力', mild: '轻微摩擦', watch: '摩擦需关注', severe: '家庭阻力明显' },
  '决策能力':                   { clean: '决策无障碍', mild: '偶有犹豫', watch: '犹豫需留意', severe: '犹豫倾向高' },
  '适应OPC需要的能力': { clean: '适应无障碍', mild: '适应稍慢', watch: '适应需推动', severe: '适应困难' },
  '对OPC的承诺':     { clean: '承诺无保留', mild: '偶有犹豫', watch: '犹豫需留意', severe: '承诺不足' },
  '家庭支持':                   { clean: '家庭无阻力', mild: '轻微顾虑', watch: '顾虑需关注', severe: '家庭阻力明显' },
  '谈判技巧':                   { clean: '谈判无碍', mild: '谈判偶弱', watch: '谈判需练', severe: '谈判弱项优先' },
  'AI &自媒体运用':              { clean: '无AI抵触', mild: '轻微AI焦虑', watch: 'AI需推动', severe: 'AI抵触明显' },
};

// ═══════════════════════════════════════════
// 段位公式：风险态度 × 能力标
// ═══════════════════════════════════════════

const SEGMENT_HIGH = 80;
const SEGMENT_MID = 60;

export function calculateSegment(scores: DimensionScores, preTotalA?: number): Segment {
  // ── 11维总分（调用方已计算时复用，满分110）──
  const totalA = preTotalA ?? (() => {
    let sum = 0;
    for (const dim of Object.keys(scores)) sum += scores[dim]?.scoreA ?? 0;
    return sum;
  })();

  // ── 4个关键维度（战略方向）──
  const riskScore = scores['风险承受能力']?.scoreA ?? 5;
  const aiScore = scores['AI &自媒体运用']?.scoreA ?? 5;
  const motivationScore = scores['创办OPC的动机']?.scoreA ?? 5;
  const marketScore = scores['适应OPC需要的能力']?.scoreA ?? 5;

  const riskAttitude = riskScore >= 6 ? '承受' : '回避';
  const aiFlag = aiScore >= 6;
  const motivationFlag = motivationScore >= 6;
  const marketFlag = marketScore >= 6;

  // ── 第一层：11维总分定档 ──
  // ≥80 高阶 · 60-79 中阶 · <60 初阶

  // ═══ 高阶（≥80分）→ 只能是正面画像 ═══
  if (totalA >=SEGMENT_HIGH) {
    if (riskAttitude === '承受' && aiFlag && motivationFlag && marketFlag) {
      return '全能型一人公司';
    }
    if (aiFlag && motivationFlag) {
      return riskAttitude === '回避' ? '谨慎型技术派' : 'AI增强型个体';
    }
    if (motivationFlag) {
      return '直觉型探索者';
    }
    // 动机偏低但总分高 → AI+市场驱动
    return 'AI增强型个体';
  }

  // ═══ 中阶（60-79分）→ 按关键维度细分 ═══
  if (totalA >=SEGMENT_MID) {
    if (riskAttitude === '回避' && aiFlag && motivationFlag) {
      return '谨慎型技术派';
    }
    if (riskAttitude === '承受' && motivationFlag && !aiFlag) {
      return '直觉型探索者';
    }
    if (riskAttitude === '回避' && marketFlag) {
      return '稳健型实干家';
    }
    if (aiFlag && motivationFlag) {
      return 'AI增强型个体';
    }
    // 中阶但模式不典型 → 稳健型（最安全路径）
    return '稳健型实干家';
  }

  // ═══ 初阶（<60分）→ 按关键维度细分，无匹配才观望 ═══
  if (riskAttitude === '回避' && marketFlag) {
    return '稳健型实干家';
  }
  if (motivationFlag && riskAttitude === '承受') {
    return '直觉型探索者';
  }

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

  const segment = calculateSegment(dimensionScores, totalA);
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
