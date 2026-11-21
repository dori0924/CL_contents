import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {H, W} from '../config';

const FLAKES = Array.from({length: 90}, (_, i) => ({
  x: random(`x${i}`) * W,
  y0: random(`y${i}`) * H,
  r: 2 + random(`r${i}`) * 5,
  v: 1.2 + random(`v${i}`) * 2.4,
  sway: 10 + random(`s${i}`) * 30,
  p: random(`p${i}`) * Math.PI * 2,
}));

// 맨 위에 얹는 눈. 크기가 클수록 빠르고 진하게(원근감)
export const Snow: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      <svg width={W} height={H}>
        {FLAKES.map((f, i) => {
          const y = (f.y0 + frame * f.v * (f.r / 4)) % (H + 20) - 10;
          const x = f.x + Math.sin(frame / 40 + f.p) * f.sway;
          return <circle key={i} cx={x} cy={y} r={f.r} fill="#fff" opacity={0.35 + f.r / 12} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
