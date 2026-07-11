/**
 * 成本输入卡片（产品型/服务型动态切换 + 必填/可选标记 + 通用设置折叠区）
 * 来源：PRD §5.1-5.3 + showroom L873-956
 */
import { useState } from 'react';
import { View, Text, Input, Picker } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';
import type { EntityType, PaymentCycle, RevenueModel } from '../../types/calculation';

const ENTITY_OPTIONS: EntityType[] = ['individual', 'sole_proprietor', 'limited_company'];

const CYCLE_OPTIONS: PaymentCycle[] = [0, 30, 60];

const REVENUE_OPTIONS: RevenueModel[] = ['hourly', 'project', 'retainer'];

export default function CostInputCard() {
  const { t } = useTranslation();
  const store = useProjectStore();
  const { mode } = store;
  const [showGeneral, setShowGeneral] = useState(false);

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
      background: 'var(--surface)', borderRadius: '16px', padding: '16px',
      border: '1px solid var(--border-subtle)', marginBottom: '12px',
    }}
    >
      <Text style={{ fontSize: FS.label, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>
        {t('roi.cost_input_title')}
      </Text>

      {/* 项目名称 */}
      <View style={{ marginBottom: '10px' }}>
        <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
          {t('roi.field_project_name')} <Text style={{ color: 'var(--red)', fontWeight: 700 }}>{t('roi.label_required')}</Text>
        </Text>
        <Input
          value={store.projectName}
          onInput={(e) => store.setField('projectName', e.detail.value)}
          placeholder={t('roi.placeholder_project')}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: '8px',
            border: '1px solid var(--border-subtle)', fontSize: FS.body,
            background: 'var(--surface)',
          }}
        />
      </View>

      {/* 月度固定成本 + 变动成本（产品型）/ Token（服务型） */}
      <View style={{ display: 'flex', marginBottom: '10px' }}>
        <View>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
            {t('roi.field_fixed_cost')} <Text style={{ color: 'var(--red)', fontWeight: 700 }}>{t('roi.label_required')}</Text>
          </Text>
          <View style={{ position: 'relative' }}>
            <Input
              type="digit"
              value={String(store.fixedCost || '')}
              onInput={(e) => store.setField('fixedCost', Number(e.detail.value))}
              placeholder="20,000"
              style={{
                width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px',
                border: '1px solid var(--border-subtle)', fontSize: FS.body,
                color: 'var(--warm)',
              }}
            />
            <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: FS.caption, color: 'var(--text-muted)' }}>{t('roi.unit_yuan')}</Text>
          </View>
        </View>

        {mode === 'product' ? (
          <View>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_unit_cost')} <Text style={{ color: 'var(--red)', fontWeight: 700 }}>{t('roi.label_required')}</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <Input
                type="digit"
                value={String(store.unitVariableCost || '')}
                onInput={(e) => store.setField('unitVariableCost', Number(e.detail.value))}
                placeholder="5.5"
                style={{
                  width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px',
                  border: '1px solid var(--border-subtle)', fontSize: FS.body,
                  color: 'var(--warm)',
                }}
              />
              <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: FS.caption, color: 'var(--text-muted)' }}>{t('roi.unit_yuan')}</Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_token')} <Text style={{ fontSize: FS.caption, color: 'var(--teal)' }}>{t('roi.label_default_0')}</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <Input
                type="digit"
                value={String(store.tokenCost || '')}
                onInput={(e) => store.setField('tokenCost', Number(e.detail.value))}
                placeholder="1,500"
                style={{
                  width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px',
                  border: '1px solid var(--border-subtle)', fontSize: FS.body,
                  color: 'var(--teal)',
                }}
              />
              <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: FS.caption, color: 'var(--teal)', fontWeight: 500 }}>{t('roi.unit_yuan')}</Text>
            </View>
          </View>
        )}
      </View>

      {/* 定价 + 月销量（产品型）/ 时薪 + 计费小时（服务型） */}
      <View style={{ display: 'flex', marginBottom: '10px' }}>
        <View>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
            {mode === 'product' ? t('roi.field_price') : t('roi.field_hourly_rate')} <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>{t('roi.label_optional')}</Text>
          </Text>
          <View style={{ position: 'relative' }}>
            <Input
              type="digit"
              value={store.unitPrice != null ? String(store.unitPrice) : ''}
              onInput={(e) => store.setField('unitPrice', e.detail.value ? Number(e.detail.value) : null)}
              placeholder={t('roi.placeholder_derive')}
              style={{
                width: '100%', padding: '9px 50px 9px 12px', borderRadius: '8px',
                border: '1px solid var(--border-subtle)', fontSize: FS.body,
                color: 'var(--gold)',
              }}
            />
            <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: '12px', color: 'var(--gold)', fontWeight: 500 }}>
              {mode === 'product' ? t('roi.unit_yuan') : t('roi.unit_yuan_h')}
            </Text>
          </View>
        </View>
        <View>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
            {mode === 'product' ? t('roi.field_volume') : t('roi.field_billable_hours')} <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>{t('roi.label_optional')}</Text>
          </Text>
          <View style={{ position: 'relative' }}>
            <Input
              type="digit"
              value={store.volume != null ? String(store.volume) : ''}
              onInput={(e) => store.setField('volume', e.detail.value ? Number(e.detail.value) : null)}
              placeholder={t('roi.placeholder_derive')}
              style={{
                width: '100%', padding: '9px 50px 9px 12px', borderRadius: '8px',
                border: '1px solid var(--border-subtle)', fontSize: FS.body,
                color: 'var(--blue)',
              }}
            />
            <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: '12px', color: 'var(--blue)', fontWeight: 500 }}>
              {mode === 'product' ? t('roi.unit_piece') : t('roi.unit_hour')}
            </Text>
          </View>
        </View>
      </View>

      {/* 产品型 token + 总成本 / 服务型 获客成本 + 拉新数 */}
      {mode === 'product' ? (
        <View style={{ display: 'flex', marginBottom: '10px' }}>
          <View>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_token')} <Text style={{ fontSize: FS.caption, color: 'var(--teal)' }}>{t('roi.label_default_0')}</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <Input type="digit" value={String(store.tokenCost || '')}
                onInput={(e) => store.setField('tokenCost', Number(e.detail.value))}
                placeholder={t('roi.placeholder_token')}
                style={{ width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: FS.body, color: 'var(--teal)' }}
              />
              <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: FS.caption, color: 'var(--teal)', fontWeight: 500 }}>{t('roi.unit_yuan')}</Text>
            </View>
          </View>
          <View>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>{t('roi.field_total_cost')}</Text>
            <Input disabled value={`¥${(store.fixedCost + store.tokenCost).toLocaleString()}`}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: FS.body, fontWeight: 700, color: 'var(--navy-deep)', background: '#f8f9fb' }}
            />
          </View>
        </View>
      ) : (
        <View style={{ display: 'flex', marginBottom: '10px' }}>
          <View>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_acq_per_client')} <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>{t('roi.label_optional')}</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <Input type="digit" value={String(store.acquisitionCostPerClient || '')}
                onInput={(e) => store.setField('acquisitionCostPerClient', Number(e.detail.value))}
                placeholder={t('roi.placeholder_acq')}
                style={{ width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: FS.body, color: 'var(--red)' }}
              />
              <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: '12px', color: 'var(--red)', fontWeight: 500 }}>{t('roi.unit_yuan')}</Text>
            </View>
          </View>
          <View>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_new_clients')} <Text style={{ fontSize: FS.caption, color: 'var(--teal)' }}>{t('roi.label_default_1')}</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <Input type="digit" value={String(store.newClientsPerMonth || '')}
                onInput={(e) => store.setField('newClientsPerMonth', Number(e.detail.value))}
                style={{ width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: FS.body, color: 'var(--red)' }}
              />
              <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: '12px', color: 'var(--red)', fontWeight: 500 }}>{t('roi.unit_person')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* ═══ 通用设置（折叠区） ═══ */}
      <View
        onClick={() => setShowGeneral(!showGeneral)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 0', marginTop: '4px',
          borderTop: '1px solid var(--border-subtle)',
          cursor: 'pointer',
        }}
      >
        <Text style={{ fontSize: FS.label, fontWeight: 600, color: 'var(--text-muted)' }}>
          {t('roi.general_settings')}
        </Text>
        <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)', transition: 'transform 0.2s' }}>
          {showGeneral ? '▲' : '▼'}
        </Text>
      </View>

      {showGeneral && (
        <View>
          {/* 服务型：营收模式子模式 */}
          {mode === 'service' && (
            <View style={{ marginBottom: '10px' }}>
              <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
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
                  border: '1px solid var(--border-subtle)', fontSize: FS.body,
                  background: 'var(--surface)',
                }}
                >
                  <Text style={{ color: 'var(--teal)', fontSize: FS.body }}>
                    {REVENUE_LABELS[store.revenueModel]}
                  </Text>
                  <Text style={{ fontSize: FS.caption, color: 'var(--teal)', fontWeight: 500 }}>▼</Text>
                </View>
              </Picker>
            </View>
          )}

          {/* Row 1: 主体类型 + 回款周期 */}
          <View style={{ display: 'flex', marginBottom: '10px' }}>
            <View>
              <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
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
                  border: '1px solid var(--border-subtle)', fontSize: FS.body,
                  background: 'var(--surface)',
                }}
                >
                  <Text style={{ color: 'var(--purple)', fontSize: FS.body }}>
                    {ENTITY_LABELS[store.entityType]}
                  </Text>
                  <Text style={{ fontSize: FS.caption, color: 'var(--purple)', fontWeight: 500 }}>▼</Text>
                </View>
              </Picker>
            </View>
            <View>
              <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
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
                  border: '1px solid var(--border-subtle)', fontSize: FS.body,
                  background: 'var(--surface)',
                }}
                >
                  <Text style={{ color: 'var(--blue)', fontSize: FS.body }}>
                    {CYCLE_LABELS[store.paymentCycle]}
                  </Text>
                  <Text style={{ fontSize: FS.caption, color: 'var(--blue)', fontWeight: 500 }}>▼</Text>
                </View>
              </Picker>
            </View>
          </View>

          {/* Row 2: 月增长率 + 启动资金 */}
          <View style={{ display: 'flex', marginBottom: '6px' }}>
            <View>
              <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                {t('roi.field_growth_rate')} <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>{t('roi.label_optional')}</Text>
              </Text>
              <View style={{ position: 'relative' }}>
                <Input
                  type="digit"
                  value={String(store.growthRate || '')}
                  onInput={(e) => store.setField('growthRate', Number(e.detail.value))}
                  placeholder="10"
                  style={{
                    width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px',
                    border: '1px solid var(--border-subtle)', fontSize: FS.body,
                    color: 'var(--green)',
                  }}
                />
                <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: FS.caption, color: 'var(--green)', fontWeight: 500 }}>%</Text>
              </View>
            </View>
            <View>
              <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                {t('roi.field_startup_capital')} <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>{t('roi.label_optional')}</Text>
              </Text>
              <View style={{ position: 'relative' }}>
                <Input
                  type="digit"
                  value={String(store.startupCapital || '')}
                  onInput={(e) => store.setField('startupCapital', Number(e.detail.value))}
                  placeholder="0"
                  style={{
                    width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px',
                    border: '1px solid var(--border-subtle)', fontSize: FS.body,
                    color: 'var(--warm)',
                  }}
                />
                <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: FS.caption, color: 'var(--warm)', fontWeight: 500 }}>{t('roi.unit_yuan')}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
