import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../supabase/api';
import { supabase } from '../supabase/client';
import { buildInstallments, InstallmentInput } from '../lib/installments';
import { newId } from '../lib/id';
import { isRecurring as isRecurringLib, toggleRecurring as toggleRecurringLib } from '../lib/recurring';
import { getInstallmentGroupSiblings } from '../lib/transactions';
import { Module, NewTransaction, RecurringTemplate, Transaction, TransactionType } from '../types';

interface DataContextValue {
  transactions: Transaction[];
  defaultTemplates: RecurringTemplate[];
  customTemplates: RecurringTemplate[];
  allTemplates: RecurringTemplate[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addTransaction: (t: NewTransaction) => Promise<void>;
  addInstallmentPurchase: (input: InstallmentInput) => Promise<void>;
  editTransaction: (id: string, patch: Partial<NewTransaction>) => Promise<void>;
  removeTransaction: (transaction: Transaction, scope: 'one' | 'group') => Promise<void>;
  isDescriptionRecurring: (description: string, module: Module) => boolean;
  toggleTemplateFor: (params: {
    description: string;
    module: Module;
    type: TransactionType;
    category: string;
    amount: number;
  }) => Promise<void>;
  addBatchTransactions: (items: NewTransaction[]) => Promise<void>;
  reconcileTransactions: (ids: string[]) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [tx, tpl] = await Promise.all([api.listTransactions(), api.listRecurringTemplates()]);
      setTransactions(tx);
      setTemplates(tpl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const channel = supabase
      .channel('bpo-data-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_templates' }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const defaultTemplates = useMemo(() => templates.filter((t) => !t.custom), [templates]);
  const customTemplates = useMemo(() => templates.filter((t) => t.custom), [templates]);

  const addTransaction = useCallback(async (t: NewTransaction) => {
    const created = await api.createTransaction(t);
    setTransactions((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
  }, []);

  const addInstallmentPurchase = useCallback(async (input: InstallmentInput) => {
    const items = buildInstallments(input);
    const created = await api.createTransactions(items);
    setTransactions((prev) => [...prev, ...created].sort((a, b) => a.date.localeCompare(b.date)));
  }, []);

  const editTransaction = useCallback(async (id: string, patch: Partial<NewTransaction>) => {
    const updated = await api.updateTransaction(id, patch);
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const removeTransaction = useCallback(
    async (transaction: Transaction, scope: 'one' | 'group') => {
      const targets =
        scope === 'group' ? getInstallmentGroupSiblings(transaction, transactions) : [transaction];
      const ids = targets.map((t) => t.id);
      await api.deleteTransactions(ids);
      await api.deleteTemplatesByDescription(transaction.module, transaction.description);
      setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)));
      setTemplates((prev) =>
        prev.filter((t) => !(t.custom && t.module === transaction.module && t.description === transaction.description))
      );
    },
    [transactions]
  );

  const isDescriptionRecurring = useCallback(
    (description: string, module: Module) => isRecurringLib(description, module, defaultTemplates, customTemplates),
    [defaultTemplates, customTemplates]
  );

  const toggleTemplateFor = useCallback(
    async (params: { description: string; module: Module; type: TransactionType; category: string; amount: number }) => {
      const def = defaultTemplates.find((t) => t.module === params.module && t.description === params.description);
      if (def) {
        await api.setTemplateExcluded(def.id, !def.excluded);
        setTemplates((prev) => prev.map((t) => (t.id === def.id ? { ...t, excluded: !t.excluded } : t)));
        return;
      }

      const existingCustom = customTemplates.find(
        (t) => t.module === params.module && t.description === params.description
      );
      if (existingCustom) {
        await api.deleteTemplate(existingCustom.id);
        setTemplates((prev) => prev.filter((t) => t.id !== existingCustom.id));
        return;
      }

      const { customTemplates: next } = toggleRecurringLib(
        params.description,
        params.module,
        defaultTemplates,
        customTemplates,
        { type: params.type, category: params.category, amount: params.amount, id: newId() }
      );
      const created = next[next.length - 1];
      const persisted = await api.createCustomTemplate({
        module: created.module,
        type: created.type,
        category: created.category,
        description: created.description,
        amount: created.amount,
        custom: true,
      });
      setTemplates((prev) => [...prev, persisted]);
    },
    [defaultTemplates, customTemplates]
  );

  const addBatchTransactions = useCallback(async (items: NewTransaction[]) => {
    const created = await api.createTransactions(items);
    setTransactions((prev) => [...prev, ...created].sort((a, b) => a.date.localeCompare(b.date)));
  }, []);

  const reconcileTransactions = useCallback(async (ids: string[]) => {
    await api.markReconciled(ids);
    setTransactions((prev) => prev.map((t) => (ids.includes(t.id) ? { ...t, reconciled: true } : t)));
  }, []);

  const value: DataContextValue = {
    transactions,
    defaultTemplates,
    customTemplates,
    allTemplates: templates,
    loading,
    error,
    refresh,
    addTransaction,
    addInstallmentPurchase,
    editTransaction,
    removeTransaction,
    isDescriptionRecurring,
    toggleTemplateFor,
    addBatchTransactions,
    reconcileTransactions,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
