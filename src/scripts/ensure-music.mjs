// 음악 폴더가 비어 있으면 징글벨 편곡을 만들어 둔다 (npm run make 첫 단계)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.resolve(ROOT, '../assets/raw/music');
const has = fs.existsSync(dir) && fs.readdirSync(dir).some((f) => /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(f));
if (!has) {
  console.log('음악이 없어 징글벨 편곡을 만듭니다...');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/compose-jingle.mjs')], {stdio: 'inherit'});
  process.exit(r.status ?? 1);
}
