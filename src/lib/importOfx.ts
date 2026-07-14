import { File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

/** Opens the native file picker for an OFX/QFX statement and returns its
 * raw text content, or `null` if the user cancelled. */
export async function pickOfxFileContent(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const file = new File(result.assets[0].uri);
  return file.text();
}
