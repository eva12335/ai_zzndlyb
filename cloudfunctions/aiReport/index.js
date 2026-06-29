/**
 * 微信云函数 — AI 深度测评报告
 *
 * 接收测评数据 → 调千问 API → 返回结构化报告
 * 环境变量：在云函数配置中设置 DASHSCOPE_API_KEY
 */
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const SYSTEM_PROMPT = `你是一人公司画像分析师（Entrepreneurial Persona Analyst）。

══════════════ 核心原则 ══════════════
1. 所有结论必须直接来源于输入数据。
2. 如果无法从输入数据推导，不要输出该结论。
3. 不允许补充用户未提供的信息。
4. 不允许推断职业、行业、收入、家庭情况、商业模式。
5. 不允许推断人格特质（除非维度直接测量该特质）。
6. 不知道就不说——省略结论比编造结论更好。
7. 不能编造 financialImpact 金额——costData 中已包含预计算值，直接引用。

══════════════ 分析规则 ══════════════
优势分析：
  仅选择得分最高的 2~3 个维度。
  每个优势结论必须引用至少一个维度得分。

机会雷达：
  仅选择得分最低的 2~3 个维度。
  每个短板分析必须引用该维度的当前分值。
  有 costData 时附加预计算的 financialImpact，无 costData 时 financialImpact 为空字符串 ""。

综合画像（segmentAnalysis）：
  必须同时引用至少两个维度得分作为依据。
  禁止仅凭单一维度生成整体画像。

行动建议（actionItems）：
  必须对应低分维度，每条建议标注来源维度名。
  数量：固定 3 条。

══════════════ 禁止行为 ══════════════
- 禁止编造用户未提供的财务数字、市场数据、行业对标
- 禁止推荐具体商业平台、社群名称、课程、工具品牌
- 禁止给出"你应该辞职""你应该贷款"等人生决策建议
- 禁止维度外推
- 禁止使用"研究表明""行业平均""通常来说"等无依据表述
- 禁止编造或修改 financialImpact 中的金额
- segmentAnalysis 字数控制在 150-250 字

══════════════ 格式约束 ══════════════
- 严格按照 JSON Schema 返回，不得新增字段
- 用户无 costData 时，financialImpact 字段必须为空字符串 ""
- 用户无 costData 时，roadmap 字段必须为 null
- 用户有 costData 时，roadmap 必须包含 3 条（3个月/6个月/12个月）`;

exports.main = async (event, context) => {
  const { dimensionScores, segmentLabel, totalScore, mode, projectName, costData } = event;

  if (!dimensionScores || !segmentLabel) {
    return { error: '缺少必要参数：dimensionScores, segmentLabel' };
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return { error: 'DASHSCOPE_API_KEY 未配置，请在云函数环境变量中设置' };
  }

  const userMessage = JSON.stringify({
    segmentLabel,
    totalScore: totalScore ?? null,
    dimensionScores,
    mode: mode ?? null,
    projectName: projectName ?? null,
    costData: costData ?? null,
  }, null, 2);

  try {
    const https = require('https');

    const response = await new Promise((resolve, reject) => {
      const url = new URL('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
      const body = JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const req = https.request({
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });

    if (response.status !== 200) {
      return { error: `AI 服务暂不可用 (${response.status})`, detail: response.data.slice(0, 200) };
    }

    const result = JSON.parse(response.data);
    const content = result?.choices?.[0]?.message?.content;

    if (!content) {
      return { error: 'AI 返回为空' };
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { error: 'AI 返回格式异常' };
    }

    return parsed;
  } catch (error) {
    return { error: error.message || '未知错误' };
  }
};
