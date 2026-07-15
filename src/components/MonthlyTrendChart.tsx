import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Card } from './Card';
import { ThemedText } from './ThemedText';
import { MonthlyTrendPoint } from '../lib/trend';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatMonth(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]}/${String(year).slice(2)}`;
}

interface Props {
  points: MonthlyTrendPoint[];
}

const BAR_MAX_HEIGHT = 100;

/** "Últimos 6 meses" grouped bar chart (receita vs despesa), matching
 * `.trend-grid`/`.trend-bar` — built with plain flex Views instead of SVG
 * since the prototype's version is exactly that (div bars with a height in
 * px). */
export function MonthlyTrendChart({ points }: Props) {
  const maxVal = Math.max(1, ...points.map((p) => Math.max(p.receitas, p.despesas)));

  return (
    <Card>
      <ThemedText variant="panelTitle">Últimos 6 meses</ThemedText>
      <View style={styles.grid}>
        {points.map((p) => (
          <View key={p.month} style={styles.col}>
            <View style={styles.bars}>
              <View
                style={[styles.bar, { height: (p.receitas / maxVal) * BAR_MAX_HEIGHT, backgroundColor: colors.receita }]}
              />
              <View
                style={[styles.bar, { height: (p.despesas / maxVal) * BAR_MAX_HEIGHT, backgroundColor: colors.despesa }]}
              />
            </View>
            <ThemedText variant="rowMeta" style={styles.label}>
              {formatMonth(p.month)}
            </ThemedText>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <ThemedText style={{ color: colors.receita }}>■</ThemedText>
          <ThemedText variant="caption"> Receitas</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <ThemedText style={{ color: colors.despesa }}>■</ThemedText>
          <ThemedText variant="caption"> Despesas</ThemedText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: BAR_MAX_HEIGHT + 30, paddingTop: 10 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: BAR_MAX_HEIGHT },
  bar: { width: 10, borderTopLeftRadius: 2, borderTopRightRadius: 2, minHeight: 1 },
  label: { marginTop: 6 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
});
