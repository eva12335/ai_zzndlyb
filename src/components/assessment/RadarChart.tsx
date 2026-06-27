/**
 * 11维雷达图 — 原生 Canvas (createCanvasContext)
 */
import { useEffect } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { DIMENSION_NAMES } from '../../utils/assessment';
import type { DimensionScores } from '../../types/assessment';

const CANVAS_ID = 'radar-canvas';
const W = 300; const H = 280;
const CX = W / 2; const CY = 130;
const MAX_R = 100; // 最大半径
const N = DIMENSION_NAMES.length; // 11
const LEVELS = [2, 4, 6, 8, 10]; // 网格层级

/** (i, radius) → 画布坐标 */
function point(i: number, r: number) {
  const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

export default function RadarChart({ scores }: { scores: DimensionScores }) {
  useEffect(() => {
    const ctx = Taro.createCanvasContext(CANVAS_ID);
    ctx.clearRect(0, 0, W, H);

    // ── 网格：多层正多边形 ──
    LEVELS.forEach((level) => {
      const r = (level / 10) * MAX_R;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const { x, y } = point(i, r);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.setStrokeStyle('#e8eaef');
      ctx.setLineWidth(1);
      ctx.stroke();
    });

    // ── 轴线（圆心到各顶点） ──
    for (let i = 0; i < N; i++) {
      const { x, y } = point(i, MAX_R);
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(x, y);
      ctx.setStrokeStyle('#edeff3');
      ctx.setLineWidth(0.5);
      ctx.stroke();
    }

    // ── 数据多边形（A 得分） ──
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const dim = DIMENSION_NAMES[i];
      const score = Math.max(0, Math.min(scores[dim]?.scoreA ?? 0, 10));
      const r = (score / 10) * MAX_R;
      const { x, y } = point(i, r);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.setFillStyle('rgba(197,160,89,0.15)');
    ctx.fill();
    ctx.setStrokeStyle('#C5A059');
    ctx.setLineWidth(2);
    ctx.stroke();

    // ── 数据点圆点标记 ──
    for (let i = 0; i < N; i++) {
      const dim = DIMENSION_NAMES[i];
      const score = Math.max(0, Math.min(scores[dim]?.scoreA ?? 0, 10));
      const r = (score / 10) * MAX_R;
      const { x, y } = point(i, r);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.setFillStyle('#C5A059');
      ctx.fill();
    }

    // ── 维度标签 ──
    ctx.setFontSize(10);
    ctx.setFillStyle('#3a4056');
    ctx.setTextAlign('center');
    ctx.setTextBaseline('middle');
    for (let i = 0; i < N; i++) {
      const labelR = MAX_R + 22;
      const { x, y } = point(i, labelR);
      const dim = DIMENSION_NAMES[i];
      const label = dim.length > 4 ? dim.slice(0, 4) : dim;
      ctx.fillText(label, x, y);
    }

    ctx.draw();
  }, [scores]);

  return (
    <View style={{
      background: '#ffffff', borderRadius: '16px', padding: '12px',
      border: '1px solid #edeff3', marginTop: '10px',
    }}>
      <Text style={{ fontSize: '16px', fontWeight: 700, color: '#1a1f2e', display: 'block', marginBottom: '2px' }}>
        你的画像
      </Text>
      <Canvas canvasId={CANVAS_ID} style={{ width: `${W}px`, height: `${H}px`, margin: '0 auto', display: 'block' }} />
    </View>
  );
}
