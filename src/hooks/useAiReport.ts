/**
 * AI 深度报告 Hook
 * 来源：PRD §8.2 + TECH_DESIGN §3.5.3
 *
 * 流程：生成 → 调云函数(8s超时) → 校验 → 成功/降级
 */
import { useState, useCallback } from 'react';
import { callAiReport } from '../services/cloudFunctions';
import { validateAiReport } from '../utils/validateAiReport';
import { DIMENSION_NAMES } from '../utils/assessment';
import type { AiReportInput, AiReportOutput } from '../types/ai';

// ═══════════════════════════════════════════
// 段位分析本地降级模板（与 SegmentCard 复用文案）
// ═══════════════════════════════════════════

const FALLBACK_ANALYSES: Record<string, string> = {
  '谨慎型技术派':
    '自驱力和AI技能是你的双引擎，对风险偏谨慎让你更倾向于用数据和工具替代直觉。你的最大杠杆在于AI——善用技术降低交付成本，用可量化的方式验证市场假设。适合从服务型月费制起步，在可控风险内积累客户。',
  '直觉型探索者':
    '冒险精神和自驱力是你的燃料。热情能帮你起步，下一步是建立系统化的工具和流程，让每一步都有据可循。AI技能可以成为撬动你现有优势的杠杆。',
  'AI增强型个体':
    '自驱力和AI技能的组合让你具备了独立经营的核心条件。你已经在用技术杠杆放大产能，下一步是优化获客渠道和提升客单价，把产能天花板往上推。',
  '稳健型实干家':
    '市场嗅觉敏锐、做事稳健是你的资产。你适合"先跑通再扩张"的节奏——用最小可行产品测试市场反应，用数据辅助决策。AI工具链补上之后，效率会再上一个台阶。',
  '待激活观望者':
    '目前各维度得分偏低，说明你还处于积累阶段。这不等于不适合一人公司——可以先从一次完整的"最小可行经验"开始：用业余时间接一个项目，测试市场对你的价值反馈，同时针对性地加强最需要提升的方向。',
  '全能型一人公司':
    '自驱力、AI技能、市场获客和风险承受能力全面在线，已具备独立经营的全部条件。下一步不是"能不能做"，而是"如何规模化"——产品化你的服务、提升客单价、建立被动收入渠道。',
};

// ═══════════════════════════════════════════
// 维度预写文案（机会雷达 · 本地降级用）
// ═══════════════════════════════════════════

const DIM_GUIDES: Record<string, { low: string; mid: string }> = {
  '创办OPC的动机': {
    low: '自驱力是你从"想"到"做"的第一步。一人公司没有人推你，需要自己给自己定目标。可以从每天 20 分钟的独立项目时间开始，慢慢养成不依赖外部推动的行动习惯。',
    mid: '自驱力有一定基础，但偶尔会起伏——有时动力十足，有时提不起劲。可以建立一套固定的工作流程：固定时间、固定节奏，不靠感觉驱动。',
  },
  '风险承受能力': {
    low: '对收入波动比较敏感，这让你在定价和投入上更谨慎——谨慎本身不是问题，但过度保守可能让你错过一些值得尝试的机会。可以从小额、可逆的风险实验开始，慢慢拓宽舒适区。',
    mid: '风险承受力在中间位置——你能接受一定程度的不确定性，但面对大决定时还是会犹豫。用数据辅助判断，把"感觉有风险"变成"算过再决定"，会少很多焦虑。',
  },
  '坚韧不拔/处理危机能力': {
    low: '遇到挫折后恢复需要较长时间——这很正常。一人公司的路上挫折是常态，关键是每次恢复的速度。可以试着记录每次从困难中走出来的过程，下次再看就知道自己扛得过去。',
    mid: '韧性有一定基础，但连续遇到打击时可能会动摇。找一位同行定期交流，互相打气——有人并肩，低谷期会短很多。',
  },
  '主动性': {
    low: '在无人监督的环境中保持自律，对你来说是个挑战——在家容易分心、效率不稳。可以试试时间块法：每天给自己排 3 个 90 分钟的深度工作段，手机放一边。',
    mid: '自律力处于中间地带——高效的时候产出惊人，拖延的时候一天就这么过去了。可以培养一个固定的"启动仪式"：每天同一时间、同一地点开始工作，给大脑一个"该干活了"的信号。',
  },
  '协调家庭·社会·OPC关系的能力': {
    low: '在家办公时，工作和生活的边界容易模糊——家人可能不知道你正在工作，你自己也可能分不清什么时候该干活、什么时候该休息。可以设定明确的物理边界（独立工作区）和时间边界（固定工作时段）。',
    mid: '边界管理整体还行，但偶尔会被家庭事务打乱节奏。建议跟家人做一次正式沟通：说清楚你的工作时段、收入目标，以及你需要什么样的支持。',
  },
  '决策能力': {
    low: '独自拍板时会犹豫——怕选错、想再研究研究。"再研究一下"是很多人都会踩的坑。可以给自己设一个决策截止时间，到点就拍板，错了再调。',
    mid: '决策力中等——日常小事能快速决定，大事容易反复权衡。可以找一个同行做"决策搭子"，每周花 30 分钟互相讨论一个关键决策——对方不需要比你厉害，只需要帮你想清楚为什么这样选。',
  },
  '适应OPC需要的能力': {
    low: '一人多角色快速切换——从写代码到跟客户沟通，再到记账报税——每次切换都在消耗精力。可以试着用 AI 工具把不擅长的重复工作（客服回复、记账）自动化，把精力留给核心交付。',
    mid: '角色切换能力有一定基础——能适应，但会累。可以把低价值的重复任务交给工具处理，把时间和精力集中在高价值的交付上。',
  },
  '对OPC的承诺': {
    low: '一个人扛所有责任，压力确实不小——遇到问题时容易把所有责任揽到自己身上。可以做一个简单的练习：把遇到的问题分成"我能控制的"和"我控制不了的"两列，精力只放在第一列。',
    mid: '责任感有一定基础——核心责任能扛得住，但偶尔也会觉得孤单。可以加入一个一人公司的线上社群，知道不只你一个人在扛。',
  },
  '家庭支持': {
    low: '家人目前对创业这件事还有顾虑——这很正常，他们担心的往往是实实在在的问题。建议安排一次正式沟通，把你的计划、收入预期和风险应对方案讲清楚，让他们从"担心"变成"了解"。',
    mid: '家人基本理解但偶尔还是会有顾虑——这是人之常情。关键是保持透明的沟通，定期跟他们同步你的进展，让他们有参与感。',
  },
  '谈判技巧': {
    low: '获客报价和成交沟通对你来说还有提升空间——可能在报价时主动让步，或者不敢跟客户谈价格。一人公司的收入直接跟谈判能力挂钩。可以从"价值报价"开始练习：谈价格前，先说清楚你能帮对方解决什么问题。',
    mid: '谈判有一定基础——敢开口，但还可以更精准。每次报价前，先把你能为客户创造的具体价值梳理一遍，不要第一个开口谈价格，也不给对方压价的机会。',
  },
  'AI &自媒体运用': {
    low: 'AI 工具的使用还有很大提升空间——很多可以自动化的工作还在手动处理，每天多花的时间就是少赚的钱。可以从一个最简单的场景开始：用 AI 帮你处理客服回复或内容初稿，每天释放半小时，一个月就多了 15 小时。',
    mid: 'AI 技能有一定基础——会用，但还没深入嵌入工作流。下一步不是学更多工具，而是把 AI 放到核心业务流程里：客服回复、内容初稿、数据整理，让 AI 替你跑这些重复劳动。',
  },
};

// ═══════════════════════════════════════════
// 预写行动建议（按维度分类）
// ═══════════════════════════════════════════

const DIM_ACTIONS: Record<string, { action: string; impact: string }> = {
  '创办OPC的动机': { action: '每天固定一个"独立项目时间"——哪怕只做 20 分钟，先养成不依赖外部推动就能行动的习惯', impact: '预期产出：每周多 2-3 小时的独立推进时间' },
  '风险承受能力': { action: '做一个"最小风险测试"——用 ¥500 以内的预算验证一个商业假设，把"冒风险"变成"做实验"', impact: '预期效果：降低决策焦虑，加快验证节奏' },
  '坚韧不拔/处理危机能力': { action: '建立"逆境日志"——每次遇到困难时记录：发生了什么、我怎么应对的、学到了什么。下次再遇到类似情况就知道自己扛得过去', impact: '预期效果：缩短从挫折中恢复的时间，增强心理韧性' },
  '主动性': { action: '用时间块法替代待办清单——每天只排 3 个 90 分钟的深度工作段，其余时间不安排任务', impact: '预期效果：日有效产出时间提升 50%+' },
  '协调家庭·社会·OPC关系的能力': { action: '跟家人做一次正式沟通——明确你的工作时间段、收入目标和需要的支持。把"我在家工作"变成"我在家经营事业"', impact: '预期效果：减少打断，提升在家工作的专业感' },
  '决策能力': { action: '找一个同行做"决策搭子"——每周 30 分钟互相讨论一个关键决策，对方不需要比你强，只需要能问"你为什么这么想"', impact: '预期效果：决策速度提升，减少"再研究一下"的拖延' },
  '适应OPC需要的能力': { action: '梳理你每周花在非核心任务上的时间——选一件让 AI 接手（客服模板、内容初稿、记账自动化）', impact: '预期效果：每周释放 3-5 小时给核心交付' },
  '对OPC的承诺': { action: '写下两个清单——"我能控制的事"和"我控制不了的事"。每次焦虑时先看第二个清单，把注意力拉回第一个', impact: '预期效果：降低独自扛责任的焦虑感，更专注于可行动项' },
  '家庭支持': { action: '安排一次正式的家庭会议——分享你的一人公司计划、时间安排和收入预期。告诉家人你需要什么样的支持（时间、空间、理解），也听听他们在担心什么', impact: '预期效果：减少家庭摩擦，获得更稳定的后盾支持' },
  '谈判技巧': { action: '练"价值报价"话术——下次跟任何客户沟通时，先说"根据你的需求，我可以帮你做到 X"，再报价。不降价，不妥协', impact: '预期效果：客单价提升 15-30%，不再主动让价' },
  'AI &自媒体运用': { action: '梳理一个可被 AI 全自动化的日常流程——客服回复、内容初稿、数据整理，三选一。用现成工具（ChatGPT / Claude / Cursor）落地', impact: '预期效果：每天释放 1-2 小时，相当于每月多 30-60 小时的获客/交付时间' },
};

// ═══════════════════════════════════════════
// 本地降级报告生成（纯函数，零随机）
// ═══════════════════════════════════════════

function buildFallbackReport(input: AiReportInput): AiReportOutput {
  const { dimensionScores, segmentLabel } = input;

  // 按分数升序排列所有维度
  const ranked = DIMENSION_NAMES
    .map((dim) => ({ dim, score: dimensionScores[dim] ?? 5 }))
    .sort((a, b) => a.score - b.score);

  // 只有确实偏低的维度（< 6 分）才作为"机会"展示
  const realGaps = ranked.filter((item) => item.score < 6);
  // 如果全都 ≥ 6 分，取最低 2 个作为"可优化项"而非"短板"
  const candidates = realGaps.length > 0 ? realGaps.slice(0, 3) : ranked.slice(0, 2);
  const allHigh = realGaps.length === 0;

  const opportunities = candidates.map((item, i) => {
    const guide = DIM_GUIDES[item.dim];
    const description = allHigh
      ? (guide?.mid || `${item.dim}表现不错，继续保持并寻找突破口`)
      : item.score < 5 ? guide?.low : guide?.mid;

    return {
      dimension: item.dim,
      currentScore: item.score,
      targetScore: Math.min(item.score + 2, 10),
      financialImpact: undefined,
      directionGuide: description || (allHigh ? '该维度处于健康水平，可作为你的核心优势继续打磨' : `建议优先提升${item.dim}——这是 ROI 最高的改进方向`),
      roiRank: i + 1,
    };
  });

  const actionItems = candidates.map((item, i) => {
    const act = DIM_ACTIONS[item.dim];
    return {
      action: allHigh
        ? `"${item.dim}"当前 ${item.score}/10，已属健康区间，继续保持即可`
        : (act?.action || `重点提升"${item.dim}"：当前 ${item.score}/10，通过刻意练习提升至 ${Math.min(item.score + 2, 10)}/10`),
      expectedImpact: allHigh
        ? '保持该维度优势，可将其作为你的核心竞争力标签'
        : (act?.impact || '该维度提升后预期改善经营效率与盈利能力'),
      risk: (item.score < 4 ? 'high' : item.score < 6 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
      sourceDimension: item.dim,
    };
  });

  const result: AiReportOutput = {
    segmentAnalysis: FALLBACK_ANALYSES[segmentLabel] ?? '基于你的测评分数的画像分析。',
    opportunities,
    actionItems,
    // 降级报告不含路线图——无成本数据时始终显示 🔓 占位
  };

  return result;
}

// ═══════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════

interface UseAiReportReturn {
  loading: boolean;
  error: string | null;
  report: AiReportOutput | null;
  isFallback: boolean;
  generateReport: (input: AiReportInput) => Promise<void>;
}

export function useAiReport(): UseAiReportReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AiReportOutput | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const generateReport = useCallback(async (input: AiReportInput) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setIsFallback(false);

    const hasCostData = !!input.costData;

    try {
      const result = await callAiReport(input);

      if (validateAiReport(result, input.segmentLabel, hasCostData)) {
        setReport(result);
      } else {
        setReport(buildFallbackReport(input));
        setIsFallback(true);
      }
    } catch {
      setReport(buildFallbackReport(input));
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, report, isFallback, generateReport };
}
