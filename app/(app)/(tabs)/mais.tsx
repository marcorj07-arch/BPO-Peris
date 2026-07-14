import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AmountField } from '../../../src/components/AmountField';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { ModuleSwitch } from '../../../src/components/ModuleSwitch';
import { MonthNav } from '../../../src/components/MonthNav';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ThemedText } from '../../../src/components/ThemedText';
import { useAuth } from '../../../src/context/AuthContext';
import { useData } from '../../../src/context/DataContext';
import { useModule } from '../../../src/context/ModuleContext';
import { BatchLaunchItem, buildBatchTransactions, getBatchLaunchChecklist } from '../../../src/lib/batchLaunch';
import { exportTransactionsToExcel } from '../../../src/lib/exportFile';
import { parseAmount } from '../../../src/lib/parseAmount';
import { colors } from '../../../src/theme';

interface RowState {
  selected: boolean;
  amountText: string;
}

export default function MoreScreen() {
  const { signOut } = useAuth();
  const { module, setModule, displayedMonth, setDisplayedMonth } = useModule();
  const { transactions, defaultTemplates, customTemplates, addBatchTransactions } = useData();

  const checklist: BatchLaunchItem[] = useMemo(
    () => getBatchLaunchChecklist(module, displayedMonth, defaultTemplates, customTemplates, transactions),
    [module, displayedMonth, defaultTemplates, customTemplates, transactions]
  );

  const [rowState, setRowState] = useState<Record<string, RowState>>({});
  const [launching, setLaunching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const getRow = (item: BatchLaunchItem): RowState =>
    rowState[item.template.id] ?? { selected: !item.alreadyLaunched, amountText: String(item.amount).replace('.', ',') };

  const setRow = (id: string, patch: Partial<RowState>) =>
    setRowState((prev) => ({ ...prev, [id]: { ...getRowById(prev, id, checklist), ...patch } }));

  function getRowById(state: Record<string, RowState>, id: string, list: BatchLaunchItem[]): RowState {
    if (state[id]) return state[id];
    const item = list.find((i) => i.template.id === id)!;
    return { selected: !item.alreadyLaunched, amountText: String(item.amount).replace('.', ',') };
  }

  const receitas = checklist.filter((c) => c.template.type === 'receita');
  const despesas = checklist.filter((c) => c.template.type === 'despesa');

  const handleBatchLaunch = async () => {
    const selected = checklist
      .map((item) => ({ item, row: getRow(item) }))
      .filter(({ row }) => row.selected)
      .map(({ item, row }) => ({ template: item.template, amount: parseAmount(row.amountText || '0') }));

    if (selected.length === 0) return;

    setLaunching(true);
    setFeedback(null);
    try {
      const items = buildBatchTransactions(module, displayedMonth, selected);
      await addBatchTransactions(items);
      setFeedback(`${items.length} lançamento(s) criado(s) em ${displayedMonth}-05.`);
      setRowState({});
    } finally {
      setLaunching(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportTransactionsToExcel(transactions);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText variant="title" style={styles.title}>
          Lançamento em lote
        </ThemedText>
        <ModuleSwitch value={module} onChange={setModule} />
        <MonthNav monthKey={displayedMonth} onChange={setDisplayedMonth} />

        {checklist.length === 0 && (
          <ThemedText variant="caption" style={styles.empty}>
            Nenhuma conta recorrente ativa neste módulo.
          </ThemedText>
        )}

        {receitas.length > 0 && (
          <>
            <ThemedText variant="bodySemiBold" style={styles.sectionTitle}>
              Receitas
            </ThemedText>
            {receitas.map((item) => (
              <BatchRow key={item.template.id} item={item} row={getRow(item)} onChange={(p) => setRow(item.template.id, p)} />
            ))}
          </>
        )}

        {despesas.length > 0 && (
          <>
            <ThemedText variant="bodySemiBold" style={styles.sectionTitle}>
              Despesas
            </ThemedText>
            {despesas.map((item) => (
              <BatchRow key={item.template.id} item={item} row={getRow(item)} onChange={(p) => setRow(item.template.id, p)} />
            ))}
          </>
        )}

        {checklist.length > 0 && (
          <Button
            label={`Lançar selecionados em ${displayedMonth}-05`}
            onPress={handleBatchLaunch}
            loading={launching}
            style={styles.launchButton}
          />
        )}

        {feedback && (
          <ThemedText variant="caption" style={styles.feedback}>
            {feedback}
          </ThemedText>
        )}

        <ThemedText variant="title" style={styles.title}>
          Exportar
        </ThemedText>
        <Card>
          <ThemedText variant="caption" style={styles.exportHint}>
            Gera uma planilha .xlsx com duas abas (Pessoal / Periscópio) de todos os lançamentos.
          </ThemedText>
          <Button label="Exportar para Excel" onPress={handleExport} loading={exporting} variant="secondary" />
        </Card>

        <ThemedText variant="title" style={styles.title}>
          Conta
        </ThemedText>
        <Button label="Sair" onPress={signOut} variant="ghost" />
      </ScrollView>
    </ScreenContainer>
  );
}

function BatchRow({
  item,
  row,
  onChange,
}: {
  item: BatchLaunchItem;
  row: RowState;
  onChange: (patch: Partial<RowState>) => void;
}) {
  return (
    <Card style={styles.row}>
      <View style={styles.rowTop}>
        <Pressable onPress={() => onChange({ selected: !row.selected })} style={[styles.checkbox, row.selected && styles.checkboxChecked]} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <ThemedText variant="bodyMedium">{item.template.description}</ThemedText>
          <ThemedText variant="caption">
            {item.template.category}
            {item.alreadyLaunched ? ' · já lançado neste mês' : ''}
          </ThemedText>
        </View>
      </View>
      <AmountField label="Valor" value={row.amountText} onChangeText={(t) => onChange({ amountText: t })} />
    </Card>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: 16, paddingBottom: 48 },
  title: { marginTop: 24, marginBottom: 12 },
  empty: { marginBottom: 8 },
  sectionTitle: { marginTop: 8, marginBottom: 8 },
  row: { marginBottom: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  checkboxChecked: { backgroundColor: colors.accentPessoal, borderColor: colors.accentPessoal },
  launchButton: { marginTop: 8, marginBottom: 8 },
  feedback: { color: colors.accentPessoal, textAlign: 'center', marginBottom: 8 },
  exportHint: { marginBottom: 12 },
});
