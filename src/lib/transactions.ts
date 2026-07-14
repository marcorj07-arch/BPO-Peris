import { Transaction } from '../types';

/** All transactions sharing an `installmentGroup` (the transaction itself
 * included), sorted by installment index. Used to drive the "delete just
 * this installment or the whole group?" prompt. */
export function getInstallmentGroupSiblings(
  transaction: Transaction,
  transactions: Transaction[]
): Transaction[] {
  if (!transaction.installmentGroup) return [transaction];
  return transactions
    .filter((t) => t.installmentGroup === transaction.installmentGroup)
    .sort((a, b) => (a.installmentIndex ?? 0) - (b.installmentIndex ?? 0));
}

export function filterByModuleAndMonth(
  transactions: Transaction[],
  module: Transaction['module'],
  monthKeyStr: string
): Transaction[] {
  return transactions.filter(
    (t) => t.module === module && t.date.slice(0, 7) === monthKeyStr
  );
}
