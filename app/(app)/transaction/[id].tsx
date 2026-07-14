import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import { AmountField } from '../../../src/components/AmountField';
import { Button } from '../../../src/components/Button';
import { CategoryPicker } from '../../../src/components/CategoryPicker';
import { DateField } from '../../../src/components/DateField';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { SegmentedToggle } from '../../../src/components/SegmentedToggle';
import { TextField } from '../../../src/components/TextField';
import { ThemedText } from '../../../src/components/ThemedText';
import { useData } from '../../../src/context/DataContext';
import { parseAmount } from '../../../src/lib/parseAmount';
import { getInstallmentGroupSiblings } from '../../../src/lib/transactions';
import { colors } from '../../../src/theme';
import { TransactionStatus, TransactionType } from '../../../src/types';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transactions, editTransaction, removeTransaction } = useData();

  const transaction = useMemo(() => transactions.find((t) => t.id === id), [transactions, id]);
  const siblings = useMemo(
    () => (transaction ? getInstallmentGroupSiblings(transaction, transactions) : []),
    [transaction, transactions]
  );

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'despesa');
  const [category, setCategory] = useState(transaction?.category ?? '');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [amountText, setAmountText] = useState(transaction ? String(transaction.amount).replace('.', ',') : '');
  const [date, setDate] = useState(transaction?.date ?? '');
  const [paidBy, setPaidBy] = useState(transaction?.paidBy ?? '');
  const [note, setNote] = useState(transaction?.note ?? '');
  const [status, setStatus] = useState<TransactionStatus>(transaction?.status ?? 'pago');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!transaction) {
    return (
      <ScreenContainer>
        <ThemedText style={styles.notFound}>Lançamento não encontrado.</ThemedText>
      </ScreenContainer>
    );
  }

  const amount = parseAmount(amountText || '0');
  const isValid = description.trim().length > 0 && amount > 0 && category;

  const handleSave = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      await editTransaction(transaction.id, {
        type,
        category,
        description: description.trim(),
        amount,
        date,
        paidBy: paidBy || undefined,
        note: note || undefined,
        status,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const performDelete = async (scope: 'one' | 'group') => {
    setSubmitting(true);
    try {
      await removeTransaction(transaction, scope);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir');
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    const isPartOfGroup = !!transaction.installmentGroup && siblings.length > 1;

    if (!isPartOfGroup) {
      confirmAndDelete('Excluir lançamento?', 'Esta ação não pode ser desfeita.', () => performDelete('one'));
      return;
    }

    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      const all = confirm('Excluir todas as parcelas deste grupo? Cancelar exclui só esta parcela.');
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
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SegmentedToggle
          value={type}
          onChange={setType}
          options={[
            { value: 'despesa', label: 'Despesa', activeColor: colors.despesaToggleActive },
            { value: 'receita', label: 'Receita', activeColor: colors.receita },
          ]}
        />

        <CategoryPicker module={transaction.module} value={category} onChange={setCategory} />

        <TextField label="Descrição" value={description} onChangeText={setDescription} />
        <AmountField label="Valor" value={amountText} onChangeText={setAmountText} />
        <DateField label="Data" value={date} onChange={setDate} />
        <TextField label="Pago por (opcional)" value={paidBy} onChangeText={setPaidBy} />
        <TextField label="Observação (opcional)" value={note} onChangeText={setNote} multiline />

        <SegmentedToggle
          value={status}
          onChange={setStatus}
          options={[
            { value: 'pago', label: 'Pago' },
            { value: 'pendente', label: 'Pendente' },
          ]}
        />

        {transaction.installmentGroup && (
          <ThemedText variant="caption" style={styles.installmentInfo}>
            Parcela {transaction.installmentIndex}/{transaction.installmentTotal}
          </ThemedText>
        )}

        {error && (
          <ThemedText variant="caption" style={styles.error}>
            {error}
          </ThemedText>
        )}

        <Button label="Salvar" onPress={handleSave} loading={submitting} disabled={!isValid} />
        <Button label="Excluir" onPress={handleDelete} variant="danger" style={styles.deleteButton} />
      </ScrollView>
    </ScreenContainer>
  );
}

function confirmAndDelete(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (confirm(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: onConfirm },
  ]);
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: 16, paddingBottom: 48 },
  installmentInfo: { marginBottom: 16 },
  error: { color: colors.despesa, marginBottom: 12, textAlign: 'center' },
  deleteButton: { marginTop: 12 },
  notFound: { padding: 24, textAlign: 'center' },
});
