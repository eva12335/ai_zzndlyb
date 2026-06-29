/**
 * 利润表 P&L 表格
 * 来源：PRD §6.1 + showroom L1003-1019
 */
import { View, Text } from '@tarojs/components';
import Decimal from 'decimal.js';
import { FS } from '../../constants/fonts';
import type { ProfitLossOutput } from '../../types/calculation';

interface Props {
  profitLoss: ProfitLossOutput;
  startupCapital: Decimal;
}

function fmt(v: Decimal): string {
  const n = v.toNumber();
  return (n >= 0 ? '¥' : '−¥') + Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(v: Decimal): string {
  return v.toFixed(2) + '%';
}

export default function ProfitLossTable({ profitLoss, startupCapital }: Props) {
  const { rows, netProfit } = profitLoss;

  // 回收期
  const hasStartup = startupCapital.gt(0);
  const paybackMonths = netProfit.gt(0) && hasStartup
    ? startupCapital.div(netProfit).ceil()
    : null;

  const paybackColor = netProfit.gt(0)
    ? (hasStartup
        ? (paybackMonths!.lte(12) ? '#4a9c7c'
          : paybackMonths!.lte(36) ? '#e0883a'
          : '#d47563')
        : '#4a9c7c')
    : '#d47563';

  const paybackLabel = netProfit.gt(0)
    ? (hasStartup ? `第 ${paybackMonths!.toNumber()} 个月` : '首月回本')
    : null;

  const paybackHint = netProfit.gt(0)
    ? (hasStartup
        ? (paybackMonths!.lte(12) ? '回收期合理'
          : paybackMonths!.lte(36) ? '回收期偏长，试试提价或增量'
          : '回收期超 3 年，建议审视投入')
        : '无初始投入，当月净利润即可覆盖运营成本')
    : null;

  return (
    <View style={{
      background: 'var(--surface)', borderRadius: '16px', padding: '14px',
      border: '1px solid var(--border-subtle)',
    }}
    >
      {/* 表格 */}
      <View>
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          const borderBottom = row.isHighlight && isLast
            ? '2px solid var(--border-subtle)'
            : '1px solid var(--border-subtle)';

          return (
            <View key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: row.isHighlight ? '7px 4px' : '6px 4px',
              paddingLeft: row.indent ? '16px' : '4px',
              borderBottom,
              background: row.isHighlight ? 'rgba(22,35,64,0.02)' : 'transparent',
              borderLeft: row.isHighlight ? '3px solid var(--gold)' : '3px solid transparent',
            }}
            >
              <Text style={{
                fontSize: FS.caption,
                fontWeight: row.isHighlight ? 700 : 400,
                color: row.isHighlight ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              >
                {row.item}
              </Text>
              <Text style={{
                fontSize: FS.caption,
                fontWeight: row.isHighlight ? 700 : 500,
                color: (() => {
                  if (!row.isHighlight) return 'var(--text-primary)';
                  if (row.item.includes('净利') || row.item.includes('净利率')) {
                    return row.amount.gte(0) ? 'var(--green)' : 'var(--red)';
                  }
                  return 'var(--navy-deep)';
                })(),
              }}
              >
                {row.item.includes('毛利率') || row.item.includes('净利率')
                  ? fmtPct(row.amount)
                  : fmt(row.amount)}
              </Text>
            </View>
          );
        })}
      </View>


      {/* 回收期 */}
      {netProfit.gt(0) && (
        <View style={{
          marginTop: '10px', padding: '10px 12px',
          background: paybackColor === '#4a9c7c' ? 'rgba(74,156,124,0.04)'
            : paybackColor === '#e0883a' ? 'rgba(224,136,58,0.04)'
            : 'rgba(212,117,99,0.04)',
          borderRadius: '8px',
          borderLeft: '3px solid ' + paybackColor,
        }}
        >
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>回收期</Text>
            <Text style={{ fontSize: FS.caption, fontWeight: 700, color: paybackColor }}>
              {paybackLabel}
            </Text>
          </View>
          {paybackHint && (
            <Text style={{
              fontSize: '10px', color: paybackColor, fontWeight: 500,
              display: 'block', marginTop: '4px',
            }}
            >
              {paybackHint}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
