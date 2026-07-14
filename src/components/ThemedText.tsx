import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, fonts } from '../theme';

type Variant = 'title' | 'subtitle' | 'body' | 'bodyMedium' | 'bodySemiBold' | 'caption' | 'amount';

const VARIANT_STYLES: Record<Variant, { fontFamily: string; fontSize: number; color: string }> = {
  title: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.textPrimary },
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.textPrimary },
  bodySemiBold: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.textPrimary },
  caption: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  amount: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.textPrimary },
};

interface Props extends TextProps {
  variant?: Variant;
}

export function ThemedText({ variant = 'body', style, ...rest }: Props) {
  const variantStyle = VARIANT_STYLES[variant];
  const numericStyle = variant === 'amount' ? { fontVariant: ['tabular-nums' as const] } : null;
  return <Text style={[variantStyle, numericStyle, style]} {...rest} />;
}
