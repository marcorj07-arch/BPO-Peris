// Periscópio Brand Guidelines v2.0 (§5) + paleta exata validada no
// protótipo (livrocaixalocal.html) — mantidas em paridade para que o app
// real reproduza fielmente o visual aprovado.
export const colors = {
  background: '#0C243E', // Azul Marinho Fechado
  card: '#14304F',
  cardEmphasis: '#1B3B5C', // fundo dos cards em destaque / tabs ativas / painéis abertos
  borderStrong: '#3A526C', // Azul Petróleo Escuro — uso pleno
  borderSubtle: '#2E4A68', // uso sutil (bordas de painel/campo)
  borderHairline: '#17304F', // divisórias finas entre linhas de lista/tabela

  textPrimary: '#FFFFFF',
  textBody: '#E8EDF0', // corpo de texto padrão do protótipo
  textSecondary: '#8FA6B8', // rótulos, legendas
  textMuted: '#6E86A0', // ícones/textos de baixa ênfase (excluir, vazio)
  textRowMeta: '#7691A6', // meta de linha (data · categoria)
  textRowAlt: '#DCE6EC', // texto secundário mais claro (inputs, valores)

  accentPessoal: '#C9A227', // Dourado
  accentEmpresa: '#B6D1DB', // Azul Claro/Gelo
  receita: '#B6D1DB',
  despesa: '#B5533C', // terracota funcional
  despesaSoft: '#D08064', // terracota usado em valores/tabelas (mais claro)
  despesaToggleActive: '#E8B923', // dourado vivo

  errorBg: '#3A2230',
  errorBorder: '#8A4A5A',
  errorText: '#E7B8C4',
} as const;

export function accentForModule(module: 'pessoal' | 'empresa'): string {
  return module === 'pessoal' ? colors.accentPessoal : colors.accentEmpresa;
}

export function withAlpha(hex: string, alphaHex: string): string {
  return `${hex}${alphaHex}`;
}
