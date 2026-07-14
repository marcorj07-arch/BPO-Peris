import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { DataProvider } from '../../src/context/DataContext';
import { ModuleProvider } from '../../src/context/ModuleContext';
import { colors } from '../../src/theme';

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Redirect href="/login" />;

  return (
    <ModuleProvider>
      <DataProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.textPrimary,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="transaction/new"
            options={{ presentation: 'modal', title: 'Novo lançamento' }}
          />
          <Stack.Screen
            name="transaction/[id]"
            options={{ presentation: 'modal', title: 'Editar lançamento' }}
          />
        </Stack>
      </DataProvider>
    </ModuleProvider>
  );
}
