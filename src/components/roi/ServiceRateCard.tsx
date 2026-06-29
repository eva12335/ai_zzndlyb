/**
 * 服务报价参考卡片
 * 定位：展示三个参照时薪，不自主计算保本价/目标价
 *
 * 三个参照值：
 *   历史时薪     = 历史月薪 ÷ 22 ÷ 8          （本地 useState，外部参考）
 *   保本时薪     = 管线 breakEvenHourlyRate   （复用主计算管线）
 *   利润目标下限时薪  = 管线 requiredPrice        （复用主计算管线）
 */
import { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';

interface Props {
  breakEvenHourlyRate: Decimal | null;
  requiredPrice: Decimal | null;
}

export default function ServiceRateCard({ breakEvenHourlyRate, requiredPrice }: Props) {
  const { t } = useTranslation();
  const store = useProjectStore();
  const [historicalMonthlySalary, setHistoricalMonthlySalary] = useState<number>(0);

  if (store.mode !== 'service') return null;

  // ── 历史时薪 = 月薪 ÷ 22 ÷ 8 ──
  const historicalHourlyRate = historicalMonthlySalary > 0
    ? Math.round(historicalMonthlySalary / 22 / 8)
    : null;

  // ── 保本时薪（来自主计算管线）──
  const breakEvenRate = breakEvenHourlyRate
    ? Math.ceil(breakEvenHourlyRate.toNumber())
    : null;

  // ── 目标利润时薪（来自主计算管线）──
  const targetRate = requiredPrice
    ? Math.ceil(requiredPrice.toNumber())
    : null;

  const hasAnyData = historicalHourlyRate || breakEvenRate || targetRate;

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
        {t('roi.service_rate_title')}
      </Text>

      {/* 历史月薪输入 */}
      <View style={{ position: 'relative', marginBottom: '12px' }}>
        <Input
          type="number"
          value={historicalMonthlySalary > 0 ? String(historicalMonthlySalary) : ''}
          onInput={(e) => setHistoricalMonthlySalary(e.detail.value ? Number(e.detail.value) : 0)}
          placeholder={t('roi.service_rate_salary_placeholder')}
          style={{
            width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px',
            border: '1px solid #edeff3',
            fontSize: FS.body, color: '#C5A059',
          }}
        />
        <Text style={{
          position: 'absolute', right: '12px', top: '9px',
          fontSize: '12px', color: '#C5A059', fontWeight: 500,
        }}
        >
          {t('roi.service_rate_unit_month')}
        </Text>
      </View>

      {hasAnyData ? (
        <>
          {/* 历史时薪 */}
          {historicalHourlyRate && (
            <View style={{
              padding: '10px 12px', borderRadius: '8px',
              background: 'rgba(197,160,89,0.04)', marginBottom: '8px',
              borderLeft: '3px solid #C5A059',
            }}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>{t('roi.service_rate_historical')}</Text>
                <Text style={{ fontSize: FS.caption, fontWeight: 700, color: '#C5A059' }}>
                  ¥{historicalHourlyRate.toLocaleString()}/h
                </Text>
              </View>
            </View>
          )}

          {/* 保本时薪（系统计算） */}
          {breakEvenRate && (
            <View style={{
              padding: '10px 12px', borderRadius: '8px',
              background: 'rgba(74,156,124,0.04)', marginBottom: '8px',
              borderLeft: '3px solid #4a9c7c',
            }}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>{t('roi.service_rate_breakeven')}</Text>
                <Text style={{ fontSize: FS.caption, fontWeight: 700, color: '#4a9c7c' }}>
                  ¥{breakEvenRate.toLocaleString()}/h
                </Text>
              </View>
            </View>
          )}

          {/* 利润目标下限时薪（系统计算） */}
          <View style={{
            padding: '10px 12px', borderRadius: '8px',
            background: 'rgba(125,108,172,0.04)', marginBottom: '8px',
            borderLeft: '3px solid #7d6cac',
          }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>{t('roi.service_rate_target')}</Text>
              <Text style={{ fontSize: FS.caption, fontWeight: 700, color: '#7d6cac' }}>
                {targetRate ? `¥${targetRate.toLocaleString()}/h` : t('roi.service_rate_target_locked')}
              </Text>
            </View>
          </View>

          {/* 建议报价区间（历史时薪 × 2.5~3） */}
          {historicalHourlyRate && (
            <View style={{
              padding: '10px 12px', borderRadius: '8px',
              background: 'rgba(22,35,64,0.04)', marginBottom: '8px',
              borderLeft: '3px solid #162340',
            }}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>建议报价</Text>
                <Text style={{ fontSize: FS.caption, fontWeight: 700, color: '#162340' }}>
                  ¥{Math.round(historicalHourlyRate * 2.5)}-{Math.round(historicalHourlyRate * 3)}/h
                </Text>
              </View>
            </View>
          )}

          {/* 底部提示 */}
          <Text style={{
            fontSize: '10px', color: '#9298a8', lineHeight: 1.5,
            display: 'block', marginTop: '4px',
          }}
          >
            {t('roi.service_rate_footer')}
          </Text>
        </>
      ) : (
        <Text style={{
          fontSize: FS.caption, color: '#9298a8',
          display: 'block', textAlign: 'center', padding: '16px 0',
        }}
        >
          {t('roi.service_rate_empty')}
        </Text>
      )}
    </View>
  );
}
