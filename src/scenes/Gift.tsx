import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {GiftBox} from '../components/GiftBox';
import {PhotoView} from '../components/PhotoView';
import {Burst, Glitter} from '../components/Sparkles';
import type {Photo} from '../types';

// 03 묶음2 중간: 선물상자가 박자마다 들썩이다가 열리며 사진이 튀어나온다 (2마디)
export const Gift: React.FC<{photo: Photo; beatFrames: number; dur: number}> = ({photo, beatFrames, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const openAt = Math.round(beatFrames * 4);
  const sinceBeat = frame % beatFrames;
  const shake = frame < openAt ? 7 * Math.sin(sinceBeat / 1.6) * Math.exp(-sinceBeat / 5) : 0;
  const hop = frame < openAt ? -30 * Math.exp(-sinceBeat / 4) : 0;
  const open = spring({frame: frame - openAt, fps, config: {damping: 14}});
  const grow = spring({frame: frame - openAt - 3, fps, config: {damping: 13, stiffness: 90}});
  const scale = interpolate(grow, [0, 1], [0.08, 1]);
  const ty = interpolate(grow, [0, 1], [-80, 0]);
  const boxFade = interpolate(frame, [openAt + 8, openAt + 18], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoom = interpolate(frame, [openAt, dur], [1, 1.08], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill>
      <Glitter frame={frame} seed="gift" count={30} />
      {frame >= openAt && (
        <AbsoluteFill style={{transform: `translateY(${ty}px) scale(${scale})`, borderRadius: interpolate(grow, [0, 1], [80, 0]), overflow: 'hidden'}}>
          <PhotoView photo={photo} zoom={zoom} />
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', left: 495 - 256, top: 420 + hop, opacity: boxFade}}>
        <GiftBox size={320} open={open} shake={shake} />
      </div>
      <Burst t={frame - openAt} cx={495} cy={900} seed="giftburst" count={50} spread={650} />
    </AbsoluteFill>
  );
};
