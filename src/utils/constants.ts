/**
 * 全局常量
 */

/** 服务型产能上限（默认月最大计费小时） */
export const MAX_BILLABLE_HOURS = 120;

/** 收入预测默认月数 */
export const PROJECTION_MONTHS = 6;

/** 月增长率默认值 */
export const DEFAULT_GROWTH_RATE = 10;

/** 金额输入上限 */
export const MAX_AMOUNT = 10_000_000;

/** 业务量输入上限 */
export const MAX_VOLUME = 999_999;

/** AI 调用超时（毫秒） */
export const AI_TIMEOUT_MS = 8000;

/** 税率表 */
export const TAX_RATES = {
  /** 小规模纳税人增值税率 */
  vat_small: 0.01,
  /** 一般纳税人增值税率 */
  vat_general: 0.06,
  /** 企业所得税 */
  corporate_income: 0.05,
  /** 分红税率 */
  dividend: 0.20,
} as const;

/** 三场景收入系数 */
export const SCENARIO_FACTORS = {
  conservative: 0.7,
  neutral: 1.0,
  optimistic: 1.3,
} as const;

/** 产品型推荐倍率（降级用） */
export const DEFAULT_PRODUCT_MULTIPLIER = 3;

/** 服务型推荐工时（降级用） */
export const DEFAULT_SERVICE_HOURS = 80;

/** 测评满分 */
export const ASSESSMENT_MAX_SCORE = 110;

/** 维度满分 */
export const DIMENSION_MAX_SCORE = 10;

/** 测评准备度阈值 */
export const READINESS_THRESHOLD = 55;
