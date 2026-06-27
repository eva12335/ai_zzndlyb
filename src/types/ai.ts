/**
 * AI 模块类型定义
 * 来源：PRD §8.2 + TECH_DESIGN §3.5.3
 */
import type { EntityType } from './calculation';

// ═══════════════════════════════════════════
// AI 深度报告 — 输入
// ═══════════════════════════════════════════

export interface AiReportInput {
  totalScore: number;
  dimensionScores: Record<string, number>;  // { "独立动机": 9, "风险承受": 5, ... }
  segmentLabel: string;                     // 段位标签，如"谨慎型技术派"
  mode?: 'product' | 'service';
  projectName?: string;
  costData?: {
    fixedCost: number;
    unitVariableCost?: number;
    unitPrice?: number;
    volume?: number;
    tokenCost: number;
    acquisitionCost?: number;
    targetProfit?: number;
    entityType: EntityType;
  };
}

// ═══════════════════════════════════════════
// AI 深度报告 — 输出
// ═══════════════════════════════════════════

export interface OpportunityItem {
  dimension: string;
  currentScore: number;
  targetScore: number;
  financialImpact?: string;    // 有成本数据时：如"+¥840/月"
  directionGuide?: string;     // 无成本数据时：方向引导
  roiRank: number;             // 1 = 最高 ROI
}

export interface ActionItem {
  action: string;
  expectedImpact: string;
  risk: 'low' | 'medium' | 'high';
  sourceDimension: string;     // ← 来源维度
}

export interface RoadmapItem {
  timeline: string;            // "3个月" / "6个月" / "12个月"
  target: string;
  expectedProfit: string;
}

export interface AiReportOutput {
  segmentAnalysis: string;     // 🧭 段位分析
  opportunities: OpportunityItem[];  // 💰 机会雷达
  actionItems: ActionItem[];   // 🎯 优先行动（3 条）
  roadmap?: RoadmapItem[];     // 📈 改进路线图（有成本数据时才有）
}
