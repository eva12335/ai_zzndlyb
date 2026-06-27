/**
 * ROI 计算管线 Hook
 * 来源：AGENTS §3.1 + TECH_DESIGN §3.2
 *
 * 职责：读取 Store → 校验 → 计算 → 返回结果
 * 不维护本地状态，纯管线
 */
import { useMemo } from 'react';
import Decimal from 'decimal.js';
import { useProjectStore } from '../store/useProjectStore';
import { validateInput } from '../utils/validateInput';
import { calculateBreakEven } from '../utils/breakEven';
import { calculateProfitLoss } from '../utils/profitLoss';
import { calculateCashFlow } from '../utils/cashFlow';
import { projectRevenue } from '../utils/revenueProjection';
import { diagnoseProfit } from '../utils/profitDiagnostic';
import type { ValidationResult } from '../types/calculation';

export function useCalculation() {
  const store = useProjectStore();

  return useMemo(() => {
    const fields = {
      mode: store.mode,
      projectName: store.projectName,
      fixedCost: store.fixedCost,
      unitVariableCost: store.unitVariableCost,
      unitPrice: store.unitPrice ?? undefined,
      volume: store.volume ?? undefined,
      tokenCost: store.tokenCost,
      acquisitionCostPerClient: store.acquisitionCostPerClient,
      newClientsPerMonth: store.newClientsPerMonth,
      targetProfit: store.targetProfit ?? undefined,
      revenueModel: store.revenueModel,
      maxBillableHours: store.maxBillableHours,
      entityType: store.entityType,
      paymentCycle: store.paymentCycle,
      growthRate: store.growthRate,
      startupCapital: store.startupCapital,
    };

    // 校验
    const validation: ValidationResult = validateInput(fields as any);

    if (!validation.pass) {
      return { validation, breakEven: null, profitLoss: null, cashFlow: null, projection: null, diagnostic: null };
    }

    // 准备计算参数
    let U = store.unitPrice ? new Decimal(store.unitPrice) : new Decimal(0);
    const VC = new Decimal(store.unitVariableCost);
    let V = store.volume ? new Decimal(store.volume) : new Decimal(0);
    const FC = new Decimal(store.fixedCost);
    const TC = new Decimal(store.tokenCost);
    const totalFC = FC.plus(TC);

    // 定价或销量留空时自动推导（PRD §1.3：反推是核心差异化）
    if (totalFC.gt(0)) {
      if (store.mode === 'product') {
        // ── 产品型推导 ──
        if (U.eq(0) && V.eq(0)) {
          if (VC.gt(0)) {
            U = VC.times(3);
            V = totalFC.div(U.minus(VC)).ceil();
          } else {
            V = new Decimal(100);
            U = totalFC.div(V);
          }
        } else if (U.eq(0) && V.gt(0)) {
          U = VC.plus(totalFC.div(V));
        } else if (U.gt(0) && V.eq(0)) {
          const cm = U.minus(VC);
          if (cm.gt(0)) {
            V = totalFC.div(cm).ceil();
          }
        }
      } else if (store.mode === 'service') {
        // ── 服务型推导 ──
        if (U.eq(0) && V.eq(0)) {
          U = totalFC.div(80);
          V = new Decimal(80);
        } else if (U.eq(0) && V.gt(0)) {
          U = totalFC.div(V);
        } else if (U.gt(0) && V.eq(0)) {
          V = totalFC.div(U);
        }
      }
    }

    // 获客支出
    const AC = store.mode === 'service'
      ? new Decimal(store.acquisitionCostPerClient).times(store.newClientsPerMonth)
      : new Decimal(0);

    // 盈亏平衡
    const breakEven = calculateBreakEven({
      unitPrice: U,
      unitVariableCost: VC,
      fixedCost: totalFC,
      acquisitionCost: AC,
      volume: V,
      targetProfit: store.targetProfit ? new Decimal(store.targetProfit) : undefined,
      maxCapacity: store.mode === 'service' ? store.maxBillableHours : undefined,
    });

    if ('error' in breakEven) {
      return { validation, breakEven: null, profitLoss: null, cashFlow: null, projection: null, diagnostic: null, error: breakEven.error };
    }

    // 服务型保本时薪（聚合层派生，不污染 BreakEvenOutput）
    const breakEvenHourlyRate = store.mode === 'service' && V.gt(0)
      ? totalFC.plus(AC).div(V)
      : null;

    // 利润表
    const profitLoss = calculateProfitLoss({
      mode: store.mode,
      unitPrice: U,
      unitVariableCost: VC,
      volume: V,
      fixedCost: FC,
      tokenCost: TC,
      acquisitionCost: AC,
      targetProfit: store.targetProfit ? new Decimal(store.targetProfit) : undefined,
      entityType: store.entityType,
      revenueModel: store.revenueModel,
      startupCapital: new Decimal(store.startupCapital),
    });

    // 现金流
    const cashFlow = calculateCashFlow({
      monthlyRevenue: U.times(V),
      monthlyCost: VC.times(V).plus(FC).plus(TC).plus(AC),
      monthlyTax: profitLoss.taxDetail.vat.plus(profitLoss.taxDetail.incomeTax),
      startupCapital: new Decimal(store.startupCapital),
      fixedInvestment: new Decimal(0),
      paymentCycle: store.paymentCycle,
      months: 6,
    });

    // 收入预测
    const projection = projectRevenue({
      baseRevenue: U.times(V),
      growthRate: store.growthRate / 100,
      months: 6,
      breakEvenRevenue: breakEven.breakEvenRevenue,
    });

    // 利润诊断
    const diagnostic = diagnoseProfit({
      mode: store.mode,
      unitPrice: U,
      unitVariableCost: VC,
      volume: V,
      fixedCost: FC,
      tokenCost: TC,
      acquisitionCost: AC,
      netProfit: profitLoss.netProfit,
    });

    return { validation, breakEven, profitLoss, cashFlow, projection, diagnostic, derivedU: U, derivedV: V, breakEvenHourlyRate };
  }, [
    store.mode, store.projectName, store.fixedCost, store.unitVariableCost,
    store.unitPrice, store.volume, store.tokenCost,
    store.acquisitionCostPerClient, store.newClientsPerMonth,
    store.targetProfit, store.revenueModel, store.maxBillableHours,
    store.entityType, store.paymentCycle, store.growthRate, store.startupCapital,
  ]);
}
