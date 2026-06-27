/**
 * 自定义底部导航（与样板间一致）
 */
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';

const TABS = [
  { path: '/pages/index/index', label: '首页', icon: '🏠' },
  { path: '/pages/assessment/index', label: '测评', icon: '📋' },
  { path: '/pages/roi/index', label: 'ROI', icon: '📊' },
  { path: '/pages/profile/index', label: '我的', icon: '👤' },
];

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

  // position:absolute 依赖 app.tsx phone-frame 的 position:relative
  return (
    <View style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9999,
      display: 'flex', background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)', borderTop: '1px solid #edeff3',
      paddingBottom: 'env(safe-area-inset-bottom)',
      height: '56px',
    }}
    >
      {TABS.map((tab) => {
        const active = current === tab.path;
        return (
          <View
            key={tab.path}
            onClick={() => switchTab(tab.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: '20px' }}>{tab.icon}</Text>
            <Text style={{
              fontSize: '13px', fontWeight: active ? 600 : 400,
              color: active ? '#C5A059' : '#9298a8',
              marginTop: '2px',
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
