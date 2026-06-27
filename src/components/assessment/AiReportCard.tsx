/**
 * AI 深度报告卡片 — 样式参考样板间 showroom-v4.html
 *
 * 结构：头部 → 画像分析 → 机会雷达 → 优先行动 → 改进路线图 → 保存
 * PRD §8.2 约束：AI 报告含4段固定结构 + System Prompt 边界锁定
 */
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import { FS } from '../../constants/fonts';
import type { AiReportOutput } from '../../types/ai';

interface Props {
  report: AiReportOutput | null;
  segmentLabel: string;           // 段位标签，如"谨慎型技术派"
  isFallback: boolean;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const card = {
  background: '#ffffff', borderRadius: '16px', padding: '16px',
  border: '1px solid #edeff3', marginBottom: '10px',
};

export default function AiReportCard({ report, segmentLabel, isFallback, loading, error, onRetry }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={{ marginTop: '16px' }}>
        <View style={{ ...card, textAlign: 'center', padding: '24px 16px' }}>
          <Text style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🤖</Text>
          <Text style={{ fontSize: FS.body, fontWeight: 600, color: '#1a1f2e', display: 'block', marginBottom: '6px' }}>
            正在生成 AI 深度报告...
          </Text>
          <Text style={{ fontSize: FS.caption, color: '#9298a8' }}>
            AI 正在分析你的 11 维度画像，预计 5-8 秒
          </Text>
          <View style={{
            marginTop: '12px', height: '4px', background: '#edeff3',
            borderRadius: '2px', overflow: 'hidden',
          }}>
            <View style={{
              height: '100%', width: '60%',
              background: 'linear-gradient(90deg, #C5A059, #d4b86a)',
              borderRadius: '2px',
            }} />
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ marginTop: '16px' }}>
        <View style={{ ...card, textAlign: 'center' }}>
          <Text style={{ fontSize: FS.body, color: '#d47563', display: 'block', marginBottom: '8px' }}>
            ⚠️ {error}
          </Text>
          <View onClick={onRetry} style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: '10px',
            background: '#162340', color: '#f0ece4', fontSize: FS.label, fontWeight: 600,
          }}>
            重试
          </View>
        </View>
      </View>
    );
  }

  if (!report) return null;

  return (
    <View style={{ marginTop: '16px' }}>
      {/* ═══ 页面标题 ═══ */}
      <Text style={{
        fontSize: '18px', fontWeight: 700, color: '#1a1f2e',
        textAlign: 'center', display: 'block', marginBottom: '12px',
      }}>
        AI 深度报告
      </Text>

      {/* 降级提示 */}
      {isFallback && (
        <View style={{
          padding: '10px 12px', borderRadius: '10px', marginBottom: '12px',
          background: 'rgba(224,136,58,0.08)', border: '1px solid rgba(224,136,58,0.2)',
        }}>
          <Text style={{ fontSize: FS.caption, color: '#e0883a', lineHeight: '18px' }}>
            📡 网络不稳定，AI 报告暂不可用 —— 以下是基于你的测评分数的画像分析
            <Text onClick={onRetry} style={{ color: '#e0883a', fontWeight: 700, textDecoration: 'underline', marginLeft: '4px' }}>重试</Text>
          </Text>
        </View>
      )}

      {/* ═══ 头部 ═══ */}
      <View style={{ textAlign: 'center', padding: '8px 0 10px' }}>
        <Text style={{ fontSize: '32px', display: 'block', marginBottom: '4px' }}>🧭</Text>
        <Text style={{ fontSize: '13px', fontWeight: 700, color: '#162340', display: 'block' }}>
          你的画像：{segmentLabel}
        </Text>
        <Text style={{ fontSize: '10px', color: '#9298a8', marginTop: '2px', display: 'block' }}>
          AI 基于 11 维度测评结果生成 · 非通用模板
        </Text>
      </View>

      {/* ═══ 画像分析 ═══ */}
      <View style={card}>
        <Text style={{
          fontSize: '13px', fontWeight: 700, color: '#1a1f2e',
          display: 'block', marginBottom: '8px',
        }}>
          🧭 为什么你是"{segmentLabel}"
        </Text>
        <Text style={{ fontSize: '12px', color: '#3a4056', lineHeight: '18px' }}>
          {report.segmentAnalysis}
        </Text>
      </View>

      {/* ═══ 机会雷达 ═══ */}
      <View style={card}>
        <Text style={{
          fontSize: '13px', fontWeight: 700, color: '#1a1f2e',
          display: 'block', marginBottom: '2px',
        }}>
          💰 机会雷达：你的短板改 1 分，天花板就抬一截
        </Text>
        <Text style={{
          fontSize: '10px', color: '#9298a8', display: 'block', marginBottom: '10px',
        }}>
          按改进 ROI 排序。填入成本数据后可解锁具体金额。
        </Text>
        {report.opportunities.map((opp, i) => {
          const borderColors: Record<number, string> = { 1: '#d47563', 2: '#e0883a', 3: '#C5A059' };
          const borderColor = borderColors[opp.roiRank] || '#C5A059';
          const bgMap: Record<string, string> = {
            '#d47563': 'rgba(212,117,99,0.04)',
            '#e0883a': 'rgba(224,136,58,0.04)',
          };
          const bg = bgMap[borderColor] || 'rgba(197,160,89,0.04)';

          return (
            <View key={i} style={{
              padding: '10px 12px', borderRadius: '12px',
              marginBottom: i === report.opportunities.length - 1 ? '0' : '6px',
              background: bg,
              borderLeft: `3px solid ${borderColor}`,
            }}>
              <Text style={{
                fontSize: '12px', fontWeight: 600, color: borderColor,
                display: 'block', marginBottom: '4px',
              }}>
                {opp.dimension} {opp.currentScore}→{opp.targetScore} · 全图最低分
              </Text>
              {/* 描述文案：AI 生成的 financialImpact 或 directionGuide */}
              {(opp.financialImpact || opp.directionGuide) && (
                <Text style={{ fontSize: '11px', color: '#3a4056', lineHeight: '18px', display: 'block', marginBottom: '4px' }}>
                  {opp.financialImpact || opp.directionGuide}
                </Text>
              )}
              {/* 无成本数据时显示引导 */}
              {!opp.financialImpact && (
                <Text style={{ fontSize: '10px', color: '#C5A059', marginTop: '2px', display: 'block' }}>
                  → 填入成本数据，解锁改 1 分能多赚多少钱
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* ═══ 优先行动 ═══ */}
      <View style={card}>
        <Text style={{
          fontSize: '13px', fontWeight: 700, color: '#1a1f2e',
          display: 'block', marginBottom: '8px',
        }}>
          🎯 优先行动：本周就能做的三件事
        </Text>
        {report.actionItems.map((item, i) => (
          <View key={i} style={{ display: 'flex', gap: '8px', marginBottom: i < 2 ? '10px' : '0' }}>
            <View style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: i === 0 ? '#C5A059' : i === 1 ? 'rgba(197,160,89,0.6)' : 'rgba(197,160,89,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: '2px',
            }}>
              <Text style={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '11px', color: '#3a4056', lineHeight: '16px' }}>
                {item.action}
              </Text>
              <Text style={{ fontSize: '9px', color: '#9298a8', marginTop: '2px', display: 'block' }}>
                ← {item.sourceDimension}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ═══ 改进路线图 ═══ */}
      <View style={card}>
        <Text style={{
          fontSize: '13px', fontWeight: 700, color: '#1a1f2e',
          display: 'block', marginBottom: '10px',
        }}>
          📈 改进路线图
        </Text>
        {report.roadmap && report.roadmap.length > 0 ? (
          report.roadmap.map((item, i) => (
            <View key={i} style={{
              display: 'flex', gap: '12px', padding: '10px 0',
              borderBottom: i < report.roadmap!.length - 1 ? '1px solid #edeff3' : 'none',
            }}>
              <View style={{
                minWidth: '56px', padding: '4px 8px', borderRadius: '6px',
                background: '#162340', textAlign: 'center',
              }}>
                <Text style={{ fontSize: FS.caption, fontWeight: 700, color: '#f0ece4' }}>
                  {item.timeline}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FS.label, fontWeight: 500, color: '#1a1f2e' }}>
                  {item.target}
                </Text>
                <Text style={{ fontSize: FS.caption, color: '#4a9c7c', fontWeight: 600 }}>
                  {item.expectedProfit}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{
            padding: '20px 12px', border: '1.5px dashed #edeff3',
            borderRadius: '12px', background: '#fafbfc', textAlign: 'center',
          }}>
            <Text style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>🔓</Text>
            <Text style={{
              fontSize: '12px', fontWeight: 600, color: '#162340',
              display: 'block', marginBottom: '4px',
            }}>
              填入成本数据，解锁完整路线图
            </Text>
            <Text style={{
              fontSize: '11px', color: '#9298a8', lineHeight: '16px', marginBottom: '12px',
            }}>
              在 ROI 利润分析中填写你的成本、定价和销量{'\n'}AI 将生成：3/6/12 个月目标 + 预期财务变化
            </Text>
            <View onClick={() => {
              Taro.switchTab({ url: '/pages/roi/index' });
            }} style={{
              display: 'inline-block', padding: '10px 24px',
              border: '1.5px solid #C5A059', borderRadius: '999px',
              background: 'rgba(197,160,89,0.06)',
            }}>
              <Text style={{ fontSize: '12px', fontWeight: 600, color: '#C5A059' }}>
                去填写成本数据 →
              </Text>
            </View>
          </View>
        )}
      </View>

    </View>
  );
}
