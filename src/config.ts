import settings from './settings.json';

export const SETTINGS = settings;

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// 쇼츠 안전 영역: 글자·얼굴을 두지 않는 가장자리 (FORMATS.md)
export const SAFE = {top: 250, bottom: 400, right: 150, left: 60};

export const C = {
  navy: '#0F1E3D',
  navyDeep: '#070F24',
  red: '#D7263D',
  redDeep: '#9E1B2C',
  green: '#1B8A5A',
  greenDeep: '#0B5D3B',
  gold: '#F2C14E',
  goldLight: '#FFE39A',
  snow: '#FFFDF7',
  ink: '#1C1C28',
};

export const BULB_COLORS = [C.red, C.gold, C.green, '#4FA3FF', '#FF8FC7'];
