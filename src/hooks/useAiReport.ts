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
    '独立动机与AI技能是你的双引擎，但保守的风险态度让你更倾向于用数据和工具替代直觉。你的最大杠杆在于AI——善用技术降低交付成本，以可量化的方式验证市场假设。适合从服务型月费制起步，在可控风险内积累客户。',
  '直觉型探索者':
    '冒险精神和自驱力是你的燃料，但缺少系统化的方法论可能让你忽略成本控制和效率优化。热情能帮你起步，但持续需要工具和流程。补齐AI技能是撬动你现有优势的最快杠杆。',
  'AI增强型个体':
    'AI技能和独立动机的组合让你具备了独立经营的核心条件。你已经在用技术杠杆放大产能，下一步是优化获客和客单价。产能天花板是你需要主动管理的瓶颈。',
  '稳健型实干家':
    '市场嗅觉敏锐、做事稳健是你的最大资产。你适合"先跑通再扩张"的节奏——用最小可行产品测试市场反应，用数据而非冲动决策。补上AI工具链能让你事半功倍。',
  '待激活观望者':
    '目前各维度得分偏低，说明你还在探索阶段。这不等于不适合一人公司——而是需要先积累一次完整的"最小可行经验"：用业余时间接一个项目，测试你的市场价值，同时针对性补强最短板。',
  '全能型一人公司':
    '独立动机、AI技能、市场获客和风险承受全面偏高，你已具备独立经营的全部条件。下一步不是"能不能做"，而是"如何规模化"——产品化服务、提价、建立被动收入渠道是你接下来的课题。',
};

// ═══════════════════════════════════════════
// 维度预写文案（机会雷达 · 本地降级用）
// ═══════════════════════════════════════════

const DIM_GUIDES: Record<string, { low: string; mid: string }> = {
  '独立动机': {
    low: '缺乏自驱会拖慢你从"想"到"做"的速度。一人公司没有老板推你——低分意味着你可能需要外部压力才能行动。建议从每天 20 分钟的独立项目开始培养自律。',
    mid: '自驱力不差但也不稳——有时激情满满，有时拖延。关键是建立"不依赖情绪"的执行系统：固定时间、固定流程、不靠灵感。',
  },
  '风险承受': {
    low: '对收入波动的容忍度偏低，会让你在定价和投资决策上偏保守。这不是缺陷——但需要意识到过度保守可能让你错失增长窗口。从可逆的小风险开始训练风险承受力。',
    mid: '风险承受力中等——你能接受一定的不确定性，但大赌注会让你犹豫。建议用数据替代直觉做风险评估，降低决策焦虑。',
  },
  '坚韧不拔': {
    low: '面对困难时的恢复力偏低——一旦遇挫，可能较长时间陷入低谷。一人公司路上挫折是常态。建议建立一个"逆境清单"：记录每次从困境中恢复的过程，建立信心。',
    mid: '韧性尚可但遇到连续打击时可能动摇。关键不是不被击倒，而是倒下的时间越来越短。找一位同行定期交流，互相打气。',
  },
  '自我控制': {
    low: '无监督环境下的自律是你的短板——在家办公可能效率低下，容易分心。建议用时间块法：每天 3 个 90 分钟的深度工作段，手机静音。',
    mid: '自律力中等——有些日子效率极高，有些日子拖延严重。建议培养一个"启动仪式"：每天同一时间、同一地点开始工作，建立条件反射。',
  },
  '协调家庭社会事业': {
    low: '在家办公的边界管理是你的弱项——家人可能不理解"你在工作"，你自己也可能分不清工作和休息。设定物理边界（独立工作区）和时间边界（明确工作时段）。',
    mid: '边界管理一般——偶尔会被家庭事务打断，但总体可控。建议跟家人做一次正式沟通：明确你的工作时间、收入目标和需要的支持。',
  },
  '决策能力': {
    low: '独自拍板时容易犹豫——信息不够深、怕选错、想再研究一下。"再研究一下"是一人公司最贵的三个字。建议给每个决策设一个截止时间，到点就拍。',
    mid: '决策力中等——小事果断、大事犹豫。关键决策可以找一位同行做"决策搭子"：每周 30 分钟互相讨论一个关键决策，对方不需要比你强，只需要能问"你为什么这么想"。',
  },
  '适应事业需要': {
    low: '一人多角色快速切换对你来说比较吃力——从写代码跳到跟客户沟通，再到记账报税，每一次切换都消耗能量。建议用 AI 工具把不擅长的角色（客服、记账）自动化掉。',
    mid: '角色切换能力尚可——能适应但会累。关键是把低价值重复任务外包给工具，把精力留给高价值的核心交付。',
  },
  '对组织的责任': {
    low: '一个人扛全部责任的压力可能让你焦虑——遇到问题时容易把所有责任归到自己身上。学会区分"可控"和"不可控"，把精力集中在可控的部分。',
    mid: '责任感中等——你能承担核心责任，但偶尔会感到孤独。建议参加一个一人公司的线上社群，知道"不是我一个人在扛"。',
  },
  '市场和客户关系': {
    low: '个人 IP 和获客能力是你的短板——可能产品不错但没人知道。建议从即刻/小红书等内容渠道做自然引流而非付费投放，先用内容证明你的专业度，再谈获客。',
    mid: '市场力中等——你知道客户在哪但到达率一般。建议聚焦一个核心渠道做深耕：每天发 1 条有价值的行业洞察，持续 30 天看效果。',
  },
  '谈判技巧': {
    low: '获客报价、成交续费的沟通力是你的最短板——可能在报价上主动让步，或者不敢跟客户谈价格。一人公司的获客谈判直接决定收入天花板。建议先从"价值报价"话术练习开始：先聊对方需要什么，再报价。',
    mid: '谈判力中等——敢开口但不够精。改进方向：每次报价前先梳理你为客户创造的具体价值，不在价格上第一个开口，不给对方压价的空间。',
  },
  'AI技能运用': {
    low: '对 AI 工具的运用是你的明显短板——可能还在手动处理一些可以被 AI 自动化的工作。每天多花 2 小时在这些事情上，就是少 2 小时获客和交付。建议从 ChatGPT 日常辅助开始，逐步扩展到代码/内容/数据自动化。',
    mid: 'AI 技能中等——会用但不够深。你不是需要学更多工具，而是把 AI 嵌入核心业务流程——让它替你处理客服回复、内容初稿、数据整理。每天多出 2 小时，就是多 2 小时获客和交付。',
  },
};

// ═══════════════════════════════════════════
// 预写行动建议（按维度分类）
// ═══════════════════════════════════════════

const DIM_ACTIONS: Record<string, { action: string; impact: string }> = {
  '独立动机': { action: '每天固定一个"独立项目时间"——哪怕只做 20 分钟，先养成不依赖外部推动就能行动的习惯', impact: '预期产出：每周多 2-3 小时的独立推进时间' },
  '风险承受': { action: '做一个"最小风险测试"——用 ¥500 以内的预算验证一个商业假设，把"冒风险"变成"做实验"', impact: '预期效果：降低决策焦虑，加快验证节奏' },
  '坚韧不拔': { action: '建立"逆境日志"——每次遇到困难时记录：发生了什么、我怎么应对的、学到了什么。下次再遇到类似情况就知道自己扛得过去', impact: '预期效果：缩短从挫折中恢复的时间，增强心理韧性' },
  '自我控制': { action: '用时间块法替代待办清单——每天只排 3 个 90 分钟的深度工作段，其余时间不安排任务', impact: '预期效果：日有效产出时间提升 50%+' },
  '协调家庭社会事业': { action: '跟家人做一次正式沟通——明确你的工作时间段、收入目标和需要的支持。把"我在家工作"变成"我在家经营事业"', impact: '预期效果：减少打断，提升在家工作的专业感' },
  '决策能力': { action: '找一个同行做"决策搭子"——每周 30 分钟互相讨论一个关键决策，对方不需要比你强，只需要能问"你为什么这么想"', impact: '预期效果：决策速度提升，减少"再研究一下"的拖延' },
  '适应事业需要': { action: '梳理你每周花在非核心任务上的时间——选一件让 AI 接手（客服模板、内容初稿、记账自动化）', impact: '预期效果：每周释放 3-5 小时给核心交付' },
  '对组织的责任': { action: '写下两个清单——"我能控制的事"和"我控制不了的事"。每次焦虑时先看第二个清单，把注意力拉回第一个', impact: '预期效果：降低独自扛责任的焦虑感，更专注于可行动项' },
  '市场和客户关系': { action: '聚焦一个核心渠道深耕——选即刻/小红书/公众号其中之一，每天发 1 条有价值的行业洞察，坚持 30 天', impact: '预期效果：30 天后至少积累 5-10 条有效线索' },
  '谈判技巧': { action: '练"价值报价"话术——下次跟任何客户沟通时，先说"根据你的需求，我可以帮你做到 X"，再报价。不降价，不妥协', impact: '预期效果：客单价提升 15-30%，不再主动让价' },
  'AI技能运用': { action: '梳理一个可被 AI 全自动化的日常流程——客服回复、内容初稿、数据整理，三选一。用现成工具（ChatGPT / Claude / Cursor）落地', impact: '预期效果：每天释放 1-2 小时，相当于每月多 30-60 小时的获客/交付时间' },
};

// ═══════════════════════════════════════════
// 本地降级报告生成（纯函数，零随机）
// ═══════════════════════════════════════════

function buildFallbackReport(input: AiReportInput): AiReportOutput {
  const { dimensionScores, segmentLabel, costData } = input;

  // 找最低分 3 个维度
  const ranked = DIMENSION_NAMES
    .map((dim) => ({ dim, score: dimensionScores[dim] ?? 5 }))
    .sort((a, b) => a.score - b.score);

  const top3 = ranked.slice(0, 3);

  const opportunities = top3.map((item, i) => {
    const guide = DIM_GUIDES[item.dim];
    const description = item.score < 5 ? guide?.low : guide?.mid;

    return {
      dimension: item.dim,
      currentScore: item.score,
      targetScore: Math.min(item.score + 2, 10),
      financialImpact: costData ? undefined : undefined,
      directionGuide: description || `建议优先提升${item.dim}——这是 ROI 最高的改进方向`,
      roiRank: i + 1,
    };
  });

  const actionItems = top3.map((item, i) => {
    const act = DIM_ACTIONS[item.dim];
    return {
      action: act?.action || `重点提升"${item.dim}"：当前 ${item.score}/10，通过刻意练习提升至 ${Math.min(item.score + 2, 10)}/10`,
      expectedImpact: act?.impact || '该维度提升后预期改善经营效率与盈利能力',
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
        // 校验失败 → 降级
        setReport(buildFallbackReport(input));
        setIsFallback(true);
      }
    } catch {
      // 网络/超时 → 降级
      setReport(buildFallbackReport(input));
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, report, isFallback, generateReport };
}
