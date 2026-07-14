import { RecurringTemplate, Transaction } from '../../types';
import { buildBatchTransactions, getBatchLaunchChecklist } from '../batchLaunch';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? Math.random().toString(),
    module: 'pessoal',
    type: 'despesa',
    date: '2026-07-01',
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

describe('getBatchLaunchChecklist', () => {
  it('pre-marks templates with no transaction yet in the target month', () => {
    const defaults = [
      template({ description: 'Aluguel' }),
      template({ description: 'Internet', amount: 120 }),
    ];
    const txs = [tx({ description: 'Aluguel', date: '2026-07-05' })];

    const checklist = getBatchLaunchChecklist('pessoal', '2026-07', defaults, [], txs, '2026-07-14');
    const aluguel = checklist.find((c) => c.template.description === 'Aluguel')!;
    const internet = checklist.find((c) => c.template.description === 'Internet')!;

    expect(aluguel.alreadyLaunched).toBe(true);
    expect(internet.alreadyLaunched).toBe(false);
  });
});

describe('buildBatchTransactions', () => {
  it('dates every selected item the 5th of the target month', () => {
    const result = buildBatchTransactions('pessoal', '2026-08', [
      { template: template({ description: 'Aluguel' }), amount: 2050 },
      { template: template({ description: 'Internet', amount: 120 }), amount: 120 },
    ]);

    expect(result).toHaveLength(2);
    expect(result.every((t) => t.date === '2026-08-05')).toBe(true);
    expect(result[0].amount).toBe(2050);
  });
});
