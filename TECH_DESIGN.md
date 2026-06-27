# TECH_DESIGN：一人公司罗盘

> 版本: V2.1 | 日期: 2026-06-19 | 基于: PRD V2.1（新增智能 + 用户识别 + 分享模块）

---

## 一、技术栈

| 层级 | 选型 | 版本 | 选型理由 |
|------|------|------|---------|
| 框架 | **Taro + React** | 4.x + 18 | Meoo taro-project 模板要求，支持 weapp 编译 |
| 构建 | **Taro CLI + Webpack** | 4.x | weapp-tailwindcss 在 Webpack 方案最稳定 |
| CSS | **Tailwind CSS 4** | 4.x | Meoo 强制，禁止 SCSS |
| 状态管理 | **Zustand** | 5.x | Meoo 模板要求，API 极简 |
| 图表 | **Canvas (createCanvasContext)** | Taro 4 内置 | 零依赖，原生 Canvas API，Taro 4 完全支持 |
| 高精度计算 | **decimal.js** | 10.x | 纯 JS，零 DOM 依赖，小程序可用 |
| Excel 导出 | **SheetJS mini** | latest | 专为小程序构建，~200KB |
| 本地存储 | **Taro.StorageSync** | - | 禁止 localStorage/IndexedDB |
| 国际化 | **i18next + react-i18next** | 23.x | 替代 vue-i18n |
| 部署 | **Meoo CDN** (`meoo.fun`) | - | FREE 计划零成本 |
| 语言 | **TypeScript** | 5.x | 类型安全 |
| 包管理 | **pnpm** | - | Meoo 强制要求 |
| 图标 | **lucide-react + 内联 SVG** | - | 禁止第三方图标库 |

---

## 二、项目结构

```
ai_zzndlyb/
├── config/
│   ├── index.ts              # Taro 编译主配置（Webpack + weapp-tailwindcss）
│   ├── dev.ts
│   └── prod.ts
├── src/
│   ├── app.tsx               # 根组件（含静默用户识别）
│   ├── app.config.ts         # 全局配置（pages 路由 + window + tabBar）
│   ├── app.css               # Tailwind CSS 4 入口
│   │
│   ├── pages/
│   │   ├── index/            # 首页（Hero + 测评引导 + 模式选择）
│   │   │   ├── index.tsx
│   │   │   └── index.config.ts
│   │   ├── assessment/       # 测评表（11维55题 + 进度 + AI 报告）
│   │   │   ├── index.tsx
│   │   │   └── index.config.ts
│   │   ├── roi/              # ROI 利润分析（成本输入 + 盈亏图 + 滑块 + 报表 + AI 推荐）
│   │   │   ├── index.tsx
│   │   │   └── index.config.ts
│   │   └── profile/          # 我的（项目列表 + 历史 + 头像昵称 + 设置）
│   │       ├── index.tsx
│   │       └── index.config.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── CardContainer.tsx
│   │   ├── home/
│   │   │   ├── HeroPanel.tsx         # 深蓝渐变 Hero 面板
│   │   │   └── ModeSelector.tsx      # 产品型/服务型切换
│   │   ├── assessment/
│   │   │   ├── QuestionCard.tsx      # A/B 栏对比题卡片
│   │   │   ├── AssessmentProgress.tsx # 进度条
│   │   │   ├── AssessmentResult.tsx  # 总分环 + 雷达图 + 解读
│   │   │   └── AiReportCard.tsx      # 🆕 AI 测评报告卡片（流式渲染）
│   │   ├── roi/
│   │   │   ├── CostInputCard.tsx     # 成本输入卡片（双模式字段切换）
│   │   │   ├── InsightCards.tsx      # 3 KPI 指标卡片组
│   │   │   ├── SliderGroup.tsx       # 双滑块联动（手势驱动）
│   │   │   ├── BreakEvenChart.tsx    # 盈亏平衡 Canvas 图
│   │   │   ├── CapacityWarning.tsx   # 产能天花板预警条
│   │   │   ├── ReportTabs.tsx        # 报表 Tab 切换
│   │   │   ├── ProfitLossTable.tsx   # 利润表（P&L）
│   │   │   ├── CashFlowTable.tsx     # 现金流量表
│   │   │   ├── BreakEvenDetail.tsx   # 盈亏详情
│   │   │   ├── ProfitDiagnosticCard.tsx # 🆕 利润诊断建议卡片
│   │   │   └── SmartRecommendCard.tsx # 🆕 V2 延后：智能定价推荐卡片
│   │   ├── profile/
│   │   │   ├── ProfileCard.tsx       # 用户信息面板（头像昵称，非登录）
│   │   │   └── ProjectList.tsx       # 历史项目列表
│   │   └── shared/
│   │       ├── ExportActions.tsx     # 导出按钮组
│   │       ├── SaveProjectBtn.tsx    # 保存项目
│   │       ├── ShareCard.tsx         # 🆕 分享卡片生成（SVG → 图片）
│   │       └── BottomTabBar.tsx      # 底部 4 Tab 导航
│   │
│   ├── store/
│   │   ├── useProjectStore.ts       # Zustand: 项目数据 + 计算状态
│   │   ├── useAssessmentStore.ts    # Zustand: 测评状态
│   │   └── useUserStore.ts          # 🆕 Zustand: 静默识别 + 头像昵称（非 Auth）
│   │
│   ├── hooks/
│   │   ├── useCalculation.ts        # 计算管道 hook
│   │   ├── useAiRecommend.ts        # 🆕 V2 延后：AI 推荐调用 hook（含降级逻辑）
│   │   ├── useAiReport.ts           # 🆕 AI 报告调用 hook（含流式渲染）
│   │   └── useStorage.ts            # Taro.StorageSync 封装
│   │
│   ├── services/
│   │   ├── cloudFunctions.ts        # 🆕 Meoo FC 云函数调用封装
│   │   └── shareImage.ts            # 🆕 分享图片生成（Canvas → 保存）
│   │
│   ├── utils/
│   │   ├── validateInput.ts         # 🆕 输入校验（四层防御）
│   │   ├── breakEven.ts             # 盈亏平衡计算（decimal.js）
│   │   ├── profitLoss.ts            # P&L 计算（含税种切换）
│   │   ├── cashFlow.ts              # 现金流计算（含账期+断流预警）
│   │   ├── profitDiagnostic.ts      # 🆕 利润诊断建议（规则引擎）
│   │   ├── revenueProjection.ts     # 🆕 收入预测线（增长率+扭亏月份）
│   │   ├── tax.ts                   # 🆕 税种计算（个体户/有限公司/个人）
│   │   ├── assessment.ts            # 测评评分逻辑 + 题库
│   │   ├── recommendFallback.ts     # 🆕 V2 延后：定价推荐本地降级引擎
│   │   ├── assessmentEngine.ts      # 🆕 规则引擎：四档分类+标签+段位+CTA（44段文案）
│   │   ├── validateAiReport.ts       # 🆕 AI 报告输出校验（维度名/金额/格式）
│   │   ├── validatePricingInput.ts    # 🆕 定价推荐输入校验（拒绝垃圾数据）
│   │   ├── validatePricingOutput.ts   # 🆕 定价推荐输出校验（数学公式交叉验证）
│   │   ├── format.ts                # 金额/百分比格式化
│   │   ├── excel.ts                 # SheetJS mini 导出封装
│   │   └── constants.ts             # 常量（产能上限、税率表等）
│   │
│   ├── types/
│   │   ├── project.ts               # Project, CostItem 类型
│   │   ├── calculation.ts           # 计算输入/输出类型
│   │   ├── assessment.ts            # 测评相关类型
│   │   ├── chart.ts                 # Canvas 图表数据点类型
│   │   ├── ai.ts                    # 🆕 AI 请求/响应类型
│   │   └── finance.ts               # 🆕 税务/账期/增长假设类型
│   │
│   └── i18n/
│       ├── index.ts                 # i18next + react-i18next 初始化
│       ├── zh.json
│       └── en.json
│
├── cloud/                           # 🆕 Meoo FC 云函数目录
│   ├── ai-recommend/                # 智能定价推荐
│   │   └── index.ts
│   └── ai-report/                   # 智能测评报告
│       └── index.ts
│
├── types/
│   └── global.d.ts
├── tailwind.config.ts               # 设计 token 完整映射
├── babel.config.js
├── tsconfig.json
├── project.config.json              # 微信开发者工具配置
├── package.json
└── pnpm-lock.yaml
```

---

## 三、核心模块设计

### 3.1 计算引擎（不变）

所有计算函数集中在 `src/utils/`，**纯函数，无副作用**。

**校验层**（`src/utils/validateInput.ts`，计算前执行）：

```typescript
// src/utils/validateInput.ts
interface ValidationError {
  field: string;
  msg: string;
}

interface ValidationResult {
  pass: boolean;
  level: 'ok' | 'warn';
  errors: ValidationError[];
  warnings: ValidationError[];
}

function validateInput(fields: CostFields): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // === 阻断规则 ===
  if (!fields.fixedCost || fields.fixedCost <= 0)
    errors.push({ field: 'fixedCost', msg: '固定成本必须大于 0' });
  if (fields.mode === 'product' && (!fields.unitVariableCost || fields.unitVariableCost <= 0))
    errors.push({ field: 'unitVariableCost', msg: '每件材料成本必须大于 0' });
  if (fields.fixedCost > 10_000_000 || fields.unitVariableCost > 10_000_000)
    errors.push({ field: 'fixedCost', msg: '金额超过上限' });

  // === 警告规则（不阻断计算） ===
  if (fields.unitPrice > 0 && fields.unitVariableCost > 0 && fields.unitPrice <= fields.unitVariableCost)
    warnings.push({ field: 'unitPrice', msg: `定价 ≤ 成本，每件亏 ¥${fields.unitVariableCost - fields.unitPrice}` });
  if (fields.volume && fields.volume > 999_999)
    warnings.push({ field: 'volume', msg: '月销量过大，请确认' });
  if (fields.tokenCost > fields.fixedCost * 2)
    warnings.push({ field: 'tokenCost', msg: 'Token 费用超过固定成本 2 倍' });

  return {
    pass: errors.length === 0,
    level: warnings.length > 0 ? 'warn' : 'ok',
    errors,
    warnings,
  };
}
```

**计算层**（`src/utils/breakEven.ts`）：

```typescript
// src/utils/breakEven.ts
import Decimal from 'decimal.js';

interface BreakEvenInput {
  unitPrice: Decimal;           // U - 单位收费
  unitVariableCost: Decimal;    // VC - 单位变动成本
  fixedCost: Decimal;           // FC - 月度固定成本 + Token（产品型不含获客，已并入VC）
  targetProfit?: Decimal;       // P - 目标月利润
  maxCapacity?: number;         // 产能上限（仅服务型，默认 120h）
}

interface BreakEvenOutput {
  breakEvenVolume: Decimal;     // V₀ = FC / (U - VC)
  breakEvenRevenue: Decimal;    // R₀ = FC / (1 - VC/U)
  contributionMargin: Decimal;  // U - VC
  contributionMarginRatio: Decimal; // (U-VC)/U
  requiredVolume?: Decimal;     // V = (FC + P) / (U - VC)
  capacityWarning?: string;     // 产能预警
}

function calculateBreakEven(input: BreakEvenInput): BreakEvenOutput {
  // decimal.js 实现，所有运算精确到分
}
```

三个核心计算模块：
- `validateInput.ts`：四层防御（输入控件 → 失焦校验 → 计算前校验 → 计算中保护）
- `breakEven.ts`：盈亏平衡推导 + 产能约束检查
- `profitLoss.ts`：完整 P&L 表生成
- `cashFlow.ts`：现金流量表生成（含账期模型）
- `profitDiagnostic.ts`：利润诊断建议（规则引擎，纯本地，净利润<0 时自动触发）

### 3.2 状态管理（Zustand）

```typescript
// src/store/useProjectStore.ts
interface ProjectState {
  mode: 'product' | 'service';
  projectName: string;
  fixedCost: number;
  acquisitionCostPerClient?: number;  // 🆕 获客成本/客户（服务型·可选）
  newClientsPerMonth: number;          // 🆕 月拉新客户数（服务型，默认 1）
  tokenCost: number;          // 🆕 Token 订阅月费
  unitVariableCost: number;
  unitPrice?: number;         // 可选
  volume?: number;            // 可选
  targetProfit?: number;
  maxBillableHours: number;   // 默认 120

  // 🆕 通用设置
  entityType: 'individual' | 'sole_proprietor' | 'limited_company'; // 主体类型
  paymentCycle: 0 | 30 | 60;  // 回款周期（天）
  growthRate: number;          // 月增长率 0-30%
  startupCapital: number;      // 启动资金

  // 输出（自动计算）
  breakEvenResult: BreakEvenOutput | null;
  profitLossTable: ProfitLossRow[];
  cashFlowTable: CashFlowRow[];
  revenueProjection: RevenueProjectionPoint[]; // 🆕 收入预测线数据点

  scenario: 'conservative' | 'neutral' | 'optimistic';
}
```

### 3.3 组件通信

```
                    Zustand Store (useProjectStore)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
  CostInputCard         BreakEvenPanel         ReportPanel
   (写入)                 (读写)                 (只读)
        │                     │                     │
        └──── 修改参数 ──→ 自动重算 ──→ 更新报表 + Canvas 图表
```

### 3.4 设计 token 配置

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        bg: '#eef0f4',
        surface: '#ffffff',
        navy: '#162340',
        'navy-mid': '#1e3054',
        gold: '#C5A059',
        'gold-light': 'rgba(197,160,89,0.10)',
        text: '#1a1f2e',
        'text-body': '#3a4056',
        'text-muted': '#9298a8',
        green: '#4a9c7c',
        'green-line': '#5cb894',
        red: '#d47563',
        'red-line': '#e08676',
        warm: '#e0883a',
        acq: '#c4626e',
        blue: '#517ea8',
        teal: '#4a9a9e',
        purple: '#7d6cac',
      },
      borderRadius: {
        card: '12px',
        'card-lg': '16px',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'sans-serif'],
        num: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 2px 16px rgba(197,160,89,0.18)',
        'navy': '0 4px 32px rgba(22,35,64,0.2)',
      },
    },
  },
};
```

### 3.5 智能模块设计

#### 3.5.1 智能定价推荐（五层可信度控制）【V2 延后】

```
Layer 1: 输入数据校验    →  拒绝垃圾数据（负数/零/极端值）
Layer 2: AI 定价生成      →  云函数调用大模型
Layer 3: 规则引擎验证      →  本地数学公式交叉校验 AI 结果
Layer 4: 本地降级推荐      →  可配置倍率兜底
Layer 5: 用户人工调整      →  "换一个" + "应用推荐"（Human-in-the-loop）
```

**Layer 1：输入数据校验**（两层拦截）

*L1a：输入框即时校验*（`CostInputCard.tsx` 内 `onBlur` 触发）

| 字段 | 规则 | 违规提示 |
|------|------|---------|
| 月度固定成本 | > 0，必填 | "固定成本不能为 0" |
| 每件材料成本 | > 0，必填 | "材料成本不能为 0" |
| 定价 | > 材料成本（如果填了） | "定价不能低于材料成本" |
| 月销量 | ≥ 0（如果填了） | "销量不能为负数" |
| 获客支出 | ≥ 0 | "获客支出不能为负数" |
| Token | ≥ 0 | "Token 不能为负数" |
| 月增长率 | 0% – 30% | 滑块范围锁死，无需提示 |
| 启动资金 | ≥ 0 | "启动资金不能为负数" |
| 目标月利润 | ≥ 0（如果填了） | "目标利润不能为负数" |

违规字段边框变红 + 下方红色提示文字。校验未通过前，AI 智能推荐按钮保持灰色不可点击。

*L1b：AI 调用前校验*（`src/utils/validatePricingInput.ts`）

```typescript
function validateInput(input: PricingRecommendationInput): ValidationResult {
  if (input.fixedCost <= 0) return fail('请先填写月度固定成本');
  if (input.mode === 'product' && (input.unitVariableCost ?? 0) <= 0)
    return fail('请先填写材料成本');
  if ((input.unitVariableCost ?? 0) < 0) return fail('成本不能为负数');
  if (input.unitPrice !== undefined && input.unitPrice < 0) return fail('定价不能为负数');
  if (input.unitPrice !== undefined && input.unitPrice <= (input.unitVariableCost ?? 0))
    return fail('定价必须高于材料成本');
  return pass();
}
```

**Layer 2：AI 定价生成**（`cloud/ai-recommend/index.ts`）

输入通过 Layer 1 才进入此层。云函数构建 prompt，调用 DeepSeek-v3.2（默认），返回推荐定价区间 + 理由。

**职责拆分**：AI 唯一输出 `multiplier` + `reasoning` + `riskNote`。所有价格、毛利、盈亏平衡由系统用 `breakEven.ts` 公式计算。

```typescript
// useAiRecommend.ts —— 前端拿到 AI 输出后执行
const m = aiOutput.multiplier;
const priceLow  = new Decimal(vc).times(m).times(0.9);   // 下限 = 成本 × 倍率 × 0.9
const priceHigh = new Decimal(vc).times(m).times(1.1);   // 上限 = 成本 × 倍率 × 1.1
const derivation = {
  costBase: vc,
  multiplier: m,
  grossProfitPerUnit: priceLow.minus(vc),
  grossMargin: priceLow.minus(vc).div(priceLow),
};
const bevLow  = fc.div(priceLow.minus(vc));
const bevHigh = fc.div(priceHigh.minus(vc));
```

**Layer 3：AI 输出校验**（`src/utils/validatePricingOutput.ts`）

```typescript
function validateAiOutput(output: AiPricingOutput, input: PricingRecommendationInput): boolean {
  const vc = input.unitVariableCost ?? 0;
  // 倍率边界：产品型 2-8，服务型 1.5-5
  const [minM, maxM] = input.mode === 'product' ? [2, 8] : [1.5, 5];
  if (output.multiplier < minM || output.multiplier > maxM) return false;
  // reasoning 必须引用输入数据
  if (!output.reasoning.includes(String(vc))) return false;
  // riskNote 必须引用输入数据中的字段（成本/销量/增长率/固定成本）
  // 禁止引用市场/行业/消费者/竞争对手
  return true;
}
```

超时配置：`AI_TIMEOUT_MS = 8000`（可配置），任何一项不通过 → 丢弃 AI 结果，触发 Layer 4。

**Layer 4：本地降级推荐**（`src/utils/recommendFallback.ts`）

```typescript
// 可配置倍率，不是硬编码行业经验
const DEFAULT_PRODUCT_MULTIPLIER = 3;   // 产品型：推荐定价 = 变动成本 × 倍率
const DEFAULT_SERVICE_HOURS = 80;        // 服务型：推荐时薪 = 月固定成本 ÷ 默认工时

// 产品型推荐
const price = unitVariableCost * DEFAULT_PRODUCT_MULTIPLIER;
// 服务型推荐
const hourlyRate = fixedCost / DEFAULT_SERVICE_HOURS;

// 倍率可在运营后台调整（2.5 / 3 / 4），无需改逻辑
// 结果标注"本地估算"
```

**Layer 5：用户人工调整**

- "换一个"：重新调用 AI，给不同的推荐
- "应用推荐"：用户接受，自动填入定价和销量，滑块跳到推荐位置
- 用户也可以手动修改，最终决策权在用户手上

**推导过程展示**（`SmartRecommendCard.tsx`）

不只显示最终价格，展示推导过程：

```
📊 推荐售价：¥35
  依据：单位成本 ¥5.5 × 倍率 6.4 ≈ ¥35
  预计毛利：¥29.5/杯
  预计毛利率：84.3%
```

#### 3.5.2 🆕 测评结果：你的画像（规则引擎 · 纯本地）

**核心原则**：测评结果不调用大模型。由 `assessmentEngine.ts` 规则引擎驱动，纯函数匹配，零随机。

**数据模型**（沿用《你适合创业吗》A/B 栏二选一逻辑）：

```typescript
// src/types/assessment.ts
interface DimensionScore {
  scoreA: number;  // A 栏得分 0–10（创业倾向，高=好）
  scoreB: number;  // B 栏得分 0–10（非创业倾向，高=差），scoreA + scoreB ≡ 10
}

interface AssessmentResult {
  dimensionScores: Record<string, DimensionScore>;  // 11 维度 × {scoreA, scoreB}
  totalA: number;  // A 总分 0–110
  totalB: number;  // B 总分 0–110
}
```

**规则引擎架构**：

```typescript
// src/utils/assessmentEngine.ts
// A 栏四档分类（创业倾向，高=好）
type TierA = 'excellent' | 'good' | 'weak' | 'danger';

function classifyA(scoreA: number): TierA {
  if (scoreA >= 8) return 'excellent';  // 突出优势
  if (scoreA >= 6) return 'good';       // 中等偏上
  if (scoreA >= 4) return 'weak';       // 需要注意
  return 'danger';                      // 明显短板
}

// B 栏四档分类（非创业倾向，高=差，与 A 互补但语义独立）
type TierB = 'clean' | 'mild' | 'watch' | 'severe';

function classifyB(scoreB: number): TierB {
  if (scoreB <= 2) return 'clean';      // 弱项不显著（对应 A 8-10）
  if (scoreB <= 4) return 'mild';       // 略有弱项（对应 A 6-7）
  if (scoreB <= 6) return 'watch';      // 需留意（对应 A 4-5）
  return 'severe';                      // 明显弱项（对应 A 0-3）
}

// A 侧标签映射（11维×4档 = 44个标签）
const TAG_MAP_A: Record<string, Record<TierA, string>> = {
  '独立动机':   { excellent: '高自驱', good: '有动力', weak: '动力一般', danger: '需外驱' },
  'AI技能运用': { excellent: 'AI加持', good: 'AI入门', weak: 'AI待学', danger: 'AI空白' },
  // ... 11维度 × 4档
};

// B 侧标签映射（11维×4档 = 44个标签，与 A 侧互补）
const TAG_MAP_B: Record<string, Record<TierB, string>> = {
  '独立动机':   { clean: '依赖倾向低', mild: '偶有依赖', watch: '依赖需关注', severe: '依赖倾向高' },
  'AI技能运用': { clean: '无AI抵触', mild: '轻微AI焦虑', watch: 'AI需推动', severe: 'AI抵触明显' },
  // ... 11维度 × 4档
};

// 段位公式：风险态度 × 能力标
function calculateSegment(scores: DimensionScores): Segment {
  const riskAttitude = scores['风险承受'] >= 6 ? '承受' : '回避';
  const topAbility = getTopAbility(scores); // AI加持 / 高自驱 / 市场敏感
  return SEGMENT_MAP[riskAttitude][topAbility]; // → "谨慎型技术派"等
}

// CTA 话术按段位匹配
function getCTA(segment: Segment): string {
  return CTA_MAP[segment]; // "最大的杠杆在哪" / "如何用系统替代直觉" 等
}
```

**画像渲染流程**：

```
assessment.ts 算出 11 维 {scoreA, scoreB} + 总分 {totalA, totalB}
  → classifyA(scoreA) A 四档分类 + classifyB(scoreB) B 四档分类
  → 匹配 A 侧四档解读文案（44段）+ B 侧四档解读文案（44段）= 88段
  → TAG_MAP_A / TAG_MAP_B 贴标签
  → calculateSegment() 算段位
  → getCTA() 匹配入口话术
  → 输出完整的"你的画像"页面数据（含 A/B 双分数 + 双四档标签）
```

**质量保证**：
- A 侧 44 段 + B 侧 44 段 = 88 段文案 + 标签映射 + 段位公式 + CTA 映射，全部硬编码在 `assessmentEngine.ts` 中
- 单元测试覆盖边界分数（A:0/3/4/5/6/7/8/10，B:0/2/3/4/5/6/7/10），相同输入保证相同输出
- 文案语言风格参考《你适合创业吗》A/B 栏行为描述

#### 3.5.3 🆕 AI 深度报告（付费版 · 大模型）

**核心差异**：规则引擎回答"你是什么"，AI 回答"你的画像对你具体这门生意意味着什么"。

**两类调用**：

| 场景 | 输入 | 输出 |
|------|------|------|
| 用户未填成本 | 11维分 + 段位标签 + 业务模式 | 段位分析 + 机会方向 + 优先行动 |
| 用户已填成本 | 上述 + 成本数据（fixedCost, unitPrice, volume…） | 段位分析 + 机会计算（金额）+ 优先行动 + 路线图 |

**报告四段式**：

```
🧭 段位分析  ← AI 综合 11 维给出因果链人格解释（规则引擎做不到）
💰 机会雷达  ← 短板 × 业务数据。有成本得金额，无成本得方向引导
🎯 优先行动  ← Top 3 行动，每条标注来源维度
📈 改进路线图 ← 有成本数据时显示 3/6/12 月，无成本时隐藏
```

**云函数**（`cloud/ai-report/index.ts`）：
- 输入：`AiReportInput`（含可选 costData + segmentLabel）
- 模型：DeepSeek-v3.2（默认），temperature: 0.3，max_tokens: 1,500
- 输出：`AiReportOutput`（结构见 PRD 8.2）

**幻觉防护四层**（详见 PRD 8.2 Prompt 完整约束）：

| 层 | 机制 | 说明 |
|---|------|------|
| 1. AI 不算钱 | 金额由本地 `breakEven.ts` 预计算，塞入 prompt 供 AI 引用 | 数字源头可控 |
| 2. System Prompt | 5 条核心原则 + 4 组分析规则 + 7 条禁止行为 + 格式约束 | 边界锁死 |
| 3. 前端校验 | `validateAiReport()` 校验维度名、段位名、金额误差（±5%） | 不合格→丢弃 |
| 4. 低温度+降级 | temperature 0.3，8s 超时 → 本地段位分析模板 | 最坏情况有兜底 |

**前端校验函数**（`src/utils/validateAiReport.ts`）：

```typescript
function validateAiReport(output: AiReportOutput, input: AiReportInput): boolean {
  if (output.segmentLabel !== input.segmentLabel) return false;
  if (output.opportunities.some(o => !DIMENSION_NAMES.includes(o.dimension))) return false;
  if (input.costData) { /* 金额交叉校验，误差超过 ±5% 则拒绝 */ }
  if (output.actionItems.length !== 3) return false;
  if (!input.costData && output.roadmap !== null) return false;
  return true;
}
```

### 3.6 用户识别模块（非登录）

**核心原则**：前端永远不出现"登录""注册"字眼。`useUserStore` 不含任何 auth/login 概念。

```typescript
// src/store/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';

interface UserState {
  openid: string | null;          // 微信 openid（静默获取）
  nickname: string | null;        // 用户昵称（可选）
  avatarUrl: string | null;       // 头像本地 Base64（可选）
  cloudSync: boolean;             // 云端同步（默认关闭，V2 上线）
  
  identify: () => Promise<void>;  // 静默识别（不叫 login）
  setProfile: (nickname: string, avatarUrl: string) => void;
  toggleCloudSync: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      openid: null,
      nickname: null,
      avatarUrl: null,
      cloudSync: false,
      
      identify: async () => {
        // 1. 检查本地是否已有 openid
        if (get().openid) return;
        // 2. 调用 Taro.login() 获取 code（无弹窗）
        try {
          const { code } = await Taro.login();
          // 3. 本地 hash 生成匿名标识（V1 不调用服务端）
          const anonymousId = await hashCode(code);
          set({ openid: anonymousId });
        } catch {
          // 失败不影响功能，用户仍可正常使用
        }
      },
      
      setProfile: (nickname, avatarUrl) => set({ nickname, avatarUrl }),
      toggleCloudSync: () => set(s => ({ cloudSync: !s.cloudSync })),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => ({
        getItem: (key) => Taro.getStorageSync(key),
        setItem: (key, value) => Taro.setStorageSync(key, value),
        removeItem: (key) => Taro.removeStorageSync(key),
      })),
    }
  )
);
```

**ProfileCard 头像昵称**：

```tsx
// 使用微信新版组件
<Button openType="chooseAvatar" onChooseAvatar={handleChooseAvatar}>
  <Image src={avatarUrl || DEFAULT_AVATAR} />
</Button>
<Input type="nickname" value={nickname} onInput={e => setNickname(e.detail.value)} />
```

### 3.7 分享卡片模块

**生成流程**：

```
ROI 计算结果页 → 用户点"分享"
  → ShareCard 组件渲染（隐藏 Canvas）
  → 将盈亏平衡图 + AI 总结绘制到 Canvas
  → Taro.canvasToTempFilePath() 生成图片
  → Taro.showShareImageMenu() 调起微信分享
```

**Canvas 绘制内容**：
- 顶部：🧭 一人公司罗盘 logo
- 中部：盈亏平衡 Canvas 图（复用 BreakEvenChart 的数据点，Canvas 重绘）
- 底部：AI 一句话总结 + 二维码（小程序码）
- 尺寸：750×1000px（朋友圈最佳比例）

### 3.8 🆕 财务创新模块（替代传统三张表）

传统创业计划书要求三张独立大表（销售收入预测/成本计划/现金流），一人公司罗盘将其创新为三个维度，叠加在现有输出上。

#### 3.8.1 税种切换（`src/utils/tax.ts`）

```typescript
interface TaxConfig {
  entityType: 'individual' | 'sole_proprietor' | 'limited_company';
  revenue: Decimal;
  profit: Decimal;  // 营业利润
}

interface TaxOutput {
  vat: Decimal;           // 增值税
  incomeTax: Decimal;      // 所得税
  netProfit: Decimal;      // 净利润
  comparisonTip: string;   // 对比提示（如"注册个体户每年多留 ¥X,XXX"）
}

function calculateTax(config: TaxConfig): TaxOutput {
  // 增值税：小规模纳税人 1%，季 30 万以下免
  // 所得税：个体户 5%-35% 累进 / 有限公司 5% / 个人劳务 20%-40%
}
```

#### 3.8.2 收入预测线（`src/utils/revenueProjection.ts`）

```typescript
interface RevenueProjectionInput {
  baseRevenue: Decimal;       // 首月收入
  growthRate: number;         // 0.00 - 0.30
  months: number;             // 预测月数（默认 6）
  breakEvenRevenue: Decimal;  // 盈亏平衡收入
}

interface RevenueProjectionOutput {
  points: { month: number; revenue: Decimal }[];
  breakEvenMonth: number | null;  // 扭亏月份（null = 6 个月内未扭亏）
}

function projectRevenue(input: RevenueProjectionInput): RevenueProjectionOutput {
  // 按增长率逐月计算收入
  // 找出 revenue ≥ breakEvenRevenue 的第一个月
}
```

#### 3.8.3 账期现金流（`src/utils/cashFlow.ts` 升级）

```typescript
interface CashFlowInput {
  // ...原有字段
  paymentCycle: 0 | 30 | 60;   // 🆕 回款周期
  startupCapital: number;       // 🆕 启动资金
}

// 升级逻辑：
// 即时回款：当月收入 → 当月到账
// 30 天回款：当月收入 → 下月到账
// 60 天回款：当月收入 → 隔月到账
// 断流预警：期末现金 < 0 的月份标红
// 双重预警：账面盈利但现金断流 = "账面赚钱，手里没钱"
```

### 3.9 🆕 利润诊断建议（`src/utils/profitDiagnostic.ts` · 规则引擎）

**设计原则**：利润为负时不调 AI，规则引擎在本地做根因诊断。三类根因 + 预写文案 = 零延迟、零幻觉。

**诊断引擎**：

```typescript
// src/utils/profitDiagnostic.ts

type RootCause = 'unitLoss' | 'scaleGap' | 'extraBurden';

interface ProfitDiagnosticInput {
  mode: 'product' | 'service';
  unitPrice: Decimal;         // U
  unitVariableCost: Decimal;  // VC
  volume: Decimal;            // V
  fixedCost: Decimal;         // FC（含 Token）
  acquisitionCostPerClient?: Decimal;  // 获客成本/客户（服务型）
  newClientsPerMonth?: number;          // 月拉新客户数（服务型，默认 1）
  netProfit: Decimal;         // 净利润（来自 profitLoss.ts）
  assessmentScores?: Record<string, DimensionScore>;  // 可选：测评数据
}

interface ProfitDiagnostic {
  rootCause: RootCause;
  rootCauseLabel: string;
  diagnosis: string;
  suggestions: SuggestionItem[];
  assessmentTip?: string;     // 结合测评的个性化提示
}

function diagnoseProfit(input: ProfitDiagnosticInput): ProfitDiagnostic | null {
  // 净利润 ≥ 0 → 无需诊断，返回 null
  if (input.netProfit.gte(0)) return null;

  const grossProfit = input.unitPrice.minus(input.unitVariableCost);
  const totalGrossProfit = grossProfit.times(input.volume);
  const totalFC = input.fixedCost;  // FC 已含 Token

  // 三分类诊断
  if (grossProfit.lte(0)) {
    return buildUnitLossDiagnosis(input);     // 毛利 ≤ 0
  }
  if (totalGrossProfit.lt(totalFC)) {
    return buildScaleGapDiagnosis(input);     // 毛利 > 0 但 < FC
  }
  return buildExtraBurdenDiagnosis(input);    // 毛利 > FC 但净利 < 0（税费/AC）
}
```

**三类诊断模板**（`DIAGNOSIS_TEMPLATES`）：

```typescript
const DIAGNOSIS_TEMPLATES: Record<RootCause, DiagnosisTemplate> = {
  unitLoss: {
    label: '单位亏损',
    // 产品型：每卖一件都在贴钱。服务型：每小时都在贴钱。
    suggestions: [
      { action: '提价至 ≥ X', impact: '预计扭亏，月净利 ¥Y', category: 'price' },
      { action: '降变动成本（换供应商/缩减材料）', category: 'cost' },
      { action: '如果无法提价或降本，建议暂停该项目', category: 'volume' },
    ],
  },
  scaleGap: {
    label: '规模不足',
    // 毛利为正但不够覆盖固定成本
    suggestions: [
      { action: '增量至 Y 件/月 (+Z%)', impact: '预计扭亏，月净利 ¥W', category: 'volume' },
      { action: '降低固定成本 ¥X/月', category: 'cost' },
      { action: '小幅提价辅助（+10%）', impact: '可降低盈亏平衡量至 Y 件', category: 'price' },
    ],
  },
  extraBurden: {
    label: '额外负担',
    // 毛利覆盖固定成本，但获客成本或税费侵蚀利润
    suggestions: [
      { action: '优化获客渠道，将获客成本从 ¥X/客户 降至 ¥Y/客户', category: 'acquisition' },
      { action: '更换主体类型节省税费', category: 'tax' },
      { action: '提价覆盖税费缺口（+¥Z）', category: 'price' },
    ],
  },
};
```

**测评增强**（`ASSESSMENT_TIPS`，11维 × 3根因 = 33条）：

```typescript
const ASSESSMENT_TIPS: Record<string, Record<RootCause, string>> = {
  '风险承受': {
    unitLoss: '你的风险承受力较强，可考虑激进提价 30%-50% 测试市场反应。',
    scaleGap: '风险承受力较强意味着你能承受更长的回本周期，不必急于盈利。',
    extraBurden: '',
  },
  '谈判技巧': {
    unitLoss: '谈判力是你的弱项，提价时建议先练习"价值报价"话术再做客户沟通。',
    scaleGap: '',
    extraBurden: '',
  },
  '市场和客户关系': {
    unitLoss: '',
    scaleGap: '获客是你的短板，建议从即刻/小红书等内容渠道做自然引流而非付费投放。',
    extraBurden: '你的获客成本过高可能与渠道选择有关，尝试内容营销替代付费广告。',
  },
  // ... 11维度 × 3根因
};
```

**显示逻辑**：
- ROI 页 `netProfit < 0` 时，在利润表下方自动显示诊断卡片
- 有测评数据时，从 ASSESSMENT_TIPS 匹配 1-2 条个性化追加
- 无测评数据时，仅显示通用建议

---

## 四、数据流

```
用户操作              Store动作              计算层              视图更新
─────────           ──────────            ──────────          ──────────
填写成本字段    →   updateField()     →                    → 表单视图更新
                  →                    → calculateAll()    → KPI 卡片更新
拖动滑块        →   updateSlider()    →                    → Canvas 图表更新
切换模式        →   setMode()         → 清空特有字段重算   → 字段标签联动
切换子模式      →   setRevenueModel() → 重算服务型收入     → 标签联动
导出            →                    → 读取计算结果        → 生成文件下载
保存项目        →                    → Taro.StorageSync   →
测评完成        →   setAssessment()   →                    → 诊断建议个性化增强

🆕 利润诊断      →   netProfit < 0     → profitDiagnostic   → 诊断卡片（利润表下方）
                 →  (有测评数据)        → ASSESSMENT_TIPS    → 追加个性化提示

🆕 AI 智能推荐   →   useAiRecommend   → FC 云函数 → AI   → SmartRecommendCard
                 →  (超时)            → recommendFallback  → 降级结果显示
                 →  [应用推荐]         → updateField()     → 自动填入 + 图表更新

🆕 AI 测评报告   →   useAiReport      → FC 云函数 → AI   → AiReportCard 流式渲染
                 →  (超时/失败)        → assessmentEngine   → 基础报告显示
                 →  [保存报告]         → canvasToImage     → 保存到相册

🆕 分享卡片      →   [分享]            → Canvas 重绘图表   → 调起微信分享

🆕 用户识别      →   identify()       → Taro.login()      → 静默，无 UI 变化
                 →   setProfile()     → Taro.StorageSync  → ProfileCard 更新
```

---

## 五、路由设计

```typescript
// src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/index/index',       // 首页
    'pages/assessment/index',  // 测评表
    'pages/roi/index',         // ROI 利润分析
    'pages/profile/index',     // 我的
  ],
  tabBar: {
    list: [
      { text: '首页', pagePath: 'pages/index/index', iconPath: '...' },
      { text: '测评', pagePath: 'pages/assessment/index', iconPath: '...' },
      { text: 'ROI',  pagePath: 'pages/roi/index', iconPath: '...' },
      { text: '我的', pagePath: 'pages/profile/index', iconPath: '...' },
    ],
  },
  window: {
    navigationBarBackgroundColor: '#162340',
    navigationBarTitleText: '一人公司罗盘',
    navigationBarTextStyle: 'white',
  },
});
```

---

## 六、部署架构

```
微信小程序用户
      │
      ├── Meoo CDN (meoo deploy)
      │     ├── 自动 HTTPS
      │     ├── 自定义域名 meoo.fun
      │     └── pnpm build && meoo deploy (前端静态资源)
      │
      ├── Meoo FC 云函数 (AI 调用代理)
      │     ├── cloud/ai-recommend/  → 智能定价推荐
      │     ├── cloud/ai-report/     → 智能测评报告
      │     ├── 环境变量: MEOO_PROJECT_API_KEY
      │     └── AI 模型: deepseek-v3.2 (默认) / qwen3.6-plus (备选)
      │
      ├── Taro.StorageSync (本地数据)
      │     ├── 项目数据
      │     ├── 测评记录
      │     └── 用户头像昵称
      │
      └── Supabase (V2 云端同步，按需)
            └── 用户主动开启后才同步
```

### 部署命令

```bash
pnpm build                    # taro build --type weapp → dist/
meoo deploy                   # 前端静态资源发布到 CDN + 云函数部署
```

### 成本

| 项目 | 费用 |
|------|------|
| Meoo FREE 计划 | ¥0/月 |
| FC 云函数调用 | ¥0（FREE 额度内） |
| AI 模型调用 (DeepSeek-v3.2) | ¥0（FREE 积分抵扣） |
| 微信小程序认证 | ¥300/年（如需要） |
| **合计** | **~¥0-25/月** |

---

## 七、性能目标

| 指标 | 目标 | 实现方式 |
|------|------|---------|
| 首次加载 | < 3s | Tailwind 原子化 + 代码分割 |
| 滑块响应 | < 100ms | 纯前端计算 + requestAnimationFrame |
| Canvas 图表渲染 | < 50ms | Taro createCanvasContext，零第三方库 |
| AI 推荐响应 | < 8s（超时降级） | FC 云函数 + 本地降级引擎 |
| AI 报告响应 | < 10s（超时降级） | FC 云函数 + 本地模板 |
| 分享卡片生成 | < 3s | Canvas 离屏渲染 + 单次绘制 |
| 导出 | < 2s | SheetJS mini 流式写入 |
| 离线可用 | ✓ | 纯本地计算 + Taro.StorageSync + AI 降级方案 |
| Bundle | ≤ 2MB | 微信小程序限制 |

---

## 八、依赖清单

```json
{
  "dependencies": {
    "react": "^18.0",
    "react-dom": "^18.0",
    "@tarojs/components": "^4.0",
    "@tarojs/taro": "^4.0",
    "zustand": "^5.0",
    "decimal.js": "^10.4",
    "xlsx": "latest (mini build)",
    "i18next": "^23.0",
    "react-i18next": "^14.0",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "typescript": "^5.3",
    "@tarojs/cli": "^4.0",
    "tailwindcss": "^4.0",
    "weapp-tailwindcss": "latest",
    "babel-preset-taro": "^4.0"
  }
}
```
