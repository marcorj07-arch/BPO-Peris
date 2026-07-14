import { parseAmount } from '../parseAmount';

describe('parseAmount', () => {
  it('parses a value with thousands separator and comma decimal', () => {
    expect(parseAmount('10.399,68')).toBeCloseTo(10399.68);
  });

  it('parses a plain comma-decimal value', () => {
    expect(parseAmount('150,5')).toBeCloseTo(150.5);
  });

  it('parses a value with multiple thousands separators', () => {
    expect(parseAmount('1.234.567,89')).toBeCloseTo(1234567.89);
  });

  it('parses a value with dot as decimal when there is no comma', () => {
    expect(parseAmount('150.5')).toBeCloseTo(150.5);
  });

  it('parses an integer string with no separators', () => {
    expect(parseAmount('1500')).toBe(1500);
  });

  it('passes numbers through unchanged', () => {
    expect(parseAmount(99.9)).toBe(99.9);
  });

  it('does not break on the classic thousands-separator trap', () => {
    // Naive `replace(",", ".")` would turn this into 10.399.68 -> NaN/wrong.
    expect(parseAmount('10.399,68')).not.toBeCloseTo(10.399, 2);
  });
});
