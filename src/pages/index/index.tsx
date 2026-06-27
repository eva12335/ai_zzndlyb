/**
 * 首页 — 两大模块入口
 */
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import HeroPanel from '../../components/home/HeroPanel';
import TabBar from '../../components/layout/TabBar';
import { useProjectStore } from '../../store/useProjectStore';
import type { CalcMode } from '../../types/calculation';

const cardStyle = {
  background: '#ffffff', borderRadius: '16px', padding: '18px 16px',
  border: '1px solid #edeff3', marginBottom: '12px',
};

const ctaBtn = (bg: string) => ({
  marginTop: '14px', padding: '13px 0', borderRadius: '12px', textAlign: 'center' as const,
  background: bg, color: '#fff', fontSize: '15px', fontWeight: 600,
});

export default function IndexPage() {
  const { t } = useTranslation();
  const mode = useProjectStore((s) => s.mode);
  const setMode = useProjectStore((s) => s.setMode);

  const goAssess = () => Taro.switchTab({ url: '/pages/assessment/index' });
  const goRoi = () => Taro.switchTab({ url: '/pages/roi/index' });

  const selModeStyle = (m: CalcMode) => ({
    flex: 1, padding: '8px 0', borderRadius: '10px', textAlign: 'center' as const,
    fontSize: '13px', fontWeight: 600,
    background: mode === m ? '#162340' : '#f5f5f8',
    color: mode === m ? '#f0ece4' : '#9298a8',
    transition: 'all 0.2s',
  });

  return (
    <View style={{ padding: '16px', paddingBottom: '80px' }}>
      {/* ═══ Hero ═══ */}
      <HeroPanel />

      {/* ═══ 路径一：测评 ═══ */}
      <View style={cardStyle}>
        <Text style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>📋</Text>
        <Text style={{ fontSize: '17px', fontWeight: 700, color: '#1a1f2e', display: 'block', marginBottom: '4px' }}>
          自我测评
        </Text>
        <Text style={{ fontSize: '12px', color: '#9298a8', lineHeight: '20px', display: 'block' }}>
          55题 · 11维度 · 约10分钟{'\n'}
          了解你的一人公司适合度，获得 AI 画像分析
        </Text>
        <View onClick={goAssess} style={{ ...ctaBtn('#4a9c7c'), marginTop: '14px' }}>
          <Text style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>开始测评 →</Text>
        </View>
      </View>

      {/* ═══ 路径二：直接算利润 ═══ */}
      <View style={cardStyle}>
        <Text style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>📊</Text>
        <Text style={{ fontSize: '17px', fontWeight: 700, color: '#1a1f2e', display: 'block', marginBottom: '4px' }}>
          直接算利润
        </Text>
        <Text style={{ fontSize: '12px', color: '#9298a8', lineHeight: '20px', display: 'block' }}>
          填成本 → 自动推导盈亏平衡{'\n'}
          利润表 · 现金流 · 盈亏分析图
        </Text>

        {/* 模式切换 */}
        <View style={{ display: 'flex', gap: '6px', marginTop: '14px', padding: '3px', background: '#f5f5f8', borderRadius: '10px' }}>
          <View onClick={() => setMode('product')} style={selModeStyle('product')}>
            <Text style={{ fontSize: '13px', fontWeight: 600, color: 'inherit' }}>🏪 {t('home.mode_product')}</Text>
          </View>
          <View onClick={() => setMode('service')} style={selModeStyle('service')}>
            <Text style={{ fontSize: '13px', fontWeight: 600, color: 'inherit' }}>💼 {t('home.mode_service')}</Text>
          </View>
        </View>

        <View onClick={goRoi} style={ctaBtn('#C5A059')}>
          <Text style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>开始计算 →</Text>
        </View>
      </View>

      <TabBar />
    </View>
  );
}
