/**
 * 金额/百分比格式化工具
 */

/** 金额格式化：¥1,234.56 */
export function fmtMoney(value: number, decimals = 2): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const fixed = abs.toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}¥${formatted}.${frac}`;
}

/** 百分比格式化：12.5% */
export function fmtPercent(value: number, decimals = 1): string {
  return value.toFixed(decimals) + '%';
}

/** 大额简写：¥1.2w */
export function fmtMoneyShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 10000) return `${sign}¥${(abs / 10000).toFixed(1)}w`;
  if (abs >= 1000) return `${sign}¥${(abs / 1000).toFixed(1)}k`;
  return `${sign}¥${abs.toFixed(0)}`;
}

/** 千分位数字 */
export function fmtNumber(value: number): string {
  return value.toLocaleString('zh-CN');
}
