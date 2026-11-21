import {C} from '../config';

// open: 0(닫힘) → 1(뚜껑 날아감)
export const GiftBox: React.FC<{size: number; open: number; shake?: number}> = ({size, open, shake = 0}) => {
  const lidY = -open * size * 1.4;
  const lidR = open * -35;
  return (
    <svg width={size * 1.6} height={size * 2.4} viewBox="-80 -140 260 240" style={{overflow: 'visible', transform: `rotate(${shake}deg)`}}>
      <g>
        <rect x={0} y={0} width={100} height={90} fill={C.red} rx={4} />
        <rect x={42} y={0} width={16} height={90} fill={C.gold} />
        <rect x={0} y={0} width={100} height={10} fill={C.redDeep} opacity={0.5} />
      </g>
      <g transform={`translate(50 0) translate(0 ${lidY}) rotate(${lidR}) translate(-50 0)`}>
        <rect x={-6} y={-22} width={112} height={24} fill={C.red} rx={4} />
        <rect x={42} y={-22} width={16} height={24} fill={C.gold} />
        <ellipse cx={36} cy={-32} rx={18} ry={11} fill="none" stroke={C.gold} strokeWidth={7} transform="rotate(-20 36 -32)" />
        <ellipse cx={64} cy={-32} rx={18} ry={11} fill="none" stroke={C.gold} strokeWidth={7} transform="rotate(20 64 -32)" />
        <circle cx={50} cy={-26} r={7} fill={C.goldLight} />
      </g>
    </svg>
  );
};
