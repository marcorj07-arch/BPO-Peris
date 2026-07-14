import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatAmount } from '../lib/parseAmount';
import { colors } from '../theme';
import { Transaction } from '../types';
import { ThemedText } from './ThemedText';

interface Props {
  transaction: Transaction;
  recurring: boolean;
  onPress: () => void;
  onToggleRecurring: () => void;
}

export function TransactionListItem({ transaction, recurring, onPress, onToggleRecurring }: Props) {
  const isDespesa = transaction.type === 'despesa';
  const installmentLabel =
    transaction.installmentGroup && transaction.installmentTotal
      ? ` · ${transaction.installmentIndex}/${transaction.installmentTotal}`
      : '';

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Pressable onPress={onToggleRecurring} hitSlop={10} style={styles.star}>
        <ThemedText style={{ color: recurring ? colors.accentPessoal : colors.borderStrong, fontSize: 18 }}>
          {recurring ? '★' : '☆'}
        </ThemedText>
      </Pressable>

      <View style={styles.middle}>
        <ThemedText variant="bodyMedium" numberOfLines={1}>
          {transaction.description}
        </ThemedText>
        <ThemedText variant="caption">
          {transaction.category} · {transaction.date.split('-').reverse().join('/')}
          {installmentLabel}
          {transaction.status === 'pendente' ? ' · pendente' : ''}
          {transaction.reconciled ? ' · conciliado' : ''}
        </ThemedText>
      </View>

      <ThemedText variant="amount" style={{ color: isDespesa ? colors.despesa : colors.receita }}>
        {isDespesa ? '-' : '+'}
        {formatAmount(transaction.amount)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  star: { marginRight: 10 },
  middle: { flex: 1, marginRight: 8 },
});
