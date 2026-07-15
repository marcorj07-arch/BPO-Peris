import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button } from '../src/components/Button';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { TextField } from '../src/components/TextField';
import { ThemedText } from '../src/components/ThemedText';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme';
import { isSupabaseConfigured } from '../src/supabase/client';

export default function LoginScreen() {
  const { session, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Redirect href="/(app)/(tabs)" />;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (signInError) setError(signInError);
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.center}>
          <View style={styles.brandBlock}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <ThemedText variant="eyebrow" style={styles.eyebrow}>
              Periscópio · Controle Financeiro
            </ThemedText>
            <ThemedText variant="h1" style={styles.brand}>
              BPO Financeiro
            </ThemedText>
          </View>

          {!isSupabaseConfigured && (
            <ThemedText variant="caption" style={styles.warning}>
              Supabase não configurado — defina EXPO_PUBLIC_SUPABASE_URL e
              EXPO_PUBLIC_SUPABASE_ANON_KEY (ver README).
            </ThemedText>
          )}

          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          {error && (
            <ThemedText variant="caption" style={styles.error}>
              {error}
            </ThemedText>
          )}

          <Button label="Entrar" onPress={handleSubmit} loading={submitting} disabled={!email || !password} />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center' },
  brandBlock: { alignItems: 'center', marginBottom: 8 },
  logo: { width: 72, height: 72, borderRadius: 36, marginBottom: 16 },
  eyebrow: { textAlign: 'center', marginBottom: 4 },
  brand: { textAlign: 'center', marginBottom: 32 },
  warning: { color: colors.despesa, marginBottom: 16, textAlign: 'center' },
  error: { color: colors.despesa, marginBottom: 12, textAlign: 'center' },
});
