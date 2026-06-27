/**
 * 个人资料卡片
 * 纯展示组件，数据从 useUserStore 读取
 * 点击触发 onEditProfile 回调，由父组件控制编辑弹窗
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store/useUserStore';

interface Props {
  onEditProfile: () => void;
}

export default function ProfileCard({ onEditProfile }: Props) {
  const { t } = useTranslation();
  const nickname = useUserStore((s) => s.nickname);
  const avatarUrl = useUserStore((s) => s.avatarUrl);

  return (
    <View
      onClick={onEditProfile}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* 头像区域 */}
      <View
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: avatarUrl ? 'transparent' : '#e8eaef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {avatarUrl ? (
          <View
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundImage: `url(${avatarUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <Text>👤</Text>
        )}
      </View>

      {/* 文字区域 */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            display: 'block',
          }}
        >
          {nickname || t('profile.avatar_setting')}
        </Text>
        <Text
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          {t('profile.avatar_optional')}
        </Text>
      </View>

      {/* 右箭头 */}
      <Text style={{ fontSize: '16px', color: 'var(--text-muted)', flexShrink: 0 }}>&#8250;</Text>
    </View>
  );
}
