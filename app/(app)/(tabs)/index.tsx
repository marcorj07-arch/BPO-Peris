import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { Card } from '../../../src/components/Card';
import { ModuleSwitch } from '../../../src/components/ModuleSwitch';
import { MonthNav } from '../../../src/components/MonthNav';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ThemedText } from '../../../src/components/ThemedText';
import { TransactionListItem } from '../../../src/components/TransactionListItem';
import { useData } from '../../../src/context/DataContext';
import { useModule } from '../../../src/context/ModuleContext';
import { formatAmount } from '../../../src/lib/parseAmount';
import { filterByModuleAndMonth } from '../../../src/lib/transactions';
import { colors } from '../../../src/theme';
import { Transaction } from '../../../src/types';

export default function TransactionsScreen() {
  const router = useRouter();
  const { module, setModule, displayedMonth, setDisplayedMonth } = useModule();
  const { transactions, loading, refresh, isDescriptionRecurring, toggleTemplateFor } = useData();

  const monthTransactions = useMemo(
    () =>
      filterByModuleAndMonth(transactions, module, displayedMonth).sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    [transactions, module, displayedMonth]
  );

  const { receitas, despesas } = useMemo(() => {
    return monthTransactions.reduce(
      (acc, t) => {
        if (t.type === 'receita') acc.receitas += t.amount;
        else acc.despesas += t.amount;
        return acc;
      },
      { receitas: 0, despesas: 0 }
    );
  }, [monthTransactions]);

  const handleToggleRecurring = (t: Transaction) =>
    toggleTemplateFor({ description: t.description, module: t.module, type: t.type, category: t.category, amount: t.amount });

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <ModuleSwitch value={module} onChange={setModule} />
      </View>

      <MonthNav monthKey={displayedMonth} onChange={setDisplayedMonth} />

      <Card style={styles.summary}>
        <View style={styles.summaryRow}>
          <ThemedText variant="caption">Receitas</ThemedText>
          <ThemedText variant="amount" style={{ color: colors.receita }}>
            {formatAmount(receitas)}
          </ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText variant="caption">Despesas</ThemedText>
          <ThemedText variant="amount" style={{ color: colors.despesa }}>
            {formatAmount(despesas)}
          </ThemedText>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <ThemedText variant="bodySemiBold">Saldo do mês</ThemedText>
          <ThemedText variant="amount">{formatAmount(receitas - despesas)}</ThemedText>
        </View>
      </Card>

      <FlatList
        data={monthTransactions}
        keyExtractor={(t) => t.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.textSecondary} />}
        ListEmptyComponent={
          <ThemedText variant="caption" style={styles.empty}>
            Nenhum lançamento neste mês.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <TransactionListItem
            transaction={item}
            recurring={isDescriptionRecurring(item.description, item.module)}
            onPress={() => router.push(`/transaction/${item.id}`)}
            onToggleRecurring={() => handleToggleRecurring(item)}
          />
        )}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/transaction/new')}>
        <ThemedText style={styles.fabLabel}>+</ThemedText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 12 },
  summary: { marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryTotal: { borderTopWidth: 1, borderTopColor: colors.borderSubtle, marginTop: 6, paddingTop: 10 },
  empty: { textAlign: 'center', marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentEmpresa,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabLabel: { fontSize: 28, color: colors.background, lineHeight: 30 },
});
