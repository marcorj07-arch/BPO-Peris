import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { accentForModule, colors } from '../theme';
import { Module } from '../types';
import { ThemedText } from './ThemedText';

interface Props {
  value: Module;
  onChange: (m: Module) => void;
}

const LABELS: Record<Module, string> = {
  pessoal: 'Pessoal',
  empresa: 'Periscópio (PJ)',
};

/** Folder-style module tabs, matching the `.tabs`/`.tab`/`.tab.active`
 * treatment from the validated prototype: active tab lifts with a card
 * background and a bottom border colored by the module's accent. */
export function ModuleSwitch({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {(['pessoal', 'empresa'] as const).map((m) => {
        const active = m === value;
        return (
          <Pressable
            key={m}
            onPress={() => onChange(m)}
            style={[
              styles.tab,
              active && {
                backgroundColor: colors.cardEmphasis,
                borderColor: accentForModule(m),
                borderBottomColor: accentForModule(m),
              },
            ]}
          >
            <ThemedText
              variant="bodySemiBold"
              style={{ color: active ? colors.textPrimary : colors.textSecondary, fontSize: 14 }}
            >
              {LABELS[m]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderBottomWidth: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});
