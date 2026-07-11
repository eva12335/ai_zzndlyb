/**
 * 测评分享按钮 — 双环境：WeChat Canvas / H5 原生 Canvas
 */
import { useRef, useCallback } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Taro from '@tarojs/taro';
import { FS } from '../../constants/fonts';
import { DIMENSION_NAMES } from '../../utils/assessment';
import type { AssessmentResult, DimensionScores } from '../../types/assessment';
import qrcodeImg from '../../assets/qrcode.png';

interface Props { result: AssessmentResult; }

const W = 375; const H = 620;
const CANVAS_ID = 'share-canvas';
const N = DIMENSION_NAMES.length;
const isH5 = Taro.getEnv() === Taro.ENV_TYPE.WEB;

const INTERPRETATIONS: Record<string, string> = {
  '谨慎型技术派': '自驱力强，AI技能熟练，市场嗅觉也在线，但对风险偏保守。你适合用技术杠杆替代资金杠杆，用数据验证替代赌博——副业稳步过渡是最适合你的路径。',
  '直觉型探索者': '敢于冒险，自驱力强。热情是你的燃料。下一步可以把AI工具纳入日常流程，让系统帮你的直觉落地，减少对个人精力的依赖。',
  'AI增强型个体': '自驱力和AI技能是你的双引擎，已经具备了独立经营的核心条件。下一步的重点是优化获客渠道和提升客单价，把产能天花板往上推。',
  '稳健型实干家': '市场嗅觉敏锐，做事稳健。你适合先跑通一个最小可行产品，用数据验证市场反应。AI技能提升之后，你会事半功倍。',
  '待激活观望者': '当前处于积累阶段，各方面分数还有提升空间。这不代表不适合一人公司——可以从最小可行第一步开始：用业余时间接一个项目，测试市场对你的价值反馈。',
  '全能型一人公司': '自驱力、AI技能、市场获客和风险承受全面在线，已具备独立经营的全部条件。下一步不是能不能做，而是如何规模化——产品化服务、提价、建立被动收入。',
};

const RADAR_LABELS: Record<string, string> = {
  '创办OPC的动机': '动机', '风险承受能力': '风险承受',
  '坚韧不拔/处理危机能力': '坚韧力', '主动性': '主动性',
  '协调家庭·社会·OPC关系的能力': '家庭平衡', '决策能力': '决策力',
  '适应OPC需要的能力': '适应力', '对OPC的承诺': '承诺',
  '家庭支持': '家庭支持', '谈判技巧': '谈判力',
  'AI &自媒体运用': 'AI技能',
};

function radarPoint(i: number, r: number, cx: number, cy: number) {
  const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const ch of text) {
    if (ctx.measureText(cur + ch).width > maxW && cur.length > 0) { lines.push(cur); cur = ch; }
    else { cur += ch; }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** 通用绘图逻辑（WeChat ctx 和原生 Canvas2D 都兼容） */
function drawCard(ctx: any, result: AssessmentResult, qrDrawPath: string) {
  ctx.fillStyle = '#162340';
  ctx.fillRect(0, 0, W, H);
  let y = 32;

  ctx.font = '13px sans-serif'; ctx.fillStyle = 'rgba(240,236,228,0.5)'; ctx.textAlign = 'center';
  ctx.fillText('OPC 创业罗盘', W / 2, y);

  y += 28; ctx.font = '14px sans-serif'; ctx.fillStyle = 'rgba(240,236,228,0.6)';
  ctx.fillText('你的创业人格类型', W / 2, y);

  y += 28; ctx.font = 'bold 22px sans-serif'; ctx.fillStyle = '#C5A059';
  ctx.fillText(result.segment, W / 2, y);

  const insight = INTERPRETATIONS[result.segment] ?? '';
  if (insight) {
    y += 24; ctx.font = '12px sans-serif'; ctx.fillStyle = 'rgba(240,236,228,0.65)';
    for (const line of wrapText(ctx, `"${insight}"`, W - 60)) { ctx.fillText(line, W / 2, y); y += 20; }
  }

  y += 16; const rcY = y + 80; const rcX = W / 2; const MR = 65;
  [2, 4, 6, 8, 10].forEach((lv) => {
    const r = (lv / 10) * MR;
    ctx.beginPath();
    for (let i = 0; i < N; i++) { const p = radarPoint(i, r, rcX, rcY); i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }
    ctx.closePath(); ctx.strokeStyle = 'rgba(240,236,228,0.12)'; ctx.lineWidth = 0.8; ctx.stroke();
  });
  for (let i = 0; i < N; i++) {
    const p = radarPoint(i, MR, rcX, rcY);
    ctx.beginPath(); ctx.moveTo(rcX, rcY); ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = 'rgba(240,236,228,0.06)'; ctx.lineWidth = 0.5; ctx.stroke();
  }

  const scores = result.dimensionScores;
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const dim = DIMENSION_NAMES[i];
    const s = Math.max(0, Math.min(scores[dim]?.scoreA ?? 0, 10));
    const p = radarPoint(i, (s / 10) * MR, rcX, rcY);
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  }
  ctx.closePath(); ctx.fillStyle = 'rgba(197,160,89,0.15)'; ctx.fill();
  ctx.strokeStyle = '#C5A059'; ctx.lineWidth = 2; ctx.stroke();

  for (let i = 0; i < N; i++) {
    const dim = DIMENSION_NAMES[i];
    const s = Math.max(0, Math.min(scores[dim]?.scoreA ?? 0, 10));
    const p = radarPoint(i, (s / 10) * MR, rcX, rcY);
    ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 2 * Math.PI); ctx.fillStyle = '#C5A059'; ctx.fill();
  }

  ctx.font = '9px sans-serif'; ctx.fillStyle = 'rgba(240,236,228,0.6)'; ctx.textAlign = 'center';
  for (let i = 0; i < N; i++) {
    const p = radarPoint(i, MR + 16, rcX, rcY);
    ctx.fillText(RADAR_LABELS[DIMENSION_NAMES[i]] || DIMENSION_NAMES[i], p.x, p.y);
  }

  y = rcY + MR + 30;
  y += 12; ctx.font = '12px sans-serif'; ctx.fillStyle = 'rgba(240,236,228,0.55)';
  ctx.fillText('扫码测测你是哪种创业者', W / 2, y);

  y += 16; const qrS = 88; const qrX = (W - qrS) / 2;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(qrX - 4, y - 4, qrS + 8, qrS + 8);
  if (qrDrawPath) {
    try { ctx.drawImage(qrDrawPath, qrX, y, qrS, qrS); } catch (_) { /* pass */ }
  }

  y += qrS + 8;
  y += 12; ctx.font = '11px sans-serif'; ctx.fillStyle = 'rgba(240,236,228,0.4)';
  ctx.fillText('微信搜一搜「OPC 创业罗盘」', W / 2, y);
}

/** H5：原生 Canvas + toDataURL → previewImage */
async function drawAndShareH5(result: AssessmentResult) {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 加载二维码图片
  let qrImg: HTMLImageElement | null = null;
  if (typeof qrcodeImg === 'string') {
    qrImg = new Image();
    qrImg.src = qrcodeImg;
    await new Promise<void>((resolve) => { qrImg!.onload = () => resolve(); qrImg!.onerror = () => resolve(); });
  }

  drawCard(ctx, result, qrImg ?? '' as any);

  // toDataURL → previewImage
  const dataUrl = canvas.toDataURL('image/png');
  Taro.previewImage({ urls: [dataUrl] });
}

/** WeChat：Taro Canvas → canvasToTempFilePath → showShareImageMenu */
async function drawAndShareWeapp(result: AssessmentResult) {
  let qrDrawPath = '';
  if (typeof qrcodeImg === 'string') {
    if (qrcodeImg.startsWith('data:')) {
      try {
        const fs = Taro.getFileSystemManager();
        const tmpPath = `${Taro.env.USER_DATA_PATH}/qrcode-tmp.png`;
        fs.writeFileSync(tmpPath, qrcodeImg.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        qrDrawPath = tmpPath;
      } catch (_) { /* pass */ }
    } else { qrDrawPath = qrcodeImg; }
  }

  const ctx = Taro.createCanvasContext(CANVAS_ID);
  drawCard(ctx, result, qrDrawPath);

  ctx.draw(false, async () => {
    try {
      const res = await Taro.canvasToTempFilePath({ canvasId: CANVAS_ID, fileType: 'png', quality: 1 });
      Taro.showShareImageMenu({
        path: res.tempFilePath,
        fail: () => {
          Taro.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => Taro.showToast({ title: '已保存到相册', icon: 'none', duration: 2500 }),
            fail: () => Taro.previewImage({ urls: [res.tempFilePath] }),
          });
        },
      });
    } catch (e) {
      console.warn('[Share] fail', e);
      Taro.showToast({ title: '生成图片失败，请重试', icon: 'none' });
    }
  });
}

export default function AssessmentShareButton({ result }: Props) {
  const { t } = useTranslation();
  const busyRef = useRef(false);

  const handleShare = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const fn = isH5 ? drawAndShareH5 : drawAndShareWeapp;
    fn(result).finally(() => { busyRef.current = false; });
  }, [result]);

  return (
    <View>
      <View onClick={handleShare} style={{
        padding: '13px', borderRadius: '12px', textAlign: 'center',
        background: 'linear-gradient(135deg, #162340, #1e3054)',
      }}>
        <Text style={{ fontSize: FS.body, fontWeight: 700, color: '#f0ece4' }}>
          {t('shared.share_btn')}
        </Text>
      </View>

      {/* WeChat 隐藏 Canvas */}
      {!isH5 && (
        <Canvas canvasId={CANVAS_ID} style={{
          position: 'absolute', left: '0', top: '0',
          width: `${W}px`, height: `${H}px`, opacity: '0', pointerEvents: 'none',
        }} />
      )}
    </View>
  );
}
