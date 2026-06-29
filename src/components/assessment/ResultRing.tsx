/**
 * A/B 分数环形图 — 原生 Canvas (createCanvasContext)
 */
import { useEffect, useRef } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface Props { totalA: number; totalB: number; maxScore: number; }

const W = 240; const H = 180;
const CX = W / 2; const CY = 90;
const OUTER = 60; const INNER = 42;

function grade(a: number): string {
  if (a >= 80) return '准备就绪';
  if (a >= 55) return '基础扎实';
  if (a >= 30) return '继续提升';
  return '蓄力待发';
}

function drawRing(c: CanvasRenderingContext2D, totalA: number, totalB: number, maxScore: number) {
  c.clearRect(0, 0, W, H);
  const pct = Math.max(0, Math.min(totalA / maxScore, 1));
  const start = -Math.PI / 2;
  const end = start + 2 * Math.PI * pct;

  // 灰色底环
  c.beginPath();
  c.arc(CX, CY, OUTER, 0, 2 * Math.PI);
  c.arc(CX, CY, INNER, 2 * Math.PI, 0, true);
  c.fillStyle = '#e8eaef';
  c.fill();

  // 金色 A 得分弧
  if (pct > 0) {
    c.beginPath();
    c.arc(CX, CY, OUTER, start, end);
    c.arc(CX, CY, INNER, end, start, true);
    c.fillStyle = '#C5A059';
    c.fill();
  }

  c.font = 'bold 28px Inter, sans-serif';
  c.fillStyle = '#162340';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(`A:${totalA}`, CX, CY - 10);

  c.font = '10px Inter, sans-serif';
  c.fillStyle = '#9298a8';
  c.fillText(`B:${totalB} / ${maxScore}`, CX, CY + 14);
}

export default function ResultRing({ totalA, totalB, maxScore }: Props) {
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    try {
      // H5: TARO-CANVAS-CORE 的子元素就是原生 <canvas>，需等一帧确保挂载
      const draw = () => {
        if (canvasRef.current?.children?.[0]) {
          const canvas = canvasRef.current.children[0] as HTMLCanvasElement;
          const ctx = canvas.getContext('2d');
          if (ctx) { drawRing(ctx, totalA, totalB, maxScore); return; }
        }
        // Weapp: 用 Taro Canvas API
        const ctx = Taro.createCanvasContext('ring-canvas');
        if (!ctx) return;
        drawRing(ctx as any, totalA, totalB, maxScore);
        (ctx as any).draw();
      };
      requestAnimationFrame(draw);
    } catch (e) { console.warn('[ResultRing]', e); }
  }, [totalA, totalB, maxScore]);

  return (
    <View style={{
      background: '#ffffff', borderRadius: '16px', padding: '12px',
      border: '1px solid #edeff3', marginTop: '10px',
    }}
    >
      {/* 标题 */}
      <Text style={{
        fontSize: '16px', fontWeight: 700, color: '#1a1f2e',
        display: 'block', marginBottom: '2px',
      }}
      >
        一人公司准备度
      </Text>

      {/* 环形图：居中 */}
      <View style={{ textAlign: 'center' }}>
        <Canvas ref={canvasRef} canvasId="ring-canvas" style={{ width: `${W}px`, height: `${H}px`, display: 'inline-block' }} />
      </View>

      {/* 底部简短评价 */}
      <Text style={{
        fontSize: '13px', color: '#C5A059', fontWeight: 600,
        display: 'block', textAlign: 'center', marginTop: '-4px',
      }}
      >
        {grade(totalA)}
      </Text>
    </View>
  );
}
