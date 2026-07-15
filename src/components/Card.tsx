import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '../theme';

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 18,
    marginBottom: 12,
  },
});
