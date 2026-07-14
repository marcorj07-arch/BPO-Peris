import { Module, RecurringTemplate, Transaction, TransactionType } from '../types';
import { parseDateParts } from './date';

export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysDiff(from: string, to: string): number {
  const a = parseDateParts(from);
  const b = parseDateParts(to);
  const ta = Date.UTC(a.year, a.month - 1, a.day);
  const tb = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((tb - ta) / 86400000);
}

function findDefault(
  description: string,
  module: Module,
  defaultTemplates: RecurringTemplate[]
): RecurringTemplate | undefined {
  return defaultTemplates.find((t) => t.module === module && t.description === description);
}

function findCustomIndex(
  description: string,
  module: Module,
  customTemplates: RecurringTemplate[]
): number {
  return customTemplates.findIndex((t) => t.module === module && t.description === description);
}

/** True if a transaction description is currently marked recurring (star on). */
export function isRecurring(
  description: string,
  module: Module,
  defaultTemplates: RecurringTemplate[],
  customTemplates: RecurringTemplate[]
): boolean {
  const def = findDefault(description, module, defaultTemplates);
  if (def) return !def.excluded;
  return findCustomIndex(description, module, customTemplates) >= 0;
}

/**
 * Toggles the recurring ("star") state for a description.
 *  - Default template, currently active -> mark `excluded: true` (soft-off, keeps history).
 *  - Default template, currently excluded -> clear the exclusion flag (back to default).
 *  - Not a default template -> add/remove from the custom templates array.
 */
export function toggleRecurring(
  description: string,
  module: Module,
  defaultTemplates: RecurringTemplate[],
  customTemplates: RecurringTemplate[],
  newTemplateData: { type: TransactionType; category: string; amount: number; id: string }
): { defaultTemplates: RecurringTemplate[]; customTemplates: RecurringTemplate[] } {
  const def = findDefault(description, module, defaultTemplates);
  if (def) {
    const defaultTemplatesNext = defaultTemplates.map((t) =>
      t === def ? { ...t, excluded: !t.excluded } : t
    );
    return { defaultTemplates: defaultTemplatesNext, customTemplates };
  }

  const customIdx = findCustomIndex(description, module, customTemplates);
  if (customIdx >= 0) {
    const customTemplatesNext = customTemplates.filter((_, i) => i !== customIdx);
    return { defaultTemplates, customTemplates: customTemplatesNext };
  }

  const newTemplate: RecurringTemplate = {
    id: newTemplateData.id,
    module,
    description,
    type: newTemplateData.type,
    category: newTemplateData.category,
    amount: newTemplateData.amount,
    custom: true,
  };
  return { defaultTemplates, customTemplates: [...customTemplates, newTemplate] };
}

/** Removes any custom template pointing at `description` — used when a
 * transaction is deleted, so it doesn't linger as a "ghost" recurring item. */
export function removeCustomTemplateForDescription(
  description: string,
  module: Module,
  customTemplates: RecurringTemplate[]
): RecurringTemplate[] {
  return customTemplates.filter((t) => !(t.module === module && t.description === description));
}

/** The "live" amount for a template: the amount of the most recent real
 * transaction with the same description (searching the whole history, past
 * or future), never a value frozen when the template was created. Falls
 * back to the template's own `amount` if no transaction matches yet. */
export function getLiveAmount(template: RecurringTemplate, transactions: Transaction[]): number {
  const matches = transactions.filter(
    (t) => t.module === template.module && t.description === template.description
  );
  if (matches.length === 0) return template.amount;
  const mostRecent = [...matches].sort((a, b) => a.date.localeCompare(b.date)).pop()!;
  return mostRecent.amount;
}

/** A template only enters the automatic projection (§4.6) if it has at
 * least one real transaction in the last 60 calendar days (counted from the
 * actual current date). Templates with no history yet are considered
 * active by default. */
export function isTemplateEligibleForProjection(
  template: RecurringTemplate,
  transactions: Transaction[],
  todayStr: string = todayISO()
): boolean {
  const matches = transactions.filter(
    (t) => t.module === template.module && t.description === template.description
  );
  if (matches.length === 0) return true;
  return matches.some((t) => {
    const diff = daysDiff(t.date, todayStr);
    return diff >= 0 && diff <= 60;
  });
}

/** Active templates for a module: not excluded, and eligible per the
 * obsolescence filter. Combines default (non-excluded) + custom templates,
 * with each template's amount resolved to its "live" value. */
export function getActiveTemplates(
  module: Module,
  defaultTemplates: RecurringTemplate[],
  customTemplates: RecurringTemplate[],
  transactions: Transaction[],
  todayStr: string = todayISO()
): RecurringTemplate[] {
  const all = [
    ...defaultTemplates.filter((t) => t.module === module && !t.excluded),
    ...customTemplates.filter((t) => t.module === module),
  ];
  return all
    .filter((t) => isTemplateEligibleForProjection(t, transactions, todayStr))
    .map((t) => ({ ...t, amount: getLiveAmount(t, transactions) }));
}
