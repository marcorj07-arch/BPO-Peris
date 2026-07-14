export type Module = 'pessoal' | 'empresa';

export type TransactionType = 'receita' | 'despesa';

export type TransactionStatus = 'pago' | 'pendente';

export interface Transaction {
  id: string;
  module: Module;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  category: string;
  description: string;
  /** Always positive; sign comes from `type`. */
  amount: number;
  paidBy?: string;
  note?: string;
  status: TransactionStatus;
  reconciled?: boolean;
  /** Bank-provided unique id (OFX), used to avoid re-importing the same statement line. */
  fitid?: string;
  installmentGroup?: string;
  installmentIndex?: number;
  installmentTotal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

export interface RecurringTemplate {
  id: string;
  module: Module;
  type: TransactionType;
  category: string;
  /** Identity key — two templates with the same description in the same module overlap. */
  description: string;
  /** Reference amount. Prefer the "live" amount from the latest matching transaction (see lib/recurring.ts). */
  amount: number;
  /** When true, disables a template that is a default one, without deleting history. */
  excluded?: boolean;
  /** True for user-added (non-default) templates. Defaults are derived from imported history. */
  custom?: boolean;
}

export const CATEGORIES: Record<Module, string[]> = {
  pessoal: ['TRABALHO', 'CASA', 'ENSINO', 'LAZER', 'VEÍCULOS', 'CARTÃO', 'IMPOSTOS', 'OUTROS'],
  empresa: ['RECEITA', 'ESCRITÓRIO', 'EDUCAÇÃO', 'TRABALHO', 'CARTÃO', 'OUTROS'],
};

export interface OfxStatementLine {
  fitid: string;
  date: string; // YYYY-MM-DD
  amount: number; // signed: negative = debit
  memo: string;
}

export interface MonthlyProjection {
  month: string; // YYYY-MM
  receitas: number;
  despesas: number;
  saldoMes: number;
  saldoAcumulado: number;
  items: ProjectedItem[];
}

export interface ProjectedItem {
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  estimated: boolean;
}
