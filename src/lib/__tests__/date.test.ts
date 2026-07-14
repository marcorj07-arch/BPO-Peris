import { addMonthsClamped, addMonthsToMonthKey, monthKey } from '../date';

describe('addMonthsClamped', () => {
  it('advances by whole months keeping the day', () => {
    expect(addMonthsClamped('2026-01-15', 1)).toBe('2026-02-15');
    expect(addMonthsClamped('2026-01-15', 11)).toBe('2026-12-15');
  });

  it('rolls over the year', () => {
    expect(addMonthsClamped('2026-11-30', 3)).toBe('2027-02-28');
  });

  it('clamps day 31 to the last day of a shorter month', () => {
    expect(addMonthsClamped('2026-01-31', 1)).toBe('2026-02-28');
  });

  it('clamps to Feb 29 on a leap year', () => {
    expect(addMonthsClamped('2028-01-31', 1)).toBe('2028-02-29');
  });

  it('handles 0 months as a no-op', () => {
    expect(addMonthsClamped('2026-05-10', 0)).toBe('2026-05-10');
  });
});

describe('monthKey / addMonthsToMonthKey', () => {
  it('extracts YYYY-MM', () => {
    expect(monthKey('2026-07-14')).toBe('2026-07');
  });

  it('advances a month key across a year boundary', () => {
    expect(addMonthsToMonthKey('2026-11', 2)).toBe('2027-01');
  });
});
