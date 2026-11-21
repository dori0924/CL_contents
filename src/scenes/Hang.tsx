import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {LightString} from '../components/LightString';
import {Polaroid} from '../components/Polaroid';
import type {Photo} from '../types';

const STRING_Y = 280;

const Item: React.FC<{photo: Photo; t: number; drop: boolean}> = ({photo, t, drop}) => {
  const w = photo.orientation === 'portrait' ? 680 : 860;
  const tilt = (random(photo.src) - 0.5) * 6;
  const swing = 9 * Math.sin(t / 5) * Math.exp(-t / 22) + 1.6 * Math.sin(t / 17) + tilt;
  const dy = drop ? interpolate(t, [0, 12], [-1100, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.3))}) : 0;
  return (
    <AbsoluteFill>
      <LightString y={STRING_Y} lit={99} twinkle={t / 30} />
      <div style={{position: 'absolute', top: STRING_Y + 118, left: (1080 - 150 + 60) / 2 - w / 2, transformOrigin: '50% -40px', transform: `translateY(${dy}px) rotate(${swing}deg)`}}>
        <Polaroid photo={photo} width={w} />
      </div>
    </AbsoluteFill>
  );
};

// 02 묶음1: 전구 줄에 폴라로이드가 매달리고, 다음 박자에 화면이 위로 올라가며 다음 사진
export const Hang: React.FC<{photo: Photo; prev: Photo | null; first: boolean}> = ({photo, prev, first}) => {
  const frame = useCurrentFrame();
  if (first) return <Item photo={photo} t={frame} drop />;
  const p = interpolate(frame, [0, 9], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill>
      {p < 1 && prev && (
        <AbsoluteFill style={{transform: `translateY(${-1920 * p}px)`}}><Item photo={prev} t={60 + frame} drop={false} /></AbsoluteFill>
      )}
      <AbsoluteFill style={{transform: `translateY(${1920 * (1 - p)}px)`}}><Item photo={photo} t={frame} drop={false} /></AbsoluteFill>
    </AbsoluteFill>
  );
};
