/**
 * 测评页
 * 来源：PRD §7
 */
import { View, Text } from '@tarojs/components';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import { useAssessmentStore } from '../../store/useAssessmentStore';
import { useProjectStore } from '../../store/useProjectStore';
import { QUESTION_BANK } from '../../utils/assessment';
import { useAiReport } from '../../hooks/useAiReport';
import QuestionCard from '../../components/assessment/QuestionCard';
import ProgressBar from '../../components/assessment/ProgressBar';
import ResultRing from '../../components/assessment/ResultRing';
import RadarChart from '../../components/assessment/RadarChart';
import TierBreakdown from '../../components/assessment/TierBreakdown';
import SegmentCard from '../../components/assessment/SegmentCard';
import AiReportCard from '../../components/assessment/AiReportCard';
import TabBar from '../../components/layout/TabBar';
import type { AiReportInput } from '../../types/ai';

const btnBase = {
  flex: 1, padding: '14px', borderRadius: '12px', textAlign: 'center' as const,
  fontSize: '14px', fontWeight: 600,
};

export default function AssessmentPage() {
  const { t } = useTranslation();
  const phase = useAssessmentStore((s) => s.phase);
  const idx = useAssessmentStore((s) => s.currentQuestionIndex);
  const answers = useAssessmentStore((s) => s.answers);
  const result = useAssessmentStore((s) => s.result);
  const answer = useAssessmentStore((s) => s.answerQuestion);
  const next = () => useAssessmentStore.getState().nextQuestion();
  const prev = () => useAssessmentStore.getState().prevQuestion();
  const submit = () => useAssessmentStore.getState().submitAssessment();
  const { loading, error, report, isFallback, generateReport } = useAiReport();
  const [showReport, setShowReport] = useState(false);

  // 构建 AI 报告输入
  const handleGenerateReport = useCallback(() => {
    const currentResult = useAssessmentStore.getState().result;
    if (!currentResult) return;
    setShowReport(true);

    const dimensionScores: Record<string, number> = {};
    for (const dim of Object.keys(currentResult.dimensionScores)) {
      dimensionScores[dim] = currentResult.dimensionScores[dim].scoreA;
    }

    const store = useProjectStore.getState();
    const hasCostData = store.fixedCost > 0;
    const input: AiReportInput = {
      totalScore: currentResult.totalA,
      dimensionScores,
      segmentLabel: currentResult.segment,
      mode: store.mode,
      projectName: store.projectName,
    };

    if (hasCostData) {
      input.costData = {
        fixedCost: store.fixedCost,
        unitVariableCost: store.unitVariableCost,
        unitPrice: store.unitPrice ?? undefined,
        volume: store.volume ?? undefined,
        tokenCost: store.tokenCost,
        acquisitionCost: store.acquisitionCostPerClient,
        targetProfit: store.targetProfit ?? undefined,
        entityType: store.entityType,
      };
    }

    generateReport(input);
  }, [generateReport]);

  if (phase === 'result' && result) {
    return (
      <View style={{ padding: '16px', paddingBottom: '80px' }}>
        <ResultRing totalA={result.totalA} totalB={result.totalB} maxScore={110} />
        <RadarChart scores={result.dimensionScores} />
        <TierBreakdown result={result} />
        <SegmentCard result={result} onGenerateReport={handleGenerateReport} />

        {/* AI 深度报告 */}
        {showReport && (
          <AiReportCard
            report={report}
            segmentLabel={result.segment}
            isFallback={isFallback}
            loading={loading}
            error={error}
            onRetry={handleGenerateReport}
          />
        )}

        {/* 追问 AI — V2 彩蛋 */}
        <View style={{
          marginTop: '8px', padding: '14px', borderRadius: '12px',
          textAlign: 'center', border: '1.5px dashed #edeff3',
          background: '#fafbfc',
        }}
        >
          <Text style={{ fontSize: FS.label, fontWeight: 600, color: '#9298a8' }}>
            追问 AI
          </Text>
          <Text style={{ fontSize: '10px', color: '#b8bec8', display: 'block', marginTop: '2px' }}>
            即将上线 · 多轮追问深度分析
          </Text>
        </View>

        <TabBar />
      </View>
    );
  }

  const q = QUESTION_BANK[idx];
  if (!q) return null;
  const hasAnswered = answers[q.id] != null;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTION_BANK.length;

  return (
    <View style={{ padding: '16px', paddingBottom: '80px' }}>
      <ProgressBar current={idx} total={QUESTION_BANK.length} />
      <QuestionCard
        question={q}
        selected={answers[q.id] ?? null}
        onSelect={(choice) => answer(q.id, choice)}
      />
      <View style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
        <View
          style={{ ...btnBase, background: 'var(--surface)', color: idx > 0 ? 'var(--text-body)' : 'var(--text-muted)', border: '1px solid var(--border)' }}
          onClick={idx > 0 ? prev : undefined}
        >
          <Text>{t('assessment.prev')}</Text>
        </View>
        {idx < QUESTION_BANK.length - 1 ? (
          hasAnswered ? (
            <NavButton label={t('assessment.next')} onTap={next} variant="next" />
          ) : (
            <View style={{ ...btnBase, background: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <Text>请先选择 A 或 B</Text>
            </View>
          )
        ) : (
          allAnswered ? (
            <NavButton label={`提交测评 (${answeredCount}/${QUESTION_BANK.length})`} onTap={submit} variant="submit" />
          ) : (
            <View style={{ ...btnBase, background: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <Text>还有 {QUESTION_BANK.length - answeredCount} 题未答</Text>
            </View>
          )
        )}
      </View>
      <TabBar />
    </View>
  );
}

/** 导航按钮子组件 — H5 兼容：隔离在子组件内确保 onClick 正常触发 */
function NavButton({ label, onTap, variant }: { label: string; onTap: () => void; variant: 'next' | 'submit' }) {
  return (
    <View
      onClick={onTap}
      style={{
        ...btnBase,
        background: variant === 'next' ? 'var(--navy-deep)' : 'var(--gold)',
        color: '#fff',
      }}
    >
      <Text>{label}</Text>
    </View>
  );
}
