/**
 * 税费计算
 * 来源：PRD §6.1 税种切换 + TECH_DESIGN §3.8.1
 */
import Decimal from 'decimal.js';
import type { TaxConfig, TaxOutput, EntityType } from '../types/calculation';

export function calculateTax(config: TaxConfig): TaxOutput {
  const { entityType, revenue, profit } = config;

  // ── 增值税：小规模纳税人 1%，季 30 万以下免 ──
  // 月均 10 万以下免增值税（简化：月 revenue < 100,000 免税）
  let vat = new Decimal(0);
  if (entityType !== 'individual' && revenue.gt(100_000)) {
    vat = revenue.times(0.01);
  }

  // ── 所得税 ──
  let incomeTax = new Decimal(0);

  if (profit.lte(0)) {
    return { vat, incomeTax: new Decimal(0), netProfit: profit.minus(vat) };
  }

  switch (entityType) {
    case 'individual':
      incomeTax = profit.times(0.2);
      break;
    case 'sole_proprietor':
      incomeTax = calculateProgressiveTax(profit);
      break;
    case 'limited_company': {
      const corporateTax = profit.times(0.05);
      const dividendTax = profit.minus(corporateTax).times(0.2);
      incomeTax = corporateTax.plus(dividendTax);
      break;
    }
  }

  const netProfit = profit.minus(vat).minus(incomeTax);
  return { vat, incomeTax, netProfit };
}

/** 个体户经营所得 5%-35% 累进（简化：统一按 10% 利润率核定） */
function calculateProgressiveTax(profit: Decimal): Decimal {
  const annualProfit = profit.times(12);
  let rate = new Decimal(0.05);
  if (annualProfit.gt(300_000)) rate = new Decimal(0.1);
  if (annualProfit.gt(500_000)) rate = new Decimal(0.2);
  if (annualProfit.gt(1_000_000)) rate = new Decimal(0.3);
  return profit.times(rate);
}
