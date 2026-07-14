import { Module, NewTransaction, RecurringTemplate, Transaction } from '../types';
import { monthKey } from './date';
import { getActiveTemplates } from './recurring';

export interface BatchLaunchItem {
  template: RecurringTemplate;
  alreadyLaunched: boolean;
  amount: number;
}

/** Builds the batch-launch checklist: every active template for the
 * module, split by type by the caller, pre-checked when it has no
 * transaction yet in `targetMonthKey`. */
export function getBatchLaunchChecklist(
  module: Module,
  targetMonthKey: string,
  defaultTemplates: RecurringTemplate[],
  customTemplates: RecurringTemplate[],
  transactions: Transaction[],
  todayStr?: string
): BatchLaunchItem[] {
  const active = getActiveTemplates(module, defaultTemplates, customTemplates, transactions, todayStr);
  const launchedDescriptions = new Set(
    transactions
      .filter((t) => t.module === module && monthKey(t.date) === targetMonthKey)
      .map((t) => t.description)
  );

  return active.map((template) => ({
    template,
    alreadyLaunched: launchedDescriptions.has(template.description),
    amount: template.amount,
  }));
}

/** Builds the transactions for the selected checklist items, all dated the
 * 5th of `targetMonthKey`. */
export function buildBatchTransactions(
  module: Module,
  targetMonthKey: string,
  selected: Array<{ template: RecurringTemplate; amount: number }>
): NewTransaction[] {
  return selected.map(({ template, amount }) => ({
    module,
    type: template.type,
    date: `${targetMonthKey}-05`,
    category: template.category,
    description: template.description,
    amount,
    status: 'pendente',
  }));
}
