import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, fonts } from '../theme';

type Variant =
  | 'h1'
  | 'eyebrow'
  | 'title'
  | 'subtitle'
  | 'panelTitle'
  | 'cardLabel'
  | 'body'
  | 'bodyMedium'
  | 'bodySemiBold'
  | 'caption'
  | 'rowMeta'
  | 'amount'
  | 'grandTotal';

const VARIANT_STYLES: Record<
  Variant,
  { fontFamily: string; fontSize: number; color: string; letterSpacing?: number; textTransform?: 'uppercase' }
> = {
  // Título principal do app ("BPO Financeiro"), Playfair Display peso 500 · 34px.
  h1: { fontFamily: fonts.heading, fontSize: 34, color: colors.textPrimary },
  // Rótulo pequeno acima do h1 ("Periscópio · Controle Financeiro").
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.headingSemiBold, fontSize: 18, color: colors.textPrimary },
  // Cabeçalho de painel ("Novo lançamento", "Despesas por categoria" etc.).
  panelTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // Rótulo dos cards de resumo ("Receitas do mês" etc.).
  cardLabel: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.textPrimary },
  bodySemiBold: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.textPrimary },
  caption: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  // Linha de metadados de um lançamento ("14/07 · CASA · MARCO").
  rowMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.textRowMeta },
  amount: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.textPrimary },
  // Valor grande do saldo acumulado no rodapé.
  grandTotal: { fontFamily: fonts.bodySemiBold, fontSize: 30, color: colors.textPrimary },
};

const TABULAR_VARIANTS: Variant[] = ['amount', 'rowMeta', 'grandTotal', 'cardLabel'];

interface Props extends TextProps {
  variant?: Variant;
}

export function ThemedText({ variant = 'body', style, ...rest }: Props) {
  const variantStyle = VARIANT_STYLES[variant];
  const numericStyle = TABULAR_VARIANTS.includes(variant) ? { fontVariant: ['tabular-nums' as const] } : null;
  return <Text style={[variantStyle, numericStyle, style]} {...rest} />;
}
