/**
 * Parses a monetary value typed in Brazilian format ("10.399,68").
 *
 * If the string has a comma, the comma is the decimal separator and every
 * dot is a thousands separator (stripped). If there's no comma, a dot (if
 * present) is already the decimal separator. Never do a naive
 * `replace(",", ".")` — that breaks on thousands separators.
 */
export function parseAmount(str: string | number): number {
  if (typeof str === 'number') return str;
  let s = String(str).trim();
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  }
  return parseFloat(s);
}

/** Formats a number as Brazilian currency, e.g. 10399.68 -> "R$ 10.399,68". */
export function formatAmount(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
