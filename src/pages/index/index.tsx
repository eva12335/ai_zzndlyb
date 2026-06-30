/**
 * 首页 — Hero + 测评卡 + 双模式并排卡片
 */
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import HeroPanel from '../../components/home/HeroPanel';
import TabBar from '../../components/layout/TabBar';
import { useProjectStore } from '../../store/useProjectStore';

const modeCard = (bg: string, border: string) => ({
  flex: 1, padding: '16px 14px', borderRadius: '16px',
  background: bg, border: `1px solid ${border}`,
  display: 'flex', flexDirection: 'column' as const,
});

const modeBtn = (bg: string, color: string) => ({
  marginTop: '14px', padding: '12px 0', borderRadius: '10px',
  textAlign: 'center' as const, fontSize: '14px', fontWeight: 600,
  background: bg, color,
});

export default function IndexPage() {
  const setMode = useProjectStore((s) => s.setMode);
  const goAssess = () => Taro.switchTab({ url: '/pages/assessment/index' });

  const goRoi = (m: 'product' | 'service') => {
    setMode(m);
    Taro.switchTab({ url: '/pages/roi/index' });
  };

  Taro.useShareAppMessage(() => {
    return {
      title: '一人公司罗盘 — 你适合一人公司吗？',
      path: '/pages/index/index',
    };
  });

  return (
    <View style={{ padding: '16px', paddingBottom: '80px' }}>
      <HeroPanel />

      {/* 测评卡 */}
      <View style={{
        background: '#ffffff', borderRadius: '16px', padding: '18px 16px',
        border: '1px solid #edeff3', marginBottom: '16px',
      }}
      >
        <Text style={{ fontSize: '17px', fontWeight: 700, color: '#162340', display: 'block', marginBottom: '4px' }}>
          测测你适合吗？
        </Text>
        <Text style={{ fontSize: '12px', color: '#9298a8', lineHeight: '20px', display: 'block' }}>
          清楚自己的牌，才知道怎么打
        </Text>
        <View onClick={goAssess} style={{
          marginTop: '14px', padding: '14px 0', borderRadius: '12px',
          textAlign: 'center', background: '#162340', color: '#fff',
          fontSize: '15px', fontWeight: 600,
        }}
        >
          <Text style={{ color: '#f0ece4', fontSize: '15px', fontWeight: 600 }}>开始测评 →</Text>
        </View>
      </View>

      {/* 直接算利润 */}
      <Text style={{
        fontSize: '13px', fontWeight: 600, color: '#9298a8',
        display: 'block', marginBottom: '10px',
      }}
      >
        直接算 ROI
      </Text>

      <View style={{ display: 'flex', gap: '10px' }}>
        {/* 产品型 */}
        <View style={modeCard('#f8f9fc', '#e0e3ed')}>
          <Text style={{ fontSize: '17px', fontWeight: 700, color: '#162340' }}>
            产品型
          </Text>
          <Text style={{
            fontSize: '12px', color: '#5a6278', lineHeight: '20px',
            marginTop: '6px', flex: 1,
          }}
          >
            实体店 · 电商 · 摆摊{'\n'}
            卖多少件能回本？
          </Text>
          <View onClick={() => goRoi('product')} style={modeBtn('#162340', '#f0ece4')}>
            <Text style={{ color: '#f0ece4', fontSize: '14px', fontWeight: 600 }}>开始计算 →</Text>
          </View>
        </View>

        {/* 服务型 */}
        <View style={modeCard('#fdfaf5', '#e8dbb8')}>
          <Text style={{ fontSize: '17px', fontWeight: 700, color: '#8b6914' }}>
            服务型
          </Text>
          <Text style={{
            fontSize: '12px', color: '#7a6938', lineHeight: '20px',
            marginTop: '6px', flex: 1,
          }}
          >
            设计 · 开发 · 咨询{'\n'}
            时薪定多少才赚？
          </Text>
          <View onClick={() => goRoi('service')} style={modeBtn('#C5A059', '#fff')}>
            <Text style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>开始计算 →</Text>
          </View>
        </View>
      </View>

      <TabBar />
    </View>
  );
}
