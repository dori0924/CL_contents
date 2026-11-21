// 음악의 박자(BPM)와 첫 강박 위치를 찾는다. 외부 라이브러리 없이 스펙트럼 변화량(onset) + 빗살 맞추기.
const N = 1024;
const H = 256;

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

function onsetEnvelope(x) {
  const frames = Math.max(0, Math.floor((x.length - N) / H));
  const win = Float32Array.from({length: N}, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
  const re = new Float64Array(N), im = new Float64Array(N);
  let prev = new Float64Array(N / 2);
  const env = new Float64Array(frames);
  const low = new Float64Array(frames);
  const LOW_BIN = Math.max(2, Math.round((120 * N) / 22050)); // 킥·베이스 대역
  let prevLow = new Float64Array(N / 2);
  for (let f = 0; f < frames; f++) {
    for (let i = 0; i < N; i++) { re[i] = x[f * H + i] * win[i]; im[i] = 0; }
    fft(re, im);
    const cur = new Float64Array(N / 2);
    let flux = 0, lflux = 0;
    const curLow = new Float64Array(N / 2);
    for (let k = 1; k < N / 2; k++) {
      const mag = Math.hypot(re[k], im[k]);
      cur[k] = Math.log1p(100 * mag);
      const d = cur[k] - prev[k];
      if (d > 0) flux += d;
      if (k <= LOW_BIN) { curLow[k] = mag; const dl = mag - prevLow[k]; if (dl > 0) lflux += dl; }
    }
    prevLow = curLow;
    env[f] = flux;
    low[f] = lflux;
    prev = cur;
  }
  // 주변 평균을 빼서 큰 음량 변화 대신 '치는 순간'만 남긴다
  const w = 16, out = new Float64Array(frames);
  let sum = 0;
  for (let i = 0; i < frames; i++) {
    sum += env[i];
    if (i - 2 * w - 1 >= 0) sum -= env[i - 2 * w - 1];
    const cnt = Math.min(i + 1, 2 * w + 1);
    out[Math.max(0, i - w)] = Math.max(0, env[Math.max(0, i - w)] - sum / cnt);
  }
  return {env: out, low};
}

const at = (e, t) => {
  const i = Math.floor(t);
  if (i < 0 || i + 1 >= e.length) return 0;
  const a = t - i;
  return e[i] * (1 - a) + e[i + 1] * a;
};

function bestPhase(env, period) {
  let best = -1, phase = 0;
  for (let p = 0; p < period; p += 0.25) {
    let s = 0;
    for (let t = p; t < env.length; t += period) s += at(env, t);
    if (s > best) { best = s; phase = p; }
  }
  return {phase, score: best};
}

export function detectBeats(x, sr) {
  const {env, low} = onsetEnvelope(x);
  const fps = sr / H;
  // 1) 대략적인 BPM: 자기상관(1~4배 주기) + 120 BPM 근처 선호
  let bpm = 120, best = -1;
  for (let b = 70; b <= 180; b += 0.1) {
    const lag = (60 * fps) / b;
    let s = 0;
    for (let k = 1; k <= 4; k++) {
      const L = lag * k;
      for (let t = 0; t + L < env.length; t += 2) s += env[t] * at(env, t + L);
    }
    const prior = Math.exp(-0.5 * (Math.log2(b / 120) / 0.7) ** 2);
    if (s * prior > best) { best = s * prior; bpm = b; }
  }
  // 2) 세밀하게: 곡 전체에서 박이 어긋나지 않는 BPM과 위상
  let fine = {bpm, phase: 0, score: -1};
  for (let b = bpm - 0.6; b <= bpm + 0.6; b += 0.01) {
    const r = bestPhase(env, (60 * fps) / b);
    if (r.score > fine.score) fine = {bpm: b, phase: r.phase, score: r.score};
  }
  const period = (60 * fps) / fine.bpm;
  // 3) 첫 강박: 4박 중 저음(킥·베이스, 120Hz 이하)이 가장 세게 들어오는 자리. 비슷하면(90% 이상) 노래가 시작되는 지점과 가까운 쪽
  const scores = [0, 1, 2, 3].map((j) => {
    let s = 0;
    for (let t = fine.phase + j * period; t < env.length; t += 4 * period) s += at(low, t);
    return s;
  });
  const maxScore = Math.max(...scores);
  const thr = 0.2 * Math.max(...env);
  const firstOnset = env.findIndex((v) => v > thr);
  const firstBeatIdx = Math.max(0, Math.round((firstOnset - fine.phase) / period));
  let down = scores.indexOf(maxScore), near = 99;
  scores.forEach((sc, j) => {
    if (sc < 0.9 * maxScore) return;
    const dist = (((j - firstBeatIdx) % 4) + 4) % 4;
    if (dist < near) { near = dist; down = j; }
  });
  // 프레임 중심 보정(N/2)
  const offset = ((fine.phase + down * period) * H + N / 2) / sr;
  return {bpm: Math.round(fine.bpm * 100) / 100, offset: Math.round(offset * 1000) / 1000};
}
