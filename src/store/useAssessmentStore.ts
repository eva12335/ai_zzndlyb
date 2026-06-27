/**
 * 测评状态管理
 * 来源：TECH_DESIGN §3.2 + PRD §7 测评表
 */
import { create } from 'zustand';
import type { AssessQuestion , AssessmentResult } from '../types/assessment';
import { QUESTION_BANK, DIMENSION_NAMES } from '../utils/assessment';
import { runAssessmentPipeline, classifyA, classifyB, getTagA, getTagB } from '../utils/assessmentEngine';
import { useUserStore } from './useUserStore';

export type AssessPhase = 'answering' | 'result' | 'report';

interface AssessmentState {
  // 答题状态
  phase: AssessPhase;
  currentQuestionIndex: number;
  answers: Record<number, 'A' | 'B'>;
  totalQuestions: number;

  // 结果
  result: AssessmentResult | null;

  // Actions
  startAssessment: () => void;
  answerQuestion: (questionId: number, choice: 'A' | 'B') => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitAssessment: () => void;
  resetAssessment: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  phase: 'answering',
  currentQuestionIndex: 0,
  answers: {},
  totalQuestions: QUESTION_BANK.length,
  result: null,

  startAssessment: () => set({
    phase: 'answering',
    currentQuestionIndex: 0,
    answers: {},
    result: null,
  }),

  answerQuestion: (questionId, choice) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: choice },
    }));
  },

  goToQuestion: (index) => set({ currentQuestionIndex: index }),

  nextQuestion: () => {
    const { currentQuestionIndex, totalQuestions } = get();
    if (currentQuestionIndex < totalQuestions - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  submitAssessment: () => {
    const { answers } = get();
    const result = runAssessmentPipeline(answers);
    useUserStore.getState().incrementAssessmentCount();
    set({ phase: 'result', result });
  },

  resetAssessment: () => set({
    phase: 'answering',
    currentQuestionIndex: 0,
    answers: {},
    result: null,
  }),
}));
