/**
 * 画像解读 + 标签展示
 * 按照样板间风格：四档分组文字解读 + A/B 侧画像标签
 */
import { View, Text } from '@tarojs/components';
import { FS } from '../../constants/fonts';
import type { AssessmentResult } from '../../types/assessment';
import { DIMENSION_NAMES } from '../../utils/assessment';

interface Props {
  result: AssessmentResult;
}

// ═══════════════════════════════════════════
// 维度的自然语言说明（用于生成解读文案）
// ═══════════════════════════════════════════

const DIM_NOTES: Record<string, string> = {
  '创办OPC的动机': '不依赖外部推动就能持续行动',
  '风险承受能力': '对收入波动的容忍度',
  '坚韧不拔/处理危机能力': '面对困难时的恢复力',
  '主动性': '无监督环境下的自律交付能力',
  '协调家庭·社会·OPC关系的能力': '在家办公的边界管理',
  '决策能力': '无人商量时独立做决定',
  '适应OPC需要的能力': '一人多角色快速切换',
  '对OPC的承诺': '一个人扛全部责任的担当',
  '家庭支持': '家人对你创办一人公司的态度与支持力度',
  '谈判技巧': '获客报价、成交续费的沟通力',
  'AI &自媒体运用': '是否习惯用AI提效',
};

// ═══════════════════════════════════════════
// 四档解读文案生成（纯函数，基于分数动态生成）
// ═══════════════════════════════════════════

function buildTierParagraph(
  dims: string[],
  scores: Record<string, number>,
  tier: string,
): string | null {
  if (dims.length === 0) return null;

  const items = dims.map((d) => ({ name: d, score: scores[d] ?? 0 }));
  items.sort((a, b) => b.score - a.score);

  const namesWithScores = items.map((i) => `${i.name}（${i.score}分）`);

  switch (tier) {
    case 'excellent': {
      const notes = items.map((i) => DIM_NOTES[i.name] ?? '').filter(Boolean);
      const noteStr = notes.length > 0 ? `——${notes.slice(0, 2).join('，')}。` : '';
      return `${namesWithScores.join('和')}是你的核心优势${noteStr}`;
    }
    case 'good': {
      const notes = items.map((i) => DIM_NOTES[i.name] ?? '').filter(Boolean);
      const noteStr = notes.length > 0 ? `——${notes.slice(0, 2).join('，')}。` : '。';
      return `${namesWithScores.join('、')}基础扎实${noteStr}保持这些优势，它会成为你持续成长的土壤。`;
    }
    case 'weak': {
      const lowest = items[items.length - 1];
      const note = lowest ? `${lowest.name}（${lowest.score}分）${DIM_NOTES[lowest.name] ? '——' + DIM_NOTES[lowest.name] : ''}` : '';
      const advice = items.some(i => i.name === '风险承受能力')
        ? '对风险保持谨慎不是问题，反而适合低风险起步模式。'
        : '把这些维度提上来，你独立经营的底气会更足。';
      return `${namesWithScores.join('、')}——${note ? note + '。' : ''}${advice}`;
    }
    case 'danger': {
      const lowest = items[0];
      const guidance = lowest?.name === '谈判技巧'
        ? '一人公司的获客报价、成交续费都需要沟通能力。可以从"价值报价"开始练习：跟客户聊价格前，先说你能帮他做到什么。'
        : lowest?.name === 'AI &自媒体运用'
          ? '获客和效率工具是一人公司的杠杆支点。可以从每天用 AI 处理一件重复工作开始，慢慢培养习惯。'
          : lowest?.name === '家庭支持'
            ? '家人的理解会让创业路更稳。建议安排一次正式沟通，分享你的计划和预期，也听听他们的顾虑。'
            : '把这些维度提上来，你独立经营的基础会更牢固。';
      return `${namesWithScores.join('、')}当前分数偏低。${guidance}`;
    }
    default:
      return null;
  }
}

// ═══════════════════════════════════════════
// A/B 侧标签颜色
// ═══════════════════════════════════════════

const TIER_COLORS_A: Record<string, string> = {
  excellent: '#4a9c7c',
  good: '#517ea8',
  weak: '#e0883a',
  danger: '#d47563',
};

// ═══════════════════════════════════════════
// 组件
// ═══════════════════════════════════════════

const TIER_LABELS: Record<string, { title: string; range: string; tierKey: string }> = {
  excellent: { title: '优势维度', range: '8-10分', tierKey: 'excellent' },
  good: { title: '良好基础', range: '6-7分', tierKey: 'good' },
  weak: { title: '有待加强', range: '4-5分', tierKey: 'weak' },
  danger: { title: '优先提升', range: '0-3分', tierKey: 'danger' },
};

const TIER_ORDER = ['excellent', 'good', 'weak', 'danger'];

export default function TierBreakdown({ result }: Props) {
  const { dimensionScores, dimensionTiersA } = result;

  // 按 A 栏四档分组，组内按分数降序
  const groupedA: Record<string, string[]> = {};
  for (const dim of DIMENSION_NAMES) {
    const tier = dimensionTiersA[dim];
    if (!groupedA[tier]) groupedA[tier] = [];
    groupedA[tier].push(dim);
  }
  for (const tier of Object.keys(groupedA)) {
    groupedA[tier].sort((a, b) => (dimensionScores[b]?.scoreA ?? 0) - (dimensionScores[a]?.scoreA ?? 0));
  }

  // 取所有维度的 A 得分用于文案生成
  const scoreAMap: Record<string, number> = {};
  for (const dim of DIMENSION_NAMES) {
    scoreAMap[dim] = dimensionScores[dim]?.scoreA ?? 0;
  }

  return (
    <View style={{
      background: '#ffffff', borderRadius: '16px', padding: '16px',
      border: '1px solid #edeff3', marginTop: '10px',
    }}
    >
      {/* ═══ 画像解读 ═══ */}
      <Text style={{
        fontSize: FS.heading, fontWeight: 700, color: 'var(--text-primary)',
        display: 'block', marginBottom: '12px',
      }}
      >
        画像解读
      </Text>

      {TIER_ORDER.map((tierKey) => {
        const dims = groupedA[tierKey];
        if (!dims || dims.length === 0) return null;
        const info = TIER_LABELS[tierKey];
        const paragraph = buildTierParagraph(dims, scoreAMap, tierKey);

        return (
          <View key={tierKey} style={{ marginBottom: '12px' }}>
            <Text style={{
              fontSize: FS.label, fontWeight: 700, color: TIER_COLORS_A[tierKey],
              display: 'block', marginBottom: '4px',
            }}
            >
              {info.title}（{info.range}）
            </Text>
            {paragraph && (
              <Text style={{
                fontSize: FS.label, color: 'var(--text-body)',
                lineHeight: '18px', display: 'block',
              }}
              >
                {paragraph}
              </Text>
            )}
          </View>
        );
      })}

    </View>
  );
}
