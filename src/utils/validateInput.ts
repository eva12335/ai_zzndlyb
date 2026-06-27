/**
 * 输入校验（四层防御之第三层）
 * 来源：PRD §5.4 + TECH_DESIGN §3.1
 */
import type { CostFields, ValidationResult, ValidationError } from '../types/calculation';

export function validateInput(fields: Partial<CostFields>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // ═══ 阻断规则 ═══
  if (!fields.fixedCost || fields.fixedCost <= 0) {
    errors.push({ field: 'fixedCost', msg: '固定成本必须大于 0' });
  }
  if (fields.fixedCost && fields.fixedCost > 10_000_000) {
    errors.push({ field: 'fixedCost', msg: '金额超过上限' });
  }

  if (fields.mode === 'product') {
    if (!fields.unitVariableCost || fields.unitVariableCost <= 0) {
      errors.push({ field: 'unitVariableCost', msg: '每件材料成本必须大于 0' });
    }
    if (fields.unitVariableCost && fields.unitVariableCost > 10_000_000) {
      errors.push({ field: 'unitVariableCost', msg: '金额超过上限' });
    }
  }

  // Token 不能为负
  if (fields.tokenCost !== undefined && fields.tokenCost < 0) {
    errors.push({ field: 'tokenCost', msg: 'Token 费用不能为负数' });
  }

  // 服务型：获客成本不能为负
  if (fields.acquisitionCostPerClient !== undefined && fields.acquisitionCostPerClient < 0) {
    errors.push({ field: 'acquisitionCostPerClient', msg: '获客成本不能为负数' });
  }

  // ═══ 警告规则（不阻断计算） ═══
  if (fields.unitPrice !== undefined && fields.unitPrice > 0 &&
      fields.unitVariableCost !== undefined && fields.unitVariableCost > 0 &&
      fields.unitPrice <= fields.unitVariableCost) {
    const loss = fields.unitVariableCost - fields.unitPrice;
    warnings.push({
      field: 'unitPrice',
      msg: `定价 ≤ 成本，每件亏损 ¥${loss.toFixed(2)}`,
    });
  }

  if (fields.volume !== undefined && fields.volume > 999_999) {
    warnings.push({ field: 'volume', msg: '月销量过大，请确认' });
  }

  if (fields.tokenCost !== undefined && fields.fixedCost !== undefined &&
      fields.fixedCost > 0 && fields.tokenCost > fields.fixedCost * 2) {
    warnings.push({ field: 'tokenCost', msg: 'Token 费用超过固定成本 2 倍' });
  }

  if (fields.mode === 'service' &&
      fields.unitPrice !== undefined && fields.volume !== undefined &&
      fields.volume > (fields as any).maxBillableHours) {
    warnings.push({ field: 'volume', msg: '计费小时超过产能上限 120h' });
  }

  return {
    pass: errors.length === 0,
    level: warnings.length > 0 ? 'warn' : 'ok',
    errors,
    warnings,
  };
}
