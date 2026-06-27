import { describe, it, expect } from 'vitest';
import { calculateScores, QUESTION_BANK, DIMENSION_NAMES } from '../assessment';
import { runAssessmentPipeline, classifyA, classifyB } from '../assessmentEngine';

describe('assessment scoring', () => {
  it('55题题库完整', () => {
    expect(QUESTION_BANK.length).toBe(55);
    for (const dim of DIMENSION_NAMES) {
      const questions = QUESTION_BANK.filter(q => q.dimension === dim);
      expect(questions.length).toBe(5);
      // 每维度5题，dimIndex 1-5
      for (let i = 1; i <= 5; i++) {
        expect(questions.some(q => q.dimIndex === i)).toBe(true);
      }
    }
  });

  it('每维度 A+B≡10', () => {
    const answers: Record<number, 'A' | 'B'> = {};
    // 奇数题选A，偶数题选B
    QUESTION_BANK.forEach((q) => { answers[q.id] = q.id % 2 === 1 ? 'A' : 'B'; });
    const scores = calculateScores(answers);
    for (const dim of DIMENSION_NAMES) {
      const { scoreA, scoreB } = scores[dim];
      expect(scoreA + scoreB).toBe(10);
    }
  });

  it('全选A得满分A=110', () => {
    const answers: Record<number, 'A' | 'B'> = {};
    QUESTION_BANK.forEach((q) => { answers[q.id] = 'A'; });
    const scores = calculateScores(answers);
    let totalA = 0, totalB = 0;
    for (const dim of DIMENSION_NAMES) {
      totalA += scores[dim].scoreA;
      totalB += scores[dim].scoreB;
    }
    expect(totalA).toBe(110);
    expect(totalB).toBe(0);
  });

  it('全选B得满分B=110', () => {
    const answers: Record<number, 'A' | 'B'> = {};
    QUESTION_BANK.forEach((q) => { answers[q.id] = 'B'; });
    const scores = calculateScores(answers);
    let totalA = 0, totalB = 0;
    for (const dim of DIMENSION_NAMES) {
      totalA += scores[dim].scoreA;
      totalB += scores[dim].scoreB;
    }
    expect(totalA).toBe(0);
    expect(totalB).toBe(110);
  });

  it('classifyA 边界', () => {
    expect(classifyA(10)).toBe('excellent');
    expect(classifyA(8)).toBe('excellent');
    expect(classifyA(7)).toBe('good');
    expect(classifyA(6)).toBe('good');
    expect(classifyA(5)).toBe('weak');
    expect(classifyA(4)).toBe('weak');
    expect(classifyA(3)).toBe('danger');
    expect(classifyA(0)).toBe('danger');
  });

  it('classifyB 边界', () => {
    expect(classifyB(0)).toBe('clean');
    expect(classifyB(2)).toBe('clean');
    expect(classifyB(3)).toBe('mild');
    expect(classifyB(4)).toBe('mild');
    expect(classifyB(5)).toBe('watch');
    expect(classifyB(6)).toBe('watch');
    expect(classifyB(7)).toBe('severe');
    expect(classifyB(10)).toBe('severe');
  });

  it('runAssessmentPipeline 全流程', () => {
    const answers: Record<number, 'A' | 'B'> = {};
    QUESTION_BANK.forEach((q) => {
      answers[q.id] = q.id <= 25 ? 'A' : 'B'; // 前25题A，后30题B
    });
    const result = runAssessmentPipeline(answers);
    expect(result.totalA + result.totalB).toBe(110);
    expect(result.segment).toBeDefined();
    expect(result.ctaText).toBeTruthy();
  });
});
