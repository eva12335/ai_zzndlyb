/**
 * AI 深度报告卡片 — 占位符
 * 后续开发真正的 AI 分析报告
 */
import { View, Text } from '@tarojs/components';

export default function AiReportCard() {
  return (
    <View style={{ marginTop: '16px' }}>
      <View style={{
        background: '#fafbfc', borderRadius: '12px', padding: '20px 16px',
        border: '1.5px dashed #edeff3', textAlign: 'center',
      }}
      >
        <Text style={{ fontSize: '14px', fontWeight: 600, color: '#9298a8', lineHeight: '20px' }}>
          AI 深度分析报告即将上线，敬请期待
        </Text>
      </View>
    </View>
  );
}
