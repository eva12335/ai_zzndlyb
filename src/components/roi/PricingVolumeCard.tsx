/**
 * 定价与销量卡片 — 可选字段，留空自动推导
 * 产品型：定价 + 月销量
 * 服务型：时薪 + 月计费小时
 */
import { View, Text, Input } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';

export default function PricingVolumeCard() {
  const { t } = useTranslation();
  const store = useProjectStore();
  const { mode } = store;
  const isService = mode === 'service';

  return (
    <View style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid #edeff3',
      marginBottom: '12px',
    }}>
      <Text style={{
        fontSize: '16px', fontWeight: 700, color: '#1a1f2e',
        display: 'block', marginBottom: '12px',
      }}>
        {t('roi.pricing_volume_title')}
      </Text>

      <View style={{ display: 'flex' }}>
        {/* 定价 / 时薪 */}
        <View style={{ flex: 1, marginRight: '6px' }}>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
            {isService ? t('roi.field_hourly_rate') : t('roi.field_price')} <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>{t('roi.label_optional')}</Text>
          </Text>
          <View style={{ position: 'relative' }}>
            <Input
              type="number"
              value={store.unitPrice != null ? String(store.unitPrice) : ''}
              onInput={(e) => store.setField('unitPrice', e.detail.value ? Number(e.detail.value) : null)}
              placeholder={t('roi.placeholder_derive')}
              style={{
                width: '100%', padding: '9px 50px 9px 12px', borderRadius: '8px',
                border: '1px solid #edeff3', fontSize: FS.body,
                color: '#C5A059',
              }}
            />
            <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: '12px', color: '#C5A059', fontWeight: 500 }}>
              {isService ? t('roi.unit_yuan_h') : t('roi.unit_yuan')}
            </Text>
          </View>
        </View>

        {/* 月销量 / 计费小时 */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
            {isService ? t('roi.field_billable_hours') : t('roi.field_volume')} <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>{t('roi.label_optional')}</Text>
          </Text>
          <View style={{ position: 'relative' }}>
            <Input
              type="number"
              value={store.volume != null ? String(store.volume) : ''}
              onInput={(e) => store.setField('volume', e.detail.value ? Number(e.detail.value) : null)}
              placeholder={t('roi.placeholder_derive')}
              style={{
                width: '100%', padding: '9px 50px 9px 12px', borderRadius: '8px',
                border: '1px solid #edeff3', fontSize: FS.body,
                color: '#517ea8',
              }}
            />
            <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: '12px', color: '#517ea8', fontWeight: 500 }}>
              {isService ? t('roi.unit_hour') : t('roi.unit_piece')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
