import { RecurringTemplate, Transaction } from '../../types';
import { computeAccumulatedBalance, projectCashFlow } from '../cashflow';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? Math.random().toString(),
    module: 'pessoal',
    type: 'despesa',
    date: '2026-06-01',
    category: 'CASA',
    description: 'Aluguel',
    amount: 2000,
    status: 'pago',
    ...overrides,
  };
}

function template(overrides: Partial<RecurringTemplate>): RecurringTemplate {
  return {
    id: overrides.id ?? Math.random().toString(),
    module: 'pessoal',
    type: 'despesa',
    category: 'CASA',
    description: 'Aluguel',
    amount: 2000,
    ...overrides,
  };
}

describe('computeAccumulatedBalance', () => {
  it('sums receitas minus despesas strictly before the given month', () => {
    const txs = [
      tx({ date: '2026-05-01', type: 'receita', amount: 5000 }),
      tx({ date: '2026-05-15', type: 'despesa', amount: 2000 }),
      tx({ date: '2026-06-01', type: 'despesa', amount: 9999 }), // excluded, same month as boundary
    ];
    expect(computeAccumulatedBalance(txs, 'pessoal', '2026-06')).toBe(3000);
  });

  it('ignores transactions from a different module', () => {
    const txs = [tx({ date: '2026-05-01', type: 'receita', amount: 5000, module: 'empresa' })];
    expect(computeAccumulatedBalance(txs, 'pessoal', '2026-06')).toBe(0);
  });
});

describe('projectCashFlow', () => {
  it('projects 12 months by default, carrying the accumulated balance forward', () => {
    const txs: Transaction[] = [
      tx({ date: '2026-06-01', type: 'receita', amount: 5000, description: 'Salário' }),
      tx({ date: '2026-06-05', type: 'despesa', amount: 2000, description: 'Aluguel' }),
    ];
    const defaults = [template({ description: 'Aluguel', amount: 2000 })];

    const projection = projectCashFlow('pessoal', txs, defaults, [], '2026-07', 12, '2026-07-14');
    expect(projection).toHaveLength(12);
    expect(projection[0].month).toBe('2026-07');
    expect(projection[11].month).toBe('2027-06');
  });

  it('does not double count a month that already has a real transaction for a recurring description', () => {
    const txs: Transaction[] = [
      tx({ date: '2026-06-05', type: 'despesa', amount: 2000, description: 'Aluguel' }),
      tx({ date: '2026-07-05', type: 'despesa', amount: 2100, description: 'Aluguel' }),
    ];
    const defaults = [template({ description: 'Aluguel', amount: 2000 })];

    const projection = projectCashFlow('pessoal', txs, defaults, [], '2026-07', 1, '2026-07-14');
    expect(projection[0].items).toHaveLength(1);
    expect(projection[0].items[0].amount).toBe(2100);
    expect(projection[0].items[0].estimated).toBe(false);
  });

  it('projects an estimated item using the live template amount for a month with no real entry yet', () => {
    const txs: Transaction[] = [tx({ date: '2026-07-05', type: 'despesa', amount: 2200, description: 'Aluguel' })];
    const defaults = [template({ description: 'Aluguel', amount: 2000 })];

    const projection = projectCashFlow('pessoal', txs, defaults, [], '2026-07', 2, '2026-07-14');
    const august = projection[1];
    expect(august.month).toBe('2026-08');
    expect(august.items).toHaveLength(1);
    expect(august.items[0].estimated).toBe(true);
    expect(august.items[0].amount).toBe(2200); // live amount, not the frozen 2000
  });

  it('accumulates saldo month over month starting from the real balance up to the period start', () => {
    const txs: Transaction[] = [
      tx({ date: '2026-05-01', type: 'receita', amount: 1000, description: 'Extra' }),
    ];
    const projection = projectCashFlow('pessoal', txs, [], [], '2026-06', 2, '2026-07-14');
    expect(projection[0].saldoAcumulado).toBe(1000);
    expect(projection[1].saldoAcumulado).toBe(1000);
  });
});
