/**
 * 现金流量表
 * 来源：PRD §6.3 + TECH_DESIGN §3.8.3
 */
import Decimal from 'decimal.js';
import type { PaymentCycle , CashFlowRow, CashFlowOutput } from '../types/calculation';

interface CashFlowInput {
  monthlyRevenue: Decimal;       // 月收入
  monthlyCost: Decimal;          // 月成本+费用（含 Token、获客）
  monthlyTax: Decimal;           // 月税费
  startupCapital: Decimal;       // 启动资金
  fixedInvestment: Decimal;      // 设备/装修等一次性支出
  paymentCycle: PaymentCycle;    // 回款周期
  months: number;                // 默认 6
}

export function calculateCashFlow(input: CashFlowInput): CashFlowOutput {
  const {
    monthlyRevenue, monthlyCost, monthlyTax,
    startupCapital, fixedInvestment, paymentCycle, months,
  } = input;

  const rows: CashFlowRow[] = [];
  const dangerMonths: number[] = [];
  let previousRevenue: Decimal | null = null;
  let twoMonthsAgoRevenue: Decimal | null = null;

  for (let m = 1; m <= months; m++) {
    // 期初现金
    const openingCash = m === 1
      ? new Decimal(startupCapital)
      : rows[m - 2].closingCash;

    // 回款计算
    let instantCollection = new Decimal(0);
    let deferredCollection = new Decimal(0);

    if (paymentCycle === 0) {
      // 即时到账：当月收入当月到
      instantCollection = new Decimal(monthlyRevenue);
    } else if (paymentCycle === 30) {
      // 30 天：当月收入下月到
      instantCollection = new Decimal(0);
      deferredCollection = previousRevenue ?? new Decimal(0);
    } else if (paymentCycle === 60) {
      // 60 天：当月收入隔月到
      instantCollection = new Decimal(0);
      deferredCollection = twoMonthsAgoRevenue ?? new Decimal(0);
    }

    const totalInflow = instantCollection.plus(deferredCollection);
    const cashOutflow = new Decimal(monthlyCost).plus(monthlyTax);
    const investment = m === 1 ? new Decimal(fixedInvestment) : new Decimal(0);
    const closingCash = openingCash.plus(totalInflow).minus(cashOutflow).minus(investment);

    // 断流预警
    const isDanger = closingCash.lt(0);
    let warningMsg: string | null = null;
    if (isDanger) {
      dangerMonths.push(m);
      // 账面盈利但现金断流
      if (monthlyRevenue.gt(monthlyCost.plus(monthlyTax))) {
        warningMsg = `第 ${m} 个月：账面盈利但现金断流（回款周期 ${paymentCycle} 天）`;
      } else {
        warningMsg = `第 ${m} 个月：现金断流，期末现金 ¥${closingCash.toFixed(0)}`;
      }
    }

    rows.push({
      month: m,
      openingCash,
      instantCollection,
      deferredCollection,
      otherInflow: new Decimal(0),
      totalInflow,
      cashOutflow,
      fixedInvestment: investment,
      closingCash,
      isDanger,
      warningMsg,
    });

    // 滚动
    twoMonthsAgoRevenue = previousRevenue;
    previousRevenue = new Decimal(monthlyRevenue);
  }

  return { rows, dangerMonths };
}
