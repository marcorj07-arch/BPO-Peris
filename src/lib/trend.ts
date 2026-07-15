import { addMonthsToMonthKey, monthKey } from './date';
import { Module, Transaction } from '../types';

export interface MonthlyTrendPoint {
  month: string; // YYYY-MM
  receitas: number;
  despesas: number;
}

/** Receita/despesa totals for the `monthsBack` months ending at
 * `endMonthKey` (inclusive), oldest first — used by the "últimos 6 meses"
 * trend chart. */
export function computeMonthlyTrend(
  transactions: Transaction[],
  module: Module,
  endMonthKey: string,
  monthsBack = 6
): MonthlyTrendPoint[] {
  const points: MonthlyTrendPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const mk = addMonthsToMonthKey(endMonthKey, -i);
    const monthTx = transactions.filter((t) => t.module === module && monthKey(t.date) === mk);
    points.push({
      month: mk,
      receitas: monthTx.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0),
      despesas: monthTx.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0),
    });
  }
  return points;
}
