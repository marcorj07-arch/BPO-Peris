import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useData } from '../context/DataContext';
import { newId } from '../lib/id';
import { parseAmount } from '../lib/parseAmount';
import { todayISO } from '../lib/recurring';
import { accentForModule, colors } from '../theme';
import { CATEGORIES, Module, TransactionStatus, TransactionType } from '../types';
import { AmountField } from './AmountField';
import { Card } from './Card';
import { CategoryPicker } from './CategoryPicker';
import { DateField } from './DateField';
import { SegmentedToggle } from './SegmentedToggle';
import { TextField } from './TextField';
import { ThemedText } from './ThemedText';

interface Props {
  module: Module;
}

/** Mirrors the "Novo lançamento" panel of the validated prototype: always
 * visible above the list (not a separate modal), segmented receita/despesa
 * toggle, and a module-accented submit button. */
export function TransactionCreateForm({ module }: Props) {
  const { addTransaction, addInstallmentPurchase } = useData();

  const [type, setType] = useState<TransactionType>('receita');
  const [category, setCategory] = useState(CATEGORIES[module][0]);
  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [date, setDate] = useState(todayISO());
  const [paidBy, setPaidBy] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('pago');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState('2');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = parseAmount(amountText || '0');
  const count = Math.max(2, Math.min(60, parseInt(installmentCount, 10) || 2));
  const isValid = description.trim().length > 0 && amount > 0 && category;

  const reset = () => {
    setDescription('');
    setAmountText('');
    setPaidBy('');
    setIsInstallment(false);
    setInstallmentCount('2');
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isInstallment) {
        await addInstallmentPurchase({
          base: { module, type, category, paidBy: paidBy || undefined },
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
          status,
        });
      }
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar lançamento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <ThemedText variant="panelTitle">Novo lançamento</ThemedText>

      <SegmentedToggle
        value={type}
        onChange={setType}
        options={[
          { value: 'receita', label: 'Receita', activeColor: colors.receita },
          { value: 'despesa', label: 'Despesa', activeColor: colors.despesaToggleActive },
        ]}
      />

      <DateField label="Data" value={date} onChange={setDate} />
      <CategoryPicker module={module} value={category} onChange={setCategory} />

      <View style={styles.row2}>
        <View style={styles.flex1}>
          <TextField label="Descrição" value={description} onChangeText={setDescription} placeholder="Descrição" />
        </View>
        <View style={styles.amountCol}>
          <AmountField label="Valor" value={amountText} onChangeText={setAmountText} />
        </View>
      </View>

      <View style={styles.row2}>
        <View style={styles.flex1}>
          <TextField label="Pago por" value={paidBy} onChangeText={setPaidBy} placeholder="Pago por" />
        </View>
        <View style={styles.statusCol}>
          <SegmentedToggle
            value={status}
            onChange={setStatus}
            options={[
              { value: 'pago', label: 'Pago' },
              { value: 'pendente', label: 'Pendente' },
            ]}
          />
        </View>
      </View>

      <Pressable style={styles.checkboxRow} onPress={() => setIsInstallment((v) => !v)}>
        <View style={[styles.checkbox, isInstallment && styles.checkboxChecked]} />
        <ThemedText variant="caption" style={{ color: colors.textRowAlt }}>
          Compra parcelada
        </ThemedText>
        {isInstallment && (
          <View style={styles.installmentCountWrap}>
            <TextField
              label=""
              value={installmentCount}
              onChangeText={setInstallmentCount}
              keyboardType="number-pad"
              style={styles.installmentCountInput}
            />
          </View>
        )}
      </Pressable>

      {error && (
        <ThemedText variant="caption" style={styles.error}>
          {error}
        </ThemedText>
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={!isValid || submitting}
        style={[styles.submit, { backgroundColor: accentForModule(module), opacity: isValid ? 1 : 0.5 }]}
      >
        <ThemedText variant="bodySemiBold" style={{ color: colors.background }}>
          {submitting ? 'Salvando…' : '+ Lançar'}
        </ThemedText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  row2: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  amountCol: { width: 130 },
  statusCol: { width: 130, marginTop: 20 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    marginRight: 8,
  },
  checkboxChecked: { backgroundColor: colors.accentPessoal, borderColor: colors.accentPessoal },
  installmentCountWrap: { width: 70, marginLeft: 10 },
  installmentCountInput: { paddingVertical: 6 },
  submit: { paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  error: { color: colors.despesa, marginBottom: 10, textAlign: 'center' },
});
