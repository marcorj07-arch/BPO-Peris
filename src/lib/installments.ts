import { NewTransaction, TransactionStatus } from '../types';
import { addMonthsClamped } from './date';

/** Splits `total` into `count` installments of `total/count`, rounded to 2
 * decimals, with the last installment absorbing the rounding residual so
 * the sum matches `total` exactly. */
export function splitInstallmentAmounts(total: number, count: number): number[] {
  if (count < 2 || count > 60) {
    throw new Error('installment count must be between 2 and 60');
  }
  const base = Math.round((total / count) * 100) / 100;
  const amounts = new Array(count).fill(base);
  const sumWithoutLast = base * (count - 1);
  const last = Math.round((total - sumWithoutLast) * 100) / 100;
  amounts[count - 1] = last;
  return amounts;
}

export interface InstallmentInput {
  base: Omit<
    NewTransaction,
    'date' | 'amount' | 'description' | 'status' | 'installmentGroup' | 'installmentIndex' | 'installmentTotal'
  >;
  description: string;
  totalAmount: number;
  count: number;
  baseDate: string;
  firstStatus: TransactionStatus;
  groupId: string;
}

/** Builds the full set of installment transactions for a parceled purchase.
 * The first installment keeps the status chosen in the form; the rest are
 * born `pendente`. One installment per month, starting at `baseDate`. */
export function buildInstallments(input: InstallmentInput): NewTransaction[] {
  const { base, description, totalAmount, count, baseDate, firstStatus, groupId } = input;
  const amounts = splitInstallmentAmounts(totalAmount, count);

  return amounts.map((amount, i) => ({
    ...base,
    description: `${description} (${i + 1}/${count})`,
    amount,
    date: addMonthsClamped(baseDate, i),
    status: i === 0 ? firstStatus : 'pendente',
    installmentGroup: groupId,
    installmentIndex: i + 1,
    installmentTotal: count,
  }));
}
