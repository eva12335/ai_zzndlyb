/**
 * 云函数调用服务层
 * 来源：TECH_DESIGN §4 数据流
 *
 * 双环境适配：
 * - 微信小程序 → wx.cloud.callFunction
 * - H5 网页 → Meoo 边缘函数
 */
import Taro from '@tarojs/taro';
import type { AiReportInput, AiReportOutput } from '../types/ai';

const FC_BASE_URL = 'https://c1uuy9cap8f4.meoo.fun/sb-api/functions/v1';

const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

/** 调用 AI 深度报告云函数 */
export async function callAiReport(input: AiReportInput): Promise<AiReportOutput> {
  // 微信小程序：走微信云开发
  if (isWeapp) {
    try {
      // @ts-ignore wx 在微信小程序环境全局可用
      const res = await wx.cloud.callFunction({ name: 'aiReport', data: input });
      const data = res.result;
      if (data?.error) {
        throw new Error(data.error);
      }
      return data as AiReportOutput;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(message);
    }
  }

  // H5：走 Meoo 边缘函数
  try {
    const { data } = await Taro.request({
      url: `${FC_BASE_URL}/ai-report`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzgyMzE1NjQwLCJleHAiOjEzMjkyOTU1NjQwfQ.kT90suM47gJeLrEcIqt-qs7QyquKiy3y87iYWZmgbf0`,
      },
      data: input,
      timeout: 8000,
    });

    if (data.error) {
      throw new Error(data.error);
    }

    return data as AiReportOutput;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(message);
  }
}
