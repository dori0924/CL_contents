// 렌더 결과의 음량을 유튜브 기준(-14 LUFS, 최고 -1 dBTP)으로 맞춰 최종 파일을 만든다.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = path.resolve(ROOT, '../output/christmas_2026_raw.mp4');
const out = path.resolve(ROOT, '../output/christmas_2026.mp4');
const isWin = process.platform === 'win32';
const ff = (args) => spawnSync(isWin ? 'npx.cmd' : 'npx', ['remotion', 'ffmpeg', ...args], {cwd: ROOT, shell: isWin, maxBuffer: 1 << 26});

const measure = (file, filter) => {
  const m = ff(['-hide_banner', '-nostats', '-i', file, '-vn', '-af', filter, '-f', 'null', '-']);
  const txt = m.stderr.toString();
  const j = txt.slice(txt.lastIndexOf('{'), txt.lastIndexOf('}') + 1);
  try { return JSON.parse(j); } catch { console.error(txt.slice(-800)); process.exit(1); }
};

// 1차: 현재 음량 측정 → 2차: 측정값으로 정확히 맞춤(linear)
const TARGET = 'I=-14:TP=-1:LRA=11';
const a = measure(raw, `loudnorm=${TARGET}:print_format=json`);
const filter = `loudnorm=${TARGET}:measured_I=${a.input_i}:measured_TP=${a.input_tp}:measured_LRA=${a.input_lra}:measured_thresh=${a.input_thresh}:offset=${a.target_offset}:linear=true`;
const r = ff(['-v', 'error', '-y', '-i', raw, '-c:v', 'copy', '-af', filter, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
if (r.status !== 0) { console.error(r.stderr.toString()); process.exit(1); }
fs.rmSync(raw, {force: true});
const b = measure(out, 'loudnorm=print_format=json');
console.log(`\n완성: ${out}\n음량: ${b.input_i} LUFS (목표 -14), 최고 ${b.input_tp} dBTP (목표 -1 이하)\n`);
