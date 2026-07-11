/**
 * AI 深度测评报告云函数（轻量化版）
 * 来源：PRD §8.2 + TECH_DESIGN §3.5.3
 *
 * 职责：接收测评数据 → 调 Meoo 内置 AI（千问）生成 segmentAnalysis → 返回
 * 部署：meoo fn deploy ai-report
 * 鉴权：使用 MEOO_PROJECT_API_KEY（Meoo AI 服务开通后自动注入）
 *
 * 优化策略（2026-07）：
 * - AI 只生成 segmentAnalysis 一段（~200 tokens），其余由前端本地模板提供
 * - System Prompt 从 65 行精简到 ~15 行
 * - 超时从 20s 降到 15s，实际 AI 响应预期 2-4s
 */

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `你是一人公司画像分析师。基于用户提供的11维度测评数据，生成一段150-250字的综合画像分析。

规则：
1. 必须同时引用至少两个维度得分作为依据
2. 所有结论必须直接来源于输入数据，不得编造
3. 不允许推断职业、行业、收入、家庭情况、商业模式
4. 禁止仅凭单一维度生成整体画像
5. 不知道就不说——省略结论比编造结论更好

只返回 JSON，不要其他任何内容：{"segmentAnalysis":"你的分析内容"}`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('MEOO_PROJECT_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'MEOO_PROJECT_API_KEY 未配置，请在 Meoo 控制台开通 AI 服务' }),
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

    // 构建用户消息（仅传 segmentAnalysis 所需数据）
    const userMessage = JSON.stringify({
      segmentLabel: input.segmentLabel,
      totalScore: input.totalScore,
      dimensionScores: input.dimensionScores,
    }, null, 2);

    // 调 Meoo 内置 AI（qwen-turbo 轻量版），10s 超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch('https://api.meoo.host/meoo-ai/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v3.2',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        stream: false,
        temperature: 0.3,
        max_tokens: 400,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Meoo AI API error:', response.status, errText);
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

    // 只返回 segmentAnalysis，其余由前端本地模板填充
    return new Response(
      JSON.stringify({ segmentAnalysis: parsed.segmentAnalysis ?? '' }),
      { headers: corsHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI report error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: corsHeaders },
    );
  }
});
