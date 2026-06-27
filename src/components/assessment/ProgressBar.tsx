import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const { t } = useTranslation();
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <View style={{ margin: '8px 0 18px' }}>
      <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: FS.label, color: 'var(--text-muted)', marginBottom: '5px' }}>
        <Text>第 <Text style={{ color: 'var(--gold)', fontWeight: 600 }}>{current + 1}</Text> {t('assessment.progress_question')}</Text>
        <Text>{t('assessment.progress_of')} {total} {t('assessment.progress_question')}</Text>
      </View>
      <View style={{ height: '5px', background: '#e8eaef', borderRadius: '3px', overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--gold), #d4b76a)', borderRadius: '3px', transition: 'width 0.5s' }} />
      </View>
    </View>
  );
}
