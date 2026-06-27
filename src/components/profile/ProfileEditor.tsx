/**
 * 个人资料编辑弹窗（底部弹出式）
 * 仅支持昵称编辑，头像功能需要微信原生组件支持（即将上线）
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Input } from '@tarojs/components';
import { useUserStore } from '../../store/useUserStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileEditor({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const nickname = useUserStore((s) => s.nickname);
  const setProfile = useUserStore((s) => s.setProfile);
  const [inputValue, setInputValue] = useState(nickname || '');

  // 弹窗打开时同步最新昵称到输入框
  useEffect(() => {
    if (visible) {
      setInputValue(nickname || '');
    }
  }, [visible, nickname]);

  if (!visible) return null;

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      setProfile(trimmed, '');
    }
    onClose();
  };

  const handleCancel = () => {
    setInputValue(nickname || '');
    onClose();
  };

  return (
    <View
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
      }}
      onClick={handleCancel}
    >
      {/* 底部弹出卡片：阻止事件冒泡，避免点击卡片内容时关闭弹窗 */}
      <View
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'var(--surface)',
          borderRadius: '16px 16px 0 0',
          padding: '24px 20px',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* 标题 */}
        <Text
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'block',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          {t('profile.avatar_editor_title')}
        </Text>

        {/* 昵称输入 */}
        <View
          style={{
            background: '#eef0f4',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '8px',
          }}
        >
          <Input
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            placeholder={t('profile.avatar_nickname_placeholder')}
            maxlength={20}
            style={{
              fontSize: '16px',
              color: 'var(--text-primary)',
              minHeight: '24px',
            }}
          />
        </View>

        {/* 提示 */}
        <Text
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '16px',
            paddingLeft: '4px',
          }}
        >
          {t('profile.avatar_privacy')}
        </Text>

        {/* 头像功能提示 */}
        <View
          style={{
            background: 'var(--gold-light)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '20px',
          }}
        >
          <Text
            style={{
              fontSize: '12px',
              color: 'var(--gold)',
              display: 'block',
            }}
          >
            {t('profile.avatar_coming_soon')}
          </Text>
        </View>

        {/* 按钮组 */}
        <View style={{ display: 'flex', gap: '12px' }}>
          <View
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: '12px',
              background: '#eef0f4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--text-body)',
              }}
            >
              {t('profile.avatar_btn_cancel')}
            </Text>
          </View>
          <View
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: '12px',
              background: 'var(--navy-deep)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#ffffff',
              }}
            >
              {t('profile.avatar_btn_save')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
