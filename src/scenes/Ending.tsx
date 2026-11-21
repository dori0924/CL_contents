import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SETTINGS, W} from '../config';
import {KO} from '../fonts';
import {Icon} from '../components/Icons';

// 07 엔딩: 눈 덮인 언덕 + From. 우리가족, 마지막에 어두워진다
export const Ending: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 4, fps, config: {damping: 12}});
  const dark = interpolate(frame, [dur - 18, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rise = interpolate(frame, [0, 20], [200, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <svg width={W} height={1920} style={{position: 'absolute', transform: `translateY(${rise}px)`}}>
        <path d="M0 1500 Q 270 1400 560 1480 T 1080 1440 L1080 1920 L0 1920Z" fill="#DCE6F5" />
        <path d="M0 1600 Q 330 1520 700 1600 T 1080 1580 L1080 1920 L0 1920Z" fill={C.snow} />
      </svg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingRight: 90, paddingBottom: 160}}>
        <div style={{transform: `scale(${s})`, display: 'flex', alignItems: 'center', gap: 22, fontFamily: KO, fontSize: 96, color: C.snow, textShadow: `0 0 26px ${C.gold}`}}>
          {SETTINGS.endingText}
          <Icon name="heart" size={96} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: dark}} />
    </AbsoluteFill>
  );
};
