import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../config';
import {KO} from '../fonts';
import {Polaroid} from '../components/Polaroid';
import type {Photo} from '../types';

// 04 묶음3: 구성원 사진 + 이름표(별칭), 오너먼트가 달랑거린다
export const Member: React.FC<{photo: Photo}> = ({photo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12}});
  const w = photo.orientation === 'portrait' ? 620 : 820;
  const swing = 12 * Math.sin(frame / 6) * Math.exp(-frame / 30);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingRight: 90}}>
      <div style={{marginTop: 300, transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [8, -2])}deg)`}}>
        <Polaroid photo={photo} width={w} clip={false} label={photo.date} />
      </div>
      <div style={{marginTop: 30, transform: `translateY(${(1 - s) * 80}px)`, position: 'relative', padding: '14px 54px', borderRadius: 18, background: C.red, border: `5px solid ${C.gold}`, fontFamily: KO, fontSize: 76, color: C.snow, boxShadow: '0 10px 24px rgba(0,0,0,0.35)'}}>
        {photo.member}
        <div style={{position: 'absolute', right: -24, top: 20, transformOrigin: '50% 0', transform: `rotate(${swing}deg)`}}>
          <div style={{width: 4, height: 40, background: C.gold, margin: '0 auto'}} />
          <div style={{width: 46, height: 46, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, #fff, ${C.green} 40%, ${C.greenDeep})`}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
