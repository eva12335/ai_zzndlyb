/**
 * 共享 Taro 存储适配器，满足 Zustand persist Storage 接口
 * Taro H5 用 { data: "..." } 包装，setItem/getItem 封装 JSON 序列化以正确配合
 */
import Taro from '@tarojs/taro';

export const taroStorage = {
  getItem: (name: string) => {
    try {
      const value = Taro.getStorageSync(name);
      if (!value) return null;
      // Taro H5 用 { data: "..." } 包装存储值，getStorageSync 返回的可能已是对象
      if (typeof value === 'object' && !Array.isArray(value) && (value as any).data) {
        return JSON.parse((value as any).data);
      }
      if (typeof value === 'string') {
        const parsed = JSON.parse(value);
        // 二次解包：JSON.parse 后可能仍是 { data: "..." } 对象
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.data) {
          return JSON.parse(parsed.data);
        }
        return parsed;
      }
      return value;
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
