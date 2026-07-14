import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { CATEGORIES, Module } from '../types';
import { ThemedText } from './ThemedText';

interface Props {
  module: Module;
  value: string;
  onChange: (category: string) => void;
}

export function CategoryPicker({ module, value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {CATEGORIES[module].map((cat) => {
        const active = cat === value;
        return (
          <Pressable
            key={cat}
            onPress={() => onChange(cat)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <ThemedText
              variant="caption"
              style={{ color: active ? colors.background : colors.textSecondary, fontSize: 12 }}
            >
              {cat}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.accentEmpresa,
    borderColor: colors.accentEmpresa,
  },
});
