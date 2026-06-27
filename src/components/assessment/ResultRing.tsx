/**
 * A/B 分数环形图 — 原生 Canvas (createCanvasContext)
 */
import { useEffect } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface Props { totalA: number; totalB: number; maxScore: number; }

const CANVAS_ID = 'ring-canvas';
const W = 240; const H = 180;
const CX = W / 2; const CY = 90;
const OUTER = 60; const INNER = 42;

/** 评测等级：简短 4 字 */
function grade(a: number): string {
  if (a >= 80) return '准备就绪';
  if (a >= 55) return '基础扎实';
  if (a >= 30) return '继续提升';
  return '蓄力待发';
}

export default function ResultRing({ totalA, totalB, maxScore }: Props) {
  useEffect(() => {
    const ctx = Taro.createCanvasContext(CANVAS_ID);
    ctx.clearRect(0, 0, W, H);

    const pct = Math.max(0, Math.min(totalA / maxScore, 1));
    const start = -Math.PI / 2;
    const end = start + 2 * Math.PI * pct;

    // 灰色底环
    ctx.beginPath();
    ctx.arc(CX, CY, OUTER, 0, 2 * Math.PI);
    ctx.arc(CX, CY, INNER, 2 * Math.PI, 0, true);
    ctx.setFillStyle('#e8eaef');
    ctx.fill();

    // 金色 A 得分弧
    if (pct > 0) {
      ctx.beginPath();
      ctx.arc(CX, CY, OUTER, start, end);
      ctx.arc(CX, CY, INNER, end, start, true);
      ctx.setFillStyle('#C5A059');
      ctx.fill();
    }

    // 中心文字：A 得分（大号）
    ctx.setFontSize(28);
    ctx.setFillStyle('#162340');
    ctx.setTextAlign('center');
    ctx.setTextBaseline('middle');
    ctx.fillText(`A:${totalA}`, CX, CY - 10);

    // 中心文字：B 得分（小号）
    ctx.setFontSize(10);
    ctx.setFillStyle('#9298a8');
    ctx.fillText(`B:${totalB} / 满分${maxScore}`, CX, CY + 14);

    ctx.draw();
  }, [totalA, totalB, maxScore]);

  return (
    <View style={{
      background: '#ffffff', borderRadius: '16px', padding: '12px',
      border: '1px solid #edeff3', marginTop: '10px',
    }}>
      {/* 标题 */}
      <Text style={{
        fontSize: '16px', fontWeight: 700, color: '#1a1f2e',
        display: 'block', marginBottom: '2px',
      }}>
        一人公司准备度
      </Text>

      {/* 环形图：居中 */}
      <View style={{ textAlign: 'center' }}>
        <Canvas canvasId={CANVAS_ID} style={{ width: `${W}px`, height: `${H}px`, display: 'inline-block' }} />
      </View>

      {/* 底部简短评价 */}
      <Text style={{
        fontSize: '13px', color: '#C5A059', fontWeight: 600,
        display: 'block', textAlign: 'center', marginTop: '-4px',
      }}>
        {grade(totalA)}
      </Text>
    </View>
  );
}
