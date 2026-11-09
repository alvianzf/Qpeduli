import type { CSSProperties } from 'react';

type P = { size?: number; className?: string; style?: CSSProperties };

export function Leaf({ size = 80, color = '#5A7EC4', className, style }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} style={style} aria-hidden>
      <path d="M12 68C12 34 34 12 70 10C70 46 48 68 12 68Z" fill={color} />
      <path d="M14 66C32 48 48 34 66 14" stroke="rgba(255,255,255,.55)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Sprout({ size = 80, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} style={style} aria-hidden>
      <path d="M40 72V40" stroke="#4267B2" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 44C40 30 30 22 16 22C16 36 26 44 40 44Z" fill="#5A7EC4" />
      <path d="M40 38C40 26 48 18 64 18C64 32 54 38 40 38Z" fill="#9DB6E3" />
      <ellipse cx="40" cy="73" rx="16" ry="4" fill="#2F4F8A" opacity=".15" />
    </svg>
  );
}

export function HandHeart({ size = 120, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <path d="M60 58C60 58 38 44 38 30C38 22 44 17 51 17C55 17 58 19 60 23C62 19 65 17 69 17C76 17 82 22 82 30C82 44 60 58 60 58Z" fill="#FF5A00" />
      <path d="M12 82C20 76 30 74 40 78L60 86C66 88 66 96 60 96L44 96" stroke="#4267B2" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M44 96L78 96C88 96 98 88 108 74" stroke="#4267B2" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 82L12 100" stroke="#4267B2" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function Tree({ size = 120, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <rect x="54" y="68" width="12" height="44" rx="5" fill="#8B6A43" />
      <circle cx="60" cy="48" r="30" fill="#4D70B8" />
      <circle cx="40" cy="62" r="20" fill="#5A7EC4" />
      <circle cx="82" cy="60" r="20" fill="#4267B2" />
    </svg>
  );
}

export function Flower({ size = 60, color = '#F6C453', className, style }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} style={style} aria-hidden>
      <path d="M30 58V34" stroke="#4267B2" strokeWidth="3" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="30" cy="16" rx="7" ry="11" fill={color} transform={`rotate(${r} 30 28)`} />
      ))}
      <circle cx="30" cy="28" r="6" fill="#FF5A00" />
    </svg>
  );
}

export function Cloud({ width = 220, opacity = 0.8 }: { width?: number; opacity?: number }) {
  return (
    <svg width={width} viewBox="0 0 220 90" aria-hidden style={{ opacity }}>
      <path d="M52 78C26 78 14 62 20 48C26 36 40 34 48 38C52 22 70 12 90 18C102 4 128 6 138 24C158 16 182 28 180 48C200 48 210 66 196 74C190 78 182 78 176 78Z" fill="#fff" />
    </svg>
  );
}

/** Row of swaying grass blades; stretches to its container width. */
export function GrassRow({ height = 46, color = '#4D70B8', count = 40 }: { height?: number; color?: string; count?: number }) {
  const blades = Array.from({ length: count }, (_, i) => {
    const x = (i / count) * 1200 + ((i * 37) % 17);
    const h = 18 + ((i * 53) % 28);
    return { x, h, d: ((i * 7) % 50) / 10 };
  });
  return (
    <svg width="100%" height={height} viewBox="0 0 1200 46" preserveAspectRatio="none" aria-hidden style={{ display: 'block' }}>
      {blades.map((b, i) => (
        <path
          key={i}
          className="grass-blade"
          style={{ animationDelay: `-${b.d}s` }}
          d={`M${b.x} 46 Q${b.x + 3} ${46 - b.h * 0.6} ${b.x + 1} ${46 - b.h} Q${b.x + 9} ${46 - b.h * 0.5} ${b.x + 8} 46Z`}
          fill={color}
          opacity={0.55 + (i % 3) * 0.15}
        />
      ))}
    </svg>
  );
}

export function HillsDivider({ fill = '#EEF6EF', height = 70 }: { fill?: string; height?: number }) {
  return (
    <svg width="100%" height={height} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden style={{ display: 'block' }}>
      <path d="M0 70C140 30 260 30 400 62C540 94 640 96 780 64C920 32 1040 28 1180 58C1290 82 1370 80 1440 66V120H0Z" fill={fill} />
    </svg>
  );
}

/** The Qpeduli "Q": a ring with an orange tail. Transparent, tight to its glyph, no background box. */
export function GoodwillMark({ size = 40, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="30" cy="30" r="21.5" stroke={light ? '#fff' : '#4267B2'} strokeWidth="9" />
      <path d="M40 40L58 58" stroke="#FF5A00" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}
