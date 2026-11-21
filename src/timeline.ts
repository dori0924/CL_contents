import {FPS, SETTINGS} from './config';
import type {Beats, Caption, Photo, Seg, Timeline} from './types';

// 고르게 n장 뽑기 (날짜 순서 유지)
const sample = <T,>(arr: T[], n: number): T[] => {
  if (n >= arr.length) return arr;
  if (n <= 0) return [];
  return Array.from({length: n}, (_, i) => arr[Math.floor((i * arr.length) / n)]);
};

export function buildTimeline(photos: Photo[], beats: Beats): Timeline {
  const b = SETTINGS.bars;
  const beat = 60 / beats.bpm;
  const bar = 4 * beat;
  const f = (t: number) => Math.round(t * FPS);
  const barAt = (n: number) => f(beats.offset + n * bar); // n번째 마디가 시작하는 프레임

  const final = photos.find((p) => p.group === 'final') ?? photos[photos.length - 1];
  let g1 = photos.filter((p) => p.group === 'g1');
  let g2 = photos.filter((p) => p.group === 'g2');
  let mem = photos.filter((p) => p.group === 'members');

  // 노래 안에 들어가도록 사진 수 조절 (1장 = 1마디, 선물상자 장면은 2마디)
  const songBars = Math.floor((beats.duration - beats.offset) / bar);
  const fixed = b.intro + b.collage + b.final + b.ending + 1;
  const slots = Math.max(6, songBars - fixed);
  const want = g1.length + g2.length + mem.length;
  if (want > slots) {
    const keepMem = Math.min(mem.length, Math.floor(slots / 4));
    mem = sample(mem, keepMem);
    const left = slots - keepMem;
    const k1 = Math.round((left * g1.length) / (g1.length + g2.length));
    g1 = sample(g1, k1);
    g2 = sample(g2, left - k1);
  }

  const segs: Seg[] = [];
  const captions: Caption[] = [];
  const beatFrames = beat * FPS;
  let n = 0; // 지금까지 쓴 마디 수 (첫 강박 기준)

  segs.push({kind: 'intro', from: 0, dur: barAt(b.intro), beatFrames, firstBeat: f(beats.offset)});
  n = b.intro;

  const group = (text: string, icon: Caption['icon'], startBar: number, endBar: number) => {
    if (endBar > startBar) captions.push({text, icon, from: barAt(startBar), dur: barAt(endBar) - barAt(startBar)});
  };

  let s = n;
  g1.forEach((photo, i) => {
    segs.push({kind: 'hang', from: barAt(n), dur: barAt(n + 1) - barAt(n), photo, first: i === 0});
    n += 1;
  });
  group(SETTINGS.groupTitles.g1, 'tree', s, n);

  s = n;
  const giftAt = Math.floor(g2.length / 2);
  g2.forEach((photo, i) => {
    if (i === giftAt && g2.length >= 3) {
      segs.push({kind: 'gift', from: barAt(n), dur: barAt(n + 2) - barAt(n), photo, beatFrames});
      n += 2;
    } else {
      segs.push({kind: 'full', from: barAt(n), dur: barAt(n + 1) - barAt(n), photo});
      n += 1;
    }
  });
  group(SETTINGS.groupTitles.g2, 'sparkle', s, n);

  s = n;
  mem.forEach((photo) => {
    segs.push({kind: 'member', from: barAt(n), dur: barAt(n + 1) - barAt(n), photo});
    n += 1;
  });
  group(SETTINGS.groupTitles.members, 'heart', s, n);

  // 콜라주: 모든 사진을 고르게 돌려 쓴다
  const pool = photos.filter((p) => p !== final);
  const halfBar = (bar / 2) * FPS;
  const need = 6 + b.collage * 2;
  const collage = Array.from({length: need}, (_, i) => pool[(i * 7) % pool.length]);
  segs.push({kind: 'collage', from: barAt(n), dur: barAt(n + b.collage) - barAt(n), photos: collage, halfBar});
  n += b.collage;

  segs.push({kind: 'final', from: barAt(n), dur: barAt(n + b.final) - barAt(n), photo: final, barFrames: bar * FPS});
  n += b.final;

  segs.push({kind: 'ending', from: barAt(n), dur: barAt(n + b.ending) - barAt(n)});
  n += b.ending;

  const total = Math.min(barAt(n), Math.floor(beats.duration * FPS));
  return {segs, captions, total, beats, beatFrames};
}
