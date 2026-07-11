/**
 * 首页 Hero 面板 — 品牌展示，纯文案不含 CTA
 */
import { View, Text } from '@tarojs/components';

const LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#C5A059" stroke-width="1.6"/><circle cx="16" cy="16" r="9" stroke="#C5A059" stroke-width="0.6" opacity="0.4"/><line x1="16" y1="3" x2="16" y2="8" stroke="#C5A059" stroke-width="1.6" stroke-linecap="round"/><polygon points="16,10 13,5 19,5" fill="#C5A059"/></svg>'
)}`;

export default function HeroPanel() {
  return (
    <View style={{
      background: 'linear-gradient(135deg, #162340, #1e3054)', borderRadius: '20px',
      padding: '24px 20px 20px', marginBottom: '16px',
    }}
    >
      {/* Logo + 标题 */}
      <View style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '16px',
      }}
      >
        <View style={{
          width: '32px', height: '32px', flexShrink: 0,
          backgroundImage: `url(${LOGO_SVG})`,
          backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
        }}
        />
        <Text style={{
          fontSize: '18px', fontWeight: 700, color: '#f0ece4',
        }}
        >
          OPC创业罗盘
        </Text>
      </View>

      {/* 副标题 */}
      <Text style={{
        fontSize: '12px', color: 'rgba(255,255,255,0.5)',
        display: 'block', marginBottom: '8px',
      }}
      >
        AI测评 · ROI分析 · 一人公司经营罗盘
      </Text>

      {/* 标题文案 */}
      <Text style={{
        fontSize: '21px', fontWeight: 800, color: '#f0ece4',
        lineHeight: 1.35, display: 'block', marginBottom: '6px',
      }}
      >
        你适合一个人干吗？
        <Text style={{ color: '#C5A059', marginLeft: '4px' }}>心里没谱</Text>
      </Text>
      <Text style={{
        fontSize: '21px', fontWeight: 800, color: '#f0ece4',
        lineHeight: 1.35, display: 'block',
      }}
      >
        成本门儿清，
        <Text style={{ color: '#C5A059' }}>回本没底</Text>
        ？
      </Text>
      <Text style={{
        fontSize: '18px', fontWeight: 700, color: '#f0ece4',
        lineHeight: 1.5, display: 'block', marginTop: '8px',
      }}
      >
        丢个数，我们帮你算明白。
      </Text>
    </View>
  );
}
