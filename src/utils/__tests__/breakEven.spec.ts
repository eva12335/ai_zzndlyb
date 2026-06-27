import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { calculateBreakEven } from '../breakEven';

describe('calculateBreakEven', () => {
  // PRD §4.2 示例：FC=20,000, VC=5.5, U=25
  it('应该计算盈亏平衡量', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(25),
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
    });
    expect(result).not.toHaveProperty('error');
    if ('error' in result) return;
    // V₀ = 20000 / (25 - 5.5) = 20000 / 19.5 = 1025.64
    expect(result.breakEvenVolume.toNumber()).toBeCloseTo(1025.64, 1);
    expect(result.contributionMargin.toNumber()).toBe(19.5);
  });

  it('除零保护：定价等于变动成本', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(10),
      unitVariableCost: new Decimal(10),
      fixedCost: new Decimal(10000),
    });
    expect(result).toHaveProperty('error');
    if ('error' in result) {
      expect(result.error).toContain('为零或负');
    }
  });

  it('负数：定价低于变动成本', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(5),
      unitVariableCost: new Decimal(10),
      fixedCost: new Decimal(10000),
    });
    expect(result).toHaveProperty('error');
  });

  it('含目标利润的计算', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(25),
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
      targetProfit: new Decimal(10000),
    });
    if ('error' in result) throw new Error('不应该报错');
    // V = (20000 + 10000) / 19.5 = 1538.46
    expect(result.requiredVolume?.toNumber()).toBeCloseTo(1538.46, 1);
  });

  it('产能预警', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(25),
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(500000),
      maxCapacity: 120,
    });
    if ('error' in result) return;
    expect(result.capacityWarning).not.toBeNull();
    expect(result.capacityWarning).toContain('产能上限');
  });

  it('0成本边界', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(25),
      unitVariableCost: new Decimal(0),
      fixedCost: new Decimal(1000),
    });
    if ('error' in result) throw new Error('不应该报错');
    expect(result.breakEvenVolume.toNumber()).toBe(40);
  });

  it('极大值不崩溃', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(100),
      unitVariableCost: new Decimal(1),
      fixedCost: new Decimal(99_999_999),
    });
    // 会触发无穷大检查
    expect(result).toHaveProperty('error');
  });

  it('requiredPrice 在 volume 未提供时应为 null', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(25),
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
      targetProfit: new Decimal(10000),
      // volume 刻意不传
    });
    if ('error' in result) throw new Error('不应该报错');
    expect(result.requiredVolume).not.toBeNull();
    expect(result.requiredVolume!.toNumber()).toBeCloseTo(1538.46, 1);
    // requiredPrice 在无 volume 时应为 null
    expect(result.requiredPrice).toBeNull();
  });

  it('requiredPrice 在 volume=0 时也应返回 null', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(25),
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
      volume: new Decimal(0),
      targetProfit: new Decimal(10000),
    });
    if ('error' in result) throw new Error('不应该报错');
    expect(result.requiredPrice).toBeNull();
  });

  it('requiredPrice 在 volume>0 时应正确计算', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(25),
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
      volume: new Decimal(1200),
      targetProfit: new Decimal(10000),
    });
    if ('error' in result) throw new Error('不应该报错');
    // U = VC + (FC + P) / V = 5.5 + 30000/1200 = 30.5
    expect(result.requiredPrice!.toNumber()).toBeCloseTo(30.5, 1);
  });

  it('AC 应纳入盈亏平衡公式', () => {
    // FC=3000, AC=5000, CM=100 → V₀ = (3000+5000)/100 = 80
    const result = calculateBreakEven({
      unitPrice: new Decimal(200),
      unitVariableCost: new Decimal(100),
      fixedCost: new Decimal(3000),
      acquisitionCost: new Decimal(5000),
    });
    if ('error' in result) throw new Error('不应该报错');
    expect(result.breakEvenVolume.toNumber()).toBeCloseTo(80, 0);
  });

  it('AC 应纳入目标利润公式', () => {
    // FC=3000, AC=5000, CM=100, P=2000 → V = (3000+5000+2000)/100 = 100
    const result = calculateBreakEven({
      unitPrice: new Decimal(200),
      unitVariableCost: new Decimal(100),
      fixedCost: new Decimal(3000),
      acquisitionCost: new Decimal(5000),
      targetProfit: new Decimal(2000),
    });
    if ('error' in result) throw new Error('不应该报错');
    expect(result.requiredVolume!.toNumber()).toBeCloseTo(100, 0);
  });

  it('AC 不传时应保持向后兼容（AC=0）', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(25),
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
    });
    if ('error' in result) throw new Error('不应该报错');
    // V₀ = (20000 + 0) / 19.5 = 1025.64
    expect(result.breakEvenVolume.toNumber()).toBeCloseTo(1025.64, 1);
  });
});
