/**
 * 段位卡片：画像标签 + 段位解读 + AI 报告 CTA
 * 样式参考样板间 showroom-v4.html 你的画像屏
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import type { AssessmentResult } from '../../types/assessment';
import { getCTA } from '../../utils/assessmentEngine';

interface Props {
  result: AssessmentResult;
  onGenerateReport?: () => void;
}

const INTERPRETATIONS: Record<string, string> = {
  '谨慎型技术派':
    '自驱力强，AI技能熟练，市场嗅觉也在线，但对风险偏保守。你适合用技术杠杆替代资金杠杆，用数据验证替代赌博——副业稳步过渡是最适合你的路径。',
  '直觉型探索者':
    '敢于冒险，自驱力强。热情是你的燃料。下一步可以把AI工具纳入日常流程，让系统帮你的直觉落地，减少对个人精力的依赖。',
  'AI增强型个体':
    '自驱力和AI技能是你的双引擎，已经具备了独立经营的核心条件。下一步的重点是优化获客渠道和提升客单价，把产能天花板往上推。',
  '稳健型实干家':
    '市场嗅觉敏锐，做事稳健。你适合先跑通一个最小可行产品，用数据验证市场反应。AI技能提升之后，你会事半功倍。',
  '待激活观望者':
    '当前处于积累阶段，各方面分数还有提升空间。这不代表不适合一人公司——可以从最小可行第一步开始：用业余时间接一个项目，测试市场对你的价值反馈。',
  '全能型一人公司':
    '自驱力、AI技能、市场获客和风险承受全面在线，已具备独立经营的全部条件。下一步不是能不能做，而是如何规模化——产品化服务、提价、建立被动收入。',
};

export default function SegmentCard({ result, onGenerateReport }: Props) {
  const { t } = useTranslation();
  const interpretation = INTERPRETATIONS[result.segment] ?? '';
  const ctaText = getCTA(result.segment);

  return (
    <View style={{
      background: '#ffffff', borderRadius: '16px', padding: '16px',
      border: '1px solid #edeff3', marginTop: '10px',
    }}
    >
      {/* ═══ 画像标签 ═══ */}
      <View style={{
        padding: '12px',
        background: 'rgba(22,35,64,0.03)', borderRadius: '12px',
        borderLeft: '3px solid #162340',
      }}
      >
        <Text style={{
          fontSize: FS.label, fontWeight: 700, color: '#162340',
          display: 'block', marginBottom: '4px',
        }}
        >
          你的画像：{result.segment}
        </Text>
        <Text style={{
          fontSize: '12px', color: 'var(--text-body)', lineHeight: '18px',
        }}
        >
          {interpretation}
        </Text>
      </View>

      {/* ═══ CTA ═══ */}
      <View style={{
        marginTop: '14px', padding: '14px',
        background: 'linear-gradient(135deg, rgba(197,160,89,0.06), rgba(197,160,89,0.02))',
        border: '1.5px solid var(--gold)', borderRadius: '16px',
        textAlign: 'center',
      }}
      >
        <Text style={{
          fontSize: '12px', color: 'var(--text-body)',
          marginBottom: '8px', lineHeight: 1.6, display: 'block',
        }}
        >
          {`"你的画像：${result.segment}" — ${ctaText}`}
        </Text>
        <View
          onClick={onGenerateReport}
          style={{
            padding: '13px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #162340, #1e3054)',
          }}
        >
          <Text style={{ fontSize: FS.body, fontWeight: 700, color: '#f0ece4' }}>
            {t('assessment.ai_report_cta')}
          </Text>
        </View>
        <Text style={{
          fontSize: '10px', color: 'var(--text-muted)',
          marginTop: '8px', display: 'block',
        }}
        >
          填写 ROI 成本数据后，可解锁具体金额和财务路线图
        </Text>
      </View>
    </View>
  );
}
