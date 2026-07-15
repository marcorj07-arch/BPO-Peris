import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatAmount } from '../lib/parseAmount';
import { colors } from '../theme';
import { Transaction } from '../types';
import { ThemedText } from './ThemedText';

interface Props {
  transaction: Transaction;
  recurring: boolean;
  onToggleStatus: () => void;
  onEdit: () => void;
  onToggleRecurring: () => void;
  onDelete: () => void;
}

export function TransactionListItem({
  transaction,
  recurring,
  onToggleStatus,
  onEdit,
  onToggleRecurring,
  onDelete,
}: Props) {
  const isDespesa = transaction.type === 'despesa';
  const isPendente = transaction.status === 'pendente';
  const installmentLabel =
    transaction.installmentGroup && transaction.installmentTotal
      ? ` · ${transaction.installmentIndex}/${transaction.installmentTotal}`
      : '';

  return (
    <View style={styles.row}>
      <Pressable onPress={onToggleStatus} hitSlop={10} style={styles.statusDot}>
        <ThemedText style={{ color: transaction.status === 'pago' ? colors.receita : colors.textSecondary, fontSize: 15 }}>
          {transaction.status === 'pago' ? '●' : '○'}
        </ThemedText>
      </Pressable>

      <Pressable onPress={onEdit} style={styles.middle}>
        <ThemedText variant="body" numberOfLines={1} style={{ fontSize: 13.5, color: isPendente ? colors.accentPessoal : colors.textBody }}>
          {transaction.description}
        </ThemedText>
        <ThemedText variant="rowMeta">
          {transaction.date.split('-').reverse().join('/')} · {transaction.category}
          {transaction.paidBy ? ` · ${transaction.paidBy}` : ''}
          {installmentLabel}
          {transaction.reconciled ? ' · 🏦 conciliado' : ''}
        </ThemedText>
      </Pressable>

      <View style={styles.actions}>
        <ThemedText variant="amount" style={{ fontSize: 13.5, color: isDespesa ? colors.despesaSoft : colors.receita }}>
          {isDespesa ? '−' : '+'} {formatAmount(transaction.amount)}
        </ThemedText>
        <Pressable onPress={onEdit} hitSlop={8} style={styles.iconBtn}>
          <ThemedText style={{ color: colors.textMuted, fontSize: 13 }}>✎</ThemedText>
        </Pressable>
        <Pressable onPress={onToggleRecurring} hitSlop={8} style={styles.iconBtn}>
          <ThemedText style={{ color: recurring ? colors.accentPessoal : colors.textMuted, fontSize: 13 }}>★</ThemedText>
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8} style={styles.iconBtn}>
          <ThemedText style={{ color: colors.textMuted, fontSize: 13 }}>✕</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderHairline,
  },
  statusDot: { paddingHorizontal: 4, flexShrink: 0 },
  middle: { flex: 1, marginLeft: 4, marginRight: 8, minWidth: 0 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  iconBtn: { padding: 4 },
});
