// 시험용 소재 만들기: 색 사진 36장(가로·세로 섞음) + 128 BPM 박자 음악 100초 → .sample/
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, '.sample');
fs.rmSync(dir, {recursive: true, force: true});
fs.mkdirSync(path.join(dir, 'photos'), {recursive: true});
fs.mkdirSync(path.join(dir, 'music'), {recursive: true});

const hues = [0, 25, 45, 120, 160, 200, 230, 280, 320];
for (let i = 1; i <= 36; i++) {
  const portrait = i % 3 === 0;
  const [w, h] = portrait ? [1500, 2000] : [2000, 1500];
  const hue = hues[i % hues.length];
  const month = String(Math.min(12, Math.ceil(i / 3))).padStart(2, '0');
  const final = i === 36;
  const name = `2026${month}${String((i % 28) + 1).padStart(2, '0')}_${final ? '가족_final' : '장면'}_${String(i).padStart(2, '0')}.jpg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},70%,62%)"/><stop offset="1" stop-color="hsl(${(hue + 60) % 360},60%,35%)"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="${w * 0.5}" cy="${h * 0.38}" r="${Math.min(w, h) * 0.16}" fill="#ffe0c4"/>
    <circle cx="${w * 0.45}" cy="${h * 0.36}" r="${Math.min(w, h) * 0.018}" fill="#333"/>
    <circle cx="${w * 0.55}" cy="${h * 0.36}" r="${Math.min(w, h) * 0.018}" fill="#333"/>
    <path d="M ${w * 0.44} ${h * 0.42} Q ${w * 0.5} ${h * 0.47} ${w * 0.56} ${h * 0.42}" stroke="#333" stroke-width="${Math.min(w, h) * 0.012}" fill="none"/>
    <rect x="${w * 0.2}" y="${h * 0.62}" width="${w * 0.6}" height="${h * 0.3}" rx="40" fill="rgba(255,255,255,0.25)"/>
    <text x="50%" y="${h * 0.82}" font-size="${Math.min(w, h) * 0.16}" text-anchor="middle" font-family="sans-serif" font-weight="bold" fill="#fff">${final ? 'FINAL' : '#' + i}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({quality: 85}).toFile(path.join(dir, 'photos', name));
}

// 128 BPM, 첫 박 0.35초: 킥(매 박) + 하이햇(반 박) + 종소리(마디 첫 박) → 16비트 WAV 직접 쓰기
const SR = 44100, DUR = 100, bpm = 128, off = 0.35, b = 60 / bpm;
const pcm = Buffer.alloc(SR * DUR * 2);
let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
for (let i = 0; i < SR * DUR; i++) {
  const t = i / SR;
  let v = 0;
  if (t >= off) {
    const pb = (t - off) % b, ph = (t - off) % (b / 2), pbar = (t - off) % (4 * b);
    v += 0.8 * Math.sin(2 * Math.PI * 55 * pb * (1 + 3 * Math.exp(-40 * pb))) * Math.exp(-12 * pb);
    v += 0.12 * rnd() * Math.exp(-80 * ph);
    v += (0.25 * Math.sin(2 * Math.PI * 1318 * t) * Math.exp(-6 * pbar)) + 0.2 * Math.sin(2 * Math.PI * 988 * t) * Math.exp(-4 * pbar);
  }
  pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 0.6 * 32767))), i * 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12);
hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22); hdr.writeUInt32LE(SR, 24);
hdr.writeUInt32LE(SR * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
fs.writeFileSync(path.join(dir, 'music', 'sample_128bpm.wav'), Buffer.concat([hdr, pcm]));
console.log(`시험용 소재 생성: ${dir}  (사진 36장, 128 BPM 음악 100초)`);
