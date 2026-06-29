/**
 * 11维雷达图 — 原生 Canvas (createCanvasContext)
 */
import { useEffect, useRef } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { DIMENSION_NAMES } from '../../utils/assessment';
import type { DimensionScores } from '../../types/assessment';

const W = 300; const H = 280;
const CX = W / 2; const CY = 130;
const MAX_R = 95;
const N = DIMENSION_NAMES.length;
const LEVELS = [2, 4, 6, 8, 10];

// 雷达图专用缩写标签（≤4字）
const RADAR_LABELS: Record<string, string> = {
  '创办OPC的动机': '动机',
  '风险承受能力': '风险承受',
  '坚韧不拔/处理危机能力': '坚韧力',
  '主动性': '主动性',
  '协调家庭·社会·OPC关系的能力': '家庭平衡',
  '决策能力': '决策力',
  '适应OPC需要的能力': '适应力',
  '对OPC的承诺': '承诺',
  '家庭支持': '家庭支持',
  '谈判技巧': '谈判力',
  'AI &自媒体运用': 'AI技能',
};

function point(i: number, r: number) {
  const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function drawRadar(c: CanvasRenderingContext2D, scores: DimensionScores) {
  c.clearRect(0, 0, W, H);

  LEVELS.forEach((level) => {
    const r = (level / 10) * MAX_R;
    c.beginPath();
    for (let i = 0; i < N; i++) { const { x, y } = point(i, r); i === 0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.closePath();
    c.strokeStyle = '#e8eaef'; c.lineWidth = 1; c.stroke();
  });

  for (let i = 0; i < N; i++) {
    const { x, y } = point(i, MAX_R);
    c.beginPath(); c.moveTo(CX, CY); c.lineTo(x, y);
    c.strokeStyle = '#edeff3'; c.lineWidth = 0.5; c.stroke();
  }

  c.beginPath();
  for (let i = 0; i < N; i++) {
    const dim = DIMENSION_NAMES[i];
    const score = Math.max(0, Math.min(scores[dim]?.scoreA ?? 0, 10));
    const r = (score / 10) * MAX_R;
    const { x, y } = point(i, r);
    i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
  }
  c.closePath();
  c.fillStyle = 'rgba(197,160,89,0.15)'; c.fill();
  c.strokeStyle = '#C5A059'; c.lineWidth = 2; c.stroke();

  for (let i = 0; i < N; i++) {
    const dim = DIMENSION_NAMES[i];
    const score = Math.max(0, Math.min(scores[dim]?.scoreA ?? 0, 10));
    const { x, y } = point(i, (score / 10) * MAX_R);
    c.beginPath(); c.arc(x, y, 3, 0, 2 * Math.PI);
    c.fillStyle = '#C5A059'; c.fill();
  }

  c.font = '10px sans-serif';
  c.fillStyle = '#3a4056';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < N; i++) {
    const { x, y } = point(i, MAX_R + 20);
    const dim = DIMENSION_NAMES[i];
    const label = RADAR_LABELS[dim] || dim;
    c.fillText(label, x, y);
  }
}

export default function RadarChart({ scores }: { scores: DimensionScores }) {
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    try {
      const draw = () => {
        // H5: TARO-CANVAS-CORE 的子元素就是原生 <canvas>
        if (canvasRef.current?.children?.[0]) {
          const canvas = canvasRef.current.children[0] as HTMLCanvasElement;
          const ctx = canvas.getContext('2d');
          if (ctx) { drawRadar(ctx, scores); return; }
        }
        // Weapp: 用 Taro Canvas API
        const tctx = Taro.createCanvasContext('radar-canvas');
        if (!tctx) return;
        drawRadar(tctx as any, scores);
        (tctx as any).draw();
      };
      requestAnimationFrame(draw);
    } catch (e) { console.warn('[RadarChart]', e); }
  }, [scores]);

  return (
    <View style={{
      background: '#ffffff', borderRadius: '16px', padding: '12px',
      border: '1px solid #edeff3', marginTop: '10px',
    }}
    >
      <Text style={{ fontSize: '16px', fontWeight: 700, color: '#1a1f2e', display: 'block', marginBottom: '2px' }}>
        你的画像
      </Text>
      <Canvas ref={canvasRef} canvasId="radar-canvas" style={{ width: `${W}px`, height: `${H}px`, margin: '0 auto', display: 'block' }} />
    </View>
  );
}
