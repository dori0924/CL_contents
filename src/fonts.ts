import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// 글꼴 파일을 저장소(public/fonts)에 넣어 인터넷 없이도 같은 모양으로 렌더된다.
// Jua (OFL), Mountains of Christmas (Apache-2.0) — 라이선스 파일은 public/fonts/에 함께 있다.
export const KO = 'Jua';
export const XMAS = 'Mountains of Christmas';

loadFont({family: KO, url: staticFile('fonts/Jua-Regular.ttf'), weight: '400'});
loadFont({family: XMAS, url: staticFile('fonts/MountainsofChristmas-Bold.ttf'), weight: '700'});
