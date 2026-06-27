/**
 * 测评题库 + 评分逻辑
 * 来源：PRD §7.1-7.2 + cross_reference_analysis §5
 *
 * 11 维度 × 5 题 = 55 题
 * 每题 A/B 二选一，选 A→A+2，选 B→B+2
 * 每维度 A 得分 0-10，B 得分 0-10，A+B≡10
 */
import type { AssessQuestion, DimensionScore, DimensionScores, AssessmentResult } from '../types/assessment';

// ═══════════════════════════════════════════
// 维度名列表
// ═══════════════════════════════════════════

export const DIMENSION_NAMES = [
  '独立动机',
  '风险承受',
  '坚韧不拔',
  '自我控制',
  '协调家庭社会事业',
  '决策能力',
  '适应事业需要',
  '对组织的责任',
  '市场和客户关系',
  '谈判技巧',
  'AI技能运用',
] as const;

// ═══════════════════════════════════════════
// 题库：55 题
// ═══════════════════════════════════════════

export const QUESTION_BANK: AssessQuestion[] = [
  // ── 1. 独立动机 ──
  { id: 1,  dimension: '独立动机', dimIndex: 1, statementA: '我想把现在做的事做成一辈子', statementB: '我是因为没有其他出路才选择自己单干' },
  { id: 2,  dimension: '独立动机', dimIndex: 2, statementA: '我自己做事的成败更多取决于自己的努力', statementB: '一个人不论做什么，要想成功都需要其他人的许多帮助' },
  { id: 3,  dimension: '独立动机', dimIndex: 3, statementA: '我从自己从事过的每一份工作中都学到了一些东西，我发现工作很有意思', statementB: '我工作只为挣钱，工作没有什么乐趣，我对工作兴趣不大' },
  { id: 4,  dimension: '独立动机', dimIndex: 4, statementA: '我想拥有一份自己的事情做，为家庭提供更好的生活方式', statementB: '我想自己做事是因为渴望成功，成功的人都有自己的事' },
  { id: 5,  dimension: '独立动机', dimIndex: 5, statementA: '我愿意全身心投入自己做的事，即使这意味着更少的休闲时间', statementB: '我认为工作和生活应该严格分开，不愿意让工作占据生活' },

  // ── 2. 风险承受 ──
  { id: 6,  dimension: '风险承受', dimIndex: 1, statementA: '我坚信要在生活中前进必须冒风险，风险中也蕴含着机会', statementB: '我只有在权衡利弊之后才会去冒风险' },
  { id: 7,  dimension: '风险承受', dimIndex: 2, statementA: '即使投入做事的资金亏掉了，我也愿意接受这样的现实', statementB: '我不喜欢冒风险，即便有机会得到很大的回报也是这样' },
  { id: 8,  dimension: '风险承受', dimIndex: 3, statementA: 'AI 工具月费和收入起伏，是我选择自己做事必须面对的现实', statementB: '没有固定工资兜底让我焦虑，我需要稳定收入才安心' },
  { id: 9,  dimension: '风险承受', dimIndex: 4, statementA: '如果我做的事最初不是很成功，并带来经济困难，我愿意坚持', statementB: '如果做的事最初不顺利且带来经济困难，我会考虑放弃' },
  { id: 10, dimension: '风险承受', dimIndex: 5, statementA: '我愿意用自己的积蓄来支撑我做的事', statementB: '我不会投入太多积蓄，这太冒险了' },

  // ── 3. 坚韧不拔/危机处理 ──
  { id: 11, dimension: '坚韧不拔', dimIndex: 1, statementA: '即使面对极大的困难，我也不会轻易放弃', statementB: '如果做某些事会存在很多困难，我认为不值得为其去奋斗' },
  { id: 12, dimension: '坚韧不拔', dimIndex: 2, statementA: '我不惧怕问题，因为问题是生活的组成部分，我会想办法解决每一个问题', statementB: '我认为解决问题很难，我尽量不去想它们' },
  { id: 13, dimension: '坚韧不拔', dimIndex: 3, statementA: '我不会为挫折和失败消沉太久，很快能重新站起来', statementB: '挫折和失败对我的影响很大，我需要很长时间恢复' },
  { id: 14, dimension: '坚韧不拔', dimIndex: 4, statementA: '当我遇到困难时，我会尽全力克服困难', statementB: '如果我遇到困难，我会试着绕过它或等待其自行消失' },
  { id: 15, dimension: '坚韧不拔', dimIndex: 5, statementA: '发生危机时，我能保持冷静并找出最佳的应对方案', statementB: '当危机升级时，我会感到慌乱和紧张' },

  // ── 4. 自我控制/自主性 ──
  { id: 16, dimension: '自我控制', dimIndex: 1, statementA: '我喜欢完全控制自己所做的事情，不需要别人监督也能按时交付', statementB: '有人督促和提醒时我的效率更高' },
  { id: 17, dimension: '自我控制', dimIndex: 2, statementA: '我能自己设定目标并严格执行计划', statementB: '我需要外部截止日期才能有效工作' },
  { id: 18, dimension: '自我控制', dimIndex: 3, statementA: '在家办公时我能保持高度自律，不会因为环境舒适而懈怠', statementB: '在家办公容易分心，我需要办公室环境才能专注' },
  { id: 19, dimension: '自我控制', dimIndex: 4, statementA: '我不会等待事情的发生，而是努力促使事情发生', statementB: '我喜欢随波逐流并等待机会来找我' },
  { id: 20, dimension: '自我控制', dimIndex: 5, statementA: '即使没有人给我反馈，我也能持续改进自己的工作', statementB: '我需要外部反馈才能知道自己做得好不好' },

  // ── 5. 协调家庭·社会·事业关系 ──
  { id: 21, dimension: '协调家庭社会事业', dimIndex: 1, statementA: '家人愿意帮我克服自己单干中遇到的困难', statementB: '家人对我自己单干感到担心' },
  { id: 22, dimension: '协调家庭社会事业', dimIndex: 2, statementA: '我能有效管理工作和家庭时间的边界', statementB: '在家办公让我很难分清什么时候该工作、什么时候该陪家人' },
  { id: 23, dimension: '协调家庭社会事业', dimIndex: 3, statementA: '家人认为我自己做事是个好主意', statementB: '家人认为我应该找一份稳定工作' },
  { id: 24, dimension: '协调家庭社会事业', dimIndex: 4, statementA: '如果需要，我可以把社交活动和休闲娱乐放在一边', statementB: '我认为在社交活动和休闲娱乐上多花时间是很重要的，不愿意减少' },
  { id: 25, dimension: '协调家庭社会事业', dimIndex: 5, statementA: '我愿意为做好自己的事而减少与家人朋友相处的时间', statementB: '我不愿意为做事牺牲与家人朋友相处的时间' },

  // ── 6. 决策能力 ──
  { id: 26, dimension: '决策能力', dimIndex: 1, statementA: '我能独立做出重要决策，即使没有人商量', statementB: '做重要决定之前，我需要征求很多人的意见' },
  { id: 27, dimension: '决策能力', dimIndex: 2, statementA: '我做决策果断，不会过度拖延', statementB: '我总是尽可能地推迟做出决定的时间' },
  { id: 28, dimension: '决策能力', dimIndex: 3, statementA: '即使信息不足，我也能凭直觉和经验做出合理判断', statementB: '我需要充分的数据和证据才能做决定' },
  { id: 29, dimension: '决策能力', dimIndex: 4, statementA: '我善于在压力下工作，能在紧迫时间内做出决策', statementB: '我不善于在压力下工作，我喜欢平稳和轻松' },
  { id: 30, dimension: '决策能力', dimIndex: 5, statementA: '当我做了决策之后，我会坚定执行不会反复怀疑', statementB: '我做了决策后经常后悔和怀疑自己' },

  // ── 7. 适应事业需要的能力 ──
  { id: 31, dimension: '适应事业需要', dimIndex: 1, statementA: '我能快速在一人多角色之间切换（客服、财务、运营、产品）', statementB: '我更喜欢专注于单一领域，不擅长同时处理多种任务' },
  { id: 32, dimension: '适应事业需要', dimIndex: 2, statementA: '我喜欢每天工作很长时间，不介意占用休息时间', statementB: '我认为工作以外的时间很重要，人不应该长时间工作' },
  { id: 33, dimension: '适应事业需要', dimIndex: 3, statementA: '我善于在压力下工作，能承受高峰期的紧张节奏', statementB: '我不善于在压力下工作，喜欢平稳和轻松的节奏' },
  { id: 34, dimension: '适应事业需要', dimIndex: 4, statementA: '我愿意非常努力地工作，付出比上班时更多的精力', statementB: '我愿意工作并做必须做的事情，但不想比上班更累' },
  { id: 35, dimension: '适应事业需要', dimIndex: 5, statementA: '我会主动学习新技能来适应做事需要', statementB: '我倾向于用现有技能解决问题，学习新东西太耗精力' },

  // ── 8. 对组织的责任 ──
  { id: 36, dimension: '对组织的责任', dimIndex: 1, statementA: '我一个人扛起全部责任没有问题', statementB: '一个人承担所有责任让我压力很大' },
  { id: 37, dimension: '对组织的责任', dimIndex: 2, statementA: '我能够对自己的所有决策和其后果负责', statementB: '我习惯在团队中分担责任，出了问题有人一起扛' },
  { id: 38, dimension: '对组织的责任', dimIndex: 3, statementA: '如果我做的事没做成，我能够接受这是自己的责任', statementB: '如果做的事没做成，我会觉得是外部原因造成的' },
  { id: 39, dimension: '对组织的责任', dimIndex: 4, statementA: '我认为在承诺的时间内交付是对客户的基本责任', statementB: '延迟交付是可以理解的，客户应该理解' },
  { id: 40, dimension: '对组织的责任', dimIndex: 5, statementA: '我会尽力兑现承诺，不管是时间还是质量', statementB: '尽力而为就好，有些事情确实没办法保证' },

  // ── 9. 市场和客户关系 ──
  { id: 41, dimension: '市场和客户关系', dimIndex: 1, statementA: '我乐于经营个人 IP，通过内容输出建立信任和影响力', statementB: '我不擅长也不喜欢在社交媒体上展示自己' },
  { id: 42, dimension: '市场和客户关系', dimIndex: 2, statementA: '我会主动研究市场趋势，并力图改变工作态度和方法以跟上时代', statementB: '最好按照我已经知道的方法去工作，跟上时代的发展太难了' },
  { id: 43, dimension: '市场和客户关系', dimIndex: 3, statementA: '如果我的顾客想购买更便宜的产品或服务，我会想办法满足他们的需求', statementB: '我只提供自己喜欢的产品或服务，不打算根据顾客需求调整' },
  { id: 44, dimension: '市场和客户关系', dimIndex: 4, statementA: '我能够通过自媒体杠杆放大获客效果（内容即获客）', statementB: '我不了解自媒体获客，还是传统的推销方式比较可靠' },
  { id: 45, dimension: '市场和客户关系', dimIndex: 5, statementA: '如果换个地方生意会更好，我会选择搬过去', statementB: '我不准备换地方，我在哪里做事，顾客就得到哪里' },

  // ── 10. 谈判技巧 ──
  { id: 46, dimension: '谈判技巧', dimIndex: 1, statementA: '我喜欢谈判，并且经常在不冒犯任何人的情况下达到目的', statementB: '我不喜欢谈判，按照别人的建议去做更容易' },
  { id: 47, dimension: '谈判技巧', dimIndex: 2, statementA: '我与别人沟通得很好，能够清晰表达自己的价值', statementB: '我与别人沟通有困难，不知道怎么推销自己' },
  { id: 48, dimension: '谈判技巧', dimIndex: 3, statementA: '我能够尊重别人的观点和选择，同时坚持自己的立场', statementB: '我一般对别人的观点和选择不感兴趣，容易被对方说服' },
  { id: 49, dimension: '谈判技巧', dimIndex: 4, statementA: '谈判时，我会考虑什么对自己有利，什么对对方有利，努力找一个双方都受益的方案', statementB: '因为事情是我在做，所以我的意见最重要，谈判总有输赢' },
  { id: 50, dimension: '谈判技巧', dimIndex: 5, statementA: '如果有人对我说"不"，我会泰然处之并尽自己最大的努力改变他们的看法', statementB: '如果有人对我说"不"，我会感到很沮丧并放弃这件事' },

  // ── 11. AI 技能运用 ──
  { id: 51, dimension: 'AI技能运用', dimIndex: 1, statementA: '我已经在日常工作中使用 AI 工具（如 Claude Code、Cursor、DeepSeek）提效', statementB: '我很少或从不用 AI 工具，还是习惯传统工作方式' },
  { id: 52, dimension: 'AI技能运用', dimIndex: 2, statementA: '我了解 Vibe Coding 的理念，愿意让 AI 参与代码/内容生成', statementB: '我不信任 AI 生成的代码或内容，必须全部自己写才放心' },
  { id: 53, dimension: 'AI技能运用', dimIndex: 3, statementA: '我能清晰估算每月的 AI 工具成本（Token、订阅），并纳入成本规划', statementB: '我不会计算 AI 工具的费用，用就用了不算' },
  { id: 54, dimension: 'AI技能运用', dimIndex: 4, statementA: '我会主动探索用 AI 自动化重复性工作（客服、数据处理、内容生成）', statementB: '我不认为 AI 能替代人工流程，自动化投入产出比不高' },
  { id: 55, dimension: 'AI技能运用', dimIndex: 5, statementA: '我认为 AI 技能是一人公司最核心的竞争力之一', statementB: '我觉得 AI 工具目前只是噱头，实际价值不大' },
];

// ═══════════════════════════════════════════
// 评分逻辑
// ═══════════════════════════════════════════

/** 根据用户答题记录计算各维度 A/B 得分 */
export function calculateScores(answers: Record<number, 'A' | 'B'>): DimensionScores {
  const scores: DimensionScores = {};

  for (const dim of DIMENSION_NAMES) {
    scores[dim] = { scoreA: 0, scoreB: 0 };
  }

  for (const q of QUESTION_BANK) {
    const answer = answers[q.id];
    if (!answer) continue;
    const dim = q.dimension;
    if (answer === 'A') {
      scores[dim].scoreA += 2;
    } else {
      scores[dim].scoreB += 2;
    }
  }

  return scores;
}

/** 获取指定维度的问题列表 */
export function getQuestionsByDimension(): Record<string, AssessQuestion[]> {
  const grouped: Record<string, AssessQuestion[]> = {};
  for (const q of QUESTION_BANK) {
    if (!grouped[q.dimension]) grouped[q.dimension] = [];
    grouped[q.dimension].push(q);
  }
  return grouped;
}
