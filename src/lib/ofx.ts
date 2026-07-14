import { Module, OfxStatementLine, Transaction, TransactionType } from '../types';
import { parseDateParts } from './date';

function extractField(chunk: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}>([^<\r\n]*)`, 'i');
  const m = chunk.match(re);
  return m ? m[1].trim() : undefined;
}

/**
 * Tolerant OFX/QFX parser. Brazilian banks frequently export OFX 1.x
 * (SGML-ish) without closing tags, so this extracts each `<STMTTRN>` chunk
 * by splitting on the opening tag rather than requiring `</STMTTRN>`.
 * Works for both checking-account statements and card invoices — both use
 * the same `<STMTTRN>` structure.
 */
export function parseOfx(content: string): OfxStatementLine[] {
  const chunks = content.split(/<STMTTRN>/i).slice(1);
  const lines: OfxStatementLine[] = [];

  for (const chunk of chunks) {
    const dtposted = extractField(chunk, 'DTPOSTED');
    const trnamt = extractField(chunk, 'TRNAMT');
    const fitid = extractField(chunk, 'FITID');
    const memo = extractField(chunk, 'MEMO');
    const name = extractField(chunk, 'NAME');

    if (!dtposted || !trnamt || !fitid) continue;

    const date = `${dtposted.slice(0, 4)}-${dtposted.slice(4, 6)}-${dtposted.slice(6, 8)}`;
    const amount = parseFloat(trnamt);
    if (Number.isNaN(amount)) continue;

    lines.push({ fitid, date, amount, memo: (memo || name || '').trim() });
  }

  return lines;
}

/** Drops statement lines whose FITID already exists on some transaction in
 * the system, so re-importing the same file (or an overlapping period)
 * doesn't duplicate entries. */
export function dedupeAgainstExisting(
  statementLines: OfxStatementLine[],
  existingTransactions: Transaction[]
): OfxStatementLine[] {
  const existingFitids = new Set(
    existingTransactions.map((t) => t.fitid).filter((f): f is string => !!f)
  );
  return statementLines.filter((l) => !existingFitids.has(l.fitid));
}

export interface OfxMatch {
  line: OfxStatementLine;
  transaction: Transaction;
}

export interface OfxMatchResult {
  matched: OfxMatch[];
  unmatchedLines: OfxStatementLine[];
  unmatchedTransactions: Transaction[];
}

function toDayNumber(dateStr: string): number {
  const { year, month, day } = parseDateParts(dateStr);
  return Date.UTC(year, month - 1, day) / 86400000;
}

/**
 * Matches statement lines against existing (unreconciled) transactions in
 * the same module: same type (sign of the value), amount within R$0.01,
 * and date within ±5 days — picking the closest date when multiple
 * candidates qualify. Matched transactions are consumed so they can't be
 * matched twice.
 */
export function matchStatementLines(
  statementLines: OfxStatementLine[],
  transactions: Transaction[],
  module: Module
): OfxMatchResult {
  const candidates = transactions.filter((t) => t.module === module && !t.reconciled);
  const usedTransactionIds = new Set<string>();
  const matched: OfxMatch[] = [];
  const unmatchedLines: OfxStatementLine[] = [];

  for (const line of statementLines) {
    const lineType: TransactionType = line.amount < 0 ? 'despesa' : 'receita';
    const lineAbs = Math.abs(line.amount);
    const lineDayNum = toDayNumber(line.date);

    let best: { t: Transaction; diffDays: number } | undefined;
    for (const t of candidates) {
      if (usedTransactionIds.has(t.id)) continue;
      if (t.type !== lineType) continue;
      if (Math.abs(t.amount - lineAbs) > 0.01) continue;
      const diffDays = Math.abs(toDayNumber(t.date) - lineDayNum);
      if (diffDays > 5) continue;
      if (!best || diffDays < best.diffDays) best = { t, diffDays };
    }

    if (best) {
      matched.push({ line, transaction: best.t });
      usedTransactionIds.add(best.t.id);
    } else {
      unmatchedLines.push(line);
    }
  }

  let unmatchedTransactions = candidates.filter((t) => !usedTransactionIds.has(t.id));
  if (statementLines.length > 0) {
    const dayNumbers = statementLines.map((l) => toDayNumber(l.date));
    const min = Math.min(...dayNumbers);
    const max = Math.max(...dayNumbers);
    unmatchedTransactions = unmatchedTransactions.filter((t) => {
      const d = toDayNumber(t.date);
      return d >= min && d <= max;
    });
  }

  return { matched, unmatchedLines, unmatchedTransactions };
}

const CATEGORY_KEYWORDS: Record<Module, Array<{ keywords: string[]; category: string }>> = {
  pessoal: [
    { keywords: ['ALUGUEL', 'CONDOMINIO', 'IPTU', 'LUZ', 'ENERGIA', 'AGUA', 'GAS'], category: 'CASA' },
    { keywords: ['ESCOLA', 'FACULDADE', 'CURSO', 'MENSALIDADE ESCOLAR'], category: 'ENSINO' },
    { keywords: ['UBER', 'CINEMA', 'NETFLIX', 'SPOTIFY', 'RESTAURANTE', 'BAR'], category: 'LAZER' },
    { keywords: ['COMBUSTIVEL', 'POSTO', 'IPVA', 'SEGURO AUTO', 'OFICINA'], category: 'VEÍCULOS' },
    { keywords: ['FATURA CARTAO', 'CARTAO DE CREDITO'], category: 'CARTÃO' },
    { keywords: ['DARF', 'INSS', 'IRPF', 'DAS'], category: 'IMPOSTOS' },
    { keywords: ['SALARIO', 'PRO-LABORE', 'HONORARIOS'], category: 'TRABALHO' },
  ],
  empresa: [
    { keywords: ['ALUGUEL', 'CONDOMINIO', 'MATERIAL DE ESCRITORIO', 'LUZ', 'INTERNET'], category: 'ESCRITÓRIO' },
    { keywords: ['CURSO', 'TREINAMENTO', 'CONGRESSO'], category: 'EDUCAÇÃO' },
    { keywords: ['FATURA CARTAO', 'CARTAO DE CREDITO'], category: 'CARTÃO' },
    { keywords: ['SALARIO', 'PRO-LABORE', 'HONORARIOS'], category: 'TRABALHO' },
    { keywords: ['MENSALIDADE', 'HONORARIOS RECEBIDOS', 'PAGAMENTO CLIENTE'], category: 'RECEITA' },
  ],
};

/** Best-effort category suggestion from the statement memo, used to
 * pre-fill the one-click launch form for unmatched lines. Always editable
 * by the user afterwards. */
export function suggestCategory(memo: string, module: Module): string {
  const upper = memo.toUpperCase();
  for (const rule of CATEGORY_KEYWORDS[module]) {
    if (rule.keywords.some((k) => upper.includes(k))) return rule.category;
  }
  return 'OUTROS';
}
