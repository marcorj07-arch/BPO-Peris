import { buildInstallments, splitInstallmentAmounts } from '../installments';

describe('splitInstallmentAmounts', () => {
  it('splits evenly when it divides cleanly', () => {
    expect(splitInstallmentAmounts(300, 3)).toEqual([100, 100, 100]);
  });

  it('puts the rounding residual on the last installment', () => {
    const amounts = splitInstallmentAmounts(100, 3);
    expect(amounts[0]).toBeCloseTo(33.33);
    expect(amounts[1]).toBeCloseTo(33.33);
    expect(amounts[2]).toBeCloseTo(33.34);
    const sum = amounts.reduce((a, b) => a + b, 0);
    expect(Math.round(sum * 100) / 100).toBe(100);
  });

  it('sums exactly for an awkward total across many installments', () => {
    const total = 10399.68;
    const count = 7;
    const amounts = splitInstallmentAmounts(total, count);
    const sum = amounts.reduce((a, b) => a + b, 0);
    expect(Math.round(sum * 100) / 100).toBe(Math.round(total * 100) / 100);
  });

  it('rejects counts outside 2..60', () => {
    expect(() => splitInstallmentAmounts(100, 1)).toThrow();
    expect(() => splitInstallmentAmounts(100, 61)).toThrow();
  });
});

describe('buildInstallments', () => {
  const base = { module: 'pessoal' as const, type: 'despesa' as const, category: 'CARTÃO', paidBy: 'Marco' };

  it('builds one installment per month with suffixed descriptions', () => {
    const result = buildInstallments({
      base,
      description: 'Notebook',
      totalAmount: 3000,
      count: 3,
      baseDate: '2026-01-31',
      firstStatus: 'pago',
      groupId: 'group-1',
    });

    expect(result).toHaveLength(3);
    expect(result.map((r) => r.description)).toEqual([
      'Notebook (1/3)',
      'Notebook (2/3)',
      'Notebook (3/3)',
    ]);
    expect(result.map((r) => r.date)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31']);
  });

  it('gives the first installment the chosen status, and the rest pendente', () => {
    const result = buildInstallments({
      base,
      description: 'Notebook',
      totalAmount: 300,
      count: 3,
      baseDate: '2026-01-10',
      firstStatus: 'pago',
      groupId: 'group-2',
    });

    expect(result[0].status).toBe('pago');
    expect(result[1].status).toBe('pendente');
    expect(result[2].status).toBe('pendente');
  });

  it('shares the same installmentGroup and carries index/total', () => {
    const result = buildInstallments({
      base,
      description: 'Notebook',
      totalAmount: 300,
      count: 3,
      baseDate: '2026-01-10',
      firstStatus: 'pendente',
      groupId: 'group-3',
    });

    result.forEach((r, i) => {
      expect(r.installmentGroup).toBe('group-3');
      expect(r.installmentIndex).toBe(i + 1);
      expect(r.installmentTotal).toBe(3);
    });
  });
});
