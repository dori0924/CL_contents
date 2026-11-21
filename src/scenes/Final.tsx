import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SETTINGS} from '../config';
import {XMAS} from '../fonts';
import {Polaroid} from '../components/Polaroid';
import {Burst, Glitter} from '../components/Sparkles';
import type {Photo} from '../types';

// 06 단체사진: 크게 등장 + 마디마다 금색 반짝이, 위아래에 인사
export const Final: React.FC<{photo: Photo; barFrames: number}> = ({photo, barFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 110}});
  const t1 = spring({frame: frame - 10, fps, config: {damping: 12}});
  const t2 = spring({frame: frame - 18, fps, config: {damping: 12}});
  const w = photo.orientation === 'portrait' ? 660 : 880;
  const bars = Math.floor(frame / barFrames);
  const text = (fontSize: number, v: number, children: string) => (
    <div style={{fontFamily: XMAS, fontWeight: 700, fontSize, color: C.goldLight, textShadow: `0 0 24px ${C.gold}, 0 5px 0 ${C.redDeep}`, transform: `scale(${v})`, opacity: v, textAlign: 'center', lineHeight: 1}}>{children}</div>
  );
  return (
    <AbsoluteFill>
      <Glitter frame={frame} seed="final" count={60} />
      <AbsoluteFill style={{alignItems: 'center', paddingRight: 90}}>
        <div style={{marginTop: 270}}>{text(112, t1, SETTINGS.finalText[0])}</div>
        <div style={{marginTop: 34, transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(${interpolate(s, [0, 1], [-10, -1.5])}deg)`}}>
          {/* 단체사진은 사람이 아래쪽에 작게 찍히는 일이 많아, 천천히 사람 쪽으로 확대한다 */}
          <Polaroid photo={photo} width={w} clip={false} label={null} zoom={interpolate(frame, [0, 200], [1.25, 1.45], {extrapolateRight: 'clamp'})} focusY={68} />
        </div>
        <div style={{marginTop: 30}}>{text(84, t2, SETTINGS.finalText[1])}</div>
      </AbsoluteFill>
      {Array.from({length: bars + 1}, (_, i) => (
        <Burst key={i} t={frame - i * barFrames} cx={495} cy={880} seed={`fin${i}`} count={44} spread={640} />
      ))}
    </AbsoluteFill>
  );
};
