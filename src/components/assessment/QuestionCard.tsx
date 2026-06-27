/**
 * A/B 双栏对比题卡片
 */
import { View, Text } from '@tarojs/components';
import { FS } from '../../constants/fonts';
import type { AssessQuestion } from '../../types/assessment';

interface QuestionCardProps {
  question: AssessQuestion;
  selected: 'A' | 'B' | null;
  onSelect: (choice: 'A' | 'B') => void;
}

export default function QuestionCard({ question, selected, onSelect }: QuestionCardProps) {
  return (
    <View style={{
      background: 'var(--surface)', borderRadius: '16px', padding: '18px 16px',
      border: '1px solid var(--border-subtle)', marginBottom: '14px',
    }}>
      <View style={{
        display: 'inline-block', fontSize: FS.label, fontWeight: 700, color: 'var(--gold)',
        background: 'var(--gold-light)', padding: '6px 14px', borderRadius: '999px',
        marginBottom: '10px',
      }}>
        {question.dimension} · 第 {question.dimIndex}/5 题
      </View>

      <View style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'start' }}>
        <View
          onClick={() => onSelect('A')}
          style={{
            padding: '14px', borderRadius: '12px',
            border: selected === 'A' ? '2px solid var(--gold)' : '1.5px solid var(--border-subtle)',
            background: selected === 'A' ? 'var(--gold-light)' : 'var(--surface)',
            boxShadow: selected === 'A' ? '0 0 0 3px var(--gold-light)' : 'var(--shadow-xs)',
            fontSize: FS.heading, color: 'var(--text-body)', lineHeight: 1.7,
            position: 'relative',
          }}
        >
          <Text style={{ fontSize: FS.label, fontWeight: 700, color: selected === 'A' ? 'var(--gold)' : 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>A 栏</Text>
          <Text>{question.statementA}</Text>
          {selected === 'A' && (
            <View style={{
              position: 'absolute', top: '8px', right: '10px', width: '18px', height: '18px',
              borderRadius: '50%', background: 'var(--gold)', color: '#fff',
              fontSize: FS.caption, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✓</View>
          )}
        </View>

        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '8px' }}>
          <Text style={{ fontSize: FS.label, fontWeight: 700, color: 'var(--text-muted)' }}>VS</Text>
        </View>

        <View
          onClick={() => onSelect('B')}
          style={{
            padding: '14px', borderRadius: '12px',
            border: selected === 'B' ? '2px solid var(--gold)' : '1.5px solid var(--border-subtle)',
            background: selected === 'B' ? 'var(--gold-light)' : 'var(--surface)',
            boxShadow: selected === 'B' ? '0 0 0 3px var(--gold-light)' : 'var(--shadow-xs)',
            fontSize: FS.heading, color: 'var(--text-body)', lineHeight: 1.7,
            position: 'relative',
          }}
        >
          <Text style={{ fontSize: '10px', fontWeight: 700, color: selected === 'B' ? 'var(--gold)' : 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>B 栏</Text>
          <Text>{question.statementB}</Text>
          {selected === 'B' && (
            <View style={{
              position: 'absolute', top: '8px', right: '10px', width: '18px', height: '18px',
              borderRadius: '50%', background: 'var(--gold)', color: '#fff',
              fontSize: FS.caption, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✓</View>
          )}
        </View>
      </View>
    </View>
  );
}
