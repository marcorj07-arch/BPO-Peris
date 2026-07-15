import { Tabs } from 'expo-router';
import React from 'react';
import { ThemedText } from '../../../src/components/ThemedText';
import { colors } from '../../../src/theme';

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <ThemedText style={{ fontSize: 20, color: focused ? colors.accentPessoal : colors.textSecondary }}>
      {symbol}
    </ThemedText>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.borderSubtle },
        tabBarActiveTintColor: colors.accentPessoal,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Lançamentos',
          tabBarIcon: ({ focused }) => <TabIcon symbol="≡" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="recorrentes"
        options={{
          title: 'Recorrentes',
          tabBarIcon: ({ focused }) => <TabIcon symbol="★" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="fluxo-caixa"
        options={{
          title: 'Fluxo de Caixa',
          tabBarIcon: ({ focused }) => <TabIcon symbol="⟶" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="conciliacao"
        options={{
          title: 'Conciliação',
          tabBarIcon: ({ focused }) => <TabIcon symbol="⇄" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mais"
        options={{
          title: 'Mais',
          tabBarIcon: ({ focused }) => <TabIcon symbol="⋯" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
