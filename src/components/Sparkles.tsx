import {random} from 'remotion';
import {C, W} from '../config';

// t: 터진 뒤 지난 프레임. 중심(cx,cy)에서 금색 반짝이가 퍼진다
export const Burst: React.FC<{t: number; cx: number; cy: number; seed: string; count?: number; spread?: number}> = ({t, cx, cy, seed, count = 36, spread = 520}) => {
  if (t < 0 || t > 50) return null;
  const k = t / 50;
  return (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      {Array.from({length: count}, (_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const d = (0.3 + 0.7 * random(`${seed}d${i}`)) * spread * (1 - (1 - k) ** 3);
        const x = cx + Math.cos(a) * d;
        const y = cy + Math.sin(a) * d + 200 * k * k;
        const s = (6 + 14 * random(`${seed}s${i}`)) * (1 - k);
        const col = [C.gold, C.goldLight, '#fff', C.red][i % 4];
        return <path key={i} transform={`translate(${x} ${y}) scale(${s / 10})`} d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5Z" fill={col} />;
      })}
    </svg>
  );
};

// 계속 반짝이는 작은 별들 (콜라주·단체사진 배경)
export const Glitter: React.FC<{frame: number; seed: string; count?: number}> = ({frame, seed, count = 40}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
    {Array.from({length: count}, (_, i) => {
      const x = random(`${seed}x${i}`) * W;
      const y = random(`${seed}y${i}`) * 1920;
      const tw = Math.max(0, Math.sin(frame / 7 + random(`${seed}p${i}`) * 6.28));
      return <path key={i} transform={`translate(${x} ${y}) scale(${tw * 1.6})`} d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5Z" fill={i % 3 ? C.goldLight : '#fff'} opacity={0.9} />;
    })}
  </svg>
);
