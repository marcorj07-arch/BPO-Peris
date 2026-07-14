import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { ThemedText } from './ThemedText';

interface Option<T extends string> {
  value: T;
  label: string;
  activeColor?: string;
}

interface Props<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}

export function SegmentedToggle<T extends string>({ value, options, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.option,
              active && { backgroundColor: opt.activeColor ?? colors.accentEmpresa },
            ]}
          >
            <ThemedText
              variant="bodySemiBold"
              style={{ color: active ? colors.background : colors.textSecondary }}
            >
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 14,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
});
