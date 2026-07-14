import { Module, MonthlyProjection, ProjectedItem, RecurringTemplate, Transaction } from '../types';
import { addMonthsToMonthKey, monthKey } from './date';
import { getActiveTemplates } from './recurring';

function signedAmount(t: Pick<Transaction, 'type' | 'amount'>): number {
  return t.type === 'receita' ? t.amount : -t.amount;
}

/** Sum of all real transactions strictly before `beforeMonthKey` (YYYY-MM). */
export function computeAccumulatedBalance(
  transactions: Transaction[],
  module: Module,
  beforeMonthKey: string
): number {
  return transactions
    .filter((t) => t.module === module && monthKey(t.date) < beforeMonthKey)
    .reduce((sum, t) => sum + signedAmount(t), 0);
}

function computeMonthProjection(
  targetMonthKey: string,
  module: Module,
  transactions: Transaction[],
  activeTemplates: RecurringTemplate[]
): Omit<MonthlyProjection, 'saldoAcumulado'> {
  const realTx = transactions.filter(
    (t) => t.module === module && monthKey(t.date) === targetMonthKey
  );
  const existingDescriptions = new Set(realTx.map((t) => t.description));

  const items: ProjectedItem[] = realTx.map((t) => ({
    description: t.description,
    category: t.category,
    type: t.type,
    amount: t.amount,
    estimated: false,
  }));

  for (const template of activeTemplates) {
    if (existingDescriptions.has(template.description)) continue;
    items.push({
      description: template.description,
      category: template.category,
      type: template.type,
      amount: template.amount,
      estimated: true,
    });
  }

  const receitas = items.filter((i) => i.type === 'receita').reduce((s, i) => s + i.amount, 0);
  const despesas = items.filter((i) => i.type === 'despesa').reduce((s, i) => s + i.amount, 0);

  return { month: targetMonthKey, receitas, despesas, saldoMes: receitas - despesas, items };
}

/** Projects the next `monthsAhead` months (default 12) starting at
 * `startMonthKey` (YYYY-MM), combining real transactions with active
 * recurring templates that don't yet have a launch in that month. */
export function projectCashFlow(
  module: Module,
  transactions: Transaction[],
  defaultTemplates: RecurringTemplate[],
  customTemplates: RecurringTemplate[],
  startMonthKey: string,
  monthsAhead = 12,
  todayStr?: string
): MonthlyProjection[] {
  const activeTemplates = getActiveTemplates(
    module,
    defaultTemplates,
    customTemplates,
    transactions,
    todayStr
  );

  let acc = computeAccumulatedBalance(transactions, module, startMonthKey);
  const results: MonthlyProjection[] = [];

  for (let i = 0; i < monthsAhead; i++) {
    const mk = addMonthsToMonthKey(startMonthKey, i);
    const monthProj = computeMonthProjection(mk, module, transactions, activeTemplates);
    acc += monthProj.saldoMes;
    results.push({ ...monthProj, saldoAcumulado: acc });
  }

  return results;
}
