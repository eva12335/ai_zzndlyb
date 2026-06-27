/**
 * 利润诊断卡片（净利润 < 0 时自动显示）
 * 来源：PRD §6.5 + showroom L1118-1141
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import type { ProfitDiagnostic } from '../../utils/profitDiagnostic';

interface Props {
  diagnostic: ProfitDiagnostic;
}

const ROOT_COLORS: Record<string, string> = {
  unitLoss: '#d47563',
  scaleGap: '#e0883a',
  extraBurden: '#7d6cac',
};

export default function ProfitDiagnosticCard({ diagnostic }: Props) {
  const { t } = useTranslation();
  const color = ROOT_COLORS[diagnostic.rootCause] || '#e0883a';

  return (
    <View style={{
      background: `linear-gradient(135deg, ${color}08, ${color}02)`,
      border: `1.5px solid ${color}30`, borderRadius: '16px',
      padding: '16px', marginTop: '12px',
    }}
    >
      {/* Header */}
      <View style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <Text style={{ fontSize: '13px', fontWeight: 700, color }}>利润诊断</Text>
      </View>

      {/* Root cause badge */}
      <View style={{
        display: 'inline-block', fontSize: '10px', fontWeight: 700,
        background: `${color}1e`, color, padding: '3px 10px',
        borderRadius: '999px', marginBottom: '8px',
      }}
      >
        根因：{diagnostic.rootCauseLabel}
      </View>

      {/* Diagnosis text */}
      <Text style={{ fontSize: '12px', color: 'var(--text-body)', lineHeight: 1.6, display: 'block', marginBottom: '12px' }}>
        {diagnostic.diagnosis}
      </Text>

      {/* Suggestions */}
      <Text style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
        {t('roi.diagnostic_suggestions')}
      </Text>
      <View style={{ margin: 0 }}>
        {diagnostic.suggestions.map((s, i) => (
          <View key={i} style={{
            display: 'flex', gap: '8px', padding: '8px 0',
            borderBottom: i < diagnostic.suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
          }}
          >
            <View style={{
              flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%',
              background: '#162340', color: '#f0ece4', fontSize: '10px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            >
              <Text>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '11px', color: 'var(--text-body)', lineHeight: 1.5 }}>{s.action}</Text>
              {s.expectedImpact ? (
                <Text style={{ fontSize: '10px', color: 'var(--green)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                  {s.expectedImpact}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      {/* Assessment tip */}
      {diagnostic.assessmentTip ? (
        <View style={{
          marginTop: '10px', padding: '10px 12px',
          background: 'rgba(81,126,168,0.06)', borderRadius: '8px',
          borderLeft: '3px solid var(--blue)',
        }}
        >
          <Text style={{ fontSize: '11px', color: 'var(--text-body)', lineHeight: 1.5 }}>
            {t('roi.diagnostic_tip_prefix')} {diagnostic.assessmentTip}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
