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

const r = ff(['-v', 'error', '-y', '-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
if (r.status !== 0) { console.error(r.stderr.toString()); process.exit(1); }
fs.rmSync(raw, {force: true});
const m = ff(['-hide_banner', '-i', out, '-af', 'loudnorm=print_format=summary', '-f', 'null', '-']);
const line = m.stderr.toString().split('\n').filter((l) => /Input Integrated|Input True Peak/.test(l)).join(' / ');
console.log(`\n완성: ${out}\n음량: ${line}\n`);
