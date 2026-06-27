/**
 * 段位卡片：画像标签 + 段位解读 + AI 报告 CTA
 * 样式参考样板间 showroom-v4.html 你的画像屏
 */
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import type { AssessmentResult } from '../../types/assessment';
import { getCTA } from '../../utils/assessmentEngine';
import { DIMENSION_NAMES } from '../../utils/assessment';

interface Props {
  result: AssessmentResult;
  onGenerateReport?: () => void;
}

const INTERPRETATIONS: Record<string, string> = {
  '谨慎型技术派':
    '自驱强 + AI 熟练 + 市场嗅觉在线，但对风险和独立决策偏保守。这类人最适合副业稳步过渡——用技术杠杆替代资金杠杆，用数据验证替代赌博。',
  '直觉型探索者':
    '敢于冒险、自驱力强，但缺少系统化的方法和AI工具加持。热情是你的燃料，但也可能让你忽略成本和效率。建议补上AI技能短板，用工具把你的直觉转化为可复用的流程。',
  'AI增强型个体':
    'AI技能和独立动机是你的双引擎。你已经具备了独立经营的核心条件，下一步是放大规模——优化获客渠道、提升客单价、建立被动收入。',
  '稳健型实干家':
    '市场嗅觉敏锐、做事稳健，适合先跑通再扩张。不急着All-in，用最小可行产品测试市场反应。你的AI技能相对薄弱，补上这一环能让你事半功倍。',
  '待激活观望者':
    '目前各方面得分偏低，说明你还在探索阶段。这不代表不适合一人公司——但建议先从最小可行第一步做起：用业余时间接一个项目，测试市场反应。',
  '全能型一人公司':
    '你在独立动机、AI技能、市场获客和风险承受方面全面偏高，已具备独立经营的全部条件。下一步是优化产能——考虑产品化你的服务、提价、或建立被动收入渠道。',
};

export default function SegmentCard({ result, onGenerateReport }: Props) {
  const { t } = useTranslation();
  const interpretation = INTERPRETATIONS[result.segment] ?? '';
  const ctaText = getCTA(result.segment);

  return (
    <View style={{
      background: '#ffffff', borderRadius: '16px', padding: '16px',
      border: '1px solid #edeff3', marginTop: '10px',
    }}>
      {/* ═══ 画像标签 ═══ */}
      <View style={{
        padding: '12px',
        background: 'rgba(22,35,64,0.03)', borderRadius: '12px',
        borderLeft: '3px solid #162340',
      }}>
        <Text style={{
          fontSize: FS.label, fontWeight: 700, color: '#162340',
          display: 'block', marginBottom: '4px',
        }}>
          🧭 你的画像标签：{result.segment}
        </Text>
        <Text style={{
          fontSize: '12px', color: 'var(--text-body)', lineHeight: '20px',
        }}>
          {interpretation}
        </Text>
      </View>

      {/* ═══ CTA ═══ */}
      <View style={{
        marginTop: '14px', padding: '14px',
        background: 'linear-gradient(135deg, rgba(197,160,89,0.06), rgba(197,160,89,0.02))',
        border: '1.5px solid var(--gold)', borderRadius: '16px',
        textAlign: 'center',
      }}>
        <Text style={{
          fontSize: '12px', color: 'var(--text-body)',
          marginBottom: '8px', lineHeight: 1.6, display: 'block',
        }}>
          "你的画像：{result.segment}" — {ctaText}
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
        }}>
          💡 填写 ROI 成本数据后，可解锁具体金额和财务路线图
        </Text>
      </View>
    </View>
  );
}
