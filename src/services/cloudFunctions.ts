/**
 * 云函数调用服务层
 * 来源：TECH_DESIGN §4 数据流
 *
 * 双环境适配：
 * - 微信小程序 → wx.cloud.callFunction
 * - H5 网页 → Meoo 边缘函数
 *
 * AI 报告轻量化（2026-07）：
 * - 云函数只返回 segmentAnalysis，其余由前端本地模板填充
 * - H5 超时从 8s 放宽到 15s
 */
import Taro from '@tarojs/taro';

const FC_BASE_URL = 'https://c1uuy9cap8f4.meoo.fun/sb-api/functions/v1';

const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

/** AI 报告云函数返回（轻量版，只含 segmentAnalysis） */
export interface AiReportResponse {
  segmentAnalysis?: string;
  error?: string;
}

/** 调用 AI 深度报告云函数 → 只获取 segmentAnalysis */
export async function callAiReport(input: {
  totalScore: number;
  dimensionScores: Record<string, number>;
  segmentLabel: string;
}): Promise<AiReportResponse> {
  // 微信小程序：走微信云开发
  if (isWeapp) {
    try {
      // @ts-ignore wx 在微信小程序环境全局可用
      const res = await wx.cloud.callFunction({ name: 'aiReport', data: input });
      const data = res.result;
      if (data?.error) {
        throw new Error(data.error);
      }
      return { segmentAnalysis: data?.segmentAnalysis ?? '' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(message);
    }
  }

  // H5：走 Meoo 边缘函数，15s 超时
  try {
    const { data } = await Taro.request({
      url: `${FC_BASE_URL}/ai-report`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzgyMzE1NjQwLCJleHAiOjEzMjkyOTU1NjQwfQ.kT90suM47gJeLrEcIqt-qs7QyquKiy3y87iYWZmgbf0`,
      },
      data: input,
      timeout: 15000,
    });

    if (data.error) {
      throw new Error(data.error);
    }

    return { segmentAnalysis: data.segmentAnalysis ?? '' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(message);
  }
}
