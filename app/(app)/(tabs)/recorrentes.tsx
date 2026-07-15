import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppHeader } from '../../../src/components/AppHeader';
import { Card } from '../../../src/components/Card';
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
      <FlatList
        data={active}
        keyExtractor={(t) => t.id}
        ListHeaderComponent={
          <View>
            <AppHeader module={module} onChangeModule={setModule} />
            <ThemedText variant="panelTitle">Contas recorrentes ★</ThemedText>
            <ThemedText variant="caption" style={styles.hint}>
              Contas marcadas com ★ nos lançamentos aparecem aqui e entram na projeção de fluxo de caixa
              enquanto tiverem histórico recente (últimos 60 dias).
            </ThemedText>
          </View>
        }
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
                  <ThemedText variant="bodyMedium" style={{ color: colors.textRowAlt, fontSize: 13.5 }}>
                    {item.description}
                  </ThemedText>
                  <ThemedText variant="rowMeta">
                    {item.category}
                    {!eligible && <ThemedText style={styles.badge}>  sem projeção</ThemedText>}
                  </ThemedText>
                </View>
                <ThemedText variant="amount" style={{ fontSize: 13.5, color: item.type === 'despesa' ? colors.despesaSoft : colors.receita }}>
                  {formatAmount(item.amount)}
                </ThemedText>
              </View>
            </Card>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: 6, marginBottom: 16, lineHeight: 17 },
  empty: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
  row: { marginBottom: 10 },
  rowMain: { flexDirection: 'row', alignItems: 'center' },
  star: { marginRight: 10 },
  badge: {
    fontSize: 9.5,
    backgroundColor: `${colors.accentPessoal}33`,
    color: colors.accentPessoal,
    overflow: 'hidden',
  },
  listContent: { paddingBottom: 40 },
});
