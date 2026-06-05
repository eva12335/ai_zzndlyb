# AGENTS.md：AI 协作开发规范

> 面向 AI 编程助手的项目上下文文件。人类也欢迎阅读。

---

## 一、项目概述

**创业利润计划工具** — 帮创业者从"我只知道花多少钱"出发，反向推导定价、销量和盈亏平衡的 Web 工具。

**核心差异化**：不是正向填表生成利润表，而是反推——用户不知道收入项没关系，系统帮你探索。

**技术栈**：Vue 3 + TypeScript + Element Plus + ECharts + decimal.js + Pinia + IndexedDB

---

## 二、快速启动

```bash
# 初始化
cd ai_zzndlyb
npm install
npm run dev       # 开发服务器 http://localhost:5173

# 测试
npm run test      # vitest 单元测试
npm run lint      # ESLint

# 构建
npm run build     # 输出到 dist/

# 部署（纯静态，无需服务器）
npx vercel --prod        # Vercel 一键部署
# 或 git push → Cloudflare Pages 自动部署
```

---

## 三、编码规范

### 3.1 通用规则

- 使用 **TypeScript**，禁止 `any`（除非确实无法推导且有注释说明）
- 使用 Vue 3 **Composition API** + `<script setup lang="ts">`
- 组件命名：`PascalCase`（如 `CostInputCard.vue`）
- Composables：`useXxx` 前缀（如 `useCalculation.ts`）
- Utils：纯函数，无副作用，文件名小写（如 `breakEven.ts`）
- 金额计算**必须**使用 `decimal.js`，禁用 JS 原生浮点运算（`0.1 + 0.2` 问题）
- 中文注释解释**为什么**（设计意图），不解释**是什么**（代码本身已说明）

### 3.2 Vue 组件规范

```vue
<script setup lang="ts">
// 1. imports
// 2. props & emits
// 3. composables
// 4. computed
// 5. methods
// 6. lifecycle
</script>

<template>
  <!-- Element Plus 组件优先 -->
</template>

<style scoped lang="scss">
/* 使用 CSS 变量，不硬编码颜色 */
</style>
```

### 3.3 计算逻辑规范

所有财务计算函数放在 `src/utils/` 下，要求：
- 纯函数：输入 → 输出，不读 Store，不写 DOM
- 参数和返回值有完整 TypeScript 类型
- 输入/输出金额单位统一为**元**，保留 2 位小数
- 关键函数有单元测试

### 3.4 命名约定

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| Vue 组件 | PascalCase | `BreakEvenChart.vue` |
| Composable | use + PascalCase | `useCalculation.ts` |
| Util 函数 | camelCase | `calculateBreakEven()` |
| Type 接口 | PascalCase + 名词 | `BreakEvenInput` |
| CSS 变量 | kebab-case | `--color-primary` |
| i18n key | snake_case | `cost_form.title` |

---

## 四、项目结构速查

```
src/
├── components/          # UI 组件（按功能分组）
│   ├── layout/          # 布局：Header, Footer, Card
│   ├── onboarding/      # 新用户引导
│   ├── setup/           # 模式选择 + 成本输入
│   ├── analysis/        # 盈亏分析（滑块+图表）
│   ├── reports/         # 三张报表 + AI建议
│   └── shared/          # 可复用按钮/开关
├── composables/         # 状态逻辑（Pinia stores + 纯逻辑）
├── utils/               # 纯计算函数（核心引擎）
├── types/               # TypeScript 类型定义
└── assets/              # 样式、图片、i18n 文件
```

**关键原则**：
- 组件负责展示 + 用户交互，**不做计算**
- 计算逻辑在 `utils/`，组件通过 composable 调用
- Store 是唯一数据源，组件不维护本地状态副本

---

## 五、新增功能的标准流程

以新增"税费计算"为例：

```
1. types/calculation.ts     ← 加 TaxConfig 类型
2. utils/tax.ts             ← 写 calculateTax() 纯函数
3. utils/tax.spec.ts        ← 写单元测试（先写测试！）
4. composables/useCalculation.ts ← 集入计算管道
5. components/reports/ProfitLossTable.vue ← UI 展示
```

**不要**：
- 跳过类型定义直接在组件里写逻辑
- 在组件里直接做金额计算
- 新功能不写测试

---

## 六、财务计算特别注意事项

### 6.1 decimal.js 使用规范

```typescript
// ✅ 正确
import Decimal from 'decimal.js';
const profit = new Decimal(revenue).minus(new Decimal(cost));

// ❌ 错误
const profit = revenue - cost;  // 浮点精度问题
```

### 6.2 除零保护

所有除法运算必须判断分母：

```typescript
if (contributionMargin.eq(0)) {
  return { error: '单位收费不能等于变动成本' };
}
const breakEvenVolume = fixedCost.div(contributionMargin);
```

### 6.3 负数处理

利润、净利润可以为负数（亏损），直接展示，不要绕过去。

### 6.4 产能上限

服务型模式，`volume` 超过 `maxBillableHours`（默认 120）时必须触发 UI 预警。

---

## 七、测试要求

### 单元测试（必须）
- `utils/` 下所有导出函数必须有测试
- 重点测试边界条件：除零、负数、极大值、产能超限

### 测试运行
```bash
npx vitest                    # 运行所有测试
npx vitest --coverage         # 覆盖率报告
```

---

## 八、常见任务

### 8.1 加一个新计算字段

1. 在 `types/` 定义类型
2. 在 `utils/` 写计算函数 + 测试
3. 在 `useCalculation.ts` 调用
4. Store 自动更新，组件自动响应

### 8.2 修改表单字段

1. 检查 `types/project.ts` 是否已有字段
2. 在 `CostInputCard.vue` 加表单项
3. 标签文案在 i18n 文件（`public/locales/zh.json`）添加
4. 如果影响计算，同步改 `utils/`

### 8.3 改主题色

1. 改 `src/assets/styles/variables.scss` 中的 CSS 变量
2. 不要直接在组件里写死颜色

### 8.4 加新的导出格式

1. 在 `composables/useExport.ts` 加导出函数
2. 在 `AppFooter.vue` 加按钮

---

## 九、禁止事项

- ❌ 在组件里直接做金额浮点运算
- ❌ 引入新依赖不更新此文档
- ❌ 删除或修改 `utils/` 下的计算函数不更新测试
- ❌ 使用 CSS 硬编码颜色（必须用 CSS 变量）
- ❌ 在 `public/locales/` 之外硬编码中文文案
- ❌ `console.log` 提交到生产代码
- ❌ 绕过 TypeScript 类型检查（`any`、`as` 强转）

---

## 十、文档索引

| 文档 | 内容 |
|------|------|
| `PRD.md` | 产品需求：做什么、为什么、功能边界 |
| `TECH_DESIGN.md` | 技术设计：架构、选型、项目结构、部署 |
| `AGENTS.md` | 本文件：AI 协作规范 |
| `cross_reference_analysis.md` | 两份调研报告的交叉比对 |
| `research_prompt.md` | 调研提示词 |
| `创业者利润计划工具开发指南.pdf` | Deep Research 深度调研报告 |
