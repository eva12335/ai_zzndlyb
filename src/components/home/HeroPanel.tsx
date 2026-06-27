/**
 * 首页 Hero 面板 — 纯品牌展示，不含 CTA
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';

export default function HeroPanel() {
  const { t } = useTranslation();

  return (
    <View style={{
      padding: '16px 0 4px',
    }}>
      <Text style={{ fontSize: FS.title, fontWeight: 800, display: 'block', marginBottom: '6px', color: '#162340' }}>
        {t('app.name')}
      </Text>
      <Text style={{ fontSize: '15px', lineHeight: 1.5, display: 'block', color: '#3a4056' }}>
        {t('app.tagline_line1')}<Text style={{ color: '#C5A059', fontWeight: 600 }}>{t('app.tagline_highlight1')}</Text>
      </Text>
      <Text style={{ fontSize: '15px', lineHeight: 1.5, display: 'block', marginBottom: '4px', color: '#3a4056' }}>
        {t('app.tagline_line2')}<Text style={{ color: '#C5A059', fontWeight: 600 }}>{t('app.tagline_highlight2')}</Text>{t('app.tagline_line3')}
      </Text>
      <Text style={{ fontSize: FS.caption, lineHeight: 1.6, display: 'block', color: '#9298a8' }}>
        {t('app.tagline_sub')}
      </Text>
    </View>
  );
}
