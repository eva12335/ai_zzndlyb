import { useEffect, PropsWithChildren } from 'react';
import '@/app.css';
import '@/i18n';  // 初始化 i18n（副作用导入，全应用可用 useTranslation）
import { View } from '@tarojs/components';
import { useUserStore } from './store/useUserStore';

const App = ({ children }: PropsWithChildren) => {
  // 静默识别：应用启动时自动获取匿名标识
  // 不涉及登录/注册 UI，用户无感知；失败不影响应用使用
  useEffect(() => {
    useUserStore.getState().identify().catch(() => {
      // 静默处理识别失败，应用其余功能不受影响
    });
  }, []);

  return (
    <View style={{ minHeight: '100vh', background: '#eef0f4', fontFamily: "'Noto Sans SC', -apple-system, sans-serif" }}>
      {children}
    </View>
  );
};

export default App;
