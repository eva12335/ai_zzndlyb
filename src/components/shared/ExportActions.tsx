/**
 * 导出操作按钮组（分享）
 * 来源：PRD §8 分享与导出
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import type { ProfitLossOutput, CashFlowOutput, BreakEvenOutput } from '../../types/calculation';

interface Props {
  profitLoss?: ProfitLossOutput;
  cashFlow?: CashFlowOutput;
  breakEven?: BreakEvenOutput;
  projectName?: string;
  onShare?: () => void;
}

export default function ExportActions({ onShare }: Props) {
  const { t } = useTranslation();

  return (
    <View style={{ marginTop: '12px' }}>
      <View
        onClick={onShare}
        style={{
          width: '100%', padding: '13px', borderRadius: '12px',
          textAlign: 'center',
          border: '1.5px solid var(--gold)',
          background: 'rgba(197,160,89,0.06)',
        }}
      >
        <Text style={{ fontSize: FS.label, fontWeight: 600, color: 'var(--gold)' }}>
          {t('shared.share_btn')}
        </Text>
      </View>
    </View>
  );
}
