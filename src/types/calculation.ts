/**
 * 计算引擎类型定义
 * 来源：PRD §4 计算模型 + TECH_DESIGN §3.1 计算引擎
 */
import type Decimal from 'decimal.js';

// ═══════════════════════════════════════════
// 成本输入字段（PRD §5.1-5.3）
// ═══════════════════════════════════════════

export type EntityType = 'individual' | 'sole_proprietor' | 'limited_company';
export type PaymentCycle = 0 | 30 | 60;
export type CalcMode = 'product' | 'service';
export type RevenueModel = 'hourly' | 'project' | 'retainer'; // 服务型子模式

export interface CostFields {
  mode: CalcMode;
  projectName: string;
  fixedCost: number;           // 月度固定成本（必填 *）
  unitVariableCost: number;    // 每件材料成本（产品型必填 *，含获客摊销）
  unitPrice?: number;          // 定价（·可选）
  volume?: number;             // 月销量 / 月计费小时（·可选）
  tokenCost: number;           // Token（月），默认 0
  acquisitionCostPerClient?: number;  // 获客成本/客户（服务型 ·可选）
  newClientsPerMonth: number;  // 月拉新客户数（服务型，默认 1）
  targetProfit?: number;       // 目标月利润（·可选，默认 0）
  revenueModel: RevenueModel;  // 服务型子模式
  maxBillableHours: number;    // 产能上限（默认 120h）
  entityType: EntityType;
  paymentCycle: PaymentCycle;
  growthRate: number;          // 月增长率 0-30%，默认 10
  startupCapital: number;      // 启动资金，默认 0
}

// ═══════════════════════════════════════════
// 盈亏平衡（PRD §4.2）
// ═══════════════════════════════════════════

export interface BreakEvenInput {
  unitPrice: Decimal;
  unitVariableCost: Decimal;
  fixedCost: Decimal;          // FC = 月度固定成本 + Token
  acquisitionCost?: Decimal;   // AC = 月获客支出（默认 0）
  volume?: Decimal;            // 可选：用于计算目标利润所需定价
  targetProfit?: Decimal;
  maxCapacity?: number;
}

export interface BreakEvenOutput {
  contributionMargin: Decimal;
  contributionMarginRatio: Decimal;
  breakEvenVolume: Decimal;
  breakEvenRevenue: Decimal;
  requiredVolume: Decimal | null;   // 含目标利润
  requiredPrice: Decimal | null;    // 目标利润所需定价
  capacityWarning: string | null;   // 产能预警
}

// ═══════════════════════════════════════════
// 利润表 P&L（PRD §6.1）
// ═══════════════════════════════════════════

export interface ProfitLossRow {
  item: string;
  amount: Decimal;
  isHighlight?: boolean;
  indent?: boolean;
}

export interface ProfitLossOutput {
  rows: ProfitLossRow[];
  grossProfit: Decimal;
  grossMargin: Decimal;
  operatingProfit: Decimal;
  netProfit: Decimal;
  netMargin: Decimal;
  taxDetail: TaxOutput;
}

// ═══════════════════════════════════════════
// 税费（PRD §6.1 + TECH §3.8.1）
// ═══════════════════════════════════════════

export interface TaxConfig {
  entityType: EntityType;
  revenue: Decimal;
  profit: Decimal;
}

export interface TaxOutput {
  vat: Decimal;
  incomeTax: Decimal;
  netProfit: Decimal;
}

// ═══════════════════════════════════════════
// 现金流量表（PRD §6.3）
// ═══════════════════════════════════════════

export interface CashFlowRow {
  month: number;
  openingCash: Decimal;
  instantCollection: Decimal;
  deferredCollection: Decimal;
  otherInflow: Decimal;
  totalInflow: Decimal;
  cashOutflow: Decimal;
  fixedInvestment: Decimal;
  closingCash: Decimal;
  isDanger: boolean;  // 断流预警
  warningMsg: string | null;
}

export interface CashFlowOutput {
  rows: CashFlowRow[];
  dangerMonths: number[];
}

// ═══════════════════════════════════════════
// 收入预测（PRD §6.2）
// ═══════════════════════════════════════════

export interface RevenueProjectionInput {
  baseRevenue: Decimal;
  growthRate: number;          // 0.00 - 0.30
  months: number;              // 默认 6
  breakEvenRevenue: Decimal;
}

export interface RevenueProjectionOutput {
  points: { month: number; revenue: Decimal }[];
  breakEvenMonth: number | null;  // null = 6 个月内未扭亏
}

// ═══════════════════════════════════════════
// 输入校验（PRD §5.4）
// ═══════════════════════════════════════════

export interface ValidationError {
  field: string;
  msg: string;
}

export interface ValidationResult {
  pass: boolean;
  level: 'ok' | 'warn';
  errors: ValidationError[];
  warnings: ValidationError[];
}
