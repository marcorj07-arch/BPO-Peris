import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Card } from '../../../src/components/Card';
import { ModuleSwitch } from '../../../src/components/ModuleSwitch';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ThemedText } from '../../../src/components/ThemedText';
import { useData } from '../../../src/context/DataContext';
import { useModule } from '../../../src/context/ModuleContext';
import { formatAmount } from '../../../src/lib/parseAmount';
import { isTemplateEligibleForProjection } from '../../../src/lib/recurring';
import { colors } from '../../../src/theme';
import { RecurringTemplate } from '../../../src/types';

export default function RecurringScreen() {
  const { module, setModule } = useModule();
  const { defaultTemplates, customTemplates, transactions, toggleTemplateFor } = useData();

  const active: RecurringTemplate[] = useMemo(() => {
    return [
      ...defaultTemplates.filter((t) => t.module === module && !t.excluded),
      ...customTemplates.filter((t) => t.module === module),
    ].sort((a, b) => a.description.localeCompare(b.description));
  }, [defaultTemplates, customTemplates, module]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <ModuleSwitch value={module} onChange={setModule} />
      </View>

      <ThemedText variant="caption" style={styles.hint}>
        Contas marcadas com ★ nos lançamentos aparecem aqui e entram na projeção de fluxo de caixa
        enquanto tiverem histórico recente (últimos 60 dias).
      </ThemedText>

      <FlatList
        data={active}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={
          <ThemedText variant="caption" style={styles.empty}>
            Nenhuma conta recorrente marcada neste módulo ainda.
          </ThemedText>
        }
        renderItem={({ item }) => {
          const eligible = isTemplateEligibleForProjection(item, transactions);
          return (
            <Card style={styles.row}>
              <View style={styles.rowMain}>
                <Pressable
                  onPress={() =>
                    toggleTemplateFor({
                      description: item.description,
                      module: item.module,
                      type: item.type,
                      category: item.category,
                      amount: item.amount,
                    })
                  }
                  hitSlop={10}
                  style={styles.star}
                >
                  <ThemedText style={{ color: colors.accentPessoal, fontSize: 18 }}>★</ThemedText>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="bodyMedium">{item.description}</ThemedText>
                  <ThemedText variant="caption">
                    {item.category}
                    {!eligible ? ' · sem projeção (sem histórico recente)' : ''}
                  </ThemedText>
                </View>
                <ThemedText variant="amount" style={{ color: item.type === 'despesa' ? colors.despesa : colors.receita }}>
                  {formatAmount(item.amount)}
                </ThemedText>
              </View>
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 12, marginBottom: 12 },
  hint: { marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 40 },
  row: { marginBottom: 10 },
  rowMain: { flexDirection: 'row', alignItems: 'center' },
  star: { marginRight: 10 },
});
