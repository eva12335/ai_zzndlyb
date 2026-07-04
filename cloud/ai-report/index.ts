/**
 * AI 深度测评报告云函数
 * 来源：PRD §8.2 + TECH_DESIGN §3.5.3
 *
 * 职责：接收测评数据 → 调千问 API 生成个性化报告 → 返回结构化 JSON
 * 部署：meoo fn deploy ai-report
 * 环境变量：DASHSCOPE_API_KEY（需通过 meoo secrets set 配置）
 */

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  示例：正确 → "独立动机 9 分，说明你具有较强的自主驱动力。"
        错误 → "你是一个执行力很强的人。"

机会雷达：
  仅选择得分最低的 2~3 个维度。
  每个短板分析必须引用该维度的当前分值。
  有 costData 时附加预计算的 financialImpact，无 costData 时 financialImpact 为空字符串 ""。

综合画像（segmentAnalysis）：
  必须同时引用至少两个维度得分作为依据。
  禁止仅凭单一维度生成整体画像。
  示例：正确 → "独立动机 9 分 + AI 技能 8 分 → 具备独立开展业务的基础条件"
        错误 → "独立动机 9 分 → 你一定适合创业"

行动建议（actionItems）：
  必须对应低分维度，每条建议标注来源维度名。
  数量：固定 3 条。
  risk 评估：低分维度且该维度对独立经营至关重要 → high；中等 → medium；轻微 → low。

══════════════ 禁止行为 ══════════════
- 禁止编造用户未提供的财务数字、市场数据、行业对标
- 禁止推荐具体商业平台、社群名称、课程、工具品牌
- 禁止给出"你应该辞职""你应该贷款"等人生决策建议
- 禁止维度外推——把某个维度得分扩展为未测量的特征
  示例：谈判力低 ≠ 不善沟通、风险承受低 ≠ 害怕失败、决策力低 ≠ 缺乏领导力
- 禁止使用"研究表明""行业平均""通常来说"等无依据表述
- 禁止编造或修改 financialImpact 中的金额
- segmentAnalysis 字数控制在 150-250 字

══════════════ 格式约束 ══════════════
- 严格按照 JSON Schema 返回，不得新增字段
- 用户无 costData 时，financialImpact 字段必须为空字符串 ""
- 用户无 costData 时，roadmap 字段必须为 null
- 用户有 costData 时，roadmap 必须包含 3 条（3个月/6个月/12个月）`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('DASHSCOPE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'DASHSCOPE_API_KEY 未配置，请在项目中设置该环境变量' }),
        { status: 503, headers: corsHeaders },
      );
    }

    const input = await req.json();
    if (!input || !input.dimensionScores || !input.segmentLabel) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数：dimensionScores, segmentLabel' }),
        { status: 400, headers: corsHeaders },
      );
    }

    // 构建用户消息
    const userMessage = JSON.stringify({
      segmentLabel: input.segmentLabel,
      totalScore: input.totalScore,
      dimensionScores: input.dimensionScores,
      mode: input.mode ?? null,
      projectName: input.projectName ?? null,
      costData: input.costData ?? null,
    }, null, 2);

    // 调千问 API（DashScope OpenAI 兼容接口）
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('千问 API error:', response.status, errText);
      return new Response(
        JSON.stringify({ error: `AI 服务暂不可用 (${response.status})`, detail: errText.slice(0, 200) }),
        { status: 502, headers: corsHeaders },
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'AI 返回为空' }),
        { status: 502, headers: corsHeaders },
      );
    }

    // 解析 JSON
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({ error: 'AI 返回格式异常' }),
        { status: 502, headers: corsHeaders },
      );
    }

    return new Response(JSON.stringify(parsed), { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI report error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: corsHeaders },
    );
  }
});
