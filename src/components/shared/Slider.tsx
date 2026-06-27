/**
 * 双滑块联动组件
 * 来源：PRD §6 盈亏分析面板
 */
import { View, Text } from '@tarojs/components';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  onChange: (value: number) => void;
}

export default function Slider({ label, value, min, max, step, unit, color, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <View className="slider-row" style={{ marginBottom: '12px' }}>
      <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
        <Text>{label}</Text>
        <Text style={{ color, fontWeight: 600 }}>{value}<Text style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{unit}</Text></Text>
      </View>
      <View
        style={{
          position: 'relative', height: '6px', borderRadius: '3px',
          background: `linear-gradient(90deg, ${color}20, ${color}40)`,
        }}
      >
        <View
          style={{
            position: 'absolute', left: 0, top: 0, height: '6px', borderRadius: '3px',
            width: `${pct}%`, background: color, transition: 'width 0.15s',
          }}
        />
        <View
          style={{
            position: 'absolute', left: `${pct}%`, top: '-6px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#fff', border: `2px solid ${color}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)', transform: 'translateX(-9px)',
          }}
        />
      </View>
      <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
        <Text>{min}{unit}</Text>
        <Text>{max}{unit}</Text>
      </View>
    </View>
  );
}
