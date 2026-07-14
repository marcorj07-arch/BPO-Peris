import React from 'react';
import { TextField } from './TextField';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

/** Free-text field for Brazilian-formatted amounts ("10.399,68"). The raw
 * text is kept as-is while typing; parsing to a number happens on submit
 * via `parseAmount` (see src/lib/parseAmount.ts) — never here on every
 * keystroke, so the user can type "1.234" without it being clobbered. */
export function AmountField({ label, value, onChangeText }: Props) {
  return (
    <TextField
      label={label}
      value={value}
      onChangeText={onChangeText}
      keyboardType="decimal-pad"
      placeholder="0,00"
    />
  );
}
