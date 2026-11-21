# 작품 #1 「우리가족의 크리스마스」 영상 코드

Remotion(React로 영상 만드는 도구)으로 만든 세로 1080×1920, 30fps 사진 영상이다.
사진과 음악만 넣으면 **음악 박자를 자동으로 찾아** 장면 길이와 전환을 맞춘다.

## 처음 한 번 (감독 PC, Windows PowerShell)

[Node.js](https://nodejs.org/) LTS가 필요하다.

```powershell
cd CL_contents\src
npm install
```

## 완성본 만들기

1. 사진 → `assets/raw/photos/` (JPG/PNG, 이름 `YYYYMMDD_장면_번호.jpg`, 단체사진은 끝에 `_final`)
2. (선택) 음악 1곡 → `assets/raw/music/` (mp3/wav/m4a). 비워 두면 팀장이 편곡한 「징글벨」이 자동으로 만들어져 들어간다
3. 실행:

```powershell
npm run make      # 사진·음악 준비 + 박자 분석 + 렌더 + 음량 맞춤
```

결과: **`output/christmas_2026.mp4`** (PC 성능에 따라 5~15분)

## 따로 실행하기

| 명령 | 하는 일 |
|---|---|
| `npm run media` | 사진 회전 보정·축소 → `public/photos/`, 음악 복사, 박자 분석 → `public/beats.json`. 사진 점검표를 출력한다 |
| `npm run studio` | 브라우저 미리보기. 오른쪽 속성에서 `showSafeArea`를 켜면 쇼츠 안전 영역이 빨갛게 보인다 |
| `npm run render` | 렌더 후 음량을 -14 LUFS로 맞춰 `output/christmas_2026.mp4` 저장 |
| `npm run compose` | 「징글벨」 편곡(140 BPM, 1분 46초)을 `assets/raw/music/`에 만든다 |
| `npm run sample` → `npm run media -- --sample` | 시험용 사진 36장·128 BPM 음악으로 동작 확인 |

## 고치는 곳: `settings.json`

| 항목 | 뜻 |
|---|---|
| `title`, `year` | 인트로 제목 |
| `groupTitles` | 묶음 제목 (올해 우리는 / 함께 웃은 날 / 고마운 우리 가족) |
| `finalText`, `endingText` | 단체사진 인사, 엔딩 문구 |
| `members` | 가족 별칭 목록. 예: `["아빠","엄마","하은"]`. 파일 이름에 별칭이 들어간 사진은 4번 장면(이름표)에 쓰인다. 비워 두면 4번 장면은 건너뛴다 |
| `bars` | 장면 길이(마디). 1마디 = 4박 |
| `bpmOverride`, `offsetOverride` | 박자 자동 분석이 틀렸을 때만: BPM과 첫 강박(초)을 직접 적는다 |

고친 뒤 `npm run make`를 다시 하면 된다.

## 구조

```
index.ts, Root.tsx     컴포지션 등록. public/*.json을 읽어 길이를 계산
Christmas.tsx          전체 조립 (배경 → 장면 → 묶음 제목 → 눈 → 음악)
timeline.ts            박자 → 장면 시간표. 노래보다 사진이 많으면 고르게 덜어낸다
scenes/                01 Intro, 02 Hang, 03 Full·Gift, 04 Member, 05 Collage, 06 Final, 07 Ending
components/            배경, 눈, 전구 줄, 폴라로이드, 선물상자, 반짝이, 묶음 제목
scripts/               prepare-media(사진·음악·박자), beats(박자 분석), finalize(음량), make-sample-media
public/fonts/          Jua(OFL), Mountains of Christmas(Apache-2.0) — 커밋됨
public/photos, music.*, *.json   npm run media가 만든다 — Git 제외
```
