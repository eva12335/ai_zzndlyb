/**
 * 盈亏平衡详情表
 * 来源：PRD §6 盈亏分析面板 + showroom L1045-1061
 */
import { View, Text } from '@tarojs/components';
import Decimal from 'decimal.js';
import { FS } from '../../constants/fonts';
import type { BreakEvenOutput } from '../../types/calculation';
import { useProjectStore } from '../../store/useProjectStore';

interface Props {
  breakEven: BreakEvenOutput;
  netProfit: Decimal;
}

export default function BreakEvenDetail({ breakEven, netProfit }: Props) {
  const store = useProjectStore();
  const volume = store.volume ? new Decimal(store.volume) : new Decimal(0);
  const startupCapital = new Decimal(store.startupCapital);
  const { breakEvenVolume, breakEvenRevenue, contributionMargin, contributionMarginRatio } = breakEven;

  // 安全边际
  const safetyMargin = volume.gt(0)
    ? volume.minus(breakEvenVolume).div(volume).times(100)
    : new Decimal(0);
  const safetyMarginVolume = volume.minus(breakEvenVolume);

  // 贡献毛利率
  const cmRatioPct = contributionMarginRatio.times(100);

  // 经营杠杆 = contributionMargin * volume / netProfit
  const operatingLeverage = netProfit.gt(0)
    ? contributionMargin.times(volume).div(netProfit)
    : null;

  // 回收期 = startupCapital / netProfit
  const paybackMonths = netProfit.gt(0) && startupCapital.gt(0)
    ? startupCapital.div(netProfit).ceil()
    : null;

  const rows: { label: string; value: string; color?: string; bold?: boolean }[] = [
    {
      label: '盈亏平衡销量',
      value: breakEvenVolume.ceil().toNumber().toLocaleString('zh-CN') + (store.mode === 'product' ? ' 件/月' : ' h/月'),
      bold: true,
    },
    {
      label: '盈亏平衡收入',
      value: '¥' + breakEvenRevenue.toNumber().toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      bold: true,
    },
    {
      label: '安全边际',
      value: safetyMargin.toFixed(1) + '%',
      color: safetyMargin.gte(20) ? 'var(--green)' : safetyMargin.gte(0) ? 'var(--warm)' : 'var(--red)',
    },
    {
      label: '安全边际销量',
      value: safetyMarginVolume.gte(0)
        ? safetyMarginVolume.toNumber().toLocaleString('zh-CN', { maximumFractionDigits: 0 }) + (store.mode === 'product' ? ' 件' : ' h')
        : '0',
    },
    {
      label: '单位贡献毛利',
      value: '¥' + contributionMargin.toFixed(2),
      bold: true,
    },
    {
      label: '贡献毛利率',
      value: cmRatioPct.toFixed(1) + '%',
      bold: true,
    },
  ];

  // 经营杠杆行
  if (operatingLeverage) {
    rows.push({
      label: '经营杠杆',
      value: operatingLeverage.toFixed(1) + '×',
      bold: true,
    });
  }

  // 回收期行
  if (paybackMonths) {
    rows.push({
      label: '回收期',
      value: '第 ' + paybackMonths.toNumber() + ' 个月',
      color: 'var(--green)',
      bold: true,
    });
  }

  return (
    <View style={{
      background: 'var(--surface)', borderRadius: '16px', padding: '14px',
      border: '1px solid var(--border-subtle)',
    }}
    >
      {rows.map((row, i) => (
        <View key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 4px',
          borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : '2px solid var(--border-subtle)',
        }}
        >
          <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>
            {row.label}
          </Text>
          <Text style={{
            fontSize: FS.caption,
            fontWeight: row.bold ? 700 : 500,
            color: row.color || 'var(--text-primary)',
          }}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
