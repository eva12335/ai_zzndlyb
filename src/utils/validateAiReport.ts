/**
 * AI 报告输出校验
 * 来源：PRD §8.2 + TECH_DESIGN §3.5.3 第三层
 */
import type { AiReportOutput } from '../types/ai';
import { DIMENSION_NAMES } from './assessment';

const REQUIRED_ACTION_ITEMS = 3;

export function validateAiReport(
  output: any,
  inputSegmentLabel: string,
  hasCostData: boolean,
): output is AiReportOutput {
  if (!output || typeof output !== 'object') return false;

  // 字段存在性
  if (typeof output.segmentAnalysis !== 'string' || output.segmentAnalysis.length < 10) return false;
  if (!Array.isArray(output.opportunities)) return false;
  if (!Array.isArray(output.actionItems)) return false;

  // 维度名必须在 11 维列表内
  const dimSet = new Set(DIMENSION_NAMES);
  for (const o of output.opportunities) {
    if (!dimSet.has(o.dimension)) return false;
    if (typeof o.currentScore !== 'number' || typeof o.targetScore !== 'number') return false;
    if (typeof o.roiRank !== 'number' || o.roiRank < 1) return false;
  }

  // actionItems 必须恰好 3 条
  if (output.actionItems.length !== REQUIRED_ACTION_ITEMS) return false;
  for (const a of output.actionItems) {
    if (!dimSet.has(a.sourceDimension)) return false;
    if (!['low', 'medium', 'high'].includes(a.risk)) return false;
    if (typeof a.action !== 'string' || typeof a.expectedImpact !== 'string') return false;
  }

  // 有成本数据 → financialImpact 可以有值，roadmap 必须存在
  if (hasCostData) {
    if (!Array.isArray(output.roadmap)) return false;
  } else {
    // 无成本数据 → financialImpact 必须为空，roadmap 必须为 null
    for (const o of output.opportunities) {
      if (o.financialImpact != null && o.financialImpact !== '') return false;
    }
    if (output.roadmap != null) return false;
  }

  return true;
}
