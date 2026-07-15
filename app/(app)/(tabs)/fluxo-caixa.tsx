import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppHeader } from '../../../src/components/AppHeader';
import { Card } from '../../../src/components/Card';
import { CashFlowChart } from '../../../src/components/CashFlowChart';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ThemedText } from '../../../src/components/ThemedText';
import { useData } from '../../../src/context/DataContext';
import { useModule } from '../../../src/context/ModuleContext';
import { projectCashFlow } from '../../../src/lib/cashflow';
import { formatAmount } from '../../../src/lib/parseAmount';
import { colors } from '../../../src/theme';
import { MonthlyProjection } from '../../../src/types';

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function formatMonth(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]}/${String(year).slice(2)}`;
}

const screenWidth = Dimensions.get('window').width;

export default function CashFlowScreen() {
  const router = useRouter();
  const { module, setModule, displayedMonth, setDisplayedMonth } = useModule();
  const { transactions, defaultTemplates, customTemplates } = useData();

  const projection: MonthlyProjection[] = useMemo(
    () => projectCashFlow(module, transactions, defaultTemplates, customTemplates, displayedMonth, 12),
    [module, transactions, defaultTemplates, customTemplates, displayedMonth]
  );

  const handleSelectMonth = (month: string) => {
    setDisplayedMonth(month);
    router.push('/(app)/(tabs)');
  };

  return (
    <ScreenContainer>
      <FlatList
        data={projection}
        keyExtractor={(p) => p.month}
        ListHeaderComponent={
          <View>
            <AppHeader module={module} onChangeModule={setModule} />
            <ThemedText variant="panelTitle">Fluxo de caixa projetado · próximos 12 meses</ThemedText>

            <Card style={styles.chartCard}>
              <CashFlowChart data={projection} width={screenWidth - 76} />
            </Card>
          </View>
        }
        renderItem={({ item }) => {
          const estimatedCount = item.items.filter((i) => i.estimated).length;
          return (
            <Pressable onPress={() => handleSelectMonth(item.month)}>
              <Card style={styles.monthRow}>
                <View style={styles.monthLabelWrap}>
                  <ThemedText variant="bodySemiBold" style={{ fontSize: 13 }}>
                    {formatMonth(item.month)}
                  </ThemedText>
                  {estimatedCount > 0 && (
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>
                        {estimatedCount} estimado{estimatedCount > 1 ? 's' : ''}
                      </ThemedText>
                    </View>
                  )}
                </View>
                <View style={styles.monthNumbers}>
                  <ThemedText variant="rowMeta" style={{ color: colors.receita }}>
                    {formatAmount(item.receitas)}
                  </ThemedText>
                  <ThemedText variant="rowMeta" style={{ color: colors.despesaSoft }}>
                    {formatAmount(item.despesas)}
                  </ThemedText>
                  <ThemedText
                    variant="bodySemiBold"
                    style={{ fontSize: 13, color: item.saldoAcumulado >= 0 ? colors.receita : colors.despesaSoft }}
                  >
                    {formatAmount(item.saldoAcumulado)}
                  </ThemedText>
                </View>
              </Card>
            </Pressable>
          );
        }}
        ListFooterComponent={
          <ThemedText variant="caption" style={styles.note}>
            Valores marcados como "estimado" ainda não foram lançados neste mês — são projetados a
            partir das suas contas recorrentes (★) com o último valor conhecido. Contas sem nenhum
            lançamento nos últimos 60 dias deixam de ser projetadas automaticamente.
          </ThemedText>
        }
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chartCard: { marginTop: 12, alignItems: 'center' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthLabelWrap: { width: 84 },
  badge: {
    backgroundColor: `${colors.accentPessoal}33`,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 9.5, color: colors.accentPessoal },
  monthNumbers: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginLeft: 12 },
  note: { marginTop: 16, lineHeight: 17 },
  listContent: { paddingBottom: 40 },
});
