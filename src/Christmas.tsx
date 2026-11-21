import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {Background} from './components/Background';
import {Caption} from './components/Caption';
import {Snow} from './components/Snow';
import {Collage} from './scenes/Collage';
import {Ending} from './scenes/Ending';
import {Final} from './scenes/Final';
import {Full} from './scenes/Full';
import {Gift} from './scenes/Gift';
import {Hang} from './scenes/Hang';
import {Intro} from './scenes/Intro';
import {Member} from './scenes/Member';
import {FPS, H, SAFE, W} from './config';
import type {Photo, Seg, Timeline} from './types';

export type ChristmasProps = {timeline: Timeline | null; showSafeArea: boolean};

const SegView: React.FC<{seg: Seg; prev: Photo | null}> = ({seg, prev}) => {
  switch (seg.kind) {
    case 'intro': return <Intro beatFrames={seg.beatFrames} firstBeat={seg.firstBeat} />;
    case 'hang': return <Hang photo={seg.photo} prev={prev} first={seg.first} />;
    case 'full': return <Full photo={seg.photo} dur={seg.dur} />;
    case 'gift': return <Gift photo={seg.photo} beatFrames={seg.beatFrames} dur={seg.dur} />;
    case 'member': return <Member photo={seg.photo} />;
    case 'collage': return <Collage photos={seg.photos} halfBar={seg.halfBar} dur={seg.dur} />;
    case 'final': return <Final photo={seg.photo} barFrames={seg.barFrames} />;
    case 'ending': return <Ending dur={seg.dur} />;
  }
};

export const Christmas: React.FC<ChristmasProps> = ({timeline, showSafeArea}) => {
  if (!timeline) return <AbsoluteFill style={{background: '#000'}} />;
  const {segs, captions, total, beats} = timeline;
  return (
    <AbsoluteFill>
      <Background />
      {segs.map((seg, i) => {
        const p = segs[i - 1];
        const prev = p && 'photo' in p ? p.photo : null;
        return (
          <Sequence key={i} from={seg.from} durationInFrames={seg.dur} name={`${String(i).padStart(2, '0')} ${seg.kind}`}>
            <SegView seg={seg} prev={prev} />
          </Sequence>
        );
      })}
      {captions.map((c, i) => (
        <Sequence key={`c${i}`} from={c.from} durationInFrames={c.dur} name={`문구 ${c.text}`}>
          <Caption text={c.text} icon={c.icon} dur={c.dur} top={c.top} />
        </Sequence>
      ))}
      <Snow opacity={0.85} />
      <Audio src={staticFile(beats.music)} volume={(f) => interpolate(f, [total - 2 * FPS, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      {showSafeArea && (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: W, height: SAFE.top, background: 'rgba(255,0,0,0.25)'}} />
          <div style={{position: 'absolute', left: 0, top: H - SAFE.bottom, width: W, height: SAFE.bottom, background: 'rgba(255,0,0,0.25)'}} />
          <div style={{position: 'absolute', left: W - SAFE.right, top: SAFE.top, width: SAFE.right, height: H - SAFE.top - SAFE.bottom, background: 'rgba(255,0,0,0.25)'}} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
