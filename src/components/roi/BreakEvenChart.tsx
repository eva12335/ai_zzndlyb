/**
 * 盈亏平衡图 — 原生 Canvas (createCanvasContext)
 *
 * 绘制：绿色总收入线、红色总成本线、金色盈亏平衡标注
 * Canvas 宽度响应式适配屏幕
 */
import { useEffect, useMemo } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Decimal from 'decimal.js';
import type { RevenueProjectionOutput } from '../../types/calculation';

interface Props {
  breakEvenVolume: Decimal;
  breakEvenRevenue: Decimal;
  unitPrice: Decimal;
  unitVariableCost: Decimal;
  fixedCost: Decimal;
  volume: Decimal;
  projection?: RevenueProjectionOutput;
}

const CANVAS_ID = 'be-canvas';

/** 金额短格式 */
function fmtY(v: number): string {
  if (v >= 10000) return '¥' + (v / 10000).toFixed(0) + 'w';
  if (v >= 1000) return '¥' + (v / 1000).toFixed(1) + 'k';
  return '¥' + v.toFixed(0);
}

export default function BreakEvenChart({
  breakEvenVolume, breakEvenRevenue, unitPrice, unitVariableCost, fixedCost, volume, projection,
}: Props) {
  // 响应式 Canvas 尺寸：取屏幕宽度 - 页面边距，上限 340px
  const [W, H] = useMemo(() => {
    try {
      const sw = Taro.getSystemInfoSync().windowWidth;
      const w = Math.max(260, Math.min(sw - 80, 340));
      const h = Math.round(w * 0.78);
      return [w, h];
    } catch {
      return [300, 234];
    }
  }, []);

  const PAD = useMemo(() => ({
    top: Math.round(H * 0.08),
    right: Math.round(W * 0.06),
    bottom: Math.round(H * 0.16),
    left: Math.round(W * 0.17),
  }), [W, H]);

  const CW = W - PAD.left - PAD.right;
  const CH = H - PAD.top - PAD.bottom;

  useEffect(() => {
    const timer = setTimeout(() => {
      const ctx = Taro.createCanvasContext(CANVAS_ID);
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

    // ── 数据准备 ──
    const U = unitPrice.toNumber();
    const VC = unitVariableCost.toNumber();
    const FC = fixedCost.toNumber();
    const V = volume.toNumber();
    const BEV = breakEvenVolume.toNumber();
    const BER = breakEvenRevenue.toNumber();

    const maxV = Math.max(V, BEV, 5) * 1.4;
    const maxRev = U * maxV;
    const maxCost = FC + VC * maxV;
    const maxY = Math.max(maxRev, maxCost, BER, 1) * 1.15;

    const toX = (v: number) => PAD.left + (v / maxV) * CW;
    const toY = (amt: number) => PAD.top + CH - (amt / maxY) * CH;

    // ── 背景 ──
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, W, H);

    // ── Y 轴刻度线 + 标签 (4档) ──
    ctx.setFontSize(9);
    ctx.setFillStyle('#9298a8');
    ctx.setTextAlign('right');
    ctx.setTextBaseline('middle');
    for (let i = 0; i <= 4; i++) {
      const amt = (maxY / 4) * i;
      const y = toY(amt);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + CW, y);
      ctx.setStrokeStyle('#edeff3');
      ctx.setLineWidth(0.5);
      ctx.stroke();
      ctx.fillText(fmtY(amt), PAD.left - 6, y);
    }

    // ── 坐标轴 ──
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, PAD.top + CH);
    ctx.lineTo(PAD.left + CW, PAD.top + CH);
    ctx.setStrokeStyle('#9298a8');
    ctx.setLineWidth(1);
    ctx.stroke();

    // ── X 轴标签 ──
    ctx.setFontSize(9);
    ctx.setFillStyle('#9298a8');
    ctx.setTextAlign('center');
    ctx.setTextBaseline('top');
    for (let i = 0; i <= 4; i++) {
      const v = (maxV / 4) * i;
      const x = toX(v);
      const label = v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v.toFixed(0);
      ctx.fillText(label, x, PAD.top + CH + 5);
    }

    // ── 总收入线（绿色） ──
    const pts = 80;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const v = (maxV / pts) * i;
      const rev = U * v;
      const x = toX(v);
      const y = toY(rev);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.setStrokeStyle('#5cb894');
    ctx.setLineWidth(2.5);
    ctx.stroke();

    // ── 总成本线（红色） ──
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const v = (maxV / pts) * i;
      const cost = FC + VC * v;
      const x = toX(v);
      const y = toY(cost);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.setStrokeStyle('#e08676');
    ctx.setLineWidth(2.5);
    ctx.stroke();

    // ── 盈亏平衡垂直线（金色虚线） ──
    const beX = toX(BEV);
    ctx.beginPath();
    ctx.setLineDash([5, 4], 0);
    ctx.setStrokeStyle('#C5A059');
    ctx.setLineWidth(1.5);
    ctx.moveTo(beX, PAD.top);
    ctx.lineTo(beX, PAD.top + CH);
    ctx.stroke();
    ctx.setLineDash([0, 0], 0);

    // ── 盈亏平衡点圆点 ──
    const beY = toY(BER);
    ctx.beginPath();
    ctx.arc(beX, beY, 5, 0, 2 * Math.PI);
    ctx.setFillStyle('#C5A059');
    ctx.fill();
    ctx.beginPath();
    ctx.arc(beX, beY, 9, 0, 2 * Math.PI);
    ctx.setFillStyle('rgba(197,160,89,0.15)');
    ctx.fill();

    // ── 图例 ──
    const legendY = PAD.top + CH + Math.round(H * 0.09);
    const legX1 = PAD.left + Math.round(W * 0.03);
    const legX2 = PAD.left + Math.round(W * 0.30);
    const legX3 = PAD.left + Math.round(W * 0.55);

    // 总收入
    ctx.beginPath();
    ctx.moveTo(legX1, legendY);
    ctx.lineTo(legX1 + 30, legendY);
    ctx.setStrokeStyle('#5cb894');
    ctx.setLineWidth(2.5);
    ctx.stroke();
    ctx.setFontSize(10);
    ctx.setFillStyle('#3a4056');
    ctx.setTextAlign('left');
    ctx.setTextBaseline('middle');
    ctx.fillText('总收入', legX1 + 35, legendY);

    // 总成本
    ctx.beginPath();
    ctx.moveTo(legX2, legendY);
    ctx.lineTo(legX2 + 30, legendY);
    ctx.setStrokeStyle('#e08676');
    ctx.setLineWidth(2.5);
    ctx.stroke();
    ctx.fillText('总成本', legX2 + 35, legendY);

    // 盈亏平衡
    ctx.beginPath();
    ctx.setLineDash([3, 3], 0);
    ctx.moveTo(legX3, legendY);
    ctx.lineTo(legX3 + 30, legendY);
    ctx.setStrokeStyle('#C5A059');
    ctx.setLineWidth(1.5);
    ctx.stroke();
    ctx.setLineDash([0, 0], 0);
    ctx.fillText('盈亏平衡', legX3 + 35, legendY);

    ctx.draw();
    }, 100);
    return () => clearTimeout(timer);
  }, [breakEvenVolume, breakEvenRevenue, unitPrice, unitVariableCost, fixedCost, volume, W, H, PAD, CW, CH]);

  return (
    <View style={{
      background: '#ffffff', borderRadius: '16px', padding: '12px',
      border: '1px solid #edeff3', marginTop: '12px',
      overflow: 'hidden',
    }}
    >
      <Text style={{
        fontSize: '16px', fontWeight: 700, color: '#1a1f2e',
        display: 'block', marginBottom: '4px',
      }}
      >
        盈亏平衡分析
      </Text>
      <Canvas
        canvasId={CANVAS_ID}
        style={{ width: `${W}px`, height: `${H}px`, margin: '0 auto', display: 'block', maxWidth: '100%' }}
      />
      {projection && projection.breakEvenMonth != null && (
        <Text style={{
          display: 'block', marginTop: '6px', fontSize: '13px',
          color: '#517ea8', textAlign: 'center', fontWeight: 600,
        }}
        >
          按增长率，第 {projection.breakEvenMonth} 个月扭亏
        </Text>
      )}
    </View>
  );
}
