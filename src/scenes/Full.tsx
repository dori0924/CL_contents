import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {PhotoView} from '../components/PhotoView';
import type {Photo} from '../types';

// 03 묶음2: 화면 가득 + 천천히 확대, 박자마다 흰 반짝임으로 전환
export const Full: React.FC<{photo: Photo; dur: number}> = ({photo, dur}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, dur], [1.0, 1.1]);
  const flash = interpolate(frame, [0, 7], [0.85, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <PhotoView photo={photo} zoom={zoom} />
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
