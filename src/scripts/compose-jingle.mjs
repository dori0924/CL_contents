// 「징글벨」(1857, 퍼블릭 도메인) 신나는 편곡을 코드로 합성해 WAV로 만든다. 저작권 걱정 없는 자체 음원.
// 구성: 인트로 4 → 벌스 16 → 코러스 16 → 브레이크 4 → 코러스 16(한 음 올림) → 엔딩 4 마디, 140 BPM
// 사용: npm run compose  → ../assets/raw/music/jingle_bells_family_mix.wav
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] ?? path.resolve(ROOT, '../assets/raw/music/jingle_bells_family_mix.wav');

const SR = 44100;
const BPM = 140;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const START = 0.25; // 첫 강박 위치(초)

// ---------- 악보 ----------
const N = {D4: 62, E4: 64, 'F#4': 66, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, G5: 79};
const seq = (s) => s.trim().split(/\s+/).map((t) => { const [n, d] = t.split(':'); return [n === 'r' ? null : N[n], Number(d)]; });

const VERSE = seq(`
D4:1 B4:1 A4:1 G4:1  D4:3 D4:0.5 D4:0.5  D4:1 B4:1 A4:1 G4:1  E4:4
E4:1 C5:1 B4:1 A4:1  F#4:4  D5:1 D5:1 C5:1 A4:1  B4:4
D4:1 B4:1 A4:1 G4:1  D4:4  D4:1 B4:1 A4:1 G4:1  E4:3 E4:1
E4:1 C5:1 B4:1 A4:1  D5:1 D5:1 D5:1 D5:1  E5:1 D5:1 C5:1 A4:1  G4:2 D5:2`);
const CHORUS = seq(`
B4:1 B4:1 B4:2  B4:1 B4:1 B4:2  B4:1 D5:1 G4:1.5 A4:0.5  B4:4
C5:1 C5:1 C5:1.5 C5:0.5  C5:1 B4:1 B4:1 B4:0.5 B4:0.5  B4:1 A4:1 A4:1 B4:1  A4:2 D5:2
B4:1 B4:1 B4:2  B4:1 B4:1 B4:2  B4:1 D5:1 G4:1.5 A4:0.5  B4:4
C5:1 C5:1 C5:1.5 C5:0.5  C5:1 B4:1 B4:1 B4:0.5 B4:0.5  D5:1 D5:1 C5:1 A4:1  G4:4`);
// 마디별 화음 (G장조 기준 근음, 종류)
const VERSE_CH = 'G G G C C D7 D7 G G G G C C D7 D7 G'.split(' ');
const CHORUS_CH = 'G G G G C G A7 D7 G G G G C G D7 G'.split(' ');
const CHORD = {G: [43, [67, 71, 74]], C: [48, [64, 67, 72]], D7: [50, [66, 69, 72]], A7: [45, [64, 67, 73]]};

// ---------- 소리 ----------
const len = Math.ceil((START + 60 * BAR + 3) * SR);
const L = new Float32Array(len), R = new Float32Array(len), REV = new Float32Array(len);
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

function add(t0, dur, pan, rev, fn) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
  const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < len; i++) {
    const v = fn(i / SR);
    L[i0 + i] += v * gl; R[i0 + i] += v * gr; REV[i0 + i] += v * rev;
  }
}
// 멜로디: 밝은 FM 벨 + 살짝 겹친 사각파 리드
const lead = (t0, m, d, vol = 0.32) => {
  const f = hz(m), dur = d * BEAT;
  add(t0, dur + 0.25, 0.1, 0.35, (t) => {
    const env = Math.min(1, t / 0.006) * Math.exp(-t * 2.2) * (t < dur ? 1 : Math.exp(-(t - dur) * 25));
    const fm = Math.sin(2 * Math.PI * f * t + 2.2 * Math.exp(-t * 6) * Math.sin(2 * Math.PI * f * 3.5 * t));
    const sq = Math.tanh(4 * Math.sin(2 * Math.PI * f * 1.003 * t)) * 0.18;
    return vol * env * (fm * 0.8 + sq);
  });
};
// 글로켄슈필(종소리) 장식
const glock = (t0, m, vol = 0.12) => add(t0, 1.2, -0.4, 0.5, (t) => vol * Math.exp(-t * 4) * (Math.sin(2 * Math.PI * hz(m) * t) + 0.4 * Math.sin(2 * Math.PI * hz(m) * 4.07 * t) * Math.exp(-t * 9)));
const bass = (t0, m, d) => add(t0, d * BEAT, 0, 0.05, (t) => 0.42 * Math.min(1, t / 0.004) * Math.exp(-t * 3) * (Math.sin(2 * Math.PI * hz(m) * t) + 0.3 * Math.sin(4 * Math.PI * hz(m) * t)));
const chordHit = (t0, notes) => notes.forEach((m, k) => add(t0, BEAT * 0.8, (k - 1) * 0.35, 0.2, (t) => 0.085 * Math.min(1, t / 0.005) * Math.exp(-t * 7) * (Math.sin(2 * Math.PI * hz(m) * t) + 0.5 * Math.sin(4 * Math.PI * hz(m) * t) + 0.25 * Math.sin(6 * Math.PI * hz(m) * t))));
const kick = (t0, v = 0.9) => add(t0, 0.35, 0, 0, (t) => v * Math.sin(2 * Math.PI * (48 * t + 90 * (1 - Math.exp(-t * 30)) / 30)) * Math.exp(-t * 9));
const snare = (t0, v = 0.35) => add(t0, 0.25, 0.05, 0.25, (t) => v * Math.exp(-t * 18) * (rnd() * 0.8 + 0.4 * Math.sin(2 * Math.PI * 190 * t)));
// 썰매 방울: 높은 음 여러 개 + 짧은 잡음
const BELLS = [5200, 6300, 7400, 8800, 10500];
const sleigh = (t0, v) => add(t0, 0.22, 0.45, 0.15, (t) => {
  let s = 0;
  for (const f of BELLS) s += Math.sin(2 * Math.PI * f * t + f);
  return v * Math.exp(-t * 22) * (s * 0.12 + rnd() * 0.25 * Math.exp(-t * 40));
});

// ---------- 배치 ----------
let bar = 0;
const at = (b, beat = 0) => START + (b + beat / 4) * BAR;
function groove(b0, bars, chords, shift, {drums = true, glockOn = false} = {}) {
  for (let i = 0; i < bars; i++) {
    const [root, tri] = CHORD[chords[i % chords.length]];
    const b = b0 + i;
    bass(at(b, 0), root + shift, 1); bass(at(b, 2), root + 7 + shift, 1);
    chordHit(at(b, 1), tri.map((m) => m + shift)); chordHit(at(b, 3), tri.map((m) => m + shift));
    if (drums) { kick(at(b, 0)); kick(at(b, 2)); snare(at(b, 1)); snare(at(b, 3)); }
    for (let e = 0; e < 8; e++) sleigh(at(b, e / 2), e % 2 ? 0.16 : 0.3);
    if (glockOn && i % 2 === 1) glock(at(b, 3.5), tri[2] + 12 + shift);
  }
}
function melody(b0, notes, shift, vol) {
  let beat = 0;
  for (const [m, d] of notes) { if (m) lead(at(b0, beat), m + shift, d, vol); beat += d; }
}

// 인트로: 방울 + 베이스, 마지막 마디에 드럼 채우기
groove(0, 4, ['G', 'G', 'C', 'D7'], 0, {drums: false});
for (let k = 0; k < 4; k++) snare(at(3, 2 + k / 2), 0.2 + k * 0.06);
kick(at(0)); bar = 4;
// 벌스
groove(bar, 16, VERSE_CH, 0); melody(bar, VERSE, 0, 0.28); bar += 16;
// 코러스
groove(bar, 16, CHORUS_CH, 0, {glockOn: true}); melody(bar, CHORUS, 0, 0.34); bar += 16;
// 브레이크: 방울과 박수만 → 한 음 올리며 마지막 코러스
for (let i = 0; i < 4; i++) { for (let e = 0; e < 8; e++) sleigh(at(bar + i, e / 2), 0.32); snare(at(bar + i, 1), 0.25); snare(at(bar + i, 3), 0.25); kick(at(bar + i, 0), 0.7); }
for (let k = 0; k < 8; k++) snare(at(bar + 3, k / 2), 0.15 + k * 0.03);
bar += 4;
groove(bar, 16, CHORUS_CH, 2, {glockOn: true}); melody(bar, CHORUS, 2, 0.36);
CHORUS.reduce((beat, [m, d]) => { if (m) lead(at(bar, beat), m + 2 + 12, d, 0.07); return beat + d; }, 0); // 옥타브 위 겹치기
bar += 16;
// 엔딩: 마지막 화음과 방울
groove(bar, 3, ['G', 'C', 'D7'], 2, {glockOn: true});
const fin = at(bar + 3);
kick(fin, 1); CHORD.G[1].forEach((m) => { add(fin, 2.5, 0, 0.4, (t) => 0.12 * Math.exp(-t * 1.4) * Math.sin(2 * Math.PI * hz(m + 2 + 12) * t)); });
lead(fin, 67 + 2 + 12, 4, 0.3); bass(fin, 43 + 2, 4);
for (let k = 0; k < 16; k++) sleigh(fin + k * 0.09, 0.3 * (1 - k / 16));

// ---------- 잔향(간단한 슈뢰더) ----------
const combs = [1116, 1188, 1277, 1356].map((d) => ({d, buf: new Float32Array(d), i: 0}));
const aps = [556, 441].map((d) => ({d, buf: new Float32Array(d), i: 0}));
for (let n = 0; n < len; n++) {
  let s = 0;
  for (const c of combs) { const y = c.buf[c.i]; c.buf[c.i] = REV[n] + y * 0.78; c.i = (c.i + 1) % c.d; s += y; }
  for (const a of aps) { const b = a.buf[a.i]; const y = -0.5 * s + b; a.buf[a.i] = s + 0.5 * y; a.i = (a.i + 1) % a.d; s = y; }
  L[n] += s * 0.08; R[n] += s * 0.08;
}

// ---------- 정규화 + 16비트 WAV ----------
let peak = 0;
for (let n = 0; n < len; n++) peak = Math.max(peak, Math.abs(Math.tanh(L[n])), Math.abs(Math.tanh(R[n])));
const g = 0.89 / peak;
const pcm = Buffer.alloc(len * 4);
for (let n = 0; n < len; n++) {
  pcm.writeInt16LE(Math.round(Math.tanh(L[n]) * g * 32767), n * 4);
  pcm.writeInt16LE(Math.round(Math.tanh(R[n]) * g * 32767), n * 4 + 2);
}
const h = Buffer.alloc(44);
h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
fs.mkdirSync(path.dirname(OUT), {recursive: true});
fs.writeFileSync(OUT, Buffer.concat([h, pcm]));
console.log(`작곡 완료: ${OUT}  (${(len / SR).toFixed(1)}초, ${BPM} BPM, ${bar + 4}마디)`);
