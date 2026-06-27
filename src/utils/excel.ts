/**
 * 文本导出工具（适配小程序：生成格式化文本供复制到剪贴板）
 * 来源：PRD §8 分享与导出
 */
import Taro from '@tarojs/taro';
import type { ProfitLossOutput, CashFlowOutput, BreakEvenOutput } from '../types/calculation';
import type { AssessmentResult } from '../types/assessment';

// ═══════════════════════════════════════════
// 文本格式化
// ═══════════════════════════════════════════

/** 两列对齐：左列中文右列数字，col1 宽度自动 */
function padRow(label: string, value: string, labelWidth = 12): string {
  const padded = label + ' '.repeat(Math.max(0, labelWidth - label.length));
  return `${padded}  ${value}`;
}

// ═══════════════════════════════════════════
// 利润表文本导出
// ═══════════════════════════════════════════

export function exportProfitLossToText(
  profitLoss: ProfitLossOutput,
  projectName: string,
): string {
  const lines: string[] = [];
  lines.push('═════════════════════════');
  lines.push(`  📊 利润表 · ${projectName}`);
  lines.push('═════════════════════════');
  lines.push('');

  for (const row of profitLoss.rows) {
    const prefix = row.indent ? '  ' : '';
    const mark = row.isHighlight ? '▶ ' : '  ';
    const amt = row.amount.toFixed(2);
    lines.push(`${mark}${prefix}${padRow(row.item, `¥${amt}`)}`);
  }

  lines.push('');
  lines.push(padRow('毛利', `¥${profitLoss.grossProfit.toFixed(2)}`));
  lines.push(padRow('毛利率', `${profitLoss.grossMargin.times(100).toFixed(1)}%`));
  lines.push(padRow('营业利润', `¥${profitLoss.operatingProfit.toFixed(2)}`));
  lines.push(padRow('净利润', `¥${profitLoss.netProfit.toFixed(2)}`));
  lines.push(padRow('净利率', `${profitLoss.netMargin.times(100).toFixed(1)}%`));
  lines.push('');
  lines.push(padRow('增值税', `¥${profitLoss.taxDetail.vat.toFixed(2)}`));
  lines.push(padRow('所得税', `¥${profitLoss.taxDetail.incomeTax.toFixed(2)}`));
  lines.push('');
  lines.push('── 一人公司罗盘 · meoo.fun ──');

  return lines.join('\n');
}

// ═══════════════════════════════════════════
// 现金流量表文本导出
// ═══════════════════════════════════════════

export function exportCashFlowToText(
  cashFlow: CashFlowOutput,
  projectName: string,
): string {
  const lines: string[] = [];
  lines.push('═════════════════════════');
  lines.push(`  💰 现金流量表 · ${projectName}`);
  lines.push('═════════════════════════');
  lines.push('');

  const header = '  月份    期初现金    流入      流出      期末现金';
  lines.push(header);
  lines.push('  ' + '─'.repeat(header.length - 2));

  for (const row of cashFlow.rows) {
    const dangerMark = row.isDanger ? '⚠️' : '  ';
    lines.push(
      `${dangerMark}第${row.month}月   ` +
      `¥${row.openingCash.toFixed(0).padStart(8)}  ` +
      `¥${row.totalInflow.toFixed(0).padStart(8)}  ` +
      `¥${row.cashOutflow.toFixed(0).padStart(8)}  ` +
      `¥${row.closingCash.toFixed(0).padStart(8)}`,
    );
    if (row.warningMsg) {
      lines.push(`       ⚠️ ${row.warningMsg}`);
    }
  }

  if (cashFlow.dangerMonths.length > 0) {
    lines.push('');
    lines.push(`⚠️ 断流预警：第 ${cashFlow.dangerMonths.join('、')} 个月现金见底`);
  }

  lines.push('');
  lines.push('── 一人公司罗盘 · meoo.fun ──');

  return lines.join('\n');
}

// ═══════════════════════════════════════════
// 分享文本（纯文本版，供 clipboard 复制）
// ═══════════════════════════════════════════

export function buildShareText(
  projectName: string,
  unitPrice: string,
  breakEvenVolume: string,
  netProfit: string,
  twistMonth: string | null,
  insight: string | null,
  isService: boolean,
): string {
  const unit = isService ? '小时' : '件';
  const lines: string[] = [];
  lines.push('🧭 一人公司罗盘');
  lines.push('');
  lines.push(`📊 ${projectName}`);
  lines.push(`定价 ¥${unitPrice}，每月需卖 ${breakEvenVolume} ${unit} 才能回本`);
  if (netProfit.startsWith('-')) {
    lines.push(`当前月净亏 ¥${netProfit.replace('-', '')}`);
  } else {
    lines.push(`当前月净利 ¥${netProfit}`);
  }
  if (twistMonth) {
    lines.push(`预计第 ${twistMonth} 个月扭亏`);
  }
  if (insight) {
    lines.push(`💡 ${insight}`);
  }
  lines.push('');
  lines.push('扫码测测你的项目 → meoo.fun');
  return lines.join('\n');
}

// ═══════════════════════════════════════════
// 测评结果分享文本
// ═══════════════════════════════════════════

export function buildAssessmentShareText(result: AssessmentResult): string {
  const lines: string[] = [];
  lines.push('🧭 一人公司罗盘 · 适合度测评');
  lines.push('');
  lines.push(`🏷️ 我的段位：${result.segment}`);
  lines.push(`📊 A 总分 ${result.totalA}/110 · B 总分 ${result.totalB}/110`);
  lines.push('');

  // 列出突出优势（A >= 8 的优秀维度）
  const strengths = Object.entries(result.dimensionScores)
    .filter(([, s]) => s.scoreA >= 8)
    .map(([dim, s]) => `  ✅ ${dim} ${s.scoreA}/10`);
  if (strengths.length > 0) {
    lines.push('🔥 突出优势：');
    strengths.forEach((s) => lines.push(s));
    lines.push('');
  }

  // 列出明显短板（A <= 3 的弱项维度）
  const weaknesses = Object.entries(result.dimensionScores)
    .filter(([, s]) => s.scoreA <= 3)
    .map(([dim, s]) => `  ⚠️ ${dim} ${s.scoreA}/10`);
  if (weaknesses.length > 0) {
    lines.push('📌 明显短板：');
    weaknesses.forEach((w) => lines.push(w));
    lines.push('');
  }

  if (result.ctaText) {
    lines.push(`💡 ${result.ctaText}`);
    lines.push('');
  }

  lines.push('扫码测测你的一人公司适合度 → meoo.fun');
  return lines.join('\n');
}

// ═══════════════════════════════════════════
// 剪贴板辅助
// ═══════════════════════════════════════════

export function copyToClipboard(text: string): void {
  Taro.setClipboardData({
    data: text,
    success: () => {
      Taro.showToast({ title: '已复制到剪贴板', icon: 'success', duration: 1500 });
    },
    fail: () => {
      Taro.showToast({ title: '复制失败，请重试', icon: 'none', duration: 1500 });
    },
  });
}
