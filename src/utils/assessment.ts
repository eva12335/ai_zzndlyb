/**
 * 测评题库 + 评分逻辑
 * 来源：PRD §7.1-7.2 + cross_reference_analysis §5
 *
 * 11 维度 × 5 题 = 55 题
 * 每题 A/B 二选一，选 A→A+2，选 B→B+2
 * 每维度 A 得分 0-10，B 得分 0-10，A+B≡10
 */
import type { AssessQuestion, DimensionScores } from '../types/assessment';

// ═══════════════════════════════════════════
// 维度名列表
// ═══════════════════════════════════════════

export const DIMENSION_NAMES = [
  '创办OPC的动机',
  '风险承受能力',
  '坚韧不拔/处理危机能力',
  '主动性',
  '协调家庭·社会·OPC关系的能力',
  '决策能力',
  '适应OPC需要的能力',
  '对OPC的承诺',
  '家庭支持',
  '谈判技巧',
  'AI &自媒体运用',
] as const;

// ═══════════════════════════════════════════
// 题库：55 题
// ═══════════════════════════════════════════

export const QUESTION_BANK: AssessQuestion[] = [
  // ── 1. 创办OPC的动机 ──
  { id: 1,  dimension: '创办OPC的动机', dimIndex: 1, statementA: '在决定创办自己的一人公司（OPC）之前，我有一份好工作', statementB: '在决定创办自己的一人公司（OPC）之前，我没有一份好工作' },
  { id: 2,  dimension: '创办OPC的动机', dimIndex: 2, statementA: '我从自己从事过的每一份工作中都学到了一些东西，我发现工作很有意思', statementB: '我工作只为了挣钱，工作没有什么乐趣，我对工作兴趣不大' },
  { id: 3,  dimension: '创办OPC的动机', dimIndex: 3, statementA: '我想让我创办的一人公司（OPC）成为我的终生事业', statementB: '我想一人公司（OPC），是因为没有其他选择' },
  { id: 4,  dimension: '创办OPC的动机', dimIndex: 4, statementA: '我想拥有一家一人公司（OPC），这样我就能够为我的家庭提供更好的生活方式', statementB: '我想创办一人公司（OPC），踏实把事业做好' },
  { id: 5,  dimension: '创办OPC的动机', dimIndex: 5, statementA: '我坚信，我一人公司（OPC）成功与否更多地取决于自己的努力', statementB: '一个人不论做什么，要想成功都需要其他人的许多帮助' },

  // ── 2. 风险承受能力 ──
  { id: 6,  dimension: '风险承受能力', dimIndex: 1, statementA: '我坚信，要在生活中前进必须冒风险', statementB: '我不喜欢冒风险，即便有机会得到很大的回报也是这样' },
  { id: 7,  dimension: '风险承受能力', dimIndex: 2, statementA: '我认为风险中也蕴含着机会', statementB: '如果可以选择，我愿意以最稳妥的方式做事' },
  { id: 8,  dimension: '风险承受能力', dimIndex: 3, statementA: '我只有在权衡利弊之后才会去冒险', statementB: '如果我喜欢一个想法，我会不计利弊地去冒风险' },
  { id: 9,  dimension: '风险承受能力', dimIndex: 4, statementA: '即使投入OPC的资金全亏掉了，我也愿意接受这样的现实', statementB: '投入自己一人公司（OPC）的资金可能会亏损，我难以接受这样的现实' },
  { id: 10, dimension: '风险承受能力', dimIndex: 5, statementA: '不论做什么事，就算我对这件事有足够的控制权，我也不会总是期待完全控制局面', statementB: '我喜欢完全控制自己所做的事情，不需要别人监督也能按时交付' },

  // ── 3. 坚韧不拔/处理危机能力 ──
  { id: 11, dimension: '坚韧不拔/处理危机能力', dimIndex: 1, statementA: '即使面对极大的困难，我也不会轻易放弃', statementB: '如果做某些事会存在很多困难，那么我认为真的不值得为其去奋斗' },
  { id: 12, dimension: '坚韧不拔/处理危机能力', dimIndex: 2, statementA: '我相信自己有能力扭转局势', statementB: '一个人能自己做的事情是有限的，运气起到很大的作用' },
  { id: 13, dimension: '坚韧不拔/处理危机能力', dimIndex: 3, statementA: '我不会为挫折和失败消沉太久，很快能重新站起来', statementB: '挫折和失败对我的影响很大，我需要很长时间恢复' },
  { id: 14, dimension: '坚韧不拔/处理危机能力', dimIndex: 4, statementA: '如果有人对我说"不"，我会泰然处之，并尽自己最大的努力改变他们的看法', statementB: '如果有人对我说"不"，我会感到很糟并放弃这件事' },
  { id: 15, dimension: '坚韧不拔/处理危机能力', dimIndex: 5, statementA: '发生危机时，我能保持冷静并找出最佳的应对方案', statementB: '当危机升级时，我会感到慌乱和紧张' },

  // ── 4. 主动性 ──
  { id: 16, dimension: '主动性', dimIndex: 1, statementA: '我不惧怕问题，因为问题是生活的组成部分，我会想办法解决每一个问题', statementB: '我认为解决问题很难。我害怕这些问题，或者干脆不想它们' },
  { id: 17, dimension: '主动性', dimIndex: 2, statementA: '当我遇到困难时，我会尽能力克服困难。困难是对我的挑战，我喜欢挑战', statementB: '如果我遇到困难，我会试图忘掉它们，或等待期自行消失' },
  { id: 18, dimension: '主动性', dimIndex: 3, statementA: '我不会等待事情的发生，而是努力促使事情发生', statementB: '我喜欢随波逐流并等待好事降临' },
  { id: 19, dimension: '主动性', dimIndex: 4, statementA: '我总是尝试做一些与众不同的事情', statementB: '我只喜欢做我擅长做的事情' },
  { id: 20, dimension: '主动性', dimIndex: 5, statementA: '我认为所有的想法可能都会有用，因此，我会寻求尽可能多的想法，并看其是否可行', statementB: '人会有想法，但是一个人不可能做所有的事情。我愿意坚持自己的想法。' },

  // ── 5. 协调家庭·社会·OPC关系的能力 ──
  { id: 21, dimension: '协调家庭·社会·OPC关系的能力', dimIndex: 1, statementA: '在一人公司（OPC）能够承受的范围之内，我从一人公司（OPC）拿出钱来供我和家人使用', statementB: '我的家人需要多少钱，我就从一人公司（OPC）拿出多少钱' },
  { id: 22, dimension: '协调家庭·社会·OPC关系的能力', dimIndex: 2, statementA: '如果我的家人或朋友有经济困难，我只会用预留给我个人的钱来帮助他们。我不会从我的一人公司（OPC）拿钱', statementB: '如果我的家人或朋友有经济困难，我将帮助他们，即使这样做可能会损害我的一人公司（OPC）' },
  { id: 23, dimension: '协调家庭·社会·OPC关系的能力', dimIndex: 3, statementA: '我不会把大量的时间花在与家人或朋友聚会等活动上而忽略我的一人公司（OPC）', statementB: '我会优先考虑与家人或朋友聚会等活动，他们高于一人公司（OPC）' },
  { id: 24, dimension: '协调家庭·社会·OPC关系的能力', dimIndex: 4, statementA: '家人和朋友必须像其他客户一样，为使用我的产品，服务或一人公司（OPC）的资产付钱', statementB: '家人和朋友可以从我的一人公司（OPC）得到特殊的好处' },
  { id: 25, dimension: '协调家庭·社会·OPC关系的能力', dimIndex: 5, statementA: '我不会因为顾客是我的家人或朋友而允许其赊账', statementB: '我会允许我的家人或朋友赊账' },

  // ── 6. 决策能力 ──
  { id: 26, dimension: '决策能力', dimIndex: 1, statementA: '我能够轻松的做决定，我喜欢做出决定', statementB: '我发现做决定很难' },
  { id: 27, dimension: '决策能力', dimIndex: 2, statementA: '我能够做出很难的决定', statementB: '在做出艰难的决定之前，我会征求很多人的意见' },
  { id: 28, dimension: '决策能力', dimIndex: 3, statementA: '一旦需要做出决定，我经常能够很快地决定做什么', statementB: '我会尽可能长的推迟做出决定的时间' },
  { id: 29, dimension: '决策能力', dimIndex: 4, statementA: '在做出决定之前，我会认真思考并考虑所有可能的选择', statementB: '我凭感觉和直觉做出决定，我只知道眼下要做什么' },
  { id: 30, dimension: '决策能力', dimIndex: 5, statementA: '我不怕犯错误，因为我可以从中吸取教训', statementB: '我经常担心会犯错误' },

  // ── 7. 适应OPC需要的能力 ──
  { id: 31, dimension: '适应OPC需要的能力', dimIndex: 1, statementA: '我只提供客户需要的产品和服务', statementB: '我只提供自己喜好的产品或服务' },
  { id: 32, dimension: '适应OPC需要的能力', dimIndex: 2, statementA: '如果我的客户想购买便宜的的产品或服务，我将想办法满足他们的需求', statementB: '如果我的客户想购买更便宜的产品或服务，他们只能找其他一人公司（OPC）' },
  { id: 33, dimension: '适应OPC需要的能力', dimIndex: 3, statementA: '如果我的顾客想赊购，我会想办法出最小的风险为他们提供赊购服务', statementB: '我不会向任何人赊销我的产品或服务' },
  { id: 34, dimension: '适应OPC需要的能力', dimIndex: 4, statementA: '如果换个地方生意会更好，我会选择搬过去', statementB: '我不准备换地方，我在哪里做事，客户就得到哪里' },
  { id: 35, dimension: '适应OPC需要的能力', dimIndex: 5, statementA: '我将研究市场趋势，主动学习新技能，并力图改变工作态度和方法以跟上时代的发展', statementB: '最好按照我已经知道的方法去工作，学习新东西太耗精力，跟上时代的发展太难了，' },

  // ── 8. 对OPC的承诺 ──
  { id: 36, dimension: '对OPC的承诺', dimIndex: 1, statementA: '我善于在压力下工作，我喜好挑战', statementB: '我不善于在压力下工作，我喜欢平静和轻松' },
  { id: 37, dimension: '对OPC的承诺', dimIndex: 2, statementA: '我喜欢每天工作很长时间，我不介意占用业余时间', statementB: '我认为工作以外的时间很重要，人不能长时间工作' },
  { id: 38, dimension: '对OPC的承诺', dimIndex: 3, statementA: '我愿意为创办和经营自己的一人公司（OPC）而减少与家人或朋友在一起的时间', statementB: '我不愿意为创办和经营自己的一人公司（OPC）而减少与家人或朋友在一起的时间' },
  { id: 39, dimension: '对OPC的承诺', dimIndex: 4, statementA: '如果需要，我可以把社交活动、休闲娱乐和业余爱好放在一边', statementB: '我认为在社交活动、休闲娱乐和业余爱好上多花时间是很重要的' },
  { id: 40, dimension: '对OPC的承诺', dimIndex: 5, statementA: '我愿意非常努力地工作', statementB: '我愿意工作并做必须做的事情' },

  // ── 9. 家庭支持 ──
  { id: 41, dimension: '家庭支持', dimIndex: 1, statementA: '我会让家人参与对他们有影响的一人公司（OPC）决定', statementB: '我不会让家人参与对他们有影响的一人公司（OPC）决定' },
  { id: 42, dimension: '家庭支持', dimIndex: 2, statementA: '因为全身心地投入一人公司（OPC）的创办和经营，使我不能花更多的时间和家人在一起，他们会理解我', statementB: '因为全身心地投入一人公司（OPC）的创办和经营，使我不能花更多的时间和家人在一起，他们会感到不快' },
  { id: 43, dimension: '家庭支持', dimIndex: 3, statementA: '如果我的一人公司（OPC）最初不是很成功，并且给家人带来了经济上的困难，他们愿意忍受', statementB: '如果我的一人公司（OPC）最初不是很成功，并且给家人带来经济上的困难，他们会十分生气' },
  { id: 44, dimension: '家庭支持', dimIndex: 4, statementA: '家人愿意帮助我克服一人公司（OPC）遇到的困难', statementB: '家人可能不愿意或者没精力帮助我克服一人公司（OPC）遇到的困难' },
  { id: 45, dimension: '家庭支持', dimIndex: 5, statementA: '家人认为我创办一人公司（OPC）是个好主意', statementB: '家人对我创办一人公司（OPC）感到担心' },

  // ── 10. 谈判技巧 ──
  { id: 46, dimension: '谈判技巧', dimIndex: 1, statementA: '我喜欢谈判，并且经常在不冒犯任何人的情况下达到目的', statementB: '我不喜欢谈判，按照别人的建议去做更容易' },
  { id: 47, dimension: '谈判技巧', dimIndex: 2, statementA: '我与别人沟通得很好', statementB: '我与别人沟通有困难' },
  { id: 48, dimension: '谈判技巧', dimIndex: 3, statementA: '我能够尊重别人的观点和选择', statementB: '我一般对别人的观点和选择不感兴趣' },
  { id: 49, dimension: '谈判技巧', dimIndex: 4, statementA: '谈判时，我会考虑什么对自己有利，什么对别人有利', statementB: '如果参加谈判，我更愿意作为一名听众，旁观事态的发展' },
  { id: 50, dimension: '谈判技巧', dimIndex: 5, statementA: '我认为在谈判中达到目的的最好方法是努力寻找一个使双方都受益的方案', statementB: '因为一人公司（OPC）是我的，所以我的意见最重要。谈判中总有一方失败' },

  // ── 11. AI &自媒体运用 ──
  { id: 51, dimension: 'AI &自媒体运用', dimIndex: 1, statementA: '我熟悉Vibe Coding 的理念，愿意让 AI 参与代码/内容生成，已经在日常工作中使用 AI 工具（如 Claude Code、Codex、DeepSeek等）', statementB: '我了解 Vibe Coding 的理念，愿意让 AI 参与代码/内容生成，还未在日常工作中使用 AI 工具（如 Claude Code、Codex、DeepSeek等）' },
  { id: 52, dimension: 'AI &自媒体运用', dimIndex: 2, statementA: '我乐于经营个人 IP，通过内容输出建立信任和影响力', statementB: '我不擅长也不喜欢在社交媒体上展示自己' },
  { id: 53, dimension: 'AI &自媒体运用', dimIndex: 3, statementA: '我能清晰估算每月的 AI 工具成本（Token、订阅），并纳入成本规划', statementB: '我会主动探索用 AI 自动化重复性工作（客服、数据处理、内容生成）' },
  { id: 54, dimension: 'AI &自媒体运用', dimIndex: 4, statementA: '我能够通过自媒体杠杆放大获客效果（内容即获客）', statementB: '我不了解自媒体获客，还是传统的推销方式比较可靠' },
  { id: 55, dimension: 'AI &自媒体运用', dimIndex: 5, statementA: '我认为 AI 技能是一人公司最核心的竞争力之一', statementB: '我不认为 AI 技能是一人公司最核心的竞争力之一' },
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
