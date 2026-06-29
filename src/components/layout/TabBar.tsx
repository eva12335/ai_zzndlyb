/**
 * 自定义底部导航（showroom-v4 风格图标）
 */
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import { HomeIcon, AssessmentIcon, RoiIcon, ProfileIcon } from './TabIcons';

const isH5 = Taro.getEnv() === Taro.ENV_TYPE.WEB;

const TAB_CONFIG = [
  { path: '/pages/index/index', label: '首页' },
  { path: '/pages/assessment/index', label: '测评' },
  { path: '/pages/roi/index', label: 'ROI' },
  { path: '/pages/profile/index', label: '我的' },
];

const ICON_SIZE = 22;

function TabIcon({ path, color }: { path: string; color: string }) {
  switch (path) {
    case '/pages/index/index': return <HomeIcon color={color} size={ICON_SIZE} />;
    case '/pages/assessment/index': return <AssessmentIcon color={color} size={ICON_SIZE} />;
    case '/pages/roi/index': return <RoiIcon color={color} size={ICON_SIZE} />;
    case '/pages/profile/index': return <ProfileIcon color={color} size={ICON_SIZE} />;
    default: return null;
  }
}

export default function TabBar() {
  const [current, setCurrent] = useState('/pages/index/index');

  useDidShow(() => {
    try {
      const pages = Taro.getCurrentPages();
      if (pages.length > 0) {
        setCurrent('/' + pages[pages.length - 1].route);
      }
    } catch (_) {}
  });

  const switchTab = (path: string) => {
    Taro.switchTab({ url: path });
  };

  return (
    <View style={{
      position: isH5 ? 'absolute' as const : 'fixed' as const,
      bottom: 0, left: 0, right: 0, zIndex: 9999,
      display: 'flex', background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)', borderTop: '1px solid #edeff3',
      paddingBottom: 'env(safe-area-inset-bottom)',
      height: '56px',
    }}
    >
      {TAB_CONFIG.map((tab) => {
        const active = current === tab.path;
        const color = active ? '#C5A059' : '#9298a8';
        return (
          <View
            key={tab.path}
            onClick={() => switchTab(tab.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <TabIcon path={tab.path} color={color} />
            <Text style={{
              fontSize: '11px', fontWeight: active ? 600 : 400,
              color, marginTop: '2px',
            }}
            >
              {tab.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
