import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { addMonthsToMonthKey } from '../lib/date';
import { colors } from '../theme';
import { ThemedText } from './ThemedText';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatMonthKey(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

interface Props {
  monthKey: string;
  onChange: (monthKey: string) => void;
}

export function MonthNav({ monthKey, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => onChange(addMonthsToMonthKey(monthKey, -1))} hitSlop={10} style={styles.arrow}>
        <ThemedText variant="subtitle">‹</ThemedText>
      </Pressable>
      <ThemedText variant="subtitle">{formatMonthKey(monthKey)}</ThemedText>
      <Pressable onPress={() => onChange(addMonthsToMonthKey(monthKey, 1))} hitSlop={10} style={styles.arrow}>
        <ThemedText variant="subtitle">›</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  arrow: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
