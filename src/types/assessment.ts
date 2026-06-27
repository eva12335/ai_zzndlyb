/**
 * 测评类型定义
 * 来源：PRD §7 测评表 + TECH_DESIGN §3.5.2
 */

// ═══════════════════════════════════════════
// 维度得分（A/B 双分数）
// ═══════════════════════════════════════════

export interface DimensionScore {
  scoreA: number;  // A 栏得分 0–10（事业倾向，高=好）
  scoreB: number;  // B 栏得分 0–10（非事业倾向，高=差），scoreA + scoreB ≡ 10
}

export type DimensionScores = Record<string, DimensionScore>;

// ═══════════════════════════════════════════
// A 栏四档（事业倾向，高=好）
// ═══════════════════════════════════════════

export type TierA = 'excellent' | 'good' | 'weak' | 'danger';

export const TIER_A_CONFIG: Record<TierA, { label: string; range: [number, number]; color: string }> = {
  excellent: { label: '突出优势', range: [8, 10], color: 'green' },
  good:      { label: '中等偏上', range: [6, 7],  color: 'blue' },
  weak:      { label: '需要注意', range: [4, 5],  color: 'orange' },
  danger:    { label: '明显短板', range: [0, 3],  color: 'red' },
};

// ═══════════════════════════════════════════
// B 栏四档（非事业倾向，高=差）
// ═══════════════════════════════════════════

export type TierB = 'clean' | 'mild' | 'watch' | 'severe';

export const TIER_B_CONFIG: Record<TierB, { label: string; range: [number, number]; color: string }> = {
  clean:  { label: '弱项不显著', range: [0, 2], color: 'green' },
  mild:   { label: '略有弱项',   range: [3, 4], color: 'blue' },
  watch:  { label: '需留意',     range: [5, 6], color: 'orange' },
  severe: { label: '明显弱项',   range: [7, 10], color: 'red' },
};

// ═══════════════════════════════════════════
// 段位（PRD §7.3）
// ═══════════════════════════════════════════

export type Segment =
  | '谨慎型技术派'
  | '直觉型探索者'
  | 'AI增强型个体'
  | '稳健型实干家'
  | '待激活观望者'
  | '全能型一人公司';

// ═══════════════════════════════════════════
// 测评题目
// ═══════════════════════════════════════════

export interface AssessQuestion {
  id: number;
  dimension: string;    // 所属维度名
  dimIndex: number;     // 维度内序号 1-5
  statementA: string;   // A 栏陈述（事业倾向）
  statementB: string;   // B 栏陈述（非事业倾向）
}

// ═══════════════════════════════════════════
// 测评完整结果
// ═══════════════════════════════════════════

export interface AssessmentResult {
  dimensionScores: DimensionScores;
  totalA: number;       // A 总分 0–110
  totalB: number;       // B 总分 0–110
  dimensionTiersA: Record<string, TierA>;  // 各维度 A 四档
  dimensionTiersB: Record<string, TierB>;  // 各维度 B 四档
  segment: Segment;
  ctaText: string;
}
