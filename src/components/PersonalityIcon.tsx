import type { JSX } from 'solid-js';

/**
 * FWTI · 16 种恋爱人格 · 简笔轮廓图标
 * 统一 viewBox 100×100 · stroke 4.2 · round caps
 * 颜色通过 currentColor 继承父容器，默认跟随 CSS var(--terracotta)
 */

type IconFn = () => JSX.Element;

const baseStyle = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 4.2,
  'stroke-linecap': 'round' as const,
  'stroke-linejoin': 'round' as const,
};
const filledStyle = { fill: 'currentColor', stroke: 'none' };

// ========== GZ · 冲 + 炸 ==========

// GZNY 自爆卡车 BOOM
const GZNY: IconFn = () => (
  <g>
    <circle cx="46" cy="62" r="28" style={baseStyle} />
    <path d="M 64 40 Q 72 30 78 32 Q 84 36 80 22" style={baseStyle} />
    <line x1="80" y1="14" x2="80" y2="20" style={baseStyle} />
    <line x1="74" y1="18" x2="70" y2="16" style={baseStyle} />
    <line x1="86" y1="18" x2="90" y2="16" style={baseStyle} />
    <line x1="76" y1="24" x2="72" y2="26" style={baseStyle} />
    <line x1="84" y1="24" x2="88" y2="26" style={baseStyle} />
    <path d="M 34 52 Q 34 44 42 44" style={baseStyle} />
  </g>
);

// GZNF 恋爱脑 CRUSH
const GZNF: IconFn = () => (
  <g>
    <path
      d="M 50 84 Q 18 62 18 40 Q 18 22 34 22 Q 46 22 50 34 Q 54 22 66 22 Q 82 22 82 40 Q 82 62 50 84 Z"
      style={baseStyle}
    />
    <path d="M 34 44 Q 40 40 44 44 Q 40 50 44 54 Q 40 60 44 64" style={baseStyle} />
    <path d="M 56 44 Q 60 40 66 44 Q 60 50 66 54 Q 60 60 66 64" style={baseStyle} />
    <line x1="50" y1="40" x2="50" y2="66" style={baseStyle} />
  </g>
);

// GZLY 醋王 LEMON
const GZLY: IconFn = () => (
  <g>
    <line x1="44" y1="14" x2="56" y2="14" style={baseStyle} />
    <path
      d="M 42 16 L 42 32 L 34 42 L 34 84 Q 34 90 40 90 L 60 90 Q 66 90 66 84 L 66 42 L 58 32 L 58 16"
      style={baseStyle}
    />
    <line x1="38" y1="52" x2="62" y2="52" style={baseStyle} />
    <line x1="38" y1="72" x2="62" y2="72" style={baseStyle} />
    <path d="M 44 60 Q 40 66 44 70 Q 48 66 44 60 Z" style={filledStyle} />
    <path d="M 56 62 Q 52 68 56 72 Q 60 68 56 62 Z" style={baseStyle} />
  </g>
);

// GZLF 浪子/浪女 HW
const GZLF: IconFn = () => (
  <g>
    <path d="M 10 60 Q 22 38 38 50 Q 52 62 62 42 Q 72 22 86 34 Q 94 42 90 58" style={baseStyle} />
    <path d="M 10 70 Q 50 82 90 70" style={baseStyle} />
    <path d="M 78 28 Q 84 28 86 34 Q 86 40 80 40" style={baseStyle} />
    <line x1="18" y1="80" x2="26" y2="80" style={baseStyle} />
    <line x1="38" y1="84" x2="50" y2="84" style={baseStyle} />
    <line x1="62" y1="80" x2="72" y2="80" style={baseStyle} />
  </g>
);

// ========== GR · 冲 + 忍 ==========

// GRNY 卑微战士 BEIWEI
const GRNY: IconFn = () => (
  <g>
    <line x1="14" y1="84" x2="86" y2="84" style={baseStyle} />
    <circle cx="50" cy="46" r="10" style={baseStyle} />
    <path d="M 50 56 L 50 68" style={baseStyle} />
    <path d="M 44 62 Q 34 70 30 84" style={baseStyle} />
    <path d="M 56 62 Q 66 70 70 84" style={baseStyle} />
    <path d="M 50 68 L 42 84" style={baseStyle} />
    <path d="M 50 68 L 58 84" style={baseStyle} />
    <path d="M 64 42 Q 61 48 64 50 Q 67 48 64 42 Z" style={filledStyle} />
  </g>
);

// GRNF 舔狗 SIMP
const GRNF: IconFn = () => (
  <g>
    <circle cx="50" cy="55" r="28" style={baseStyle} />
    <path d="M 24 40 Q 18 20 32 26" style={baseStyle} />
    <path d="M 76 40 Q 82 20 68 26" style={baseStyle} />
    <circle cx="40" cy="50" r="2.5" style={filledStyle} />
    <circle cx="60" cy="50" r="2.5" style={filledStyle} />
    <path d="M 46 60 L 54 60 L 50 66 Z" style={filledStyle} />
    <path d="M 50 66 Q 46 72 42 70" style={baseStyle} />
    <path d="M 50 66 Q 54 72 58 70" style={baseStyle} />
    <path d="M 44 72 Q 50 82 56 72" style={baseStyle} />
    <line x1="50" y1="76" x2="50" y2="80" style={baseStyle} />
  </g>
);

// GRLY 钓系大师 LVCHA
const GRLY: IconFn = () => (
  <g>
    <line x1="14" y1="84" x2="78" y2="20" style={baseStyle} />
    <circle cx="30" cy="68" r="4" style={baseStyle} />
    <path d="M 78 20 Q 88 46 74 68" style={baseStyle} />
    <path d="M 74 68 Q 74 76 68 76 Q 62 76 62 70" style={baseStyle} />
    <path d="M 40 76 Q 28 68 16 76 Q 28 86 40 78 L 48 72 L 48 82 Z" style={baseStyle} />
    <circle cx="22" cy="74" r="1.8" style={filledStyle} />
  </g>
);

// GRLF 正常人 NPC
const GRLF: IconFn = () => (
  <g>
    <circle cx="42" cy="30" r="11" style={baseStyle} />
    <path d="M 38 30 Q 42 34 46 30" style={baseStyle} />
    <line x1="42" y1="41" x2="42" y2="70" style={baseStyle} />
    <path d="M 42 50 L 26 60" style={baseStyle} />
    <path d="M 42 50 L 58 60" style={baseStyle} />
    <line x1="42" y1="70" x2="30" y2="86" style={baseStyle} />
    <line x1="42" y1="70" x2="54" y2="86" style={baseStyle} />
    <path d="M 68 32 L 76 42 L 92 22" style={baseStyle} />
  </g>
);

// ========== DZ · 蹲 + 炸 ==========

// DZNY 定时炸弹 FUZE
const DZNY: IconFn = () => (
  <g>
    <circle cx="48" cy="60" r="28" style={baseStyle} />
    <line x1="48" y1="36" x2="48" y2="40" style={baseStyle} />
    <line x1="72" y1="60" x2="68" y2="60" style={baseStyle} />
    <line x1="48" y1="84" x2="48" y2="80" style={baseStyle} />
    <line x1="24" y1="60" x2="28" y2="60" style={baseStyle} />
    <line x1="48" y1="60" x2="48" y2="46" style={baseStyle} />
    <line x1="48" y1="60" x2="60" y2="60" style={baseStyle} />
    <circle cx="48" cy="60" r="1.8" style={filledStyle} />
    <path d="M 64 38 Q 72 28 78 30" style={baseStyle} />
    <circle cx="80" cy="22" r="3" style={filledStyle} />
    <line x1="80" y1="14" x2="80" y2="18" style={baseStyle} />
    <line x1="86" y1="20" x2="90" y2="18" style={baseStyle} />
  </g>
);

// DZNF 林黛玉 LINDDY
const DZNF: IconFn = () => (
  <g>
    <circle cx="50" cy="50" r="30" style={baseStyle} />
    <path d="M 34 46 Q 40 52 46 46" style={baseStyle} />
    <path d="M 54 46 Q 60 52 66 46" style={baseStyle} />
    <path d="M 34 38 L 44 42" style={baseStyle} />
    <path d="M 66 38 L 56 42" style={baseStyle} />
    <path d="M 36 54 Q 30 66 34 72 Q 40 70 38 62 Q 38 58 36 54 Z" style={filledStyle} />
    <path d="M 42 68 Q 50 62 58 68" style={baseStyle} />
  </g>
);

// DZLY 刺猬 OUCH
const DZLY: IconFn = () => (
  <g>
    <path
      d="M 18 66 Q 18 48 38 46 L 72 46 Q 84 46 84 56 Q 84 72 68 72 L 28 72 Q 18 72 18 66 Z"
      style={baseStyle}
    />
    <circle cx="80" cy="52" r="1.6" style={filledStyle} />
    <path d="M 82 58 L 88 58" style={baseStyle} />
    <circle cx="88" cy="56" r="1.4" style={filledStyle} />
    <line x1="28" y1="46" x2="26" y2="34" style={baseStyle} />
    <line x1="36" y1="44" x2="34" y2="30" style={baseStyle} />
    <line x1="44" y1="44" x2="44" y2="28" style={baseStyle} />
    <line x1="52" y1="44" x2="54" y2="30" style={baseStyle} />
    <line x1="60" y1="44" x2="62" y2="32" style={baseStyle} />
    <line x1="32" y1="72" x2="32" y2="78" style={baseStyle} />
    <line x1="46" y1="72" x2="46" y2="78" style={baseStyle} />
    <line x1="60" y1="72" x2="60" y2="78" style={baseStyle} />
  </g>
);

// DZLF 猫系恋人 MEOW
const DZLF: IconFn = () => (
  <g>
    <path
      d="M 24 58 Q 24 32 50 32 Q 76 32 76 58 Q 76 82 50 82 Q 24 82 24 58 Z"
      style={baseStyle}
    />
    <path d="M 28 40 L 22 18 L 42 32" style={baseStyle} />
    <path d="M 72 40 L 78 18 L 58 32" style={baseStyle} />
    <path d="M 38 50 Q 38 58 42 58 Q 42 50 42 46" style={baseStyle} />
    <path d="M 58 50 Q 58 58 62 58 Q 62 50 62 46" style={baseStyle} />
    <path d="M 46 62 L 54 62 L 50 66 Z" style={filledStyle} />
    <path d="M 50 66 Q 46 72 42 70" style={baseStyle} />
    <path d="M 50 66 Q 54 72 58 70" style={baseStyle} />
    <line x1="14" y1="60" x2="34" y2="62" style={baseStyle} />
    <line x1="14" y1="68" x2="34" y2="66" style={baseStyle} />
    <line x1="66" y1="62" x2="86" y2="60" style={baseStyle} />
    <line x1="66" y1="66" x2="86" y2="68" style={baseStyle} />
  </g>
);

// ========== DR · 蹲 + 忍 ==========

// DRNY 透明人 GHOST
const DRNY: IconFn = () => (
  <g>
    <path
      d="M 24 40 Q 24 16 50 16 Q 76 16 76 40 L 76 82 L 68 76 L 58 82 L 50 76 L 42 82 L 32 76 L 24 82 Z"
      style={{ ...baseStyle, 'stroke-dasharray': '5 4' }}
    />
    <circle cx="42" cy="40" r="2.2" style={filledStyle} />
    <circle cx="58" cy="40" r="2.2" style={filledStyle} />
    <circle cx="50" cy="54" r="2.6" style={baseStyle} />
  </g>
);

// DRNF 树懒 BAILAN
const DRNF: IconFn = () => (
  <g>
    <line x1="8" y1="20" x2="92" y2="20" style={baseStyle} />
    <ellipse cx="50" cy="58" rx="24" ry="28" style={baseStyle} />
    <path d="M 34 38 Q 26 28 22 20" style={baseStyle} />
    <path d="M 66 38 Q 74 28 78 20" style={baseStyle} />
    <path d="M 18 20 L 22 14 L 26 20" style={baseStyle} />
    <path d="M 74 20 L 78 14 L 82 20" style={baseStyle} />
    <path d="M 38 52 Q 42 56 46 52" style={baseStyle} />
    <path d="M 54 52 Q 58 56 62 52" style={baseStyle} />
    <circle cx="50" cy="60" r="1.5" style={filledStyle} />
    <path d="M 44 66 Q 50 70 56 66" style={baseStyle} />
    <path d="M 40 82 Q 42 88 46 84" style={baseStyle} />
    <path d="M 60 82 Q 58 88 54 84" style={baseStyle} />
  </g>
);

// DRLY 仙人掌 FROST
const DRLY: IconFn = () => (
  <g>
    <path d="M 32 76 L 36 92 L 64 92 L 68 76 Z" style={baseStyle} />
    <line x1="28" y1="76" x2="72" y2="76" style={baseStyle} />
    <path d="M 42 76 L 42 30 Q 42 22 50 22 Q 58 22 58 30 L 58 76" style={baseStyle} />
    <path d="M 42 50 L 32 50 Q 26 50 26 44 L 26 34" style={baseStyle} />
    <path d="M 58 42 L 68 42 Q 74 42 74 36 L 74 26" style={baseStyle} />
    <line x1="48" y1="34" x2="52" y2="34" style={baseStyle} />
    <line x1="50" y1="32" x2="50" y2="36" style={baseStyle} />
    <line x1="48" y1="52" x2="52" y2="52" style={baseStyle} />
    <line x1="50" y1="50" x2="50" y2="54" style={baseStyle} />
    <line x1="48" y1="66" x2="52" y2="66" style={baseStyle} />
    <line x1="50" y1="64" x2="50" y2="68" style={baseStyle} />
    <line x1="28" y1="38" x2="32" y2="38" style={baseStyle} />
    <line x1="30" y1="36" x2="30" y2="40" style={baseStyle} />
    <line x1="70" y1="30" x2="74" y2="30" style={baseStyle} />
    <line x1="72" y1="28" x2="72" y2="32" style={baseStyle} />
  </g>
);

// DRLF 已读不回 GONE
const DRLF: IconFn = () => (
  <g>
    <rect x="26" y="10" width="48" height="80" rx="7" style={baseStyle} />
    <line x1="44" y1="18" x2="56" y2="18" style={baseStyle} />
    <circle cx="50" cy="84" r="2.2" style={baseStyle} />
    <rect x="32" y="28" width="28" height="10" rx="4" style={baseStyle} />
    <rect x="40" y="44" width="28" height="10" rx="4" style={baseStyle} />
    <rect x="32" y="60" width="22" height="10" rx="4" style={baseStyle} />
    <path d="M 58 68 L 60 71 L 64 66" style={baseStyle} />
    <path d="M 62 68 L 64 71 L 68 66" style={baseStyle} />
  </g>
);

const ICONS: Record<string, IconFn> = {
  GZNY, GZNF, GZLY, GZLF,
  GRNY, GRNF, GRLY, GRLF,
  DZNY, DZNF, DZLY, DZLF,
  DRNY, DRNF, DRLY, DRLF,
};

export interface PersonalityIconProps {
  code: string;
  size?: number;
  class?: string;
}

export default function PersonalityIcon(props: PersonalityIconProps) {
  const size = () => props.size ?? 120;
  const Icon = () => ICONS[props.code] ?? GRLF;
  return (
    <svg
      class={props.class}
      width={size()}
      height={size()}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`FWTI ${props.code} icon`}
    >
      {Icon()()}
    </svg>
  );
}
