import { Transaction } from '../../types';
import { dedupeAgainstExisting, matchStatementLines, parseOfx, suggestCategory } from '../ofx';

const SAMPLE_OFX_NO_CLOSING_TAGS = `
OFXHEADER:100
DATA:OFXSGML
VERSION:102

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260710120000[-3:GMT]
<TRNAMT>-150.00
<FITID>2026071000001
<MEMO>PIX ALUGUEL JOAO
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260711120000[-3:GMT]
<TRNAMT>5000.00
<FITID>2026071100002
<NAME>HONORARIOS CLIENTE X
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
`;

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? Math.random().toString(),
    module: 'pessoal',
    type: 'despesa',
    date: '2026-07-10',
    category: 'CASA',
    description: 'Aluguel',
    amount: 150,
    status: 'pago',
    ...overrides,
  };
}

describe('parseOfx', () => {
  it('extracts transactions from OFX without closing STMTTRN tags', () => {
    const lines = parseOfx(SAMPLE_OFX_NO_CLOSING_TAGS);
    expect(lines).toHaveLength(2);

    expect(lines[0]).toMatchObject({
      fitid: '2026071000001',
      date: '2026-07-10',
      amount: -150.0,
      memo: 'PIX ALUGUEL JOAO',
    });

    expect(lines[1]).toMatchObject({
      fitid: '2026071100002',
      date: '2026-07-11',
      amount: 5000.0,
      memo: 'HONORARIOS CLIENTE X',
    });
  });

  it('returns an empty array for content with no STMTTRN', () => {
    expect(parseOfx('<OFX></OFX>')).toEqual([]);
  });
});

describe('dedupeAgainstExisting', () => {
  it('drops statement lines whose FITID already exists on a transaction', () => {
    const lines = parseOfx(SAMPLE_OFX_NO_CLOSING_TAGS);
    const existing = [tx({ fitid: '2026071000001' })];
    const result = dedupeAgainstExisting(lines, existing);
    expect(result).toHaveLength(1);
    expect(result[0].fitid).toBe('2026071100002');
  });
});

describe('matchStatementLines', () => {
  it('matches a statement line to a transaction with same amount/type and date within 5 days', () => {
    const lines = parseOfx(SAMPLE_OFX_NO_CLOSING_TAGS);
    const existing = [
      tx({ id: 'a', date: '2026-07-08', amount: 150, type: 'despesa' }),
      tx({ id: 'b', date: '2026-07-11', amount: 5000, type: 'receita', description: 'Honorários' }),
    ];
    const result = matchStatementLines(lines, existing, 'pessoal');
    expect(result.matched).toHaveLength(2);
    expect(result.unmatchedLines).toHaveLength(0);
  });

  it('leaves a line unmatched when the date is more than 5 days away', () => {
    const lines = parseOfx(SAMPLE_OFX_NO_CLOSING_TAGS);
    const existing = [tx({ id: 'a', date: '2026-06-01', amount: 150, type: 'despesa' })];
    const result = matchStatementLines(lines, existing, 'pessoal');
    expect(result.matched).toHaveLength(0);
    expect(result.unmatchedLines.length).toBeGreaterThan(0);
  });

  it('does not match transactions already reconciled', () => {
    const lines = parseOfx(SAMPLE_OFX_NO_CLOSING_TAGS);
    const existing = [tx({ id: 'a', date: '2026-07-10', amount: 150, type: 'despesa', reconciled: true })];
    const result = matchStatementLines(lines, existing, 'pessoal');
    expect(result.matched.find((m) => m.transaction.id === 'a')).toBeUndefined();
  });

  it('picks the closest date when multiple candidates qualify', () => {
    const lines = parseOfx(SAMPLE_OFX_NO_CLOSING_TAGS);
    const existing = [
      tx({ id: 'far', date: '2026-07-07', amount: 150, type: 'despesa' }),
      tx({ id: 'close', date: '2026-07-09', amount: 150, type: 'despesa' }),
    ];
    const result = matchStatementLines(lines, existing, 'pessoal');
    const match = result.matched.find((m) => m.line.fitid === '2026071000001');
    expect(match?.transaction.id).toBe('close');
  });
});

describe('suggestCategory', () => {
  it('suggests a category from known keywords', () => {
    expect(suggestCategory('PIX ALUGUEL APTO', 'pessoal')).toBe('CASA');
    expect(suggestCategory('POSTO SHELL COMBUSTIVEL', 'pessoal')).toBe('VEÍCULOS');
  });

  it('falls back to OUTROS when nothing matches', () => {
    expect(suggestCategory('TRANSFERENCIA DESCONHECIDA XYZ', 'pessoal')).toBe('OUTROS');
  });
});
