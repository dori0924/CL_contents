// 사진·음악을 public/으로 옮기고(사진은 회전 보정·축소), 음악 박자를 분석한다.
// 결과: public/photos/*.jpg, public/music.*, public/photos.json, public/beats.json  (모두 Git 제외)
// 사용: npm run media            (../assets/raw/photos, ../assets/raw/music)
//       npm run media -- --sample (.sample/ 의 시험용 소재)
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {detectBeats} from './beats.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const sample = process.argv.includes('--sample');
const settings = JSON.parse(fs.readFileSync(path.join(ROOT, 'settings.json'), 'utf8'));
const photoDir = sample ? path.join(ROOT, '.sample/photos') : path.resolve(ROOT, '../assets/raw/photos');
const musicDir = sample ? path.join(ROOT, '.sample/music') : path.resolve(ROOT, '../assets/raw/music');
const pub = path.join(ROOT, 'public');

const IMG = /\.(jpe?g|png|webp|tiff?|avif)$/i;
const AUD = /\.(mp3|wav|m4a|aac|ogg|flac)$/i;

function fail(msg) { console.error(`\n[오류] ${msg}\n`); process.exit(1); }

// ---------- 사진 ----------
if (!fs.existsSync(photoDir)) fail(`사진 폴더가 없습니다: ${photoDir}`);
const all = fs.readdirSync(photoDir).filter((f) => !f.startsWith('.'));
const heic = all.filter((f) => /\.hei[cf]$/i.test(f));
if (heic.length) console.warn(`[주의] HEIC 사진 ${heic.length}장은 건너뜁니다. JPG로 바꿔 넣어 주세요: ${heic.slice(0, 3).join(', ')}…`);
const files = all.filter((f) => IMG.test(f)).sort((a, b) => a.localeCompare(b, 'ko'));
if (files.length < 8) fail(`사진이 ${files.length}장뿐입니다. 최소 8장, 권장 30~45장입니다.`);

fs.rmSync(path.join(pub, 'photos'), {recursive: true, force: true});
fs.mkdirSync(path.join(pub, 'photos'), {recursive: true});

const photos = [];
const report = [];
for (const [i, f] of files.entries()) {
  const out = `p${String(i + 1).padStart(3, '0')}.jpg`;
  const src = sharp(path.join(photoDir, f), {failOn: 'none'});
  const meta = await src.metadata();
  const info = await src.rotate().resize({width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true})
    .jpeg({quality: 88, mozjpeg: true}).toFile(path.join(pub, 'photos', out));
  const long = Math.max(meta.width ?? 0, meta.height ?? 0);
  const m = f.match(/^(\d{4})(\d{2})(\d{2})/);
  const member = settings.members.find((n) => n && f.includes(n)) ?? null;
  const orientation = info.height > info.width * 1.05 ? 'portrait' : 'landscape';
  photos.push({
    src: `photos/${out}`, w: info.width, h: info.height, orientation,
    date: m ? `${m[1]}.${m[2]}.${m[3]}` : null,
    member, final: /_final/i.test(f),
  });
  report.push({file: f, orientation, long, note: [long < 2000 ? '해상도 낮음' : '', m ? '' : '날짜 없는 이름'].filter(Boolean).join(', ')});
}

// 묶음 나누기 (brief/PHOTO_PLAN.md)
let finalIdx = photos.findIndex((p) => p.final);
if (finalIdx < 0) {
  finalIdx = photos.length - 1;
  console.warn('[주의] _final 사진이 없어 마지막 사진을 단체사진으로 씁니다.');
}
const finalPhoto = photos[finalIdx];
const rest = photos.filter((_, i) => i !== finalIdx);
const memberPhotos = [];
for (const name of settings.members) {
  memberPhotos.push(...rest.filter((p) => p.member === name).slice(0, settings.maxPhotosPerMember));
}
const others = rest.filter((p) => !memberPhotos.includes(p));
const half = Math.ceil(others.length / 2);
for (const p of others.slice(0, half)) p.group = 'g1';
for (const p of others.slice(half)) p.group = 'g2';
for (const p of memberPhotos) p.group = 'members';
finalPhoto.group = 'final';
fs.writeFileSync(path.join(pub, 'photos.json'), JSON.stringify({photos: [...others, ...memberPhotos, finalPhoto]}, null, 1));

// ---------- 음악 ----------
const music = fs.existsSync(musicDir) ? fs.readdirSync(musicDir).filter((f) => AUD.test(f)).sort() : [];
if (!music.length) fail(`음악 파일이 없습니다: ${musicDir}  (mp3/wav/m4a 하나를 넣어 주세요)`);
if (music.length > 1) console.warn(`[주의] 음악이 ${music.length}개입니다. 첫 번째 "${music[0]}"을 씁니다.`);
for (const f of fs.readdirSync(pub)) if (/^music\./.test(f)) fs.rmSync(path.join(pub, f));
const ext = path.extname(music[0]).toLowerCase();
fs.copyFileSync(path.join(musicDir, music[0]), path.join(pub, `music${ext}`));

const SR = 22050;
const isWin = process.platform === 'win32';
const dec = spawnSync(isWin ? 'npx.cmd' : 'npx',
  ['remotion', 'ffmpeg', '-v', 'error', '-i', path.join(musicDir, music[0]), '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', '-f', 'wav', '-'],
  {cwd: ROOT, maxBuffer: 1 << 30, shell: isWin});
if (dec.status !== 0) fail(`음악을 읽지 못했습니다: ${dec.stderr?.toString().slice(0, 300)}`);
// WAV에서 data 덩어리를 찾아 16비트 PCM → 실수로
const wav = dec.stdout;
let p = 12;
while (p + 8 <= wav.length && wav.toString('ascii', p, p + 4) !== 'data') p += 8 + wav.readUInt32LE(p + 4);
const body = wav.subarray(p + 8);
const pcm = new Float32Array(Math.floor(body.length / 2));
for (let i = 0; i < pcm.length; i++) pcm[i] = body.readInt16LE(i * 2) / 32768;
const duration = pcm.length / SR;
let {bpm, offset} = detectBeats(pcm, SR);
if (settings.bpmOverride) bpm = settings.bpmOverride;
if (settings.offsetOverride != null) offset = settings.offsetOverride;
fs.writeFileSync(path.join(pub, 'beats.json'), JSON.stringify({music: `music${ext}`, bpm, offset, duration}, null, 1));

// ---------- 보고 ----------
const count = (g) => photos.filter((p) => p.group === g).length;
console.log('\n=== 사진 점검 ===');
console.table(report);
console.log(`사진 ${photos.length}장 (세로 ${photos.filter((p) => p.orientation === 'portrait').length}, 가로 ${photos.filter((p) => p.orientation === 'landscape').length})`);
console.log(`묶음: 올해 우리는 ${count('g1')} / 함께 웃은 날 ${count('g2')} / 가족 ${count('members')} / 단체사진 1`);
console.log(`\n=== 음악 ===\n${music[0]}  길이 ${duration.toFixed(1)}초, 박자 ${bpm.toFixed(2)} BPM, 첫 박 ${offset.toFixed(3)}초`);
console.log('\n다음: npm run studio (미리보기) 또는 npm run render (완성본)\n');
