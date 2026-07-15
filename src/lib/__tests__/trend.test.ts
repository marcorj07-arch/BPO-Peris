import { Transaction } from '../../types';
import { computeMonthlyTrend } from '../trend';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? Math.random().toString(),
    module: 'pessoal',
    type: 'despesa',
    date: '2026-06-01',
    category: 'CASA',
    description: 'X',
    amount: 100,
    status: 'pago',
    ...overrides,
  };
}

describe('computeMonthlyTrend', () => {
  it('returns 6 points ending at the given month, oldest first', () => {
    const points = computeMonthlyTrend([], 'pessoal', '2026-07');
    expect(points.map((p) => p.month)).toEqual([
      '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07',
    ]);
  });

  it('sums receitas and despesas per month for the given module only', () => {
    const txs: Transaction[] = [
      tx({ date: '2026-06-05', type: 'receita', amount: 1000 }),
      tx({ date: '2026-06-10', type: 'despesa', amount: 400 }),
      tx({ date: '2026-06-15', type: 'despesa', amount: 100, module: 'empresa' }),
    ];
    const points = computeMonthlyTrend(txs, 'pessoal', '2026-07');
    const june = points.find((p) => p.month === '2026-06')!;
    expect(june.receitas).toBe(1000);
    expect(june.despesas).toBe(400);
  });
});
