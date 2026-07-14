import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '../theme';
import { MonthlyProjection } from '../types';

interface Props {
  data: MonthlyProjection[];
  width: number;
  height?: number;
}

/** Minimal SVG line chart for the projected accumulated balance — kept
 * dependency-free (no victory-native/react-native-skia) so it renders in
 * Expo Go without extra native setup. */
export function CashFlowChart({ data, width, height = 140 }: Props) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.saldoAcumulado);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const paddingX = 12;
  const paddingY = 12;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const points = values.map((v, i) => {
    const x = paddingX + (i / Math.max(values.length - 1, 1)) * innerWidth;
    const y = paddingY + innerHeight - ((v - min) / range) * innerHeight;
    return { x, y };
  });

  const zeroY = paddingY + innerHeight - ((0 - min) / range) * innerHeight;

  return (
    <View>
      <Svg width={width} height={height}>
        <Line x1={paddingX} y1={zeroY} x2={width - paddingX} y2={zeroY} stroke={colors.borderSubtle} strokeWidth={1} />
        <Polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={colors.accentEmpresa}
          strokeWidth={2}
        />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={values[i] >= 0 ? colors.accentEmpresa : colors.despesa} />
        ))}
      </Svg>
    </View>
  );
}
