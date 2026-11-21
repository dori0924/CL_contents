import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, SAFE, W} from '../config';
import {Glitter} from '../components/Sparkles';
import type {Photo} from '../types';

const AREA = {x: SAFE.left, y: SAFE.top, w: W - SAFE.left - SAFE.right, h: H - SAFE.top - SAFE.bottom};
const GAP = 18;

// 05 클라이맥스: 반 마디마다 한 칸씩 사진이 바뀌는 2×2 → 2×3 콜라주
export const Collage: React.FC<{photos: Photo[]; halfBar: number; dur: number}> = ({photos, halfBar, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const second = frame >= dur / 2;
  const [cols, rows] = second ? [2, 3] : [2, 2];
  const S = cols * rows;
  const start = second ? Math.round(dur / 2) : 0;
  const step = Math.floor((frame - start) / halfBar);
  const cw = (AREA.w - GAP * (cols - 1)) / cols;
  const ch = (AREA.h - GAP * (rows - 1)) / rows;
  const base = second ? 4 + Math.floor(dur / 2 / halfBar) : 0;
  return (
    <AbsoluteFill>
      <Glitter frame={frame} seed="collage" count={46} />
      {Array.from({length: S}, (_, j) => {
        // 이 칸이 마지막으로 바뀐 단계 (j번 칸은 step % S === j 일 때 바뀐다)
        const last = step - ((((step - j) % S) + S) % S);
        const changedAt = last >= 0 ? start + last * halfBar : start;
        const idx = last >= 0 ? base + S + last : base + j;
        const photo = photos[idx % photos.length];
        const pop = spring({frame: frame - changedAt - (last < 0 ? j * 2 : 0), fps, config: {damping: 10, stiffness: 170}});
        const c = j % cols, r = Math.floor(j / cols);
        return (
          <div key={`${second}-${j}`} style={{position: 'absolute', left: AREA.x + c * (cw + GAP), top: AREA.y + r * (ch + GAP), width: cw, height: ch, transform: `scale(${0.6 + 0.4 * pop})`, opacity: Math.min(1, pop * 1.5), borderRadius: 22, overflow: 'hidden', border: `6px solid ${j % 2 ? C.gold : C.snow}`, boxShadow: '0 14px 30px rgba(0,0,0,0.45)'}}>
            <Img src={staticFile(photo.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
