import React from 'react';
import { StyleSheet, View } from 'react-native';
import { formatAmount } from '../lib/parseAmount';
import { accentForModule, colors } from '../theme';
import { Module } from '../types';
import { ThemedText } from './ThemedText';

interface Props {
  module: Module;
  receitas: number;
  despesas: number;
  pendente: number;
  acumulado: number;
}

/** Mirrors `.summary-grid`/`.card` from the prototype: a 2-column grid of
 * stat cards, with the accumulated balance emphasized in the module's
 * accent color. */
export function SummaryCardsGrid({ module, receitas, despesas, pendente, acumulado }: Props) {
  const saldo = receitas - despesas;
  const ac = accentForModule(module);

  const cards = [
    { label: 'Receitas do mês', value: receitas, tone: colors.receita },
    { label: 'Despesas do mês', value: despesas, tone: colors.despesa },
    { label: 'Resultado do mês', value: saldo, tone: saldo >= 0 ? colors.receita : colors.despesa },
    { label: 'Pendente no mês', value: pendente, tone: colors.accentPessoal },
    { label: 'Saldo acumulado', value: acumulado, tone: ac, emphasis: true },
  ];

  return (
    <View style={styles.grid}>
      {cards.map((c) => (
        <View key={c.label} style={[styles.card, c.emphasis && { backgroundColor: colors.cardEmphasis, borderColor: `${ac}66` }]}>
          <View style={styles.labelRow}>
            <ThemedText style={{ color: c.tone, fontSize: 10 }}>●</ThemedText>
            <ThemedText variant="cardLabel">{c.label}</ThemedText>
          </View>
          <ThemedText variant="amount" style={{ fontSize: 21 }}>
            {formatAmount(c.value)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    padding: 16,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
});
