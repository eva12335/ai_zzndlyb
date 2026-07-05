/**
 * 成本结构卡片 — 所有"花钱"的字段
 * 产品型：固定成本 + 材料成本 + Token + 月总成本
 * 服务型：固定成本 + Token + 获客成本 + 拉新数
 */
import { useState, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';

/** 成本输入缓冲 hook：本地存字串，store 存数字，避免小数点被吞 */
function useCostText(
  storeVal: number,
  setStore: (v: number) => void,
): [string, (raw: string) => void, () => void] {
  const [text, setText] = useState(storeVal ? String(storeVal) : '');
  useEffect(() => { setText(storeVal ? String(storeVal) : ''); }, [storeVal]);
  const onChange = (raw: string) => { setText(raw); const n = Number(raw); if (!isNaN(n)) setStore(n); };
  const onBlur = () => { const v = Math.round(storeVal * 100) / 100; setStore(v); setText(v ? String(v) : ''); };
  return [text, onChange, onBlur];
}

/** 输入框统一样式 */
const inputBase = {
  width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px',
  border: '1px solid #edeff3', fontSize: FS.body,
};

const unitLabel = {
  position: 'absolute' as const, right: '12px', top: '9px',
  fontSize: FS.caption, color: '#9298a8',
};

export default function CostStructureCard() {
  const { t } = useTranslation();
  const store = useProjectStore();
  const { mode } = store;

  const totalFixed = store.fixedCost + store.tokenCost;

  const [fcText, setFcText, blurFc] = useCostText(store.fixedCost, (v) => store.setField('fixedCost', v));
  const [vcText, setVcText, blurVc] = useCostText(store.unitVariableCost, (v) => store.setField('unitVariableCost', v));
  const [tkText, setTkText, blurTk] = useCostText(store.tokenCost, (v) => store.setField('tokenCost', v));
  const [acText, setAcText, blurAc] = useCostText(store.acquisitionCostPerClient, (v) => store.setField('acquisitionCostPerClient', v));

  return (
    <View style={{
      background: '#ffffff',
      borderRadius: '16px', padding: '16px',
      border: '1px solid #edeff3', marginBottom: '12px',
    }}
    >
      <Text style={{
        fontSize: '16px', fontWeight: 700, color: '#1a1f2e',
        display: 'block', marginBottom: '12px',
      }}
      >
        {t('roi.cost_structure_title')}
      </Text>

      {/* Row 1: 月度固定成本 + 变动成本(产品) / Token(服务) */}
      <View style={{ display: 'flex', marginBottom: '10px' }}>
        <View style={{ flex: 1, marginRight: '6px', minWidth: 0 }}>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
            {t('roi.field_fixed_cost')} <Text style={{ color: '#d47563', fontWeight: 700 }}>{t('roi.label_required')}</Text>
          </Text>
          <View style={{ position: 'relative' }}>
            <Input type="number" value={fcText}
              onInput={(e) => setFcText(e.detail.value)}
              onBlur={blurFc}
              placeholder="20,000"
              style={{ ...inputBase, color: '#e0883a' }}
            />
            <Text style={unitLabel}>{t('roi.unit_yuan')}</Text>
          </View>
        </View>

        {mode === 'product' ? (
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_unit_cost')} <Text style={{ color: '#d47563', fontWeight: 700 }}>{t('roi.label_required')}</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <Input type="number" value={vcText}
                onInput={(e) => setVcText(e.detail.value)}
                onBlur={blurVc}
                placeholder="5.5"
                style={{ ...inputBase, color: '#e0883a' }}
              />
              <Text style={unitLabel}>{t('roi.unit_yuan')}</Text>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_token')} <Text style={{ fontSize: FS.caption, color: '#517ea8' }}>{t('roi.label_default_0')}</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <Input type="number" value={tkText}
                onInput={(e) => setTkText(e.detail.value)}
                onBlur={blurTk}
                placeholder="1,500"
                style={{ ...inputBase, color: '#517ea8' }}
              />
              <Text style={{ ...unitLabel, color: '#517ea8', fontWeight: 500 }}>{t('roi.unit_yuan')}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Row 2: Token(产品型) + 月总成本 / 获客成本(服务型) + 拉新数 */}
      {mode === 'product' ? (
        <View style={{ display: 'flex' }}>
          <View style={{ flex: 1, marginRight: '6px', minWidth: 0 }}>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_token')} <Text style={{ fontSize: FS.caption, color: '#517ea8' }}>{t('roi.label_default_0')}</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <Input type="number" value={tkText}
                onInput={(e) => setTkText(e.detail.value)}
                onBlur={blurTk}
                placeholder={t('roi.placeholder_token')}
                style={{ ...inputBase, color: '#517ea8' }}
              />
              <Text style={{ ...unitLabel, color: '#517ea8', fontWeight: 500 }}>{t('roi.unit_yuan')}</Text>
            </View>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_total_cost')}
            </Text>
            <Input disabled value={`¥${totalFixed.toLocaleString()}`}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '8px',
                border: '1px solid #edeff3', fontSize: FS.body,
                fontWeight: 700, color: '#162340', background: '#f8f9fb',
              }}
            />
          </View>
        </View>
      ) : (
        <View style={{ display: 'flex' }}>
          <View style={{ flex: 1, marginRight: '6px', minWidth: 0 }}>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_acq_per_client')} <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>{t('roi.label_optional')}</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <Input type="number" value={acText}
                onInput={(e) => setAcText(e.detail.value)}
                onBlur={blurAc}
                placeholder={t('roi.placeholder_acq')}
                style={{ ...inputBase, color: '#d47563' }}
              />
              <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: '12px', color: '#d47563', fontWeight: 500 }}>{t('roi.unit_yuan')}</Text>
            </View>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#9298a8', marginBottom: '4px', display: 'block' }}>
              {t('roi.field_new_clients')} <Text style={{ fontSize: FS.caption, color: '#517ea8' }}>{t('roi.label_default_1')}</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <Input type="number" value={String(store.newClientsPerMonth || '')}
                onInput={(e) => store.setField('newClientsPerMonth', Number(e.detail.value))}
                style={{ ...inputBase, color: '#d47563' }}
              />
              <Text style={{ position: 'absolute', right: '12px', top: '9px', fontSize: '12px', color: '#d47563', fontWeight: 500 }}>{t('roi.unit_person')}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
