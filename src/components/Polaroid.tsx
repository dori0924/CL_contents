import {Img, staticFile} from 'remotion';
import {C} from '../config';
import {KO} from '../fonts';
import type {Photo} from '../types';

// 폴라로이드 틀. width는 틀 전체 폭. 아래 여백에 날짜(또는 label)를 손글씨처럼
export const Polaroid: React.FC<{photo: Photo; width: number; label?: string | null; clip?: boolean; zoom?: number; focusY?: number}> = ({photo, width, label, clip = true, zoom = 1, focusY = 30}) => {
  const pad = width * 0.055;
  const inner = width - pad * 2;
  // 사진 원래 비율을 따르되 너무 길거나 납작하지 않게 (0.75~1.25)
  const ih = inner * Math.min(1.25, Math.max(0.75, photo.h / photo.w));
  const text = label ?? photo.date;
  return (
    <div style={{width, background: '#FBF8F1', padding: pad, paddingBottom: pad * 3.2, boxShadow: '0 24px 60px rgba(0,0,0,0.45)', borderRadius: 6, position: 'relative'}}>
      {clip && (
        <div style={{position: 'absolute', top: -46, left: width / 2 - 20, width: 40, height: 84, borderRadius: 8, background: 'linear-gradient(90deg,#B07A45,#D9A66B,#B07A45)', boxShadow: '0 4px 8px rgba(0,0,0,0.35)'}} />
      )}
      <div style={{width: inner, height: ih, overflow: 'hidden'}}>
        <Img src={staticFile(photo.src)} style={{width: inner, height: ih, objectFit: 'cover', objectPosition: `50% ${focusY}%`, display: 'block', transform: `scale(${zoom})`, transformOrigin: `50% ${focusY}%`}} />
      </div>
      {text && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: pad * 0.7, textAlign: 'center', fontFamily: KO, fontSize: width * 0.075, color: C.ink, opacity: 0.8}}>{text}</div>
      )}
    </div>
  );
};
