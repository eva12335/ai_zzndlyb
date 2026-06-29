/**
 * 通用设置卡片 — 主体类型、回款周期、营收模式、增长率、启动资金
 */
import { View, Text, Input, Picker } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';
import type { EntityType, PaymentCycle, RevenueModel } from '../../types/calculation';

const ENTITY_OPTIONS: EntityType[] = ['individual', 'sole_proprietor', 'limited_company'];
const CYCLE_OPTIONS: PaymentCycle[] = [0, 30, 60];
const REVENUE_OPTIONS: RevenueModel[] = ['hourly', 'project', 'retainer'];

export default function GeneralSettingsCard() {
  const { t } = useTranslation();
  const store = useProjectStore();
  const { mode } = store;

  const ENTITY_LABELS: Record<EntityType, string> = {
    individual: t('roi.entity_individual'),
    sole_proprietor: t('roi.entity_sole'),
    limited_company: t('roi.entity_company'),
  };

  const CYCLE_LABELS: Record<PaymentCycle, string> = {
    0: t('roi.payment_instant'),
    30: t('roi.payment_30d'),
    60: t('roi.payment_60d'),
  };

  const REVENUE_LABELS: Record<RevenueModel, string> = {
    hourly: t('roi.revenue_hourly'),
    project: t('roi.revenue_project'),
    retainer: t('roi.revenue_retainer'),
  };

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
        {t('roi.general_settings')}
      </Text>

      {/* 服务型：营收模式 */}
      {mode === 'service' && (
        <View style={{ marginBottom: '10px' }}>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
            {t('roi.field_revenue_model')}
          </Text>
          <Picker
            mode="selector"
            range={REVENUE_OPTIONS.map(v => REVENUE_LABELS[v])}
            value={REVENUE_OPTIONS.indexOf(store.revenueModel)}
            onChange={(e) => {
              const idx = Number(e.detail.value);
              store.setField('revenueModel', REVENUE_OPTIONS[idx]);
            }}
          >
            <View style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              border: '1px solid #edeff3', fontSize: FS.body,
              background: '#ffffff',
            }}
            >
              <Text style={{ color: '#517ea8', fontSize: FS.body }}>
                {REVENUE_LABELS[store.revenueModel]}
              </Text>
              <Text style={{ fontSize: FS.caption, color: '#517ea8', fontWeight: 500 }}>▼</Text>
            </View>
          </Picker>
        </View>
      )}

      {/* Row 1: 主体类型 + 回款周期 */}
      <View style={{ display: 'flex', marginBottom: '10px' }}>
        <View style={{ flex: 1, marginRight: '6px' }}>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
            {t('roi.field_entity_type')}
          </Text>
          <Picker
            mode="selector"
            range={ENTITY_OPTIONS.map(v => ENTITY_LABELS[v])}
            value={ENTITY_OPTIONS.indexOf(store.entityType)}
            onChange={(e) => {
              const idx = Number(e.detail.value);
              store.setField('entityType', ENTITY_OPTIONS[idx]);
            }}
          >
            <View style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              border: '1px solid #edeff3', fontSize: FS.body,
              background: '#ffffff',
            }}
            >
              <Text style={{ color: '#7d6cac', fontSize: FS.body }}>
                {ENTITY_LABELS[store.entityType]}
              </Text>
              <Text style={{ fontSize: FS.caption, color: '#7d6cac', fontWeight: 500 }}>▼</Text>
            </View>
          </Picker>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
            {t('roi.field_payment_cycle')}
          </Text>
          <Picker
            mode="selector"
            range={CYCLE_OPTIONS.map(v => CYCLE_LABELS[v])}
            value={CYCLE_OPTIONS.indexOf(store.paymentCycle)}
            onChange={(e) => {
              const idx = Number(e.detail.value);
              store.setField('paymentCycle', CYCLE_OPTIONS[idx]);
            }}
          >
            <View style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              border: '1px solid #edeff3', fontSize: FS.body,
              background: '#ffffff',
            }}
            >
              <Text style={{ color: '#517ea8', fontSize: FS.body }}>
                {CYCLE_LABELS[store.paymentCycle]}
              </Text>
              <Text style={{ fontSize: FS.caption, color: '#517ea8', fontWeight: 500 }}>▼</Text>
            </View>
          </Picker>
        </View>
      </View>

      {/* Row 2: 月增长率 + 启动资金 */}
      <View style={{ display: 'flex' }}>
        <View style={{ flex: 1, marginRight: '6px' }}>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
            {t('roi.field_growth_rate')} <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>{t('roi.label_optional')}</Text>
          </Text>
          <View style={{ position: 'relative' }}>
            <Input
              type="digit"
              value={String(store.growthRate || '')}
              onInput={(e) => store.setField('growthRate', Number(e.detail.value))}
              placeholder="10"
              style={{
                width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px',
                border: '1px solid #edeff3', fontSize: FS.body,
                color: '#4a9c7c',
              }}
            />
            <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: FS.caption, color: '#4a9c7c', fontWeight: 500 }}>%</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
            {t('roi.field_startup_capital')} <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>{t('roi.label_optional')}</Text>
          </Text>
          <View style={{ position: 'relative' }}>
            <Input
              type="digit"
              value={String(store.startupCapital || '')}
              onInput={(e) => store.setField('startupCapital', Number(e.detail.value))}
              placeholder="0"
              style={{
                width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px',
                border: '1px solid #edeff3', fontSize: FS.body,
                color: '#e0883a',
              }}
            />
            <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: FS.caption, color: '#e0883a', fontWeight: 500 }}>{t('roi.unit_yuan')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
