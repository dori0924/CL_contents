export type Photo = {
  src: string;
  w: number;
  h: number;
  orientation: 'portrait' | 'landscape';
  date: string | null;
  member: string | null;
  final: boolean;
  group: 'g1' | 'g2' | 'members' | 'final';
};

export type Beats = {music: string; bpm: number; offset: number; duration: number};

export type Seg =
  | {kind: 'intro'; from: number; dur: number; beatFrames: number; firstBeat: number}
  | {kind: 'hang'; from: number; dur: number; photo: Photo; first: boolean}
  | {kind: 'full'; from: number; dur: number; photo: Photo}
  | {kind: 'gift'; from: number; dur: number; photo: Photo; beatFrames: number}
  | {kind: 'member'; from: number; dur: number; photo: Photo}
  | {kind: 'collage'; from: number; dur: number; photos: Photo[]; halfBar: number}
  | {kind: 'final'; from: number; dur: number; photo: Photo; barFrames: number}
  | {kind: 'ending'; from: number; dur: number};

export type Caption = {text: string; icon: 'tree' | 'sparkle' | 'heart'; from: number; dur: number};

export type Timeline = {segs: Seg[]; captions: Caption[]; total: number; beats: Beats; beatFrames: number};
