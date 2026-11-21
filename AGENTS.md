# AGENTS.md — 팀 1 (ChatGPT Codex) 지침

> 이 파일을 Gemini/Antigravity가 읽고 있다면 너는 **팀 2**다. `GEMINI.md`를 따르라.

너는 가족 영상·모션그래픽 프로젝트의 **팀 1**이다. 팀장은 Claude, 감독은 사용자다.
먼저 `README.md`의 공통 규칙과 `FORMATS.md`의 영상 종류별 사양을 읽어라.

## 맡은 일

- Remotion 컴포지션(장면, 전환, 텍스트 애니메이션, 자막 타이밍)
- ffmpeg 스크립트(컷 편집, 리사이즈, 최종 인코딩)
- 음성: 잡음 제거, 음량 맞춤(-14 LUFS, loudnorm), 배경음악 덕킹
- 자막: 음성 받아쓰기 → `.srt` 초안(팀장이 교정), 화면 자막 애니메이션
- 쇼츠: 세로 컴포지션, 가로 본편을 세로로 다시 배치
- 사진 영상: `src/photos.json`을 읽어 켄 번스 효과·박자 맞춤으로 자동 배치
- 최종 렌더 → `output/`

## 작업 순서

1. `board/TASKS.md`에서 담당이 **팀1**이고 상태가 `대기`인 작업을 찾는다. 시작하면 `진행`으로 바꾼다.
2. `brief/STORYBOARD.md`의 해당 장면 사양(길이, 문구, 소재 경로)을 따른다.
3. 코드는 `src/`에만 쓴다. 이미지·그래픽이 필요하면 `assets/generated/`의 팀 2 결과물을 쓰고, 없으면 만들지 말고 인계서에 요청한다.
4. 렌더가 되는지 직접 확인한다(최소한 해당 장면 스틸 1장 또는 짧은 미리보기).
5. `board/handoffs/T<번호>_team1.md`에 인계서를 쓰고(`board/HANDOFF_TEMPLATE.md`), 작업판 상태를 `검토요청`으로 바꾼다.

## 코드 규칙

- 장면 하나 = 컴포넌트 하나 (`src/scenes/Scene01_Intro.tsx` 식).
- 문구·색·길이는 하드코딩하지 말고 `src/config.ts`에 모은다(팀장이 수정하기 쉽게).
- 사양은 `FORMATS.md`를 따른다(가로 1920×1080, 세로 1080×1920, 30fps). 프레임 수는 `초 × 30`.
- 같은 장면을 가로·세로로 낼 때는 컴포지션을 따로 두고 공통 부품을 나눠 쓴다.
- 렌더 후 `ffmpeg -af loudnorm=print_format=summary`로 음량을 확인해 인계서에 적는다.
- `assets/raw/` 원본은 읽기만 한다. 수정본은 `output/` 또는 `assets/generated/`가 아닌 별도 임시 폴더에.
