import {Composition, staticFile} from 'remotion';
import {Christmas, type ChristmasProps} from './Christmas';
import {FPS, H, W} from './config';
import {buildTimeline} from './timeline';
import type {Beats, Photo} from './types';
import './fonts';

export const Root: React.FC = () => (
  <Composition
    id="Christmas"
    component={Christmas}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={FPS * 10}
    defaultProps={{timeline: null, showSafeArea: false} satisfies ChristmasProps}
    calculateMetadata={async ({props}) => {
      // npm run media 가 만든 public/photos.json, public/beats.json 을 읽어 길이를 정한다
      const [pj, bj] = await Promise.all([fetch(staticFile('photos.json')), fetch(staticFile('beats.json'))]);
      if (!pj.ok || !bj.ok) throw new Error('public/photos.json 또는 beats.json이 없습니다. 먼저 npm run media 를 실행하세요.');
      const {photos} = (await pj.json()) as {photos: Photo[]};
      const beats = (await bj.json()) as Beats;
      const timeline = buildTimeline(photos, beats);
      return {durationInFrames: timeline.total, props: {...props, timeline}};
    }}
  />
);
