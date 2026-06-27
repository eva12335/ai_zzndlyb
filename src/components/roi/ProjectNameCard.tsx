/**
 * 项目名称卡片
 */
import { View, Text, Input } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';

export default function ProjectNameCard() {
  const { t } = useTranslation();
  const store = useProjectStore();

  return (
    <View style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid #edeff3',
      marginBottom: '12px',
    }}>
      <Text style={{
        fontSize: '16px', fontWeight: 700, color: '#1a1f2e',
        display: 'block', marginBottom: '10px',
      }}>
        {t('roi.project_name_title')}
      </Text>
      <View style={{ position: 'relative' }}>
        <Input
          value={store.projectName}
          onInput={(e) => store.setField('projectName', e.detail.value)}
          placeholder={t('roi.placeholder_project')}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: '8px',
            border: '1px solid #edeff3', fontSize: FS.body,
            background: '#ffffff',
          }}
        />
        <Text style={{
          position: 'absolute', right: '12px', top: '9px',
          fontSize: '12px', color: '#d47563', fontWeight: 700,
        }}>
          {t('roi.label_required')}
        </Text>
      </View>
    </View>
  );
}
