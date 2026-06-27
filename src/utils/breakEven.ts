/**
 * 盈亏平衡计算
 * 来源：PRD §4.2 核心推导 + TECH_DESIGN §3.1
 *
 * 公式（含获客成本 AC）：
 *   V₀ = (FC + AC) / (U - VC)
 *   R₀ = U × V₀ = (FC + AC) / (1 - VC/U)
 *   V  = (FC + AC + P) / (U - VC)   ← 含目标利润
 *   U  = VC + (FC + AC + P) / V     ← 目标利润所需定价
 */
import Decimal from 'decimal.js';
import type { BreakEvenInput, BreakEvenOutput } from '../types/calculation';

export function calculateBreakEven(input: BreakEvenInput): BreakEvenOutput | { error: string } {
  const { unitPrice: U, unitVariableCost: VC, fixedCost: FC, acquisitionCost: AC, targetProfit: P, maxCapacity } = input;
  const totalFixed = AC ? FC.plus(AC) : FC;

  // ── 除零保护 ──
  const contributionMargin = U.minus(VC);
  if (contributionMargin.lte(0)) {
    return { error: '单位贡献毛利为零或负——定价不能 ≤ 变动成本' };
  }

  const contributionMarginRatio = contributionMargin.div(U);

  // ── 盈亏平衡业务量：V₀ = (FC + AC) / (U - VC) ──
  const breakEvenVolume = totalFixed.div(contributionMargin).toDecimalPlaces(2);
  const breakEvenRevenue = U.times(breakEvenVolume).toDecimalPlaces(2);

  // ── 无穷大检查 ──
  if (breakEvenVolume.gt(999_999)) {
    return { error: '盈亏平衡量异常（>999,999），请检查输入' };
  }

  // ── 目标利润所需业务量：V = (FC + AC + P) / (U - VC) ──
  let requiredVolume: Decimal | null = null;
  let requiredPrice: Decimal | null = null;
  if (P && P.gt(0)) {
    requiredVolume = totalFixed.plus(P).div(contributionMargin).toDecimalPlaces(2);
    // 仅当销量已知时才能反推所需定价：U = VC + (FC + AC + P) / V
    if (input.volume && input.volume.gt(0)) {
      requiredPrice = VC.plus(totalFixed.plus(P).div(input.volume)).toDecimalPlaces(2);
    }
  }

  // ── 产能预警 ──
  let capacityWarning: string | null = null;
  if (maxCapacity && breakEvenVolume.gt(maxCapacity)) {
    capacityWarning = `盈亏平衡量 ${breakEvenVolume} 超过产能上限 ${maxCapacity}h`;
  }
  if (maxCapacity && requiredVolume && requiredVolume.gt(maxCapacity)) {
    capacityWarning = `目标利润所需 ${requiredVolume}h 超过产能上限 ${maxCapacity}h`;
  }

  return {
    contributionMargin,
    contributionMarginRatio,
    breakEvenVolume,
    breakEvenRevenue,
    requiredVolume,
    requiredPrice,
    capacityWarning,
  };
}
