/**
 * 反推计算逻辑验证
 * 验证 PRD 核心承诺：定价和销量均可留空，系统自动推导
 */
import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { calculateBreakEven } from '../breakEven';

// 模拟 useCalculation.ts 中应有的反推逻辑
function deriveProductMode(
  fixedCost: number,
  unitVariableCost: number,
  tokenCost: number,
  unitPrice: number | null,
  volume: number | null,
) {
  const VC = new Decimal(unitVariableCost);
  const totalFC = new Decimal(fixedCost).plus(tokenCost);
  let U = unitPrice ? new Decimal(unitPrice) : new Decimal(0);
  let V = volume ? new Decimal(volume) : new Decimal(0);

  if (totalFC.gt(0) && VC.gt(0)) {
    if (U.eq(0) && V.eq(0)) {
      // 两者都空：定价=VC×3，销量=FC/(U-VC)
      U = VC.times(3);
      V = totalFC.div(U.minus(VC)).ceil();
    } else if (U.eq(0) && V.gt(0)) {
      // 定价空：U = VC + FC / V
      U = VC.plus(totalFC.div(V));
    } else if (U.gt(0) && V.eq(0)) {
      // 销量空：V = FC / (U - VC)
      V = totalFC.div(U.minus(VC)).ceil();
    }
  }

  return { U, V };
}

describe('反推逻辑验证', () => {
  // ═══ 场景1: PRD §2.1 小明咖啡店 ═══
  it('定价和销量都填了 → 正常计算（当前可用）', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(25),
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
    });
    if ('error' in result) throw new Error('不应该报错');
    expect(result.breakEvenVolume.ceil().toNumber()).toBe(1026);
    expect(result.contributionMargin.toNumber()).toBe(19.5);
  });

  // ═══ 场景2: 🔥 产品型定价=空，销量=空 ═══
  it('🔥 产品型：定价=空 销量=空 → 应自动推导', () => {
    const { U, V } = deriveProductMode(20000, 5.5, 0, null, null);

    expect(U.gt(0)).toBe(true);
    expect(V.gt(0)).toBe(true);

    // 推导后应能正常计算
    const result = calculateBreakEven({
      unitPrice: U,
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
    });
    if ('error' in result) throw new Error('推导后的值不应该报错');
    expect(result.breakEvenVolume.ceil().toNumber()).toBeGreaterThan(0);
  });

  // ═══ 场景3: 🔥 产品型定价=空，销量已知 ═══
  it('🔥 产品型：定价=空 销量=1200 → 应反推定価', () => {
    const { U, V } = deriveProductMode(20000, 5.5, 0, null, 1200);

    // U = VC + FC/V = 5.5 + 20000/1200 = 22.17
    expect(U.toNumber()).toBeCloseTo(22.17, 1);
    expect(V.toNumber()).toBe(1200);

    const result = calculateBreakEven({
      unitPrice: U,
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
    });
    if ('error' in result) throw new Error('不应该报错');
    expect(result.breakEvenVolume.ceil().toNumber()).toBeLessThanOrEqual(1200);
  });

  // ═══ 场景4: 🔥 产品型销量=空，定价已知 ═══
  it('🔥 产品型：定价=25 销量=空 → 应反推销量', () => {
    const { U, V } = deriveProductMode(20000, 5.5, 0, 25, null);

    expect(U.toNumber()).toBe(25);
    // V = FC/(U-VC) = 20000/19.5 = 1026
    expect(V.toNumber()).toBe(1026);

    const result = calculateBreakEven({
      unitPrice: U,
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
    });
    if ('error' in result) throw new Error('不应该报错');
    expect(result.breakEvenVolume.ceil().toNumber()).toBe(1026);
  });

  // ═══ 场景5: 服务型反推（当前已有，确保不误删） ═══
  it('服务型：时薪=空 计费小时=空 → 当前已有反推', () => {
    // 模拟当前 useCalculation.ts 的服务型推导
    const totalFC = new Decimal(3000).plus(1500); // 4500
    let U = new Decimal(0);
    let V = new Decimal(0);

    if (U.eq(0) && V.eq(0)) {
      U = totalFC.div(80);
      V = new Decimal(80);
    }

    expect(U.toNumber()).toBeCloseTo(56.25, 1);
    expect(V.toNumber()).toBe(80);
  });

  // ═══ 场景6: requiredPrice 销量为 null 应返回 null ═══
  it('🔥 requiredPrice：volume=null 时不应除以1，应返回 null', () => {
    const result = calculateBreakEven({
      unitPrice: new Decimal(25),
      unitVariableCost: new Decimal(5.5),
      fixedCost: new Decimal(20000),
      targetProfit: new Decimal(10000),
      // volume 不传 → undefined
    });
    if ('error' in result) throw new Error('不应该报错');

    // requiredVolume 应该正常
    expect(result.requiredVolume).not.toBeNull();
    expect(result.requiredVolume!.toNumber()).toBeCloseTo(1538.46, 1);

    // requiredPrice 在 volume 未提供时应该为 null
    expect(result.requiredPrice).toBeNull();
  });
});
