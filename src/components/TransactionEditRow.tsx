import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useData } from '../context/DataContext';
import { parseAmount } from '../lib/parseAmount';
import { getInstallmentGroupSiblings } from '../lib/transactions';
import { colors } from '../theme';
import { Transaction, TransactionStatus } from '../types';
import { AmountField } from './AmountField';
import { CategoryPicker } from './CategoryPicker';
import { DateField } from './DateField';
import { SegmentedToggle } from './SegmentedToggle';
import { TextField } from './TextField';
import { ThemedText } from './ThemedText';

interface Props {
  transaction: Transaction;
  onDone: () => void;
}

/** Compact inline edit form that replaces a row in place — mirrors
 * `.edit-row` from the prototype instead of pushing a separate screen. */
export function TransactionEditRow({ transaction, onDone }: Props) {
  const { transactions, editTransaction, removeTransaction } = useData();

  const [category, setCategory] = useState(transaction.category);
  const [description, setDescription] = useState(transaction.description);
  const [amountText, setAmountText] = useState(String(transaction.amount).replace('.', ','));
  const [date, setDate] = useState(transaction.date);
  const [paidBy, setPaidBy] = useState(transaction.paidBy ?? '');
  const [status, setStatus] = useState<TransactionStatus>(transaction.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = parseAmount(amountText || '0');
  const isValid = description.trim().length > 0 && amount > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      await editTransaction(transaction.id, {
        category,
        description: description.trim(),
        amount,
        date,
        paidBy: paidBy || undefined,
        status,
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
      setSubmitting(false);
    }
  };

  const performDelete = async (scope: 'one' | 'group') => {
    setSubmitting(true);
    try {
      await removeTransaction(transaction, scope);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir');
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    const siblings = getInstallmentGroupSiblings(transaction, transactions);
    const isPartOfGroup = !!transaction.installmentGroup && siblings.length > 1;

    if (!isPartOfGroup) {
      confirm('Excluir lançamento?', 'Esta ação não pode ser desfeita.', () => performDelete('one'));
      return;
    }

    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      const all = window.confirm('Excluir todas as parcelas deste grupo? Cancelar exclui só esta parcela.');
      performDelete(all ? 'group' : 'one');
      return;
    }

    Alert.alert('Excluir parcela', 'Esse lançamento faz parte de uma compra parcelada.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Só esta parcela', onPress: () => performDelete('one') },
      { text: 'Todas as parcelas', style: 'destructive', onPress: () => performDelete('group') },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <DateField label="Data" value={date} onChange={setDate} />
      <CategoryPicker module={transaction.module} value={category} onChange={setCategory} />
      <TextField label="Descrição" value={description} onChangeText={setDescription} />
      <AmountField label="Valor" value={amountText} onChangeText={setAmountText} />
      <TextField label="Pago por" value={paidBy} onChangeText={setPaidBy} />
      <SegmentedToggle
        value={status}
        onChange={setStatus}
        options={[
          { value: 'pago', label: 'Pago' },
          { value: 'pendente', label: 'Pendente' },
        ]}
      />

      {error && (
        <ThemedText variant="caption" style={styles.error}>
          {error}
        </ThemedText>
      )}

      <View style={styles.actions}>
        <Pressable onPress={handleDelete} style={styles.deleteBtn} disabled={submitting}>
          <ThemedText variant="caption" style={{ color: colors.despesa }}>
            Excluir
          </ThemedText>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={onDone} style={styles.cancelBtn} disabled={submitting}>
          <ThemedText variant="caption" style={{ color: colors.textRowAlt }}>
            Cancelar
          </ThemedText>
        </Pressable>
        <Pressable onPress={handleSave} style={[styles.saveBtn, { opacity: isValid ? 1 : 0.5 }]} disabled={!isValid || submitting}>
          <ThemedText variant="caption" style={{ color: colors.background, fontWeight: '700' }}>
            {submitting ? 'Salvando…' : 'Salvar'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function confirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: onConfirm },
  ]);
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderRadius: 6,
    padding: 10,
    marginVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderHairline,
  },
  error: { color: colors.despesa, marginBottom: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  deleteBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  saveBtn: { backgroundColor: colors.accentPessoal, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 5 },
});
