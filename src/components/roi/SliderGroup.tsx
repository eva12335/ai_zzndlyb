/**
 * 参数联动探索卡片 —— 双滑块实时调整定价 & 销量，即时反馈月收入与净利润
 * 来源：TECH_DESIGN §6 盈亏分析面板
 */
import { View, Text, Slider } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { useProjectStore } from '../../store/useProjectStore';
import { FS } from '../../constants/fonts';

export default function SliderGroup() {
  const { t } = useTranslation();
  const store = useProjectStore();
  const isService = store.mode === 'service';

  // ═══ 滑块量程 ═══
  // 小成本友好：上限 300，成本联动×3（成本 100 → 上限 300）
  const maxPrice = isService ? 5000 : Math.max((store.unitVariableCost || 5) * 3, 300);
  const maxVolume = isService ? 100 : 10000;
  const priceStep = isService ? 20 : 1;

  // ═══ 当前值（回退默认） ═══
  const price = store.unitPrice ?? (isService ? 250 : 25);
  const volume = store.volume ?? (isService ? 80 : 1200);

  // ═══ 实时衍生指标 ═══
  const unitVC = new Decimal(isService ? 0 : store.unitVariableCost);
  const unitPrice = new Decimal(price);
  const vol = new Decimal(volume);
  const fixedCost = new Decimal(store.fixedCost).plus(store.tokenCost);
  // 获客成本（服务型有获客支出，产品型为 0）
  const acquisitionCost = isService
    ? new Decimal(store.acquisitionCostPerClient).times(store.newClientsPerMonth)
    : new Decimal(0);
  const monthlyRevenue = unitPrice.times(vol);
  // 滑块净利 = 收入 - 变动成本 - 固定成本 - 获客成本（不含税费，见下方提示）
  const netProfit = monthlyRevenue
    .minus(unitVC.times(vol))
    .minus(fixedCost)
    .minus(acquisitionCost);

  // ═══ 模式相关文案 ═══
  const priceUnit = isService ? t('roi.unit_yuan_h') : t('roi.unit_yuan');
  const volUnitSuffix = isService ? ' h' : ' 件';

  const isLoss = netProfit.lt(0);

  return (
    <View
      style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '12px',
      }}
    >
      {/* 标题 */}
      <Text
        style={{
          fontSize: FS.heading,
          fontWeight: 700,
          color: 'var(--text-primary)',
          display: 'block',
          marginBottom: '16px',
        }}
      >
        {t('roi.slider_title')}
      </Text>

      {/* ═══ 滑块 1：定价 / 时薪 ═══ */}
      <View style={{ marginBottom: '16px' }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)' }}>
            {isService ? t('roi.field_hourly_rate') : t('roi.field_price')}
          </Text>
          <Text style={{ fontSize: FS.label, fontWeight: 700, color: 'var(--gold)' }}>
            {price}
            <Text style={{ fontSize: FS.caption, color: 'var(--gold)', fontWeight: 500 }}>{' ' + priceUnit}</Text>
          </Text>
        </View>
        <Slider
          min={0}
          max={maxPrice}
          step={priceStep}
          value={price}
          activeColor="var(--gold)"
          backgroundColor="rgba(212,168,92,0.15)"
          blockColor="var(--gold)"
          blockSize={20}
          onChanging={(e) => store.setField('unitPrice', e.detail.value)}
        />
        <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
          <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>0 {priceUnit}</Text>
          <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>{maxPrice} {priceUnit}</Text>
        </View>
      </View>

      {/* ═══ 滑块 2：销量 / 计费小时 ═══ */}
      <View style={{ marginBottom: '16px' }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <Text style={{ fontSize: FS.label, fontWeight: 500, color: 'var(--text-muted)' }}>
            {isService ? t('roi.field_billable_hours') : t('roi.field_volume')}
          </Text>
          <Text style={{ fontSize: FS.label, fontWeight: 700, color: 'var(--blue)' }}>
            {volume}
            <Text style={{ fontSize: FS.caption, color: 'var(--blue)', fontWeight: 500 }}>{volUnitSuffix}</Text>
          </Text>
        </View>
        <Slider
          min={0}
          max={maxVolume}
          step={1}
          value={volume}
          activeColor="var(--blue)"
          backgroundColor="rgba(94,134,182,0.15)"
          blockColor="var(--blue)"
          blockSize={20}
          onChanging={(e) => store.setField('volume', e.detail.value)}
        />
        <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
          <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>0{volUnitSuffix}</Text>
          <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>{maxVolume}{volUnitSuffix}</Text>
        </View>
      </View>

      {/* ═══ 实时衍生指标 ═══ */}
      <View
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 8px',
          background: 'rgba(22,35,64,0.03)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* 月收入 */}
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
            {t('roi.slider_revenue')}
          </Text>
          <Text
            style={{
              fontSize: FS.kpi,
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            ¥{monthlyRevenue.toNumber().toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        {/* 分隔线 */}
        <View style={{ width: '1px', background: 'var(--border-subtle)' }} />

        {/* 净利润 */}
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
            {t('roi.slider_profit')}
          </Text>
          <Text
            style={{
              fontSize: FS.kpi,
              fontWeight: 800,
              color: isLoss ? 'var(--red)' : 'var(--green)',
            }}
          >
            {isLoss ? '−¥' : '+¥'}{netProfit.abs().toNumber().toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* 税费提示 */}
      <Text style={{
        fontSize: '9px', color: '#9298a8',
        textAlign: 'center', marginTop: '6px', display: 'block',
      }}
      >
        {t('roi.slider_tax_note')}
      </Text>
    </View>
  );
}
