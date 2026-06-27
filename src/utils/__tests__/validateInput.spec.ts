import { describe, it, expect } from 'vitest';
import { validateInput } from '../validateInput';

describe('validateInput', () => {
  it('阻断：固定成本为0', () => {
    const r = validateInput({ mode: 'product', fixedCost: 0 });
    expect(r.pass).toBe(false);
    expect(r.errors.some(e => e.field === 'fixedCost')).toBe(true);
  });

  it('阻断：固定成本为空', () => {
    const r = validateInput({ mode: 'product' });
    expect(r.pass).toBe(false);
  });

  it('阻断：产品型材料成本为0', () => {
    const r = validateInput({ mode: 'product', fixedCost: 10000, unitVariableCost: 0 });
    expect(r.pass).toBe(false);
    expect(r.errors.some(e => e.field === 'unitVariableCost')).toBe(true);
  });

  it('阻断：金额超上限', () => {
    const r = validateInput({ mode: 'product', fixedCost: 20_000_000 });
    expect(r.pass).toBe(false);
  });

  it('通过：正常输入', () => {
    const r = validateInput({ mode: 'product', fixedCost: 20000, unitVariableCost: 5.5, tokenCost: 500 });
    expect(r.pass).toBe(true);
  });

  it('警告：定价≤成本', () => {
    const r = validateInput({ mode: 'product', fixedCost: 20000, unitVariableCost: 20, unitPrice: 15, tokenCost: 0 });
    expect(r.pass).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.warnings[0].field).toBe('unitPrice');
  });

  it('警告：Token超固定成本2倍', () => {
    const r = validateInput({ mode: 'product', fixedCost: 1000, unitVariableCost: 10, tokenCost: 3000 });
    expect(r.warnings.some(w => w.field === 'tokenCost')).toBe(true);
  });

  it('警告：月销量过大', () => {
    const r = validateInput({ mode: 'product', fixedCost: 1000, unitVariableCost: 10, volume: 2_000_000 });
    expect(r.warnings.some(w => w.field === 'volume')).toBe(true);
  });

  it('服务型：不校验unitVariableCost', () => {
    const r = validateInput({ mode: 'service', fixedCost: 3000, tokenCost: 0 });
    expect(r.pass).toBe(true);
  });
});
