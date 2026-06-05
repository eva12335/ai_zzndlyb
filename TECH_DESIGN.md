# TECH_DESIGN：创业者利润计划工具

> 版本: V1.0 | 日期: 2026-06-05 | 基于: 两份调研报告交叉比对结论

---

## 一、技术栈

| 层级 | 选型 | 版本 | 选型理由 |
|------|------|------|---------|
| 框架 | **Vue.js** | 3.4+ | 中文生态好，Element Plus 配套成熟 |
| 构建 | **Vite** | 5.x | Vue 生态标配，HMR 快 |
| UI 库 | **Element Plus** | 2.x | Table/Form 组件丰富，适合财务报表场景 |
| 状态管理 | **Pinia** | 2.x | Vue 3 官方推荐 |
| 图表 | **ECharts** | 5.x | 两份调研唯一共同推荐，中文文档完善 |
| 高精度计算 | **decimal.js** | 10.x | 两份调研唯一共同推荐，解决浮点精度 |
| Excel 导出 | **ExcelJS** | 4.x | 两份调研共同推荐 |
| PDF 导出 | **浏览器打印** | - | MVP 零依赖，@media print |
| 本地存储 | **idb** (IndexedDB 封装) | 8.x | 零后端，隐私合规 |
| 国际化 | **i18next** + **vue-i18n** | 9.x / 9.x | 两份调研共同推荐 |
| 认证 | **Supabase Auth** | - | 免费额度够用，支持邮箱注册 |
| 部署 | **Vercel** (默认) / **Cloudflare Pages** (国内更快) | - | 免费，自定义域名 ¥50/年 |
| 语言 | **TypeScript** | 5.x | 类型安全，财务计算不能出类型错 |
| CSS | **SCSS** + **Element Plus 变量覆盖** | - | 主题色定制需要 |

---

## 二、项目结构

```
profit-planner/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json              # Vercel 部署配置
├── .env.example
│
├── public/
│   ├── favicon.svg
│   ├── manifest.json          # PWA
│   └── locales/               # i18n 语言文件
│       ├── zh.json
│       └── en.json
│
├── src/
│   ├── main.ts                # 入口
│   ├── App.vue                # 根组件
│   ├── router/
│   │   └── index.ts           # 路由（可选，单页可不要）
│   │
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── variables.scss # CSS 变量 + 双主题色
│   │   │   ├── global.scss    # 全局样式
│   │   │   ├── product.scss   # 产品型主题（暖橙）
│   │   │   └── service.scss   # 服务型主题（冷蓝）
│   │   └── images/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue       # 顶部导航栏
│   │   │   ├── AppFooter.vue       # 底部操作栏
│   │   │   └── CardContainer.vue   # 通用卡片容器
│   │   │
│   │   ├── onboarding/
│   │   │   └── OnboardingOverlay.vue # 3步引导弹窗
│   │   │
│   │   ├── setup/
│   │   │   ├── ModeSelector.vue      # 模式选择（产品型/服务型）
│   │   │   ├── ProjectCard.vue       # 项目信息卡片
│   │   │   └── CostInputCard.vue     # 成本输入表单卡片
│   │   │
│   │   ├── analysis/
│   │   │   ├── InsightCards.vue      # 3个关键指标卡片组
│   │   │   ├── SliderGroup.vue       # 双滑块联动组件
│   │   │   ├── BreakEvenChart.vue    # ECharts 盈亏平衡图
│   │   │   └── CapacityWarning.vue   # 产能天花板预警条
│   │   │
│   │   ├── reports/
│   │   │   ├── ReportPanel.vue       # 报表区容器
│   │   │   ├── ReportTabs.vue        # 报表 Tab 切换
│   │   │   ├── ProfitLossTable.vue   # 利润表
│   │   │   ├── CashFlowTable.vue     # 现金流量表
│   │   │   ├── BreakEvenDetail.vue   # 盈亏详情
│   │   │   └── AiAdviceBanner.vue    # AI 建议文案横幅
│   │   │
│   │   └── shared/
│   │       ├── ExportExcelBtn.vue    # Excel 导出按钮
│   │       ├── ExportPdfBtn.vue      # PDF 导出按钮
│   │       ├── SaveProjectBtn.vue    # 保存项目按钮
│   │       ├── ThemeToggle.vue       # 模式/主题切换
│   │       └── LangToggle.vue        # 语言切换
│   │
│   ├── composables/
│   │   ├── useCalculation.ts    # 五大模块计算引擎（核心）
│   │   ├── useProjectStore.ts   # Pinia store：项目数据+计算状态
│   │   ├── useTheme.ts          # 双主题切换逻辑
│   │   ├── useI18n.ts           # i18next 初始化与切换
│   │   ├── useStorage.ts        # IndexedDB 读写封装
│   │   └── useExport.ts         # Excel/PDF 导出逻辑
│   │
│   ├── types/
│   │   ├── project.ts           # Project, CostItem 等核心类型
│   │   ├── calculation.ts       # 计算输入/输出类型
│   │   └── chart.ts             # 图表配置类型
│   │
│   └── utils/
│       ├── breakEven.ts         # 盈亏平衡计算函数
│       ├── profitLoss.ts        # P&L 计算函数
│       ├── cashFlow.ts          # 现金流计算函数
│       ├── format.ts            # 金额/百分比格式化
│       └── constants.ts         # 行业默认值、产能上限等常量
│
└── tests/
    ├── unit/
    │   ├── breakEven.spec.ts    # 盈亏平衡计算单元测试
    │   ├── profitLoss.spec.ts   # P&L 计算单元测试
    │   └── cashFlow.spec.ts     # 现金流计算单元测试
    └── e2e/
        └── main-flow.spec.ts    # 端到端：完整用户流程
```

---

## 三、核心模块设计

### 3.1 计算引擎（最重要）

所有计算函数集中在 `src/utils/` 下，**纯函数，无副作用**：

```typescript
// src/utils/breakEven.ts
import Decimal from 'decimal.js';

interface BreakEvenInput {
  unitPrice: Decimal;        // U - 单位收费
  unitVariableCost: Decimal; // VC - 单位变动成本
  fixedCost: Decimal;        // FC - 月度固定成本
  targetProfit?: Decimal;    // T - 目标月利润（可选）
  maxCapacity?: number;      // 产能上限（仅服务型）
}

interface BreakEvenOutput {
  breakEvenVolume: Decimal;      // V₀
  breakEvenRevenue: Decimal;     // R₀
  contributionMargin: Decimal;   // U - VC
  contributionMarginRatio: Decimal; // (U-VC)/U
  requiredVolume?: Decimal;      // 目标利润所需销量
  capacityWarning?: string;      // 产能预警信息
}

function calculateBreakEven(input: BreakEvenInput): BreakEvenOutput {
  // decimal.js 实现，所有运算精确到分
}
```

三个核心计算模块：
- `breakEven.ts`：盈亏平衡推导 + 产能约束检查
- `profitLoss.ts`：完整 P&L 表生成（按月/年/生命周期）
- `cashFlow.ts`：现金流量表生成（含账期模型）

### 3.2 状态管理（Pinia Store）

```typescript
// src/composables/useProjectStore.ts
interface ProjectState {
  // 输入
  mode: 'product' | 'service';
  serviceRevenueModel: 'hourly' | 'project' | 'retainer';
  projectName: string;
  industry: string;
  fixedCost: number;
  unitVariableCost: number;
  unitPrice?: number;       // 可选
  volume?: number;          // 可选
  targetProfit?: number;    // 可选
  initialInvestment?: number;
  collectionPeriod: string;
  paymentPeriod: string;
  teamSize?: number;
  maxBillableHours: number; // 默认 120
  
  // 输出（自动计算）
  breakEvenResult: BreakEvenOutput | null;
  profitLossTable: ProfitLossRow[];
  cashFlowTable: CashFlowRow[];
  
  // 场景
  scenario: 'conservative' | 'neutral' | 'optimistic';
}
```

### 3.3 组件通信

```
                    Pinia Store (useProjectStore)
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
  CostInputCard     BreakEvenPanel    ReportPanel
   (写入)             (读写)            (只读)
        │                 │                 │
        └──── 修改参数 ──→ 自动重算 ──→ 更新报表
```

- 表单修改 → 更新 Store → 触发计算 → 图表和报表自动刷新
- 滑块移动 → 更新 Store → 触发计算 → 报表自动刷新
- 所有计算走 composable，不直接在组件内写公式

### 3.4 主题切换

```scss
// 通过 CSS 变量 + body class 切换
body[data-mode="product"] {
  --color-primary: #E67E22;
  --color-primary-light: #FDEBD0;
  --color-primary-dark: #D35400;
}

body[data-mode="service"] {
  --color-primary: #3498DB;
  --color-primary-light: #D6EAF8;
  --color-primary-dark: #2980B9;
}
```

---

## 四、数据流

```
用户操作              Store动作              计算层              视图更新
─────────           ──────────            ──────────          ──────────
填写表单字段    →   updateField()     →                    → 表单视图更新
                  →                    → calculateAll()    → 指标卡片更新
拖动滑块        →   updateSlider()    →                    → 图表/报表更新
切换模式        →   toggleMode()      → 清空特有字段重算   → 主题色+标签联动
切换子模式      →   toggleRevenueModel() → 重算服务型收入   → 字段标签联动
导出            →                    → 读取计算结果        → 生成文件下载
保存项目        →                    → 序列化到IndexedDB  →
```

---

## 五、路由设计

MVP 单页应用，不需要 vue-router。如果有后续扩展（设置页、项目列表页），再加路由。

```
/              主页面（模式选择 + 输入 + 分析 + 报表）
/login        登录页（V2）
/projects     项目列表（V2）
/settings     设置（V2）
```

---

## 六、部署架构

### 为什么纯前端不需要服务器

```
本应用 = 纯静态资源（HTML + JS + CSS）
  - 所有计算在浏览器完成（decimal.js）
  - 所有数据存本地 IndexedDB
  - 零后端 API，零数据库
  - → 静态文件托管即可，无需任何服务器
```

### 推荐部署方案

```
用户浏览器
    │
    ├── Vercel / Cloudflare Pages (免费自动部署)
    │     ├── 自动 HTTPS
    │     ├── 全球 CDN
    │     ├── 自定义域名 (¥50/年)
    │     └── 每次 git push 自动部署
    │
    ├── IndexedDB (本地数据，浏览器内)
    │
    └── Supabase Auth (邮箱登录，可选，免费额度 5万用户)
```

### Vercel 部署（推荐）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 一键部署
vercel --prod

# 3. 绑定自定义域名
# Vercel Dashboard → Settings → Domains → 添加你的域名
# DNS 添加 CNAME 记录指向 cname.vercel-dns.com
```

### Cloudflare Pages 部署（国内访问更快）

```bash
# 1. git push 到 GitHub
# 2. Cloudflare Dashboard → Pages → 连接 GitHub 仓库
# 3. 构建命令: npm run build
# 4. 输出目录: dist
# 5. 自动部署完成
```

### vercel.json 配置

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 成本

| 项目 | 费用 |
|------|------|
| 静态托管 (Vercel/Cloudflare) | ¥0/月 |
| 自定义域名 | ~¥50/年 |
| Supabase Auth (可选) | ¥0/月 (5万 MAU 以内) |
| **合计** | **~¥4/月** |

---

## 七、性能目标

| 指标 | 目标 | 实现方式 |
|------|------|---------|
| 首次加载 | < 3s (3G) | Tree shaking + 代码分割 + Gzip |
| 滑块响应 | < 100ms | 纯前端计算 + requestAnimationFrame |
| 图表渲染 | < 200ms | ECharts 增量更新 |
| Excel 导出 | < 2s | ExcelJS 流式写入 |
| 离线可用 | ✓ | PWA Service Worker + IndexedDB |

---

## 八、安全与隐私

- 财务数据默认**仅存本地 IndexedDB**，不上传任何服务器
- 登录后云同步为**可选功能**，用户主动触发
- 不收集用户个人信息、不接第三方统计
- HTTPS 强制
- 依赖项定期 `npm audit`

---

## 九、依赖清单

```json
{
  "dependencies": {
    "vue": "^3.4",
    "pinia": "^2.1",
    "element-plus": "^2.5",
    "echarts": "^5.5",
    "decimal.js": "^10.4",
    "exceljs": "^4.4",
    "i18next": "^23.0",
    "vue-i18n": "^9.0",
    "idb": "^8.0",
    "@supabase/supabase-js": "^2.0"  // V2 登录时启用
  },
  "devDependencies": {
    "typescript": "^5.3",
    "vite": "^5.0",
    "@vitejs/plugin-vue": "^5.0",
    "sass": "^1.70",
    "vitest": "^1.0",
    "unplugin-auto-import": "^0.17",
    "unplugin-vue-components": "^0.26"
  }
}
```
