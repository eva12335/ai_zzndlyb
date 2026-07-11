/**
 * 定价与销量卡片 — 可选字段，留空自动推导
 * 产品型：定价 + 月销量
 * 服务型：时薪 + 月计费小时
 */
import { useState, useEffect, useRef } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';

export default function PricingVolumeCard() {
  const { t } = useTranslation();
  const store = useProjectStore();
  const { mode } = store;
  const isService = mode === 'service';

  // 本地输入文本，避免 Number() 转换吞掉小数点
  const [priceText, setPriceText] = useState<string>(
    store.unitPrice != null ? String(store.unitPrice) : ''
  );
  // 外部 store 变化时同步回本地（如切换模式恢复默认值）
  // 仅在非输入状态下同步，输入中不覆盖
  const priceSynced = useRef(false);
  useEffect(() => {
    if (priceSynced.current) { priceSynced.current = false; return; }
    setPriceText(store.unitPrice != null ? String(store.unitPrice) : '');
  }, [store.unitPrice]);

  return (
    <View style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid #edeff3',
      marginBottom: '12px',
    }}
    >
      <Text style={{
        fontSize: '16px', fontWeight: 700, color: '#1a1f2e',
        display: 'block', marginBottom: '12px',
      }}
      >
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
              type="digit"
              value={priceText}
              onInput={(e) => {
                const raw = e.detail.value;
                if (!raw) { setPriceText(''); store.setField('unitPrice', null); return; }
                if (isService) {
                  setPriceText(raw);
                  const num = Number(raw);
                  if (!isNaN(num)) store.setField('unitPrice', num);
                } else {
                  // 产品型：最多两位小数，只允许数字和一个点
                  let v = raw.replace(/[^\d.]/g, '');
                  const dot = v.indexOf('.');
                  if (dot !== -1) {
                    v = v.substring(0, dot + 1) + v.substring(dot + 1).replace(/\./g, '');
                    if (v.length - dot - 1 > 2) v = v.substring(0, dot + 3);
                  }
                  setPriceText(v);
                  const num = parseFloat(v);
                  if (!isNaN(num)) {
                    priceSynced.current = true;
                    store.setField('unitPrice', num);
                  }
                }
              }}
              onBlur={() => {
                // 失焦：格式化显示、写入准确数值
                if (!isService && priceText) {
                  const num = parseFloat(priceText);
                  if (!isNaN(num)) {
                    const rounded = Math.round(num * 100) / 100;
                    setPriceText(String(rounded));
                    priceSynced.current = true;
                    store.setField('unitPrice', rounded);
                  }
                }
              }}
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
              type="digit"
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
