import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SETTINGS} from '../config';
import {KO} from '../fonts';
import {LightString} from '../components/LightString';
import {Burst} from '../components/Sparkles';

// 01 인트로: 전구가 박자마다 하나씩 켜지고, 마지막에 제목이 튀어나온다
export const Intro: React.FC<{beatFrames: number; firstBeat: number}> = ({beatFrames, firstBeat}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const beat = (frame - firstBeat) / beatFrames;
  const lit = Math.max(0, (beat + 1) * (11 / 11));
  const titleAt = firstBeat + Math.round(11 * beatFrames);
  const s = spring({frame: frame - titleAt, fps, config: {damping: 9, stiffness: 140}});
  const y = spring({frame: frame - titleAt - Math.round(beatFrames), fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <LightString y={300} lit={lit} twinkle={frame / 40} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingRight: 90}}>
        <div style={{transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [-12, -3])}deg)`, fontFamily: KO, fontSize: 132, lineHeight: 1.15, color: C.snow, textAlign: 'center',
          textShadow: `0 0 30px ${C.gold}, 0 6px 0 ${C.redDeep}, 0 12px 24px rgba(0,0,0,0.5)`}}>
          {SETTINGS.title.split(' ').map((w, i) => <div key={i}>{w}</div>)}
        </div>
        <div style={{marginTop: 36, transform: `translateY(${(1 - y) * 60}px)`, opacity: y, fontFamily: KO, fontSize: 84, color: C.gold, letterSpacing: 24}}>{SETTINGS.year}</div>
      </AbsoluteFill>
      <Burst t={frame - titleAt} cx={495} cy={900} seed="intro" count={48} spread={560} />
    </AbsoluteFill>
  );
};
