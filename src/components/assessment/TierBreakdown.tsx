/**
 * 画像解读 + 标签展示
 * 按照样板间风格：四档分组文字解读 + A/B 侧画像标签
 */
import { View, Text } from '@tarojs/components';
import { FS } from '../../constants/fonts';
import type { AssessmentResult } from '../../types/assessment';
import { getTagA } from '../../utils/assessmentEngine';
import { DIMENSION_NAMES } from '../../utils/assessment';

interface Props {
  result: AssessmentResult;
}

// ═══════════════════════════════════════════
// 维度的自然语言说明（用于生成解读文案）
// ═══════════════════════════════════════════

const DIM_NOTES: Record<string, string> = {
  '独立动机': '不依赖外部推动就能持续行动',
  '风险承受': '对收入波动的容忍度',
  '坚韧不拔': '面对困难时的恢复力',
  '自我控制': '无监督环境下的自律交付能力',
  '协调家庭社会事业': '在家办公的边界管理',
  '决策能力': '无人商量时独立做决定',
  '适应事业需要': '一人多角色快速切换',
  '对组织的责任': '一个人扛全部责任的担当',
  '市场和客户关系': '个人IP、一人获客能力',
  '谈判技巧': '获客报价、成交续费的沟通力',
  'AI技能运用': '是否习惯用AI提效',
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
      // 突出优势：这是发动机
      const notes = items.map((i) => DIM_NOTES[i.name] ?? '').filter(Boolean);
      const noteStr = notes.length > 0 ? `——${notes.slice(0, 2).join('，')}。` : '';
      return `你的${namesWithScores.join('和')}是一人公司最核心的发动机${noteStr}`;
    }
    case 'good': {
      const notes = items.map((i) => DIM_NOTES[i.name] ?? '').filter(Boolean);
      const noteStr = notes.length > 0 ? `——${notes.slice(0, 2).join('，')}。` : '。';
      return `${namesWithScores.join('、')}表现稳定${noteStr}这些能力让你具备持续学习和寻找机会的基础。`;
    }
    case 'weak': {
      const lowest = items[items.length - 1];
      const note = lowest ? `${lowest.name}（${lowest.score}分）${DIM_NOTES[lowest.name] ? '——' + DIM_NOTES[lowest.name] : ''}` : '';
      const advice = tier === 'weak' && items.some(i => i.name === '风险承受')
        ? '这不是缺陷，恰好说明你适合低风险起步模式。'
        : '建议针对性提升，它们可能成为你扩张时的瓶颈。';
      return `${namesWithScores.join('、')}——${note ? note + '。' : ''}${advice}`;
    }
    case 'danger': {
      const itemsList = namesWithScores.join('、');
      const lowest = items[0]; // lowest score first after desc sort
      const impact = lowest?.name === '谈判技巧'
        ? '对一人公司来说，获客报价、成交续费都离不开谈判——这个短板会直接影响你的收入天花板。'
        : lowest?.name === '市场和客户关系'
          ? '没有获客能力，再好的产品也难以变现——这是生存的第一道坎。'
          : '这些短板如果长期不补，会成为你独立经营的最大绊脚石。';
      return `${itemsList}是全图最低分。${impact}建议优先补这块。`;
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

const TIER_ICONS_A: Record<string, string> = {
  excellent: '🟢',
  good: '🔵',
  weak: '🟠',
  danger: '🔴',
};

const TIER_ICONS_B: Record<string, string> = {
  clean: '✓',
  mild: '○',
  watch: '▲',
  severe: '⚠',
};

const TIER_COLORS_B: Record<string, string> = {
  clean: '#4a9c7c',
  mild: '#517ea8',
  watch: '#e0883a',
  severe: '#d47563',
};

// ═══════════════════════════════════════════
// 组件
// ═══════════════════════════════════════════

const TIER_LABELS: Record<string, { title: string; range: string; tierKey: string }> = {
  excellent: { title: '突出优势', range: '8-10分', tierKey: 'excellent' },
  good: { title: '中等偏上', range: '6-7分', tierKey: 'good' },
  weak: { title: '需要注意', range: '4-5分', tierKey: 'weak' },
  danger: { title: '明显短板', range: '0-3分', tierKey: 'danger' },
};

const TIER_ORDER = ['excellent', 'good', 'weak', 'danger'];

export default function TierBreakdown({ result }: Props) {
  const { dimensionScores, dimensionTiersA, dimensionTiersB } = result;

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
    }}>
      {/* ═══ 📋 画像解读 ═══ */}
      <Text style={{
        fontSize: FS.heading, fontWeight: 700, color: 'var(--text-primary)',
        display: 'block', marginBottom: '12px',
      }}
      >
        📋 画像解读
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
              {TIER_ICONS_A[tierKey]} {info.title}（{info.range}）
            </Text>
            {paragraph && (
              <Text style={{
                fontSize: FS.label, color: 'var(--text-body)',
                lineHeight: '22px', display: 'block',
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
