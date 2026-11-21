import {C} from '../config';

export const Icon: React.FC<{name: 'tree' | 'sparkle' | 'heart'; size: number}> = ({name, size}) => {
  if (name === 'tree')
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <polygon points="50,6 82,52 66,52 90,84 10,84 34,52 18,52" fill={C.green} />
        <rect x="43" y="84" width="14" height="12" fill="#7A4A25" />
        <polygon points="50,0 54,10 64,10 56,16 59,26 50,20 41,26 44,16 36,10 46,10" fill={C.gold} />
        <circle cx="38" cy="66" r="5" fill={C.red} /><circle cx="62" cy="72" r="5" fill={C.gold} /><circle cx="52" cy="42" r="4" fill={C.red} />
      </svg>
    );
  if (name === 'sparkle')
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path d="M50 4 C54 38 62 46 96 50 C62 54 54 62 50 96 C46 62 38 54 4 50 C38 46 46 38 50 4Z" fill={C.gold} />
        <path d="M82 8 C83 18 86 20 94 21 C86 22 83 25 82 34 C81 25 78 22 70 21 C78 20 81 18 82 8Z" fill={C.goldLight} />
      </svg>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88Z" fill={C.red} />
      <ellipse cx="30" cy="28" rx="8" ry="5" fill="#fff" opacity="0.5" />
    </svg>
  );
};
