/**
 * 6 KPI 指标卡片 — 微信小程序兼容版
 *
 * 布局：2 列 × 3 行（避免 3 列在小屏上文字溢出）
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';
import type { BreakEvenOutput } from '../../types/calculation';

interface Props {
  netProfit: Decimal | null;
  operatingProfit: Decimal | null;
  breakEven: BreakEvenOutput | null;
  currentVolume: Decimal;
}

export default function KpiCards({ netProfit, operatingProfit, breakEven, currentVolume }: Props) {
  const { t } = useTranslation();
  const store = useProjectStore();
  const isService = store.mode === 'service';

  const isLoss = netProfit && netProfit.lt(0);
  const bev = breakEven?.breakEvenVolume ?? null;
  const ber = breakEven?.breakEvenRevenue ?? null;
  const completionRate = bev && bev.gt(0) ? currentVolume.div(bev).times(100) : null;
  const safetyMargin = bev && currentVolume.gt(0)
    ? currentVolume.minus(bev).div(currentVolume).times(100)
    : null;

  const unitLabel = isService ? 'h' : '';

  return (
    <View style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid #edeff3',
      marginBottom: '12px',
    }}
    >
      {/* 分区标题 */}
      <Text style={{
        fontSize: '16px', fontWeight: 700, color: '#1a1f2e',
        display: 'block', marginBottom: '12px',
      }}
      >
        {t('roi.kpi_section_title')}
      </Text>

      {/* 行标签：盈利规模 */}
      <Text style={{
        fontSize: FS.caption, fontWeight: 600, color: '#9298a8',
        display: 'block', marginBottom: '6px',
      }}
      >
        {t('roi.kpi_row_profit')}
      </Text>

      {/* Row 1: 月净利润 + 盈亏平衡量 */}
      <View style={{ display: 'flex', marginBottom: '8px' }}>
        <View style={{ flex: 1, marginRight: '8px', minWidth: 0 }}>
          <KpiCard
            value={netProfit ? (netProfit.gte(0) ? '+¥' : '−¥') + netProfit.abs().toFixed(2) : '—'}
            label={t('roi.kpi_net_profit')}
            valueColor={isLoss ? '#d47563' : '#4a9c7c'}
            bgColor={isLoss ? 'rgba(212,117,99,0.03)' : 'rgba(74,156,124,0.04)'}
            borderColor={isLoss ? 'rgba(212,117,99,0.2)' : 'rgba(74,156,124,0.15)'}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <KpiCard
            value={bev ? bev.ceil().toNumber().toLocaleString('zh-CN') + unitLabel : '—'}
            label={t('roi.kpi_breakeven_vol')}
            valueColor="#517ea8"
          />
        </View>
      </View>

      {/* Row 2: 盈亏平衡收入 + 营业利润 */}
      <View style={{ display: 'flex', marginBottom: '8px' }}>
        <View style={{ flex: 1, marginRight: '8px', minWidth: 0 }}>
          <KpiCard
            value={ber ? '¥' + ber.toNumber().toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
            label={t('roi.kpi_breakeven_rev')}
            valueColor="#517ea8"
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <KpiCard
            value={operatingProfit ? (operatingProfit.gte(0) ? '+¥' : '−¥') + operatingProfit.abs().toFixed(2) : '—'}
            label={t('roi.kpi_operating_profit')}
            valueColor={operatingProfit && operatingProfit.gte(0) ? '#162340' : '#d47563'}
          />
        </View>
      </View>

      {/* 行标签：安全边际 */}
      <Text style={{
        fontSize: FS.caption, fontWeight: 600, color: '#9298a8',
        display: 'block', marginBottom: '6px',
      }}
      >
        {t('roi.kpi_row_safety')}
      </Text>

      {/* Row 3: 当前完成率 + 安全边际率 */}
      <View style={{ display: 'flex' }}>
        <View style={{ flex: 1, marginRight: '8px', minWidth: 0 }}>
          <KpiCard
            value={completionRate ? completionRate.toFixed(2) + '%' : '—'}
            label={t('roi.kpi_completion')}
            valueColor="#1a1f2e"
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <KpiCard
            value={safetyMargin ? safetyMargin.toFixed(2) + '%' : '—'}
            label={t('roi.kpi_safety_margin')}
            valueColor={safetyMargin && safetyMargin.gte(20) ? '#4a9c7c' : safetyMargin && safetyMargin.gte(0) ? '#e0883a' : '#d47563'}
          />
        </View>
      </View>
    </View>
  );
}

function KpiCard({
  value, label, valueColor,
  bgColor = '#ffffff',
  borderColor = '#edeff3',
}: {
  value: string;
  label: string;
  valueColor: string;
  bgColor?: string;
  borderColor?: string;
}) {
  return (
    <View style={{
      padding: '14px 8px', borderRadius: '12px', textAlign: 'center',
      background: bgColor,
      border: '1px solid ' + borderColor,
      overflow: 'hidden',
    }}
    >
      <Text style={{
        fontSize: '16px', fontWeight: 600, color: valueColor,
        display: 'block', marginBottom: '2px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
      >
        {value}
      </Text>
      <Text style={{
        fontSize: '11px', color: '#9298a8',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
      >
        {label}
      </Text>
    </View>
  );
}
