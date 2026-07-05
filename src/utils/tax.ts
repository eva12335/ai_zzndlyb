/**
 * 税费计算（2025-2026 最新税法）
 * 来源：个人所得税法 + 财税〔2023〕19号（增值税减按1%至2027年底）
 *
 * 个体户/独资企业：经营所得 5%-35% 五级累进，年所得≤200万减半征收
 * 有限公司：企业所得税5% + 分红个税20%
 * 增值税：小规模纳税人，月收入≤10万免征，>10万按1%征收
 */
import Decimal from 'decimal.js';
import type { TaxConfig, TaxOutput } from '../types/calculation';

export function calculateTax(config: TaxConfig): TaxOutput {
  const { entityType, revenue, profit } = config;

  // ── 增值税：小规模纳税人 1%，月≤10万免征 ──
  let vat = new Decimal(0);
  if (revenue.gt(100_000)) {
    vat = revenue.times(0.01);
  }

  // ── 所得税 ──
  let incomeTax = new Decimal(0);

  if (profit.lte(0)) {
    return { vat, incomeTax: new Decimal(0), netProfit: profit.minus(vat) };
  }

  switch (entityType) {
    case 'individual':
    case 'sole_proprietor':
      // 个体户/独资企业：经营所得 5%-35% 五级累进，年≤200万减半
      incomeTax = calculateBusinessTax(profit);
      break;
    case 'limited_company': {
      // 有限公司：企业所得税5% + 分红个税20%
      const corporateTax = profit.times(0.05);
      const dividendTax = profit.minus(corporateTax).times(0.2);
      incomeTax = corporateTax.plus(dividendTax);
      break;
    }
  }

  const netProfit = profit.minus(vat).minus(incomeTax);
  return { vat, incomeTax, netProfit };
}

/** 经营所得个税：五级累进 + 年≤200万减半征收（至2027年底） */
function calculateBusinessTax(profit: Decimal): Decimal {
  const annual = profit.times(12);
  // 五级超额累进
  let annualTax = new Decimal(0);
  if (annual.lte(30_000)) {
    annualTax = annual.times(0.05);
  } else if (annual.lte(90_000)) {
    annualTax = annual.times(0.1).minus(1_500);
  } else if (annual.lte(300_000)) {
    annualTax = annual.times(0.2).minus(10_500);
  } else if (annual.lte(500_000)) {
    annualTax = annual.times(0.3).minus(40_500);
  } else {
    annualTax = annual.times(0.35).minus(65_500);
  }
  // 年≤200万减半征收
  if (annual.lte(200_000)) {
    annualTax = annualTax.div(2);
  }
  return annualTax.div(12);
}
