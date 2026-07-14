import { RecurringTemplate, Transaction } from '../../types';
import {
  getActiveTemplates,
  getLiveAmount,
  isRecurring,
  isTemplateEligibleForProjection,
  removeCustomTemplateForDescription,
  toggleRecurring,
} from '../recurring';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? 'tx-1',
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
    id: overrides.id ?? 'tmpl-1',
    module: 'pessoal',
    type: 'despesa',
    category: 'CASA',
    description: 'Aluguel',
    amount: 2000,
    ...overrides,
  };
}

describe('toggleRecurring / isRecurring', () => {
  it('marks a default template as excluded on first toggle, and re-activates on second', () => {
    const defaults = [template({ id: 'd1' })];
    let custom: RecurringTemplate[] = [];

    let result = toggleRecurring('Aluguel', 'pessoal', defaults, custom, {
      type: 'despesa',
      category: 'CASA',
      amount: 2000,
      id: 'unused',
    });
    expect(result.defaultTemplates[0].excluded).toBe(true);
    expect(isRecurring('Aluguel', 'pessoal', result.defaultTemplates, result.customTemplates)).toBe(false);

    result = toggleRecurring('Aluguel', 'pessoal', result.defaultTemplates, result.customTemplates, {
      type: 'despesa',
      category: 'CASA',
      amount: 2000,
      id: 'unused',
    });
    expect(result.defaultTemplates[0].excluded).toBeFalsy();
    expect(isRecurring('Aluguel', 'pessoal', result.defaultTemplates, result.customTemplates)).toBe(true);
  });

  it('adds and removes a custom template when the description has no default', () => {
    const defaults: RecurringTemplate[] = [];
    let custom: RecurringTemplate[] = [];

    let result = toggleRecurring('Consultoria XPTO', 'empresa', defaults, custom, {
      type: 'receita',
      category: 'RECEITA',
      amount: 5000,
      id: 'new-1',
    });
    expect(result.customTemplates).toHaveLength(1);
    expect(result.customTemplates[0].custom).toBe(true);
    expect(isRecurring('Consultoria XPTO', 'empresa', result.defaultTemplates, result.customTemplates)).toBe(true);

    result = toggleRecurring('Consultoria XPTO', 'empresa', result.defaultTemplates, result.customTemplates, {
      type: 'receita',
      category: 'RECEITA',
      amount: 5000,
      id: 'new-1',
    });
    expect(result.customTemplates).toHaveLength(0);
  });
});

describe('removeCustomTemplateForDescription', () => {
  it('removes a custom template matching module + description', () => {
    const custom = [template({ id: 'c1', module: 'empresa', description: 'Foo', custom: true })];
    const result = removeCustomTemplateForDescription('Foo', 'empresa', custom);
    expect(result).toHaveLength(0);
  });
});

describe('getLiveAmount', () => {
  it('falls back to the template amount when there is no matching transaction', () => {
    const t = template({ amount: 1800 });
    expect(getLiveAmount(t, [])).toBe(1800);
  });

  it('uses the most recent matching transaction amount, ignoring the frozen template amount', () => {
    const t = template({ amount: 1800 });
    const txs = [
      tx({ id: 't1', date: '2026-03-01', amount: 1800 }),
      tx({ id: 't2', date: '2026-05-01', amount: 1950 }),
      tx({ id: 't3', date: '2026-04-01', amount: 1900 }),
    ];
    expect(getLiveAmount(t, txs)).toBe(1950);
  });

  it('considers future-dated transactions too, not just past ones', () => {
    const t = template({ amount: 1800 });
    const txs = [
      tx({ id: 't1', date: '2026-06-01', amount: 1800 }),
      tx({ id: 't2', date: '2027-01-01', amount: 2100 }),
    ];
    expect(getLiveAmount(t, txs)).toBe(2100);
  });
});

describe('isTemplateEligibleForProjection', () => {
  const today = '2026-07-14';

  it('is eligible when there is no history at all', () => {
    const t = template({});
    expect(isTemplateEligibleForProjection(t, [], today)).toBe(true);
  });

  it('is eligible when the last transaction is within 60 days', () => {
    const t = template({});
    const txs = [tx({ date: '2026-06-01' })]; // 43 days before today
    expect(isTemplateEligibleForProjection(t, txs, today)).toBe(true);
  });

  it('is not eligible when the last transaction is older than 60 days', () => {
    const t = template({});
    const txs = [tx({ date: '2026-01-01' })];
    expect(isTemplateEligibleForProjection(t, txs, today)).toBe(false);
  });

  it('exactly 60 days ago is still eligible (inclusive boundary)', () => {
    const t = template({});
    const txs = [tx({ date: '2026-05-15' })]; // 60 days before 2026-07-14
    expect(isTemplateEligibleForProjection(t, txs, today)).toBe(true);
  });
});

describe('getActiveTemplates', () => {
  it('excludes obsolete templates and resolves live amounts', () => {
    const defaults = [
      template({ id: 'd1', description: 'Aluguel' }),
      template({ id: 'd2', description: 'Academia (encerrada)', amount: 150 }),
    ];
    const txs = [
      tx({ id: 't1', description: 'Aluguel', date: '2026-07-01', amount: 2100 }),
      tx({ id: 't2', description: 'Academia (encerrada)', date: '2026-01-01', amount: 150 }),
    ];
    const active = getActiveTemplates('pessoal', defaults, [], txs, '2026-07-14');
    expect(active.map((t) => t.description)).toEqual(['Aluguel']);
    expect(active[0].amount).toBe(2100);
  });
});
