/**
 * 首页
 * 来源：PRD §2.1-2.2
 */
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { FS } from '../../constants/fonts';
import HeroPanel from '../../components/home/HeroPanel';
import ModeSelector from '../../components/home/ModeSelector';
import TabBar from '../../components/layout/TabBar';
import { useProjectStore } from '../../store/useProjectStore';

export default function IndexPage() {
  const mode = useProjectStore((s) => s.mode);
  const setMode = useProjectStore((s) => s.setMode);

  const handleAssessment = () => Taro.switchTab({ url: '/pages/assessment/index' });
  const handleRoi = () => Taro.switchTab({ url: '/pages/roi/index' });

  return (
    <View style={{ padding: '16px', paddingBottom: '80px' }}>
      <HeroPanel onStartAssessment={handleAssessment} onGoRoi={handleRoi} />
      <ModeSelector mode={mode} onChange={setMode} onNavigate={handleRoi} />
      <TabBar />
    </View>
  );
}
