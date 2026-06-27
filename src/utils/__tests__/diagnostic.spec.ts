import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { diagnoseProfit } from '../profitDiagnostic';

describe('profitDiagnostic', () => {
  it('净利润≥0 不触发诊断', () => {
    const result = diagnoseProfit({
      mode: 'product', unitPrice: new Decimal(25), unitVariableCost: new Decimal(5),
      volume: new Decimal(1000), fixedCost: new Decimal(10000), tokenCost: new Decimal(500),
      acquisitionCost: new Decimal(0), netProfit: new Decimal(5000),
    });
    expect(result).toBeNull();
  });

  it('unitLoss: 净利为负，定价≤成本', () => {
    const result = diagnoseProfit({
      mode: 'product', unitPrice: new Decimal(5), unitVariableCost: new Decimal(10),
      volume: new Decimal(100), fixedCost: new Decimal(1000), tokenCost: new Decimal(0),
      acquisitionCost: new Decimal(0), netProfit: new Decimal(-500),
    });
    expect(result).not.toBeNull();
    expect(result!.rootCause).toBe('unitLoss');
  });

  it('scaleGap: 毛利>0 但 <FC', () => {
    const result = diagnoseProfit({
      mode: 'product', unitPrice: new Decimal(25), unitVariableCost: new Decimal(5),
      volume: new Decimal(500), fixedCost: new Decimal(20000), tokenCost: new Decimal(500),
      acquisitionCost: new Decimal(0), netProfit: new Decimal(-5000),
    });
    expect(result).not.toBeNull();
    expect(result!.rootCause).toBe('scaleGap');
  });

  it('extraBurden: 毛利>FC 但净利为负（税/获客侵蚀）', () => {
    // 毛利 20000, FC 10000, 但大量获客侵蚀利润
    const result = diagnoseProfit({
      mode: 'service', unitPrice: new Decimal(250), unitVariableCost: new Decimal(0),
      volume: new Decimal(80), fixedCost: new Decimal(3000), tokenCost: new Decimal(500),
      acquisitionCost: new Decimal(17000), netProfit: new Decimal(-500),
    });
    expect(result).not.toBeNull();
    expect(result!.rootCause).toBe('extraBurden');
  });

  it('建议包含具体数字', () => {
    const result = diagnoseProfit({
      mode: 'product', unitPrice: new Decimal(25), unitVariableCost: new Decimal(5),
      volume: new Decimal(500), fixedCost: new Decimal(20000), tokenCost: new Decimal(500),
      acquisitionCost: new Decimal(0), netProfit: new Decimal(-5000),
    });
    expect(result!.suggestions.length).toBeGreaterThanOrEqual(2);
    expect(result!.rootCauseLabel).toBe('规模不足');
  });
});
