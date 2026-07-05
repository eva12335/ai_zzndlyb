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

const CHECK_STYLE = {
  position: 'absolute' as const, top: '8px', right: '10px', width: '18px', height: '18px',
  borderRadius: '50%', background: 'var(--gold)', color: '#fff',
  fontSize: '12px', display: 'flex', alignItems: 'center' as const, justifyContent: 'center' as const,
};

function columnStyle(side: 'A' | 'B', selected: 'A' | 'B' | null) {
  const isSel = selected === side;
  return {
    padding: '14px', borderRadius: '12px', width: '100%',
    border: isSel ? '2px solid var(--gold)' : '1.5px solid var(--border-subtle)',
    background: isSel ? 'var(--gold-light)' : 'var(--surface)',
    boxShadow: isSel ? '0 0 0 3px var(--gold-light)' : 'var(--shadow-xs)',
    fontSize: '16px', color: 'var(--text-body)', lineHeight: 1.7,
    position: 'relative' as const,
    marginBottom: side === 'A' ? '8px' : 0,
    marginTop: side === 'B' ? '8px' : 0,
  };
}

export default function QuestionCard({ question, selected, onSelect }: QuestionCardProps) {
  return (
    <View style={{
      background: 'var(--surface)', borderRadius: '16px', padding: '18px 16px',
      border: '1px solid var(--border-subtle)', marginBottom: '14px',
    }}
    >
      <View style={{
        display: 'inline-block', fontSize: FS.label, fontWeight: 700, color: 'var(--gold)',
        background: 'var(--gold-light)', padding: '6px 14px', borderRadius: '999px',
        marginBottom: '10px',
      }}
      >
        {question.dimension}
      </View>

      <View>
        <View onClick={() => onSelect('A')} style={columnStyle('A', selected)}>
          <Text style={{ fontSize: FS.label, fontWeight: 700, color: selected === 'A' ? 'var(--gold)' : 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>A</Text>
          <Text>{question.statementA}</Text>
          {selected === 'A' && <View style={CHECK_STYLE}>✓</View>}
        </View>

        <View onClick={() => onSelect('B')} style={columnStyle('B', selected)}>
          <Text style={{ fontSize: FS.label, fontWeight: 700, color: selected === 'B' ? 'var(--gold)' : 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>B</Text>
          <Text>{question.statementB}</Text>
          {selected === 'B' && <View style={CHECK_STYLE}>✓</View>}
        </View>
      </View>
    </View>
  );
}
