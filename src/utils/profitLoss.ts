/**
 * 利润表 P&L 计算
 * 来源：PRD §6.1 + TECH_DESIGN §3.1
 */
import Decimal from 'decimal.js';
import type { RevenueModel, PaymentCycle, EntityType , ProfitLossRow, ProfitLossOutput } from '../types/calculation';
import { calculateTax } from './tax';

interface PnLInput {
  mode: 'product' | 'service';
  unitPrice: Decimal;
  unitVariableCost: Decimal;
  volume: Decimal;
  fixedCost: Decimal;             // 月度固定成本
  tokenCost: Decimal;             // Token（月）
  acquisitionCost: Decimal;       // 月获客支出（服务型=获客成本/客户 × 拉新数，产品型=0）
  targetProfit?: Decimal;
  entityType: EntityType;
  revenueModel: RevenueModel;
  startupCapital: Decimal;        // 启动资金（用于折旧）
  depreciateMonths?: number;      // 分摊月数，默认 12
}

export function calculateProfitLoss(input: PnLInput): ProfitLossOutput {
  const {
    unitPrice: U, unitVariableCost: VC, volume: V,
    fixedCost, tokenCost, acquisitionCost,
    entityType, startupCapital, depreciateMonths = 12,
  } = input;

  // ── 一、营业收入 ──
  const revenue = U.times(V);

  // ── 减：营业成本 ──
  const cogs = VC.times(V);

  // ── 二、毛利 ──
  const grossProfit = revenue.minus(cogs);
  const grossMargin = revenue.gt(0) ? grossProfit.div(revenue) : new Decimal(0);

  // ── 减：费用 ──
  const fc = new Decimal(fixedCost);
  const ac = new Decimal(acquisitionCost);
  const tc = new Decimal(tokenCost);
  const depreciation = new Decimal(startupCapital).div(depreciateMonths);

  // ── 三、营业利润 ──
  const operatingProfit = grossProfit.minus(fc).minus(ac).minus(tc).minus(depreciation);

  // ── 税费 ──
  const taxResult = calculateTax({
    entityType,
    revenue,
    profit: operatingProfit,
  });

  // ── 四、净利润 ──
  const netProfit = operatingProfit.minus(taxResult.vat).minus(taxResult.incomeTax);
  const netMargin = revenue.gt(0) ? netProfit.div(revenue) : new Decimal(0);

  // ── 构建行 ──
  const rows: ProfitLossRow[] = [
    { item: '一、营业收入', amount: revenue },
    { item: '减：营业成本', amount: cogs, indent: true },
    { item: '二、毛利', amount: grossProfit, isHighlight: true },
    { item: `毛利率`, amount: grossMargin.times(100), isHighlight: true },
    { item: '减：固定费用', amount: fc, indent: true },
    { item: '减：获客支出', amount: ac, indent: true },
    { item: '减：Token', amount: tc, indent: true },
    { item: '减：折旧摊销', amount: depreciation, indent: true },
    { item: '三、营业利润', amount: operatingProfit, isHighlight: true },
    { item: '减：增值税', amount: taxResult.vat, indent: true },
    { item: '减：所得税', amount: taxResult.incomeTax, indent: true },
    { item: '四、净利润', amount: netProfit, isHighlight: true },
    { item: `净利率`, amount: netMargin.times(100), isHighlight: true },
  ];

  return {
    rows,
    grossProfit,
    grossMargin,
    operatingProfit,
    netProfit,
    netMargin,
    taxDetail: taxResult,
  };
}
