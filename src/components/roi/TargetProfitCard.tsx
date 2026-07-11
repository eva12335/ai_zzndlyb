/**
 * 目标利润推导卡片
 * 输入目标月利润 → 反向推导达成目标所需月销量 + 所需定价
 */
import { View, Text, Input } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';

interface Props {
  requiredVolume: Decimal | null;
  requiredPrice: Decimal | null;
}

export default function TargetProfitCard({ requiredVolume, requiredPrice }: Props) {
  const { t } = useTranslation();
  const store = useProjectStore();
  const isService = store.mode === 'service';
  const hasTarget = store.targetProfit != null && store.targetProfit > 0;

  const volSuffix = isService ? 'h' : '';
  const volValue = hasTarget && requiredVolume
    ? Math.ceil(requiredVolume.toNumber()).toLocaleString('zh-CN') + volSuffix
    : '—';
  const volLabel = isService ? '所需计费' : t('roi.target_req_vol_label');

  const priceValue = hasTarget && requiredPrice
    ? '¥' + requiredPrice.toFixed(2)
    : '—';
  const priceLabel = isService ? '下限时薪' : t('roi.target_req_price');

  return (
    <View style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid #edeff3',
      marginBottom: '12px',
    }}
    >
      {/* 标题 */}
      <Text style={{
        fontSize: '16px', fontWeight: 700, color: '#1a1f2e',
        display: 'block', marginBottom: '12px',
      }}
      >
        {t('roi.target_card_title')}
      </Text>

      {/* 输入区 */}
      <View style={{ marginBottom: '10px' }}>
        <View style={{ position: 'relative' }}>
          <Input
            type="digit"
            value={store.targetProfit != null ? String(store.targetProfit) : ''}
            onInput={(e) => {
              const v = e.detail.value;
              store.setField('targetProfit', v ? Number(v) : null);
            }}
            placeholder={t('roi.placeholder_profit')}
            style={{
              width: '100%', padding: '9px 40px 9px 12px',
              borderRadius: '8px', border: '1px solid #edeff3',
              fontSize: FS.body, color: '#7d6cac',
            }}
          />
          <Text style={{
            position: 'absolute', right: '12px', top: '9px',
            fontSize: '12px', color: '#7d6cac', fontWeight: 500,
          }}
          >
            {t('roi.unit_yuan')}
          </Text>
        </View>
      </View>

      {/* 引导文案 */}
      <Text style={{
        fontSize: FS.caption, color: '#9298a8',
        display: 'block', marginBottom: '10px', paddingLeft: '4px',
      }}
      >
        {t('roi.target_card_hint')}
      </Text>

      {/* 推导结果：两卡并排 */}
      <View style={{ display: 'flex' }}>
        <View style={{ flex: 1, marginRight: '6px' }}>
          <DerivedCard value={volValue} label={volLabel} />
        </View>
        <View style={{ flex: 1 }}>
          <DerivedCard value={priceValue} label={priceLabel} />
        </View>
      </View>
    </View>
  );
}

function DerivedCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={{
      padding: '12px 6px', borderRadius: '12px', textAlign: 'center',
      background: 'rgba(125,108,172,0.03)',
      border: '1px solid rgba(125,108,172,0.2)',
    }}
    >
      <Text style={{
        fontSize: FS.kpi, fontWeight: 800, color: '#7d6cac',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        display: 'block',
      }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>{label}</Text>
    </View>
  );
}
