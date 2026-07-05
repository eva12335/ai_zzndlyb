/**
 * 保存项目按钮
 * 点击后将当前输入字段保存到本地存储
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text } from '@tarojs/components';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';

export default function SaveProjectBtn() {
  const { t } = useTranslation();
  const saveProject = useProjectStore((s) => s.saveProject);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleSave = () => {
    saveProject();
    setFeedback(t('shared.saved'));
  };

  return (
    <View
      onClick={handleSave}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '13px 0',
        margin: '12px 0 24px 0',
        borderRadius: '12px',
        border: '1.5px solid var(--gold)',
        background: 'rgba(197,160,89,0.08)',
        cursor: 'pointer',
      }}
    >
      <Text style={{ fontSize: FS.label, fontWeight: 600, color: feedback ? 'var(--green)' : 'var(--gold)' }}>
        {feedback ?? t('shared.save_btn')}
      </Text>
    </View>
  );
}
