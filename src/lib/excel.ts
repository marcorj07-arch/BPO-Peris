import * as XLSX from 'xlsx';
import { Transaction } from '../types';

const SHEET_NAMES = { pessoal: 'Pessoal', empresa: 'Periscópio' } as const;
const HEADER = ['Data', 'Módulo', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Pago por', 'Status'];

function toRow(t: Transaction): (string | number)[] {
  return [
    t.date,
    t.module === 'pessoal' ? 'Pessoal' : 'Periscópio',
    t.type === 'receita' ? 'Receita' : 'Despesa',
    t.category,
    t.description,
    t.type === 'despesa' ? -t.amount : t.amount,
    t.paidBy || '',
    t.status === 'pago' ? 'Pago' : 'Pendente',
  ];
}

/** Builds the two-sheet (Pessoal / Periscópio) export workbook, pure and
 * independent of any file-system or native module. */
export function buildWorkbook(transactions: Transaction[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  (['pessoal', 'empresa'] as const).forEach((module) => {
    const rows = transactions
      .filter((t) => t.module === module)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(toRow);
    const ws = XLSX.utils.aoa_to_sheet([HEADER, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, SHEET_NAMES[module]);
  });

  return wb;
}

/** Serializes the workbook to a base64 .xlsx payload, ready to write to
 * disk (e.g. via expo-file-system) and share. */
export function workbookToBase64(wb: XLSX.WorkBook): string {
  return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
}
