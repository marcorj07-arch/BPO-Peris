import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { Module } from '../types';
import { ModuleSwitch } from './ModuleSwitch';
import { ThemedText } from './ThemedText';

interface Props {
  module: Module;
  onChangeModule: (m: Module) => void;
}

export function AppHeader({ module, onChangeModule }: Props) {
  const { session } = useAuth();
  const router = useRouter();
  const initial = session?.user?.email?.trim().charAt(0).toUpperCase() || '?';

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
        <Pressable
          onPress={() => router.push('/(app)/(tabs)/mais')}
          style={styles.avatar}
          hitSlop={8}
        >
          <ThemedText variant="bodySemiBold" style={{ color: colors.textSecondary }}>
            {initial}
          </ThemedText>
        </Pressable>
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
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: { width: 40, height: 40, borderRadius: 20 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hr: { borderTopWidth: 1, borderTopColor: colors.borderStrong, marginBottom: 16 },
});
