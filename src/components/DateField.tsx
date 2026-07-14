import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { ThemedText } from './ThemedText';
import { TextField } from './TextField';

interface Props {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

function toDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DateField({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    return <TextField label={label} value={value} onChangeText={onChange} placeholder="AAAA-MM-DD" />;
  }

  return (
    <View style={styles.wrapper}>
      <ThemedText variant="caption" style={styles.label}>
        {label}
      </ThemedText>
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <ThemedText>{value.split('-').reverse().join('/')}</ThemedText>
      </Pressable>

      {open && (
        <DateTimePicker
          value={toDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selectedDate) => {
            setOpen(Platform.OS === 'ios');
            if (event.type === 'dismissed') {
              setOpen(false);
              return;
            }
            if (selectedDate) onChange(toISODate(selectedDate));
            if (Platform.OS === 'android') setOpen(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
