/**
 * i18n 国际化初始化
 * 来源：PRD §3.1 中英文切换 + TECH_DESIGN §1
 */
// eslint-disable-next-line import/no-named-as-default-member
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './zh.json';
import en from './en.json';

// eslint-disable-next-line import/no-named-as-default-member
i18next.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: 'zh',              // 默认中文
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,   // React 已处理 XSS
  },
});

export default i18next;
