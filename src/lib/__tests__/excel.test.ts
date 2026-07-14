import * as XLSX from 'xlsx';
import { Transaction } from '../../types';
import { buildWorkbook } from '../excel';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? Math.random().toString(),
    module: 'pessoal',
    type: 'despesa',
    date: '2026-07-10',
    category: 'CASA',
    description: 'Aluguel',
    amount: 2000,
    status: 'pago',
    ...overrides,
  };
}

describe('buildWorkbook', () => {
  it('creates a sheet per module with the expected header', () => {
    const wb = buildWorkbook([
      tx({ module: 'pessoal', description: 'Aluguel' }),
      tx({ module: 'empresa', description: 'Mensalidade cliente', category: 'RECEITA', type: 'receita' }),
    ]);

    expect(wb.SheetNames).toEqual(['Pessoal', 'Periscópio']);

    const pessoalSheet = XLSX.utils.sheet_to_json(wb.Sheets['Pessoal'], { header: 1 }) as unknown[][];
    expect(pessoalSheet[0]).toEqual([
      'Data',
      'Módulo',
      'Tipo',
      'Categoria',
      'Descrição',
      'Valor',
      'Pago por',
      'Status',
    ]);
    expect(pessoalSheet[1][4]).toBe('Aluguel');

    const empresaSheet = XLSX.utils.sheet_to_json(wb.Sheets['Periscópio'], { header: 1 }) as unknown[][];
    expect(empresaSheet[1][4]).toBe('Mensalidade cliente');
  });

  it('only places each transaction on its own module sheet', () => {
    const wb = buildWorkbook([tx({ module: 'pessoal' })]);
    const empresaRows = XLSX.utils.sheet_to_json(wb.Sheets['Periscópio'], { header: 1 }) as unknown[][];
    expect(empresaRows).toHaveLength(1); // header only
  });
});
