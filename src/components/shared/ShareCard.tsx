/**
 * 分享卡片预览（深色海军蓝背景）
 * 来源：showroom-v4.html L1063-1081、L1318-1336
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { FS } from '../../constants/fonts';
import { buildShareText, copyToClipboard } from '../../utils/excel';
import type { ProfitLossOutput, BreakEvenOutput, CashFlowOutput, RevenueProjectionOutput } from '../../types/calculation';
import type { ProfitDiagnostic } from '../../utils/profitDiagnostic';

interface Props {
  projectName: string;
  unitPrice: Decimal;
  breakEven: BreakEvenOutput;
  profitLoss: ProfitLossOutput;
  cashFlow: CashFlowOutput;
  projection: RevenueProjectionOutput | null;
  diagnostic: ProfitDiagnostic | null;
  isService: boolean;
}

export default function ShareCard({
  projectName,
  unitPrice,
  breakEven,
  profitLoss,
  cashFlow,
  projection,
  diagnostic,
  isService,
}: Props) {
  const { t } = useTranslation();
  const unit = isService ? t('roi.unit_hour') : t('roi.unit_piece');
  const beVolume = breakEven.breakEvenVolume.ceil().toNumber().toLocaleString('zh-CN');
  const price = unitPrice.toFixed(2);
  const net = profitLoss.netProfit;
  const netStr = net.gte(0)
    ? `当前月净利 ¥${net.toFixed(0)}`
    : `当前月净亏 ¥${net.abs().toFixed(0)}`;
  const projectionText = projection?.breakEvenMonth != null
    ? `第 ${projection.breakEvenMonth} 个月扭亏`
    : '';
  const insight = diagnostic?.suggestions?.[0]?.action ?? null;

  const handleShare = () => {
    const text = buildShareText(
      projectName,
      price,
      beVolume,
      net.toFixed(0),
      projection?.breakEvenMonth != null ? String(projection.breakEvenMonth) : null,
      insight,
      isService,
    );
    copyToClipboard(text);
  };

  return (
    <View
      style={{
        marginTop: '16px',
        background: 'linear-gradient(155deg, #162340 0%, #1a2d52 30%, #1e3054 60%, #1a2a48 100%)',
        borderRadius: '16px',
        padding: '18px 16px',
        color: '#f0ece4',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(22,35,64,0.2)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 装饰光晕 */}
      <View
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(197,160,89,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <View style={{ position: 'relative', zIndex: 1 }}>
        {/* 标题行 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          {/* 罗盘图标 */}
          <View style={{
            width: '20px', height: '20px', borderRadius: '50%',
            border: '1.2px solid #C5A059',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          >
            <Text style={{ fontSize: '10px', color: '#C5A059', lineHeight: 1 }}>▲</Text>
          </View>
          <Text style={{ fontSize: '13px', fontWeight: 700, color: '#f0ece4' }}>
            {t('shared.share_title')}
          </Text>
        </View>

        {/* 主信息 */}
        <Text
          style={{
            fontSize: '15px',
            fontWeight: 800,
            marginBottom: '4px',
            lineHeight: 1.4,
            display: 'block',
            color: '#f0ece4',
            overflow: 'hidden',
            wordBreak: 'break-all',
          }}
        >
          {projectName}{'\n'}
          定价 <Text style={{ color: 'var(--gold)' }}>¥{price}</Text>
          {' '}· 月需卖 <Text style={{ color: 'var(--gold)' }}>{beVolume} {unit}</Text> 回本
        </Text>

        {/* 副信息 */}
        <Text
          style={{
            fontSize: '11px',
            color: 'rgba(240,236,228,0.55)',
            display: 'block',
            marginBottom: '10px',
          }}
        >
          {netStr}{projectionText ? ` · ${projectionText}` : ''}
        </Text>

        {/* 洞察提示 */}
        {insight && (
          <Text
            style={{
              fontSize: '10px',
              color: 'rgba(240,236,228,0.45)',
              display: 'block',
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '6px',
              marginBottom: '12px',
              overflow: 'hidden',
            }}
          >
            💡 {insight}
          </Text>
        )}
      </View>

      {/* 分享按钮 */}
      <View
        onClick={handleShare}
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: '12px',
          width: '100%',
          padding: '13px',
          border: '1.5px solid rgba(197,160,89,0.4)',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}
      >
        <Text style={{ fontSize: FS.label, fontWeight: 600, color: '#f0ece4' }}>
          {t('shared.share_btn')}
        </Text>
      </View>
    </View>
  );
}
