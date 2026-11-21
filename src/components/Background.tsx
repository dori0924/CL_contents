import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C, H, W} from '../config';

const STARS = Array.from({length: 70}, (_, i) => ({
  x: random(`sx${i}`) * W,
  y: random(`sy${i}`) * H * 0.85,
  r: 1 + random(`sr${i}`) * 2.2,
  p: random(`sp${i}`) * Math.PI * 2,
}));

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 0%, #1E3566 0%, ${C.navy} 45%, ${C.navyDeep} 100%)`}}>
      <svg width={W} height={H}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.25 + 0.5 * (0.5 + 0.5 * Math.sin(frame / 18 + s.p))} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
