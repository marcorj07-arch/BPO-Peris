import React from 'react';
import { StyleSheet, View } from 'react-native';
import { formatAmount } from '../lib/parseAmount';
import { colors } from '../theme';
import { Module } from '../types';
import { ThemedText } from './ThemedText';

interface Props {
  module: Module;
  acumulado: number;
}

const MODULE_LABEL: Record<Module, string> = { pessoal: 'Pessoal', empresa: 'Periscópio (PJ)' };

/** Right-aligned footer figure with a double underline, mirroring
 * `.grand-total`/`.grand-total-value`. */
export function GrandTotal({ module, acumulado }: Props) {
  const positive = acumulado >= 0;
  const tone = positive ? colors.receita : colors.despesaSoft;

  return (
    <View style={styles.wrap}>
      <ThemedText variant="eyebrow" style={styles.label}>
        Saldo acumulado · {MODULE_LABEL[module]}
      </ThemedText>
      <View style={[styles.valueWrap, { borderColor: positive ? colors.receita : colors.despesa }]}>
        <ThemedText variant="grandTotal" style={{ color: tone }}>
          {formatAmount(acumulado)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24, alignItems: 'flex-end' },
  label: { marginBottom: 4 },
  valueWrap: { borderBottomWidth: 3, paddingBottom: 6 },
});
