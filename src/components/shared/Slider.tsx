/**
 * 跨平台滑块组件
 * - 微信小程序：使用 Taro Slider（触摸原生支持）
 * - H5 网页：使用纯 View + 鼠标/触摸事件（完全响应式）
 */
import { useRef, useEffect } from 'react';
import { View, Text, Slider as TaroSlider } from '@tarojs/components';
import Taro from '@tarojs/taro';

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

const isH5 = Taro.getEnv() === Taro.ENV_TYPE.WEB;

export default function Slider({ label, value, min, max, step, unit, color, onChange }: SliderProps) {
  // ═══ 微信小程序：使用原生 Slider ═══
  if (!isH5) {
    return (
      <View className="slider-row" style={{ marginBottom: '12px' }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
          <Text>{label}</Text>
          <Text style={{ color, fontWeight: 600 }}>{value}<Text style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{unit}</Text></Text>
        </View>
        <TaroSlider
          min={min}
          max={max}
          step={step}
          value={value}
          activeColor={color}
          backgroundColor={`${color}20`}
          blockColor={color}
          blockSize={20}
          onChanging={(e) => onChange(e.detail.value)}
        />
        <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
          <Text>{min}{unit}</Text>
          <Text>{max}{unit}</Text>
        </View>
      </View>
    );
  }

  // ═══ H5 网页：纯 View + 鼠标/触摸拖拽 ═══
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  // 通过 ref 持有最新回调，避免 useEffect 因 value 变化反复销毁/重建监听器
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const calcValue = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + pct * (max - min);
    const stepped = Math.round(raw / step) * step;
    return Math.max(min, Math.min(max, stepped));
  };

  const handleStart = (clientX: number) => {
    draggingRef.current = true;
    onChangeRef.current(calcValue(clientX));
  };

  const handleMove = (clientX: number) => {
    if (!draggingRef.current) return;
    onChangeRef.current(calcValue(clientX));
  };

  const handleEnd = () => {
    draggingRef.current = false;
  };

  // 全局事件：只在 mount/unmount 时注册/销毁，不依赖任何状态变化
  useEffect(() => {
    const onMove = (e: MouseEvent) => handleMove(e.clientX);
    const onUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); handleMove(e.touches[0].clientX); };
    const onTouchEnd = () => handleEnd();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <View className="slider-row" style={{ marginBottom: '12px', userSelect: 'none' }}>
      {label ? (
        <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
          <Text>{label}</Text>
          <Text style={{ color, fontWeight: 600 }}>{value}<Text style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{unit}</Text></Text>
        </View>
      ) : null}

      {/* 滑块轨道 */}
      <View
        ref={trackRef as any /* Taro View ref 类型与 HTMLDivElement 不兼容 */}
        style={{
          position: 'relative', height: '24px', display: 'flex', alignItems: 'center',
          cursor: 'pointer', touchAction: 'none',
        }}
        onClick={(e: any /* Taro 合成事件 */) => {
          const cx = e?.clientX ?? e?.nativeEvent?.clientX ?? e?.changedTouches?.[0]?.clientX;
          if (cx) onChange(calcValue(cx));
        }}
        onTouchEnd={(e: any /* Taro 触摸事件 */) => {
          e.stopPropagation();
          const touch = e?.changedTouches?.[0] ?? e?.nativeEvent?.changedTouches?.[0];
          if (touch) onChange(calcValue(touch.clientX));
        }}
      >
        {/* 背景轨道 */}
        <View
          style={{
            width: '100%', height: '6px', borderRadius: '3px',
            background: `${color}25`,
          }}
        />
        {/* 已填充部分 */}
        <View
          style={{
            position: 'absolute', left: 0, top: '9px', height: '6px', borderRadius: '3px',
            width: `${pct}%`, background: color, pointerEvents: 'none',
          }}
        />
        {/* 拖拽手柄 */}
        <View
          style={{
            position: 'absolute', left: `${pct}%`, top: '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#fff', border: `2px solid ${color}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transform: 'translateX(-9px)',
            cursor: 'grab',
          }}
          onMouseDown={(e: any /* Taro 鼠标事件 */) => {
            e.stopPropagation();
            const cx = e?.clientX || (e?.nativeEvent?.clientX);
            if (cx) handleStart(cx);
          }}
          onTouchStart={(e: any /* Taro 触摸事件 */) => {
            e.stopPropagation();
            e.preventDefault?.();
            const touch = e?.touches?.[0] ?? e?.nativeEvent?.touches?.[0];
            if (touch) handleStart(touch.clientX);
          }}
        />
      </View>

      {label ? (
        <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
          <Text>{min}{unit}</Text>
          <Text>{max}{unit}</Text>
        </View>
      ) : null}
    </View>
  );
}
