/**
 * Tab 图标组件 — showroom-v4 SVG 风格
 * 使用 base64 SVG data URI，通过 Image 组件渲染（兼容 H5 + weapp）
 */
import { Image } from '@tarojs/components';

// ── showroom-v4 原始 SVG，替换 currentColor 为占位符 ──

const HOME_SVG = (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`;

const ASSESS_SVG = (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>`;

const ROI_SVG = (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;

const PROFILE_SVG = (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

// ── SVG → base64 data URI ──

function toDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

// ── 图标属性 ──

interface IconProps {
  color: string;
  size?: number;
}

/** 首页 */
export function HomeIcon({ color, size = 22 }: IconProps) {
  return (
    <Image
      src={toDataUri(HOME_SVG(color))}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

/** 测评 */
export function AssessmentIcon({ color, size = 22 }: IconProps) {
  return (
    <Image
      src={toDataUri(ASSESS_SVG(color))}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

/** ROI */
export function RoiIcon({ color, size = 22 }: IconProps) {
  return (
    <Image
      src={toDataUri(ROI_SVG(color))}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

/** 我的 */
export function ProfileIcon({ color, size = 22 }: IconProps) {
  return (
    <Image
      src={toDataUri(PROFILE_SVG(color))}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
