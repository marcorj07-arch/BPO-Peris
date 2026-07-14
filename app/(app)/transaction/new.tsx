import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AmountField } from '../../../src/components/AmountField';
import { Button } from '../../../src/components/Button';
import { CategoryPicker } from '../../../src/components/CategoryPicker';
import { DateField } from '../../../src/components/DateField';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { SegmentedToggle } from '../../../src/components/SegmentedToggle';
import { TextField } from '../../../src/components/TextField';
import { ThemedText } from '../../../src/components/ThemedText';
import { useData } from '../../../src/context/DataContext';
import { useModule } from '../../../src/context/ModuleContext';
import { newId } from '../../../src/lib/id';
import { parseAmount } from '../../../src/lib/parseAmount';
import { todayISO } from '../../../src/lib/recurring';
import { colors } from '../../../src/theme';
import { CATEGORIES, TransactionStatus, TransactionType } from '../../../src/types';

export default function NewTransactionScreen() {
  const router = useRouter();
  const { module } = useModule();
  const { addTransaction, addInstallmentPurchase } = useData();

  const [type, setType] = useState<TransactionType>('despesa');
  const [category, setCategory] = useState(CATEGORIES[module][0]);
  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [date, setDate] = useState(todayISO());
  const [paidBy, setPaidBy] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('pago');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState('2');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = parseAmount(amountText || '0');
  const count = Math.max(2, Math.min(60, parseInt(installmentCount, 10) || 2));
  const isValid = description.trim().length > 0 && amount > 0 && category;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isInstallment) {
        await addInstallmentPurchase({
          base: { module, type, category, paidBy: paidBy || undefined, note: note || undefined },
          description: description.trim(),
          totalAmount: amount,
          count,
          baseDate: date,
          firstStatus: status,
          groupId: newId(),
        });
      } else {
        await addTransaction({
          module,
          type,
          category,
          description: description.trim(),
          amount,
          date,
          paidBy: paidBy || undefined,
          note: note || undefined,
          status,
        });
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar lançamento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SegmentedToggle
          value={type}
          onChange={(v) => setType(v)}
          options={[
            { value: 'despesa', label: 'Despesa', activeColor: colors.despesaToggleActive },
            { value: 'receita', label: 'Receita', activeColor: colors.receita },
          ]}
        />

        <CategoryPicker module={module} value={category} onChange={setCategory} />

        <TextField label="Descrição" value={description} onChangeText={setDescription} placeholder="Ex: Aluguel" />
        <AmountField
          label={isInstallment ? 'Valor total da compra' : 'Valor'}
          value={amountText}
          onChangeText={setAmountText}
        />
        <DateField label="Data" value={date} onChange={setDate} />
        <TextField label="Pago por (opcional)" value={paidBy} onChangeText={setPaidBy} />
        <TextField label="Observação (opcional)" value={note} onChangeText={setNote} multiline />

        <SegmentedToggle
          value={status}
          onChange={(v) => setStatus(v)}
          options={[
            { value: 'pago', label: 'Pago' },
            { value: 'pendente', label: 'Pendente' },
          ]}
        />

        <Pressable style={styles.checkboxRow} onPress={() => setIsInstallment((v) => !v)}>
          <View style={[styles.checkbox, isInstallment && styles.checkboxChecked]} />
          <ThemedText variant="bodyMedium">Compra parcelada</ThemedText>
        </Pressable>

        {isInstallment && (
          <TextField
            label="Número de parcelas (2 a 60)"
            value={installmentCount}
            onChangeText={setInstallmentCount}
            keyboardType="number-pad"
          />
        )}

        {error && (
          <ThemedText variant="caption" style={styles.error}>
            {error}
          </ThemedText>
        )}

        <Button label="Salvar" onPress={handleSubmit} loading={submitting} disabled={!isValid} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: 16, paddingBottom: 48 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: colors.accentPessoal, borderColor: colors.accentPessoal },
  error: { color: colors.despesa, marginBottom: 12, textAlign: 'center' },
});
