# AGENTS.md：AI 协作开发规范

> 面向 AI 编程助手的项目上下文文件。人类也欢迎阅读。

---

## 一、项目概述

**一人公司罗盘** — 面向 AI 时代超级个体的微信小程序利润探索工具。

**核心差异化**：不是正向填表生成利润表，而是反推——用户不知道收入项没关系，系统帮你探索。定价和销量均可留空。

**技术栈**：Taro 4.x + React 18 + Tailwind CSS 4 + Zustand + decimal.js + Taro.StorageSync + 纯内联 SVG

**平台**：Meoo (`meoo deploy` → 微信小程序 weapp)

---

## 二、快速启动

```bash
# 初始化（Meoo 环境已就绪）
cd ai_zzndlyb
pnpm install
pnpm dev         # Taro dev server http://localhost:3015 (strictPort)

# 构建
pnpm build       # taro build --type weapp → dist/

# 部署
meoo deploy      # 发布到 CDN

# 开发环境要求
# Node.js ≥ 20.19, pnpm, Meoo CLI v0.2.8+
```

---

## 三、编码规范

### 3.1 通用规则

- 使用 **TypeScript**，禁止 `any`（除非确实无法推导且有注释说明）
- 使用 React 函数组件 + Hooks
- 组件命名：`PascalCase`（如 `CostInputCard.tsx`）
- Hooks：`useXxx` 前缀（如 `useCalculation.ts`）
- Utils：纯函数，无副作用，文件名小写（如 `breakEven.ts`）
- 金额计算**必须**使用 `decimal.js`，禁用 JS 原生浮点运算
- 所有文案通过 i18n 管理，不硬编码在组件中

### 3.2 React 组件规范

```tsx
// 1. imports
import { View, Text } from '@tarojs/components';
import { useProjectStore } from '@/store/useProjectStore';

// 2. types
interface Props { title: string; }

// 3. component
export default function MyComponent({ title }: Props) {
  // 3a. hooks
  const data = useProjectStore(s => s.data);

  // 3b. derived state
  const computed = useMemo(() => ..., [data]);

  // 3c. handlers
  const handleClick = useCallback(() => { ... }, []);

  // 3d. render
  return <View className="card p-4">...</View>;
}
```

### 3.3 Taro 特定规范

- 使用 `@tarojs/components` 的 `<View>`, `<Text>`, `<Input>`, `<Picker>`，禁止原生 HTML 标签
- 禁止使用 `<Button>`——用 `<View onClick>` + Tailwind 替代
- 日期/枚举选择用 `<Picker>`，不用 `<Input>`
- 存储统一用 `Taro.setStorageSync / getStorageSync`，禁止 `localStorage`/`IndexedDB`
- 禁止 `import { supabase }` 等后端直连——所有云调用经 API 层

### 3.4 Tailwind CSS 规范

- 所有颜色、间距、阴影在 `tailwind.config.ts` 中预定义
- 禁止任意值语法：`w-[340px]`、`bg-[#562aff]`（小程序不兼容）
- 禁止 `peer-*` / `group-*` 修饰符
- 类名必须为字符串字面量——不能用动态拼接
- 图标使用 `lucide-react` 或内联 SVG

### 3.5 计算逻辑规范

所有财务计算函数放在 `src/utils/` 下，要求：
- 纯函数：输入 → 输出，不读 Store，不写 DOM
- 参数和返回值有完整 TypeScript 类型
- 输入/输出金额单位统一为**元**，保留 2 位小数
- 关键函数有单元测试
- 固定成本计算必须包含 Token（月）

### 3.6 命名约定

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| React 组件 | PascalCase | `BreakEvenChart.tsx` |
| Hook | use + PascalCase | `useCalculation.ts` |
| Util 函数 | camelCase | `calculateBreakEven()` |
| Type 接口 | PascalCase + 名词 | `BreakEvenInput` |
| i18n key | snake_case | `cost_form.title` |
| 页面目录 | kebab-case | `pages/roi/index.tsx` |

---

## 四、项目结构速查

```
src/
├── pages/                # 页面（4 Tab + 分页跳转）
│   ├── index/            # 首页
│   ├── assessment/       # 测评表
│   ├── roi/              # ROI 利润分析
│   └── profile/          # 我的
├── components/           # UI 组件（按功能分组）
│   ├── layout/           # 通用布局
│   ├── home/             # 首页专用
│   ├── assessment/       # 测评专用
│   ├── roi/              # ROI 专用
│   ├── profile/          # 我的专用
│   └── shared/           # 可复用组件
├── store/                # Zustand stores
├── hooks/                # 自定义 Hooks
├── utils/                # 纯计算函数（核心引擎）
│   ├── validateInput.ts      # 输入校验（四层防御）
│   ├── breakEven.ts          # 盈亏平衡推导
│   ├── profitLoss.ts         # 利润表（P&L）
│   ├── cashFlow.ts           # 现金流量表
│   ├── profitDiagnostic.ts   # 利润诊断建议（规则引擎）
│   ├── revenueProjection.ts  # 收入预测线
│   ├── tax.ts                # 税费计算
│   ├── assessment.ts         # 测评评分逻辑
│   ├── assessmentEngine.ts   # 画像规则引擎（四档+段位+标签）
│   └── format.ts / excel.ts # 格式化 & 导出
├── types/                # TypeScript 类型定义
└── i18n/                 # 国际化语言文件
```

**关键原则**：
- 组件负责展示 + 用户交互，不做计算
- 计算逻辑在 `utils/`，组件通过 hook 调用
- Store 是唯一数据源，组件不维护本地状态副本

---

## 五、新增功能的标准流程

以新增"税费计算"为例：

```
1. types/calculation.ts     ← 加 TaxConfig 类型
2. utils/tax.ts             ← 写 calculateTax() 纯函数
3. utils/tax.spec.ts        ← 写单元测试
4. hooks/useCalculation.ts  ← 集入计算管道
5. components/roi/ProfitLossTable.tsx ← UI 展示
```

**不要**：
- 跳过类型定义直接在组件里写逻辑
- 在组件里直接做金额计算
- 新功能不写测试

---

## 六、财务计算特别注意

### 6.1 decimal.js 使用规范

```typescript
// ✅ 正确
import Decimal from 'decimal.js';
const profit = new Decimal(revenue).minus(new Decimal(cost));

// ❌ 错误
const profit = revenue - cost;  // 浮点精度问题
```

### 6.2 总固定成本计算

```typescript
const totalFC = new Decimal(fixedCost).plus(new Decimal(tokenCost));
// 服务型额外：获客成本按客户独立计算，不获客为零
```

### 6.3 除零保护

```typescript
if (contributionMargin.eq(0)) {
  return { error: '单位收费不能等于变动成本' };
}
const breakEvenVolume = fixedCost.div(contributionMargin);
```

### 6.4 产能上限

服务型模式，`volume` 超过 `maxBillableHours`（默认 120h）时必须触发 UI 橙色预警。

---

## 七、测试要求

### 单元测试（必须）
- `utils/` 下所有导出函数必须有测试
- 重点测试边界条件：除零、负数、Token 纳入计算、产能超限

### 测试运行
```bash
npx vitest                    # 运行所有测试
```

---

## 八、文档索引

| 文档 | 内容 |
|------|------|
| `PRD.md` | 产品需求：做什么、为什么、功能边界 |
| `TECH_DESIGN.md` | 技术设计：架构、选型、项目结构、部署 |
| `AGENTS.md` | 本文件：AI 协作规范 |
| `cross_reference_analysis.md` | 调研报告交叉比对 |
| `research_prompt.md` | 调研提示词 |
| `showroom.html` | 样板间 V1：4 页面 JS 交互版（参考用） |
| `showroom-v4.html` | 样板间 V2.1（V1 定稿）：7 屏静态，产品型+服务型均内嵌利润表/现金流/盈亏详情，含分享卡片、时薪定价参考 |
| `AI定价推荐-V2备忘` | Obsidian：AI 定价推荐功能延后到 V2 的决策记录 |

---

## 九、禁止事项

- ❌ 在组件里直接做金额浮点运算
- ❌ 使用 Element Plus / ant-design-vue / naive-ui 等第三方 UI 库
- ❌ 使用 SCSS/SASS
- ❌ 引入新依赖不更新此文档
- ❌ 删除或修改 `utils/` 下的计算函数不更新测试
- ❌ 使用 CSS 硬编码颜色（必须用 Tailwind token）
- ❌ 在 `src/i18n/` 之外硬编码中文文案
- ❌ `console.log` 提交到生产代码
- ❌ 出现"企业""公司"字眼——统一用"事业"（产品名"一人公司罗盘"除外）
- ❌ 使用原生 HTML 标签（`<div>`, `<span>`, `<button>`）——用 Taro 组件
- ❌ 引入 ECharts / 使用内联 SVG（WXML 不渲染 SVG 标签）——图表全部用 `Taro.createCanvasContext(canvasId)` 原生 Canvas API

---

## 十、微信小程序平台约束（血的教训 · 2026-06-21）

> **核心原则：样板间是设计稿，小程序是施工环境。样板间的效果，必须经过平台可行性筛选后再实施。**

### 10.1 动手前必做：平台可行性检查

每次接到 UI 任务，第一步不是写代码，而是对照下表：

| 样板间用了什么 | 小程序能不能做 | 不能做的话用什么替代 |
|--------------|-------------|-----------------|
| SVG（`<svg>`, `<circle>`, `<polyline>` 等） | ❌ WXML 不渲染 SVG 标签 | 原生 Canvas `createCanvasContext` API |
| ECharts（`echarts` + `echarts-for-weixin`） | ❌ `addEventListener` 不可用，Taro+Vite 下桥接层失效 | 原生 Canvas `createCanvasContext` API |
| `rich-text` + 静态 SVG 字符串 | ⚠️ 能渲染但无法动态更新 | 只适用于分享卡片等静态场景 |
| `display: grid` | ❌ 不支持 | `display: flex` |
| CSS 变量 `var(--xxx)` | ❌ 部分失效 | 硬编码色值（`#C5A059` 等） |
| `boxShadow` 外发光（spread radius） | ❌ 不支持 | `border` 替代 |
| `gap` in flex | ⚠️ 低版本不支持 | `marginRight` / `marginBottom` 替代 |
| `position: absolute` 于交互元素 | ⚠️ 可能吞事件 | 用 flex 布局替代 |
| Canvas 2D (`type="2d"`) | ⚠️ 原生浮层，脱离文档流 | 旧版 Canvas API (`canvasId`) |

### 10.2 验证铁律

```
改代码 → pnpm build:weapp → 微信开发者工具看效果 → 确认无误 → 告诉用户"好了"

禁止：改代码 → pnpm dev:web（H5 浏览器）→ "好了"
禁止：改代码后不构建，凭理论说"应该没问题"
```

### 10.3 变更范围控制

- 用户提一个问题 → 只修那个问题相关的代码
- 禁止顺手改"看起来可以优化"的不相关代码
- 禁止大面积重构布局（如 flex → grid → flex 来回跳）
- 如果修 A 问题时发现 B 也坏了 → 先告知用户，确认后再修 B

### 10.4 与用户协作

- 效果做不出来 → 直说，给出替代方案让用户选
- 不确定怎么做 → 先问，不猜
- 用户说不行 → 先理解现象，再定位原因，再改
- 每轮改动不超过 3 个文件
- **废弃 `pnpm dev:web`**：本项目只用 `pnpm build:weapp` + 微信开发者工具验证

### 10.5 图表绘制：Canvas createCanvasContext 使用规范（2026-06-21 实战验证）

**唯一正确路径**：Taro 4.x 旧版 Canvas API。

```tsx
import { Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';

// 1. Canvas 组件：canvasId 标识，不含 type 属性
<Canvas canvasId="my-chart" style={{ width: '300px', height: '240px' }} />

// 2. useEffect 中获取 CanvasContext 并绘制
const ctx = Taro.createCanvasContext('my-chart');
ctx.clearRect(0, 0, W, H);   // 清空
ctx.beginPath();              // 开始路径
ctx.arc(cx, cy, r, 0, 2*PI); // 绘制
ctx.setFillStyle('#C5A059');  // 填充色（必须用色值，不用 CSS 变量）
ctx.fill();                   // 填充
ctx.setFontSize(14);          // 字号
ctx.setFillStyle('#162340');  // 文字色
ctx.setTextAlign('center');   // 对齐
ctx.fillText('Hello', x, y);  // 文字
ctx.stroke();                 // 描边
ctx.setLineDash([5, 4], 0);   // 虚线
ctx.draw();                   // 提交渲染（必须调用！）
```

**规则**：
- ✅ 使用 `<Canvas canvasId="xxx" />`（不带 `type` 属性）
- ✅ 使用 `Taro.createCanvasContext('xxx')` 获取绘制上下文
- ✅ 颜色直接硬编码色值（`#C5A059`），不用 CSS 变量
- ✅ 数据变化时 `useEffect` deps 触发重绘
- ❌ 禁止 `type="2d"`（原生浮层，z-index 失控）
- ❌ 禁止在 Canvas 内使用 CSS 变量
- ❌ 禁止用 `SelectorQuery` 获取 Canvas 节点（那是 Canvas 2D 路径）
- ❌ 禁止忘记 `ctx.draw()`——不调用则画布不更新
