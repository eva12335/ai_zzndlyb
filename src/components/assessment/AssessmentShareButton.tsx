/**
 * 测评分享按钮 — Canvas 绘图 → showShareImageMenu 原生转发
 */
import { useRef, useCallback } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Taro from '@tarojs/taro';
import { FS } from '../../constants/fonts';
import { DIMENSION_NAMES } from '../../utils/assessment';
import type { AssessmentResult, DimensionScores } from '../../types/assessment';
import qrcodeImg from '../../assets/qrcode.png';

interface Props {
  result: AssessmentResult;
}

// ═══ Canvas 尺寸 ═══
const W = 375;
const H = 620;


// ═══ 段位解读 ═══
const INTERPRETATIONS: Record<string, string> = {
  '谨慎型技术派':
    '自驱力强，AI技能熟练，市场嗅觉也在线，但对风险偏保守。你适合用技术杠杆替代资金杠杆，用数据验证替代赌博——副业稳步过渡是最适合你的路径。',
  '直觉型探索者':
    '敢于冒险，自驱力强。热情是你的燃料。下一步可以把AI工具纳入日常流程，让系统帮你的直觉落地，减少对个人精力的依赖。',
  'AI增强型个体':
    '自驱力和AI技能是你的双引擎，已经具备了独立经营的核心条件。下一步的重点是优化获客渠道和提升客单价，把产能天花板往上推。',
  '稳健型实干家':
    '市场嗅觉敏锐，做事稳健。你适合先跑通一个最小可行产品，用数据验证市场反应。AI技能提升之后，你会事半功倍。',
  '待激活观望者':
    '当前处于积累阶段，各方面分数还有提升空间。这不代表不适合一人公司——可以从最小可行第一步开始：用业余时间接一个项目，测试市场对你的价值反馈。',
  '全能型一人公司':
    '自驱力、AI技能、市场获客和风险承受全面在线，已具备独立经营的全部条件。下一步不是能不能做，而是如何规模化——产品化服务、提价、建立被动收入。',
};

// ═══ 雷达图缩写标签 ═══
const RADAR_LABELS: Record<string, string> = {
  '创办OPC的动机': '动机', '风险承受能力': '风险承受',
  '坚韧不拔/处理危机能力': '坚韧力', '主动性': '主动性',
  '协调家庭·社会·OPC关系的能力': '家庭平衡', '决策能力': '决策力',
  '适应OPC需要的能力': '适应力', '对OPC的承诺': '承诺',
  '家庭支持': '家庭支持', '谈判技巧': '谈判力',
  'AI &自媒体运用': 'AI技能',
};

const N = DIMENSION_NAMES.length;

// ═══ Canvas ID ═══
const CANVAS_ID = 'share-canvas';

// ═══ 文字换行 ═══
function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const ch of text) {
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = ch;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ═══ Canvas 绘制主函数 ═══
async function drawAndShare(result: AssessmentResult) {
  try {
    // 准备二维码路径：base64 需先写入临时文件
    let qrDrawPath = '';
    if (typeof qrcodeImg === 'string') {
      if (qrcodeImg.startsWith('data:')) {
        // base64 → 写入临时文件
        try {
          const fs = Taro.getFileSystemManager();
          const tmpPath = `${Taro.env.USER_DATA_PATH}/qrcode-tmp.png`;
          const base64 = qrcodeImg.replace(/^data:image\/\w+;base64,/, '');
          fs.writeFileSync(tmpPath, base64, 'base64');
          qrDrawPath = tmpPath;
        } catch (_) { /* 写入失败则跳过 */ }
      } else {
        // 路径字符串，直接使用
        qrDrawPath = qrcodeImg;
      }
    }

    const ctx = Taro.createCanvasContext(CANVAS_ID);

    // ── 背景 ──
    ctx.setFillStyle('#162340');
    ctx.fillRect(0, 0, W, H);

    let y = 0;

    // ── 品牌名 ──
    y += 32;
    ctx.setFontSize(13);
    ctx.setFillStyle('rgba(240,236,228,0.5)');
    ctx.setTextAlign('center');
    ctx.fillText('OPC 创业罗盘', W / 2, y);

    // ── 人格类型标签 ──
    y += 28;
    ctx.setFontSize(14);
    ctx.setFillStyle('rgba(240,236,228,0.6)');
    ctx.fillText('你的创业人格类型', W / 2, y);

    y += 28;
    ctx.setFontSize(22);
    ctx.setFillStyle('#C5A059');
    ctx.setTextAlign('center');
    ctx.fillText(result.segment, W / 2, y);

    // ── 洞察文字 ──
    const insight = INTERPRETATIONS[result.segment] ?? '';
    if (insight) {
      y += 24;
      ctx.setFontSize(12);
      ctx.setFillStyle('rgba(240,236,228,0.65)');
      ctx.setTextAlign('center');
      const wrapped = wrapText(ctx, `"${insight}"`, W - 60);
      for (const line of wrapped) {
        ctx.fillText(line, W / 2, y);
        y += 20;
      }
    }

    // ── 雷达图 ──
    y += 16;
    const radarCY = y + 80;
    const radarCX = W / 2;
    const MAX_R = 65;
    const levels = [2, 4, 6, 8, 10];

    function radarPoint(i: number, r: number) {
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      return { x: radarCX + r * Math.cos(angle), y: radarCY + r * Math.sin(angle) };
    }

    // 网格
    for (const level of levels) {
      const r = (level / 10) * MAX_R;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const { x, y: py } = radarPoint(i, r);
        i === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
      }
      ctx.closePath();
      ctx.setStrokeStyle('rgba(240,236,228,0.12)');
      ctx.setLineWidth(0.8);
      ctx.stroke();
    }

    // 轴线
    for (let i = 0; i < N; i++) {
      const { x, y: py } = radarPoint(i, MAX_R);
      ctx.beginPath();
      ctx.moveTo(radarCX, radarCY);
      ctx.lineTo(x, py);
      ctx.setStrokeStyle('rgba(240,236,228,0.06)');
      ctx.setLineWidth(0.5);
      ctx.stroke();
    }

    // 数据多边形
    const scores: DimensionScores = result.dimensionScores;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const dim = DIMENSION_NAMES[i];
      const score = Math.max(0, Math.min(scores[dim]?.scoreA ?? 0, 10));
      const r = (score / 10) * MAX_R;
      const { x, y: py } = radarPoint(i, r);
      i === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
    }
    ctx.closePath();
    ctx.setFillStyle('rgba(197,160,89,0.15)');
    ctx.fill();
    ctx.setStrokeStyle('#C5A059');
    ctx.setLineWidth(2);
    ctx.stroke();

    // 数据点
    for (let i = 0; i < N; i++) {
      const dim = DIMENSION_NAMES[i];
      const score = Math.max(0, Math.min(scores[dim]?.scoreA ?? 0, 10));
      const { x, y: py } = radarPoint(i, (score / 10) * MAX_R);
      ctx.beginPath();
      ctx.arc(x, py, 2.5, 0, 2 * Math.PI);
      ctx.setFillStyle('#C5A059');
      ctx.fill();
    }

    // 维度标签
    ctx.setFontSize(9);
    ctx.setFillStyle('rgba(240,236,228,0.6)');
    ctx.setTextAlign('center');
    ctx.setTextBaseline('middle');
    for (let i = 0; i < N; i++) {
      const { x, y: py } = radarPoint(i, MAX_R + 16);
      const dim = DIMENSION_NAMES[i];
      const label = RADAR_LABELS[dim] || dim;
      ctx.fillText(label, x, py);
    }

    y = radarCY + MAX_R + 30;

    // ── CTA ──
    y += 12;
    ctx.setFontSize(12);
    ctx.setFillStyle('rgba(240,236,228,0.55)');
    ctx.setTextAlign('center');
    ctx.fillText('扫码测测你是哪种创业者', W / 2, y);

    // ── 小程序码 ──
    y += 16;
    const qrSize = 88;
    const qrX = (W - qrSize) / 2;
    // 白色背景
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(qrX - 4, y - 4, qrSize + 8, qrSize + 8);
    if (qrDrawPath) {
      ctx.drawImage(qrDrawPath, qrX, y, qrSize, qrSize);
    }

    y += qrSize + 8;

    // ── 搜索引导 ──
    y += 12;
    ctx.setFontSize(11);
    ctx.setFillStyle('rgba(240,236,228,0.4)');
    ctx.setTextAlign('center');
    ctx.fillText('微信搜一搜「OPC 创业罗盘」', W / 2, y);

    // ── 绘制完成 ──
    ctx.draw(false, async () => {
      try {
        const res = await Taro.canvasToTempFilePath({
          canvasId: CANVAS_ID,
          fileType: 'png',
          quality: 1,
        });
        // 优先尝试原生分享菜单（转发/朋友圈/保存）
        Taro.showShareImageMenu({
          path: res.tempFilePath,
          fail: () => {
            // 开发工具/低版本微信不支持 → 降级保存到相册
            Taro.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                Taro.showToast({ title: '已保存到相册，去发朋友圈吧', icon: 'none', duration: 2500 });
              },
              fail: () => {
                // 相册权限未开 → 预览图片让用户长按保存
                Taro.previewImage({ urls: [res.tempFilePath] });
              },
            });
          },
        });
      } catch (e) {
        console.warn('[Share] canvasToTempFilePath fail', e);
        Taro.showToast({ title: '生成图片失败，请重试', icon: 'none' });
      }
    });
  } catch (e) {
    console.warn('[Share] draw fail', e);
  }
}

export default function AssessmentShareButton({ result }: Props) {
  const { t } = useTranslation();
  const busyRef = useRef(false);

  const handleShare = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    drawAndShare(result).finally(() => {
      busyRef.current = false;
    });
  }, [result]);

  return (
    <View>
      {/* 分享按钮 */}
      <View
        onClick={handleShare}
        style={{
          marginTop: '16px',
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #162340, #1e3054)',
        }}
      >
        <Text style={{ fontSize: FS.body, fontWeight: 700, color: '#f0ece4' }}>
          {t('shared.share_btn')}
        </Text>
      </View>

      {/* 隐藏 Canvas：opacity:0 不可见但正常渲染，确保 canvasToTempFilePath 正确导出 */}
      <Canvas
        canvasId={CANVAS_ID}
        style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          width: `${W}px`,
          height: `${H}px`,
          opacity: '0',
          transform: 'translateX(-50%)',
        }}
      />
    </View>
  );
}
