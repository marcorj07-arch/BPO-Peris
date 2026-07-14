import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Transaction } from '../types';
import { buildWorkbook, workbookToBase64 } from './excel';

/** Builds the Excel export and opens the native share sheet so the user can
 * save or send it. */
export async function exportTransactionsToExcel(transactions: Transaction[]): Promise<void> {
  const base64 = workbookToBase64(buildWorkbook(transactions));
  const fileName = `bpo-periscopio-${new Date().toISOString().slice(0, 10)}.xlsx`;
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(base64, { encoding: 'base64' });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Exportar lançamentos',
    });
  }
}
