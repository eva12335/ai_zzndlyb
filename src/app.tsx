import { useEffect, PropsWithChildren } from 'react';
import Taro from '@tarojs/taro';
import '@/app.css';
import '@/i18n';  // 初始化 i18n（副作用导入，全应用可用 useTranslation）
import { View } from '@tarojs/components';
import { useUserStore } from './store/useUserStore';

const App = ({ children }: PropsWithChildren) => {
  // 微信小程序云开发初始化
  useEffect(() => {
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      try {
        // @ts-ignore wx 在微信小程序环境全局可用
        wx.cloud.init({ env: 'cloudbase-dog6buex81dc9cd93' });
      } catch (_) { /* 云开发未开通时静默 */ }
    }
  }, []);

  // 静默识别：应用启动时自动获取匿名标识
  useEffect(() => {
    useUserStore.getState().identify().catch(() => {
      // 静默处理识别失败，应用其余功能不受影响
    });
  }, []);

  return (
    <View style={{
      display: 'flex', justifyContent: 'center',
      background: '#d5d8e0', minHeight: '100vh',
      overflowX: 'hidden',
    }}
    >
      <View style={{
        width: '100%', maxWidth: '430px',
        minHeight: '100vh',
        background: 'var(--bg)',
        fontFamily: "'Noto Sans SC', -apple-system, sans-serif",
        boxShadow: '0 0 40px rgba(0,0,0,0.12)',
        position: 'relative',
        overflowX: 'hidden',
      }}
      >
        {children}
      </View>
    </View>
  );
};

export default App;
