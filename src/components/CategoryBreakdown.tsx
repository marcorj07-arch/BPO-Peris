import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { formatAmount } from '../lib/parseAmount';
import { colors } from '../theme';
import { Transaction } from '../types';
import { Card } from './Card';
import { ThemedText } from './ThemedText';

interface Props {
  transactions: Transaction[];
}

/** "Despesas por categoria" panel — horizontal bars sized relative to the
 * largest category, matching `.cat-row`/`.cat-bar-fill`. */
export function CategoryBreakdown({ transactions }: Props) {
  const rows = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'despesa')
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + t.amount;
      });
    return Object.entries(map)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const max = rows[0]?.value ?? 1;

  return (
    <Card>
      <ThemedText variant="panelTitle">Despesas por categoria</ThemedText>
      {rows.length === 0 ? (
        <ThemedText variant="caption" style={{ color: colors.textMuted }}>
          Sem despesas registradas.
        </ThemedText>
      ) : (
        rows.map((r) => (
          <View key={r.category} style={styles.row}>
            <View style={styles.top}>
              <ThemedText variant="caption" style={{ color: colors.textRowAlt, fontSize: 12.5 }}>
                {r.category}
              </ThemedText>
              <ThemedText variant="rowMeta">{formatAmount(r.value)}</ThemedText>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${(r.value / max) * 100}%` }]} />
            </View>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 10 },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barBg: { height: 6, backgroundColor: colors.borderHairline, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.despesa, borderRadius: 3 },
});
