import {BULB_COLORS, W} from '../config';

// 위쪽에 늘어진 전구 줄. lit: 켜진 전구 수(소수 허용), twinkle: 반짝임 위상
export const LightString: React.FC<{y: number; sag?: number; bulbs?: number; lit?: number; twinkle?: number}> = ({
  y, sag = 90, bulbs = 11, lit = 999, twinkle = 0,
}) => {
  const x0 = -30, x1 = W + 30;
  const pt = (t: number) => ({x: x0 + (x1 - x0) * t, y: y + sag * 4 * t * (1 - t)});
  const d = `M ${x0} ${y} Q ${W / 2} ${y + sag * 2} ${x1} ${y}`;
  return (
    <svg width={W} height={y + sag + 120} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={d} stroke="#2B3B2B" strokeWidth={5} fill="none" />
      {Array.from({length: bulbs}, (_, i) => {
        const t = (i + 0.5) / bulbs;
        const p = pt(t);
        const on = Math.min(1, Math.max(0, lit - i));
        const color = BULB_COLORS[i % BULB_COLORS.length];
        const glow = on * (0.75 + 0.25 * Math.sin(twinkle * Math.PI * 2 + i * 1.7));
        return (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${(t - 0.5) * 30})`}>
            <rect x={-7} y={-2} width={14} height={14} rx={3} fill="#3A4A3A" />
            <circle cx={0} cy={34} r={46} fill={color} opacity={0.28 * glow} style={{filter: 'blur(10px)'}} />
            <ellipse cx={0} cy={30} rx={13} ry={20} fill={on > 0 ? color : '#4A5068'} opacity={0.35 + 0.65 * on} />
            <ellipse cx={-4} cy={24} rx={4} ry={7} fill="#fff" opacity={0.6 * on} />
          </g>
        );
      })}
    </svg>
  );
};
