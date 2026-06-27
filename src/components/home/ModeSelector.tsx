/**
 * 经营模式选择器（产品型 / 服务型）
 * 来源：PRD §5.1-5.2
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import type { CalcMode } from '../../types/calculation';

interface ModeSelectorProps {
  mode: CalcMode;
  onChange: (mode: CalcMode) => void;
  onNavigate?: () => void;
}

export default function ModeSelector({ mode, onChange, onNavigate }: ModeSelectorProps) {
  const { t } = useTranslation();

  const handleSelect = (m: CalcMode) => {
    onChange(m);
    onNavigate?.();
  };
  return (
    <View style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
      <View
        onClick={() => handleSelect('product')}
        style={{
          flex: 1, padding: '14px', borderRadius: '12px', textAlign: 'center',
          border: mode === 'product' ? '2px solid var(--gold)' : '1px solid var(--border-subtle)',
          background: mode === 'product' ? 'var(--gold-light)' : 'var(--surface)',
          boxShadow: mode === 'product' ? '0 0 0 3px var(--gold-light)' : 'var(--shadow-xs)',
          transition: 'all 0.28s',
        }}
      >
        <Text style={{ fontSize: '24px', display: 'block' }}>🏪</Text>
        <Text style={{ fontSize: FS.heading, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>{t('home.mode_product')}</Text>
        <Text style={{ fontSize: FS.body, color: 'var(--text-muted)', display: 'block', lineHeight: 1.6 }}>
          {t('home.mode_product_desc')}
        </Text>
      </View>
      <View
        onClick={() => handleSelect('service')}
        style={{
          flex: 1, padding: '14px', borderRadius: '12px', textAlign: 'center',
          border: mode === 'service' ? '2px solid var(--gold)' : '1px solid var(--border-subtle)',
          background: mode === 'service' ? 'var(--gold-light)' : 'var(--surface)',
          boxShadow: mode === 'service' ? '0 0 0 3px var(--gold-light)' : 'var(--shadow-xs)',
          transition: 'all 0.28s',
        }}
      >
        <Text style={{ fontSize: '24px', display: 'block' }}>💼</Text>
        <Text style={{ fontSize: FS.heading, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>{t('home.mode_service')}</Text>
        <Text style={{ fontSize: FS.body, color: 'var(--text-muted)', display: 'block', lineHeight: 1.6 }}>
          {t('home.mode_service_desc')}
        </Text>
      </View>
    </View>
  );
}
