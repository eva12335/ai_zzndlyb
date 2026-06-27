/**
 * 现金流量表（水平滚动月份）
 * 来源：PRD §6.3 + showroom L1022-1043
 */
import { View, Text, ScrollView } from '@tarojs/components';
import Decimal from 'decimal.js';
import { FS } from '../../constants/fonts';
import type { CashFlowOutput, PaymentCycle } from '../../types/calculation';

interface Props {
  cashFlow: CashFlowOutput;
  paymentCycle: PaymentCycle;
}

const CYCLE_LABELS: Record<PaymentCycle, string> = {
  0: '即时回款',
  30: '30 天回款',
  60: '60 天回款',
};

const CYCLE_DESCS: Record<PaymentCycle, string> = {
  0: '当月收入当月到账',
  30: '当月收入下月到账',
  60: '当月收入隔月到账',
};

function fmt(v: Decimal): string {
  const n = v.toNumber();
  return (n >= 0 ? '¥' : '−¥') + Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function CashFlowTable({ cashFlow, paymentCycle }: Props) {
  const { rows, dangerMonths } = cashFlow;

  const COL_W = 90; // 每列最小宽度 px

  return (
    <View style={{
      background: 'var(--surface)', borderRadius: '16px', padding: '14px',
      border: '1px solid var(--border-subtle)',
    }}
    >
      {/* 回款周期标签 */}
      <View style={{ marginBottom: '6px' }}>
        <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>
          ⏳ 回款周期：{CYCLE_LABELS[paymentCycle]}（{CYCLE_DESCS[paymentCycle]}）
        </Text>
      </View>

      {/* 水平滚动表格 */}
      <ScrollView scrollX style={{ width: '100%' }}>
        <View style={{ minWidth: `${COL_W * (rows.length + 1)}px` }}>
          {/* 表头 */}
          <View style={{ display: 'flex', borderBottom: '2px solid var(--border-subtle)' }}>
            <View style={{ width: `${COL_W}px`, padding: '5px 3px', flexShrink: 0 }}>
              <Text style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>项目</Text>
            </View>
            {rows.map((r) => (
              <View key={r.month} style={{ width: `${COL_W}px`, padding: '5px 3px', flexShrink: 0, textAlign: 'right' }}>
                <Text style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>第{r.month}月</Text>
              </View>
            ))}
          </View>

          {/* 月初现金 */}
          <RowRenderer colW={COL_W} label="月初现金" rows={rows}
            getValue={(r) => r.openingCash}
            isBold={false} isMuted
          />

          {/* + 即时回款 */}
          <RowRenderer colW={COL_W} label="+ 即时回款" rows={rows}
            getValue={(r) => r.instantCollection}
            isBold={false} color="var(--green)"
          />

          {/* + 延期回款 */}
          <RowRenderer colW={COL_W} label="+ 延期回款" rows={rows}
            getValue={(r) => r.deferredCollection}
            isBold={false} color="var(--green)"
          />

          {/* = 现金流入 */}
          <RowRenderer colW={COL_W} label="= 现金流入" rows={rows}
            getValue={(r) => r.totalInflow}
            isBold
          />

          {/* - 成本费用 */}
          <RowRenderer colW={COL_W} label="− 成本费用" rows={rows}
            getValue={(r) => r.cashOutflow}
            isBold={false} color="var(--red)"
          />

          {/* - 固定投资 */}
          <RowRenderer colW={COL_W} label="− 固定投资" rows={rows}
            getValue={(r) => r.fixedInvestment}
            isBold={false} color="var(--red)"
          />

          {/* = 月末现金 */}
          <View style={{ display: 'flex', borderTop: '2px solid var(--border-subtle)' }}>
            <View style={{ width: `${COL_W}px`, padding: '5px 3px', flexShrink: 0 }}>
              <Text style={{ fontSize: '10px', fontWeight: 700, color: 'var(--navy-deep)' }}>= 月末现金</Text>
            </View>
            {rows.map((r) => (
              <View key={r.month} style={{
                width: `${COL_W}px`, padding: '5px 3px', flexShrink: 0, textAlign: 'right',
                background: r.isDanger ? 'rgba(212,117,99,0.08)' : 'transparent',
              }}
              >
                <Text style={{
                  fontSize: '10px', fontWeight: 700,
                  color: r.isDanger ? 'var(--red)' : r.closingCash.gte(0) ? 'var(--green)' : 'var(--red)',
                }}
                >
                  {fmt(r.closingCash)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 断流预警 */}
      {dangerMonths.length > 0 && (
        <View style={{
          marginTop: '10px', padding: '10px 12px',
          background: 'rgba(212,117,99,0.06)', borderRadius: '8px',
          borderLeft: '3px solid var(--red)',
        }}
        >
          <Text style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 600, display: 'block' }}>
            ⚠️ 连续 {dangerMonths.length} 月现金为负，账面赚钱 ≠ 手里有钱
          </Text>
          {rows.find(r => r.warningMsg)?.warningMsg ? (
            <Text style={{ fontSize: '9px', color: 'var(--text-primary)', lineHeight: 1.5, marginTop: '2px', display: 'block' }}>
              {rows.find(r => r.warningMsg)?.warningMsg}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

/** 单行渲染器 */
function RowRenderer({
  colW, label, rows, getValue, isBold, isMuted, color,
}: {
  colW: number;
  label: string;
  rows: { month: number; isDanger: boolean }[];
  getValue: (r: any) => Decimal;
  isBold: boolean;
  isMuted?: boolean;
  color?: string;
}) {
  return (
    <View style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
      <View style={{ width: `${colW}px`, padding: '5px 3px', flexShrink: 0 }}>
        <Text style={{
          fontSize: '10px',
          fontWeight: isBold ? 600 : 400,
          color: isMuted ? 'var(--text-muted)' : 'var(--text-primary)',
        }}
        >
          {label}
        </Text>
      </View>
      {rows.map((r) => (
        <View key={r.month} style={{
          width: `${colW}px`, padding: '5px 3px', flexShrink: 0, textAlign: 'right',
          background: r.isDanger ? 'rgba(212,117,99,0.04)' : 'transparent',
        }}
        >
          <Text style={{
            fontSize: '10px',
            fontWeight: isBold ? 600 : 400,
            color: r.isDanger ? 'var(--red)' : (color || 'var(--text-primary)'),
          }}
          >
            {fmt(getValue(r))}
          </Text>
        </View>
      ))}
    </View>
  );
}
