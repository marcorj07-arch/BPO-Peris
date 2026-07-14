import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { accentForModule, colors } from '../theme';
import { Module } from '../types';
import { ThemedText } from './ThemedText';

interface Props {
  value: Module;
  onChange: (m: Module) => void;
}

export function ModuleSwitch({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {(['pessoal', 'empresa'] as const).map((m) => {
        const active = value === m;
        return (
          <Pressable
            key={m}
            onPress={() => onChange(m)}
            style={[
              styles.tab,
              active && { backgroundColor: accentForModule(m) },
            ]}
          >
            <ThemedText
              variant="bodySemiBold"
              style={{ color: active ? colors.background : colors.textSecondary }}
            >
              {m === 'pessoal' ? 'Pessoal' : 'Periscópio'}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
});
