import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';

// Playfair Display (títulos) + Montserrat (corpo, dados, tabelas — §5).
export const fontAssets = {
  'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
  'PlayfairDisplay-Medium': PlayfairDisplay_500Medium,
  'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
  'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
  'Montserrat-Regular': Montserrat_400Regular,
  'Montserrat-Medium': Montserrat_500Medium,
  'Montserrat-SemiBold': Montserrat_600SemiBold,
  'Montserrat-Bold': Montserrat_700Bold,
};

export const fonts = {
  headingRegular: 'PlayfairDisplay-Regular',
  heading: 'PlayfairDisplay-Medium', // h1 do protótipo usa peso 500
  headingSemiBold: 'PlayfairDisplay-SemiBold',
  headingBold: 'PlayfairDisplay-Bold',
  body: 'Montserrat-Regular',
  bodyMedium: 'Montserrat-Medium',
  bodySemiBold: 'Montserrat-SemiBold',
  bodyBold: 'Montserrat-Bold',
} as const;

/** Numbers throughout (amounts, tables) should use tabular figures. RN
 * doesn't support the `font-variant-numeric` CSS prop, so this is applied
 * via `fontVariant` on Text components that render numeric data. */
export const tabularNums = { fontVariant: ['tabular-nums' as const] };
