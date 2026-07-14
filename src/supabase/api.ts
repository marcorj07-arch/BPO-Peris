import { NewTransaction, RecurringTemplate, Transaction } from '../types';
import { supabase } from './client';

interface TransactionRow {
  id: string;
  module: Transaction['module'];
  type: Transaction['type'];
  date: string;
  category: string;
  description: string;
  amount: number;
  paid_by: string | null;
  note: string | null;
  status: Transaction['status'];
  reconciled: boolean;
  fitid: string | null;
  installment_group: string | null;
  installment_index: number | null;
  installment_total: number | null;
  created_at: string;
  updated_at: string;
}

interface TemplateRow {
  id: string;
  module: RecurringTemplate['module'];
  type: RecurringTemplate['type'];
  category: string;
  description: string;
  amount: number;
  excluded: boolean;
  custom: boolean;
}

function rowToTransaction(r: TransactionRow): Transaction {
  return {
    id: r.id,
    module: r.module,
    type: r.type,
    date: r.date,
    category: r.category,
    description: r.description,
    amount: Number(r.amount),
    paidBy: r.paid_by ?? undefined,
    note: r.note ?? undefined,
    status: r.status,
    reconciled: r.reconciled,
    fitid: r.fitid ?? undefined,
    installmentGroup: r.installment_group ?? undefined,
    installmentIndex: r.installment_index ?? undefined,
    installmentTotal: r.installment_total ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function transactionToRow(t: NewTransaction | Transaction): Partial<TransactionRow> {
  return {
    module: t.module,
    type: t.type,
    date: t.date,
    category: t.category,
    description: t.description,
    amount: t.amount,
    paid_by: t.paidBy ?? null,
    note: t.note ?? null,
    status: t.status,
    reconciled: t.reconciled ?? false,
    fitid: t.fitid ?? null,
    installment_group: t.installmentGroup ?? null,
    installment_index: t.installmentIndex ?? null,
    installment_total: t.installmentTotal ?? null,
  };
}

function rowToTemplate(r: TemplateRow): RecurringTemplate {
  return {
    id: r.id,
    module: r.module,
    type: r.type,
    category: r.category,
    description: r.description,
    amount: Number(r.amount),
    excluded: r.excluded,
    custom: r.custom,
  };
}

export async function listTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: true });
  if (error) throw error;
  return (data as TransactionRow[]).map(rowToTransaction);
}

export async function createTransaction(t: NewTransaction): Promise<Transaction> {
  const { data, error } = await supabase.from('transactions').insert(transactionToRow(t)).select().single();
  if (error) throw error;
  return rowToTransaction(data as TransactionRow);
}

export async function createTransactions(ts: NewTransaction[]): Promise<Transaction[]> {
  if (ts.length === 0) return [];
  const { data, error } = await supabase.from('transactions').insert(ts.map(transactionToRow)).select();
  if (error) throw error;
  return (data as TransactionRow[]).map(rowToTransaction);
}

export async function updateTransaction(id: string, patch: Partial<NewTransaction>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(transactionToRow(patch as NewTransaction))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToTransaction(data as TransactionRow);
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteTransactions(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from('transactions').delete().in('id', ids);
  if (error) throw error;
}

export async function markReconciled(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from('transactions').update({ reconciled: true }).in('id', ids);
  if (error) throw error;
}

export async function listRecurringTemplates(): Promise<RecurringTemplate[]> {
  const { data, error } = await supabase.from('recurring_templates').select('*');
  if (error) throw error;
  return (data as TemplateRow[]).map(rowToTemplate);
}

export async function setTemplateExcluded(id: string, excluded: boolean): Promise<void> {
  const { error } = await supabase.from('recurring_templates').update({ excluded }).eq('id', id);
  if (error) throw error;
}

export async function createCustomTemplate(
  t: Omit<RecurringTemplate, 'id'>
): Promise<RecurringTemplate> {
  const { data, error } = await supabase
    .from('recurring_templates')
    .insert({
      module: t.module,
      type: t.type,
      category: t.category,
      description: t.description,
      amount: t.amount,
      excluded: t.excluded ?? false,
      custom: true,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToTemplate(data as TemplateRow);
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('recurring_templates').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteTemplatesByDescription(module: string, description: string): Promise<void> {
  const { error } = await supabase
    .from('recurring_templates')
    .delete()
    .eq('module', module)
    .eq('description', description)
    .eq('custom', true);
  if (error) throw error;
}
