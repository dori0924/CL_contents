import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, SAFE, W} from '../config';
import {KO} from '../fonts';
import {Icon} from './Icons';

// 묶음 제목: 아래 안전 영역 바로 위에 알약 모양으로. 묶음이 끝나기 직전에 사라진다
export const Caption: React.FC<{text: string; icon: 'tree' | 'sparkle' | 'heart'; dur: number; top?: boolean}> = ({text, icon, dur, top = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 160}});
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bob = Math.sin(frame / 9) * 4;
  return (
    <div style={{position: 'absolute', left: SAFE.left, width: W - SAFE.left - SAFE.right, top: top ? SAFE.top + 10 : H - SAFE.bottom - 150, display: 'flex', justifyContent: 'center', opacity: out}}>
      <div style={{transform: `translateY(${bob}px) scale(${s})`, display: 'flex', alignItems: 'center', gap: 18, padding: '18px 40px', borderRadius: 999, background: 'rgba(7,15,36,0.72)', border: `4px solid ${C.gold}`, boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
        <Icon name={icon} size={72} />
        <span style={{fontFamily: KO, fontSize: 68, color: C.snow, letterSpacing: 2}}>{text}</span>
      </div>
    </div>
  );
};
