import {AbsoluteFill, Img, staticFile} from 'remotion';
import type {Photo} from '../types';

// 세로 사진은 화면 가득, 가로 사진은 흐린 배경 위 가운데 (얼굴이 잘리지 않게)
export const PhotoView: React.FC<{photo: Photo; zoom?: number}> = ({photo, zoom = 1}) => {
  const src = staticFile(photo.src);
  if (photo.orientation === 'portrait') {
    return (
      <AbsoluteFill>
        <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', transform: `scale(${zoom})`, transformOrigin: '50% 35%'}} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(38px) brightness(0.55) saturate(1.2)', transform: 'scale(1.2)'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img src={src} style={{width: 1080, height: (1080 * photo.h) / photo.w, objectFit: 'cover', transform: `scale(${zoom})`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
