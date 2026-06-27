/**
 * 收入预测线
 * 来源：PRD §6.2 + TECH_DESIGN §3.8.2
 */
import Decimal from 'decimal.js';
import type { RevenueProjectionInput, RevenueProjectionOutput } from '../types/calculation';

export function projectRevenue(input: RevenueProjectionInput): RevenueProjectionOutput {
  const { baseRevenue, growthRate, months, breakEvenRevenue } = input;

  const points: { month: number; revenue: Decimal }[] = [];
  let breakEvenMonth: number | null = null;

  let currentRevenue = new Decimal(baseRevenue);

  for (let m = 1; m <= months; m++) {
    if (m > 1) {
      currentRevenue = currentRevenue.times(1 + growthRate);
    }
    points.push({ month: m, revenue: currentRevenue.toDecimalPlaces(0) });

    // 找到扭亏月份
    if (breakEvenMonth === null && currentRevenue.gte(breakEvenRevenue)) {
      breakEvenMonth = m;
    }
  }

  return { points, breakEvenMonth };
}
