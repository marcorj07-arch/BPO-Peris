import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { CategoryPicker } from '../../../src/components/CategoryPicker';
import { ModuleSwitch } from '../../../src/components/ModuleSwitch';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ThemedText } from '../../../src/components/ThemedText';
import { useData } from '../../../src/context/DataContext';
import { useModule } from '../../../src/context/ModuleContext';
import { pickOfxFileContent } from '../../../src/lib/importOfx';
import { formatAmount } from '../../../src/lib/parseAmount';
import {
  dedupeAgainstExisting,
  matchStatementLines,
  OfxMatchResult,
  parseOfx,
  suggestCategory,
} from '../../../src/lib/ofx';
import { colors } from '../../../src/theme';
import { OfxStatementLine } from '../../../src/types';

export default function ReconciliationScreen() {
  const { module, setModule } = useModule();
  const { transactions, reconcileTransactions, addTransaction } = useData();

  const [loadingFile, setLoadingFile] = useState(false);
  const [result, setResult] = useState<OfxMatchResult | null>(null);
  const [reconciling, setReconciling] = useState(false);
  const [launchedFitids, setLaunchedFitids] = useState<Set<string>>(new Set());
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handlePickFile = async () => {
    setError(null);
    setLoadingFile(true);
    try {
      const content = await pickOfxFileContent();
      if (!content) return;
      const lines = parseOfx(content);
      const deduped = dedupeAgainstExisting(lines, transactions);
      const matchResult = matchStatementLines(deduped, transactions, module);
      setResult(matchResult);
      setLaunchedFitids(new Set());
      setCategoryOverrides({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao ler o extrato');
    } finally {
      setLoadingFile(false);
    }
  };

  const handleConfirmReconciliation = async () => {
    if (!result || result.matched.length === 0) return;
    setReconciling(true);
    try {
      await reconcileTransactions(result.matched.map((m) => m.transaction.id));
    } finally {
      setReconciling(false);
    }
  };

  const handleLaunchLine = async (line: OfxStatementLine) => {
    const category = categoryOverrides[line.fitid] ?? suggestCategory(line.memo, module);
    await addTransaction({
      module,
      type: line.amount < 0 ? 'despesa' : 'receita',
      date: line.date,
      category,
      description: line.memo || 'Lançamento do extrato',
      amount: Math.abs(line.amount),
      status: 'pago',
      reconciled: true,
      fitid: line.fitid,
    });
    setLaunchedFitids((prev) => new Set(prev).add(line.fitid));
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <ModuleSwitch value={module} onChange={setModule} />
      </View>

      <Button label="Selecionar extrato OFX/QFX" onPress={handlePickFile} loading={loadingFile} />

      {error && (
        <ThemedText variant="caption" style={styles.error}>
          {error}
        </ThemedText>
      )}

      {result && (
        <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
          <Card>
            <ThemedText variant="bodySemiBold">{result.matched.length} conciliados automaticamente</ThemedText>
            <ThemedText variant="caption">
              Valor idêntico e data dentro de ±5 dias de um lançamento existente.
            </ThemedText>
            {result.matched.length > 0 && (
              <Button
                label="Confirmar conciliação"
                onPress={handleConfirmReconciliation}
                loading={reconciling}
                style={styles.confirmButton}
              />
            )}
          </Card>

          {result.unmatchedLines.length > 0 && (
            <>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Sem correspondência ({result.unmatchedLines.length})
              </ThemedText>
              {result.unmatchedLines.map((line) => {
                const launched = launchedFitids.has(line.fitid);
                const category = categoryOverrides[line.fitid] ?? suggestCategory(line.memo, module);
                return (
                  <Card key={line.fitid}>
                    <ThemedText variant="bodyMedium">{line.memo || '(sem descrição)'}</ThemedText>
                    <ThemedText variant="caption">
                      {line.date.split('-').reverse().join('/')} ·{' '}
                      <ThemedText
                        variant="caption"
                        style={{ color: line.amount < 0 ? colors.despesa : colors.receita }}
                      >
                        {formatAmount(Math.abs(line.amount))}
                      </ThemedText>
                    </ThemedText>
                    {!launched && (
                      <>
                        <CategoryPicker
                          module={module}
                          value={category}
                          onChange={(cat) => setCategoryOverrides((prev) => ({ ...prev, [line.fitid]: cat }))}
                        />
                        <Button label="Lançar" onPress={() => handleLaunchLine(line)} variant="secondary" />
                      </>
                    )}
                    {launched && (
                      <ThemedText variant="caption" style={{ color: colors.accentPessoal }}>
                        Lançado ✓
                      </ThemedText>
                    )}
                  </Card>
                );
              })}
            </>
          )}

          {result.unmatchedTransactions.length > 0 && (
            <>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Lançamentos sem correspondência no extrato ({result.unmatchedTransactions.length})
              </ThemedText>
              <ThemedText variant="caption" style={styles.sectionHint}>
                Aviso, não erro — pode ser um lançamento ainda não compensado no banco.
              </ThemedText>
              {result.unmatchedTransactions.map((t) => (
                <Card key={t.id}>
                  <ThemedText variant="bodyMedium">{t.description}</ThemedText>
                  <ThemedText variant="caption">
                    {t.date.split('-').reverse().join('/')} · {formatAmount(t.amount)}
                  </ThemedText>
                </Card>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 12, marginBottom: 12 },
  error: { color: colors.despesa, marginTop: 12, textAlign: 'center' },
  results: { marginTop: 16 },
  sectionTitle: { marginTop: 8, marginBottom: 8 },
  sectionHint: { marginBottom: 8 },
  confirmButton: { marginTop: 12 },
});
