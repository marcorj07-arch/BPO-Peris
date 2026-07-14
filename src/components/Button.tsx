import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { ThemedText } from './ThemedText';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const VARIANT_BG: Record<Variant, string> = {
  primary: colors.accentEmpresa,
  secondary: colors.card,
  danger: colors.despesa,
  ghost: 'transparent',
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary: colors.background,
  secondary: colors.textPrimary,
  danger: colors.textPrimary,
  ghost: colors.accentEmpresa,
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: VARIANT_BG[variant], opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'ghost' && { borderWidth: 1, borderColor: colors.borderStrong },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={VARIANT_TEXT[variant]} />
      ) : (
        <ThemedText style={{ color: VARIANT_TEXT[variant], fontFamily: fonts.bodySemiBold }}>{label}</ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
