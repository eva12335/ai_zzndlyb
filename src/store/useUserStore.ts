/**
 * 用户状态管理（静默识别，非登录/注册）
 * 来源：TECH_DESIGN §3.6 静默识别设计
 *
 * 设计原则：
 * - 用户打开即用，无登录/注册 UI
 * - openid 仅作为本地匿名标识，不关联真实身份
 * - 昵称/头像为纯个性化设置，不用于追踪
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Taro from '@tarojs/taro';

interface UserState {
  openid: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  cloudSync: boolean;
  assessmentCount: number;
  analysisCount: number;

  identify: () => Promise<void>;
  setProfile: (nickname: string, avatarUrl: string) => void;
  toggleCloudSync: () => void;
  incrementAssessmentCount: () => void;
  incrementAnalysisCount: () => void;
}

// 简单哈希函数（无 crypto 依赖，兼容小程序环境）
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return 'u_' + Math.abs(hash).toString(36);
}

// 兜底：生成本地匿名标识，不依赖微信 code
function randomId(): string {
  return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

// Taro 存储适配器，满足 zustand persist Storage 接口
const taroStorage = {
  getItem: (name: string) => {
    try {
      const value = Taro.getStorageSync(name);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: unknown): void => {
    try {
      Taro.setStorageSync(name, JSON.stringify(value));
    } catch {
      // 静默处理写入失败
    }
  },
  removeItem: (name: string): void => {
    try {
      Taro.removeStorageSync(name);
    } catch {
      // 静默处理删除失败
    }
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      openid: null,
      nickname: null,
      avatarUrl: null,
      cloudSync: false,
      assessmentCount: 0,
      analysisCount: 0,

      identify: async () => {
        // 已有标识则跳过，避免重复调用
        if (get().openid) return;

        try {
          const loginRes = await Taro.login();
          if (loginRes.code) {
            const id = simpleHash(loginRes.code);
            set({ openid: id });
            return;
          }
        } catch {
          // Taro.login 可能因隐私协议等原因失败
          // 静默降级：使用本地随机 ID，确保应用始终可用
        }

        // 兜底：生成本地匿名标识
        const fallbackId = randomId();
        set({ openid: fallbackId });
      },

      setProfile: (nickname: string, avatarUrl: string) => {
        set({ nickname, avatarUrl });
      },

      toggleCloudSync: () => {
        set((s) => ({ cloudSync: !s.cloudSync }));
      },

      incrementAssessmentCount: () => {
        set((s) => ({ assessmentCount: s.assessmentCount + 1 }));
      },

      incrementAnalysisCount: () => {
        set((s) => ({ analysisCount: s.analysisCount + 1 }));
      },
    }),
    {
      name: 'solopreneur-user',
      storage: taroStorage,
    }
  )
);
