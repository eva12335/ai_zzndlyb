/**
 * 首页 Hero 面板
 * 来源：PRD §2.1-2.2 + showroom L566-582
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';

interface HeroPanelProps {
  onStartAssessment: () => void;
  onGoRoi: () => void;
}

export default function HeroPanel({ onStartAssessment, onGoRoi }: HeroPanelProps) {
  const { t } = useTranslation();

  return (
    <View className="hero-panel" style={{
      background: 'linear-gradient(135deg, #162340, #1e3054)', borderRadius: '20px',
      padding: '20px 18px', marginBottom: '12px',
      position: 'relative', overflow: 'hidden',
    }}
    >
      <View style={{ position: 'relative', zIndex: 1 }}>
        <Text style={{ fontSize: FS.title, fontWeight: 800, display: 'block', marginBottom: '6px', color: '#f0ece4' }}>
          {t('app.name')}
        </Text>
        <Text style={{ fontSize: FS.heading, lineHeight: 1.5, display: 'block', marginBottom: '2px', color: '#f0ece4' }}>
          {t('app.tagline_line1')}<Text style={{ color: '#C5A059', fontWeight: 600 }}>{t('app.tagline_highlight1')}</Text>
        </Text>
        <Text style={{ fontSize: FS.heading, lineHeight: 1.5, display: 'block', marginBottom: '2px', color: '#f0ece4' }}>
          {t('app.tagline_line2')}<Text style={{ color: '#C5A059', fontWeight: 600 }}>{t('app.tagline_highlight2')}</Text>{t('app.tagline_line3')}
        </Text>
        <Text style={{ fontSize: FS.caption, lineHeight: 1.6, display: 'block', marginBottom: '16px', color: 'rgba(240,236,228,0.6)' }}>
          {t('app.tagline_sub')}
        </Text>
        <View style={{ display: 'flex', gap: '8px' }}>
          <View
            onClick={onStartAssessment}
            style={{
              flex: 1, padding: '14px 0', borderRadius: '12px', textAlign: 'center',
              background: '#C5A059', color: '#fff', fontWeight: 600, fontSize: FS.heading,
              boxShadow: '0 2px 16px rgba(197,160,89,0.3)',
            }}
          >
            {t('home.cta_assessment')}
          </View>
          <View
            onClick={onGoRoi}
            style={{
              flex: 1, padding: '12px 0', borderRadius: '12px', textAlign: 'center',
              background: 'rgba(255,255,255,0.08)', color: '#e8e2d6',
              fontWeight: 500, fontSize: FS.heading,
            }}
          >
            {t('home.cta_roi')}
          </View>
        </View>
      </View>
    </View>
  );
}
