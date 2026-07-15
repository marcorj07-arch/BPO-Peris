import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { AppHeader } from '../../../src/components/AppHeader';
import { CategoryBreakdown } from '../../../src/components/CategoryBreakdown';
import { GrandTotal } from '../../../src/components/GrandTotal';
import { MonthNav } from '../../../src/components/MonthNav';
import { MonthlyTrendChart } from '../../../src/components/MonthlyTrendChart';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { SummaryCardsGrid } from '../../../src/components/SummaryCardsGrid';
import { TextField } from '../../../src/components/TextField';
import { ThemedText } from '../../../src/components/ThemedText';
import { TransactionCreateForm } from '../../../src/components/TransactionCreateForm';
import { TransactionEditRow } from '../../../src/components/TransactionEditRow';
import { TransactionListItem } from '../../../src/components/TransactionListItem';
import { useData } from '../../../src/context/DataContext';
import { useModule } from '../../../src/context/ModuleContext';
import { computeMonthlyTrend } from '../../../src/lib/trend';
import { filterByModuleAndMonth } from '../../../src/lib/transactions';
import { colors } from '../../../src/theme';

export default function TransactionsScreen() {
  const { module, setModule, displayedMonth, setDisplayedMonth } = useModule();
  const { transactions, loading, refresh, isDescriptionRecurring, toggleTemplateFor, editTransaction, removeTransaction } =
    useData();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const monthTransactions = useMemo(
    () =>
      filterByModuleAndMonth(transactions, module, displayedMonth).sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, module, displayedMonth]
  );

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return monthTransactions;
    const q = search.trim().toLowerCase();
    return monthTransactions.filter(
      (t) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [monthTransactions, search]);

  const { receitas, despesas, pendente } = useMemo(() => {
    return monthTransactions.reduce(
      (acc, t) => {
        if (t.type === 'receita') acc.receitas += t.amount;
        else {
          acc.despesas += t.amount;
          if (t.status === 'pendente') acc.pendente += t.amount;
        }
        return acc;
      },
      { receitas: 0, despesas: 0, pendente: 0 }
    );
  }, [monthTransactions]);

  const acumulado = useMemo(
    () =>
      transactions
        .filter((t) => t.module === module)
        .reduce((s, t) => s + (t.type === 'receita' ? t.amount : -t.amount), 0),
    [transactions, module]
  );

  const trendPoints = useMemo(
    () => computeMonthlyTrend(transactions, module, displayedMonth),
    [transactions, module, displayedMonth]
  );

  const handleToggleStatus = (id: string, current: 'pago' | 'pendente') =>
    editTransaction(id, { status: current === 'pago' ? 'pendente' : 'pago' });

  const handleDelete = (id: string) => {
    const t = monthTransactions.find((x) => x.id === id);
    if (t) removeTransaction(t, 'one');
  };

  return (
    <ScreenContainer>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(t) => t.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.textSecondary} />}
        ListHeaderComponent={
          <View>
            <AppHeader module={module} onChangeModule={setModule} />
            <MonthNav monthKey={displayedMonth} onChange={setDisplayedMonth} />
            <SummaryCardsGrid module={module} receitas={receitas} despesas={despesas} pendente={pendente} acumulado={acumulado} />
            <TransactionCreateForm module={module} />

            <View style={styles.listHead}>
              <ThemedText variant="panelTitle" style={{ marginBottom: 0 }}>
                Lançamentos ({filteredTransactions.length})
              </ThemedText>
              <View style={styles.searchBox}>
                <TextField value={search} onChangeText={setSearch} placeholder="Buscar…" style={styles.searchInput} />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <ThemedText variant="caption" style={styles.empty}>
            Nenhum lançamento encontrado.
          </ThemedText>
        }
        renderItem={({ item }) =>
          editingId === item.id ? (
            <TransactionEditRow transaction={item} onDone={() => setEditingId(null)} />
          ) : (
            <TransactionListItem
              transaction={item}
              recurring={isDescriptionRecurring(item.description, item.module)}
              onToggleStatus={() => handleToggleStatus(item.id, item.status)}
              onEdit={() => setEditingId(item.id)}
              onToggleRecurring={() =>
                toggleTemplateFor({
                  description: item.description,
                  module: item.module,
                  type: item.type,
                  category: item.category,
                  amount: item.amount,
                })
              }
              onDelete={() => handleDelete(item.id)}
            />
          )
        }
        ListFooterComponent={
          <View>
            <View style={styles.spacer} />
            <CategoryBreakdown transactions={monthTransactions} />
            <MonthlyTrendChart points={trendPoints} />
            <GrandTotal module={module} acumulado={acumulado} />
            <View style={styles.bottomSpacer} />
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  searchBox: { width: 140 },
  searchInput: { paddingVertical: 6, fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 24, marginBottom: 24, color: colors.textMuted },
  spacer: { height: 16 },
  bottomSpacer: { height: 40 },
});
