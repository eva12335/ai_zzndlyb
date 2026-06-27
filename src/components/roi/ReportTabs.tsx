/**
 * 报表标签页切换（利润表 / 现金流）
 */
import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { FS } from '../../constants/fonts';
import type { ProfitLossOutput, CashFlowOutput, PaymentCycle } from '../../types/calculation';
import ProfitLossTable from './ProfitLossTable';
import CashFlowTable from './CashFlowTable';

type TabKey = 'pl' | 'cashflow';

interface Props {
  profitLoss: ProfitLossOutput;
  cashFlow: CashFlowOutput;
  paymentCycle: PaymentCycle;
  startupCapital: Decimal;
}

export default function ReportTabs({ profitLoss, cashFlow, paymentCycle, startupCapital }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('pl');

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'pl', label: t('roi.tab_pl') },
    { key: 'cashflow', label: t('roi.tab_cashflow') },
  ];

  return (
    <View style={{ marginTop: '12px' }}>
      {/* Tab 按钮 */}
      <View style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <View
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: '8px', textAlign: 'center',
                background: isActive ? 'var(--navy-deep)' : '#f5f5f8',
                transition: 'background 0.15s',
              }}
            >
              <Text style={{
                fontSize: FS.caption, fontWeight: isActive ? 600 : 500,
                color: isActive ? '#f0ece4' : 'var(--text-muted)',
              }}
              >
                {tab.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 内容 */}
      {activeTab === 'pl' && <ProfitLossTable profitLoss={profitLoss} startupCapital={startupCapital} />}
      {activeTab === 'cashflow' && (
        <CashFlowTable cashFlow={cashFlow} paymentCycle={paymentCycle} />
      )}
    </View>
  );
}
