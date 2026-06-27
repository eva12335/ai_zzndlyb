/**
 * 产能预警条（服务型计费小时超过 maxBillableHours 时显示）
 * 来源：PRD §6 + 服务型计算
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';

interface Props {
  volume: Decimal;
}

export default function CapacityWarning({ volume }: Props) {
  const { t } = useTranslation();
  const store = useProjectStore();

  // 仅在服务型下检查
  if (store.mode !== 'service') return null;

  const maxHours = store.maxBillableHours || 120;
  if (volume.lte(maxHours)) return null;

  return (
    <View style={{
      marginTop: '12px', marginBottom: '12px',
      padding: '10px 14px',
      background: 'rgba(224,136,58,0.08)', borderRadius: '10px',
      borderLeft: '3px solid var(--warm)',
    }}
    >
      <Text style={{ fontSize: FS.caption, color: 'var(--warm)', fontWeight: 600, lineHeight: 1.5 }}>
        {t('roi.capacity_warning', { volume: volume.toNumber() })}
      </Text>
    </View>
  );
}
