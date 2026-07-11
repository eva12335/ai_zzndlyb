/**
 * 项目状态管理（ROI 计算 + 项目持久化）
 * 来源：TECH_DESIGN §3.2
 */
import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { useUserStore } from './useUserStore';
import { taroStorage } from './storage';
import type { CalcMode, RevenueModel, EntityType, PaymentCycle, CostFields } from '../types/calculation';

// ═══════════════════════════════════════════
// 项目持久化
// ═══════════════════════════════════════════

const PROJECTS_KEY = 'solopreneur-projects';

export interface SavedProject {
  id: string;           // Date.now().toString() 唯一 ID
  name: string;
  mode: CalcMode;
  fields: CostFields;   // 所有输入字段快照
  createdAt: string;    // ISO 日期字符串
  netProfit?: number;   // 计算结果快照
}

interface ProjectState {
  // 输入字段
  mode: CalcMode;
  projectName: string;
  fixedCost: number;
  unitVariableCost: number;
  unitPrice: number | null;       // null = 留空推导
  volume: number | null;          // null = 留空推导
  tokenCost: number;
  acquisitionCostPerClient: number;
  newClientsPerMonth: number;
  targetProfit: number | null;    // null = 默认 0
  revenueModel: RevenueModel;
  maxBillableHours: number;
  entityType: EntityType;
  paymentCycle: PaymentCycle;
  growthRate: number;
  startupCapital: number;
  netProfit: number | null;       // 计算结果缓存，用于项目快照

  // Actions
  setMode: (mode: CalcMode) => void;
  setField: (field: string, value: number | string | null) => void;
  resetToDefaults: () => void;
  saveProject: () => void;
  loadProjects: () => SavedProject[];
  deleteProject: (id: string) => void;
  loadProject: (id: string) => void;
}

const PRODUCT_DEFAULTS = {
  mode: 'product' as CalcMode,
  projectName: '写字楼咖啡店',
  fixedCost: 20000,
  unitVariableCost: 5.5,
  unitPrice: 25 as number | null,
  volume: 1200 as number | null,
  tokenCost: 0,
  acquisitionCostPerClient: 0,
  newClientsPerMonth: 1,
  targetProfit: 10000,
  revenueModel: 'hourly' as RevenueModel,
  maxBillableHours: 120,
  entityType: 'individual' as EntityType,
  paymentCycle: 0 as PaymentCycle,
  growthRate: 10,
  startupCapital: 0,
  netProfit: null as number | null,
};

const SERVICE_DEFAULTS = {
  mode: 'service' as CalcMode,
  projectName: 'AI 咨询服务',
  fixedCost: 3000,
  unitVariableCost: 0,
  unitPrice: 250 as number | null,
  volume: 80 as number | null,
  tokenCost: 1500,
  acquisitionCostPerClient: 300,
  newClientsPerMonth: 1,
  targetProfit: 15000,
  revenueModel: 'hourly' as RevenueModel,
  maxBillableHours: 120,
  entityType: 'individual' as EntityType,
  paymentCycle: 0 as PaymentCycle,
  growthRate: 10,
  startupCapital: 0,
  netProfit: null as number | null,
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...PRODUCT_DEFAULTS as ProjectState,

  setMode: (mode) => set({
    ...(mode === 'product' ? PRODUCT_DEFAULTS : SERVICE_DEFAULTS),
    mode,
  } as ProjectState),

  setField: (field, value) => set({ [field]: value }),

  resetToDefaults: () => {
    const currentMode = get().mode;
    set({ ...(currentMode === 'product' ? PRODUCT_DEFAULTS : SERVICE_DEFAULTS) } as ProjectState);
  },

  // ═══════════════════════════════════════════
  // 项目持久化 CRUD
  // ═══════════════════════════════════════════

  saveProject: () => {
    const s = get();
    const projects = get().loadProjects();
    const newProject: SavedProject = {
      id: Date.now().toString(),
      name: s.projectName,
      mode: s.mode,
      fields: {
        mode: s.mode,
        projectName: s.projectName,
        fixedCost: s.fixedCost,
        unitVariableCost: s.unitVariableCost,
        unitPrice: s.unitPrice ?? undefined,
        volume: s.volume ?? undefined,
        tokenCost: s.tokenCost,
        acquisitionCostPerClient: s.acquisitionCostPerClient,
        newClientsPerMonth: s.newClientsPerMonth,
        targetProfit: s.targetProfit ?? undefined,
        revenueModel: s.revenueModel,
        maxBillableHours: s.maxBillableHours,
        entityType: s.entityType,
        paymentCycle: s.paymentCycle,
        growthRate: s.growthRate,
        startupCapital: s.startupCapital,
      },
      createdAt: new Date().toISOString(),
      netProfit: s.netProfit ?? undefined,
    };
    projects.push(newProject);
    Taro.setStorageSync(PROJECTS_KEY, JSON.stringify(projects));
    useUserStore.getState().incrementAnalysisCount();
  },

  loadProjects: () => {
    try {
      const data = taroStorage.getItem(PROJECTS_KEY);
      return Array.isArray(data) ? (data as SavedProject[]) : [];
    } catch {
      return [];
    }
  },

  deleteProject: (id) => {
    const projects = get().loadProjects();
    Taro.setStorageSync(PROJECTS_KEY, JSON.stringify(projects.filter((p) => p.id !== id)));
  },

  loadProject: (id) => {
    const projects = get().loadProjects();
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const f = project.fields;
    set({
      mode: f.mode,
      projectName: f.projectName,
      fixedCost: f.fixedCost,
      unitVariableCost: f.unitVariableCost,
      unitPrice: f.unitPrice ?? null,
      volume: f.volume ?? null,
      tokenCost: f.tokenCost,
      acquisitionCostPerClient: f.acquisitionCostPerClient ?? 0,
      newClientsPerMonth: f.newClientsPerMonth,
      targetProfit: f.targetProfit ?? null,
      revenueModel: f.revenueModel,
      maxBillableHours: f.maxBillableHours,
      entityType: f.entityType,
      paymentCycle: f.paymentCycle,
      growthRate: f.growthRate,
      startupCapital: f.startupCapital,
      netProfit: project.netProfit ?? null,
    });
  },
}));
