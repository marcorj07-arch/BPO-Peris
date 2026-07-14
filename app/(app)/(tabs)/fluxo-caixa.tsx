import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { CashFlowChart } from '../../../src/components/CashFlowChart';
import { Card } from '../../../src/components/Card';
import { ModuleSwitch } from '../../../src/components/ModuleSwitch';
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
      <View style={styles.header}>
        <ModuleSwitch value={module} onChange={setModule} />
      </View>

      <Card>
        <ThemedText variant="caption" style={styles.chartLabel}>
          Saldo acumulado projetado (12 meses)
        </ThemedText>
        <CashFlowChart data={projection} width={screenWidth - 64} />
      </Card>

      <FlatList
        data={projection}
        keyExtractor={(p) => p.month}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleSelectMonth(item.month)}>
            <Card style={styles.monthRow}>
              <ThemedText variant="bodySemiBold" style={styles.monthLabel}>
                {formatMonth(item.month)}
              </ThemedText>
              <View style={styles.monthNumbers}>
                <ThemedText variant="caption" style={{ color: colors.receita }}>
                  +{formatAmount(item.receitas)}
                </ThemedText>
                <ThemedText variant="caption" style={{ color: colors.despesa }}>
                  -{formatAmount(item.despesas)}
                </ThemedText>
                <ThemedText variant="bodyMedium">{formatAmount(item.saldoAcumulado)}</ThemedText>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 12, marginBottom: 12 },
  chartLabel: { marginBottom: 8 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthLabel: { width: 56 },
  monthNumbers: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginLeft: 12 },
});
