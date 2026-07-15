import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Module } from '../types';
import { ModuleSwitch } from './ModuleSwitch';
import { ThemedText } from './ThemedText';

interface Props {
  module: Module;
  onChangeModule: (m: Module) => void;
}

export function AppHeader({ module, onChangeModule }: Props) {
  return (
    <View>
      <View style={styles.row}>
        <View style={styles.brand}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <View>
            <ThemedText variant="eyebrow">Periscópio · Controle Financeiro</ThemedText>
            <ThemedText variant="h1">BPO Financeiro</ThemedText>
          </View>
        </View>
      </View>
      <ModuleSwitch value={module} onChange={onChangeModule} />
      <View style={styles.hr} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: { width: 40, height: 40, borderRadius: 20 },
  hr: { borderTopWidth: 1, borderTopColor: colors.borderStrong, marginBottom: 16 },
});
