// Periscópio Brand Guidelines v2.0 (§5 da especificação)
export const colors = {
  background: '#0C243E', // Azul Marinho Fechado
  card: '#14304F',
  borderStrong: '#3A526C', // Azul Petróleo Escuro — uso pleno
  borderSubtle: '#2E4A68', // uso sutil
  textPrimary: '#FFFFFF',
  textSecondary: '#8FA6B8',
  accentPessoal: '#C9A227', // Dourado
  accentEmpresa: '#B6D1DB', // Azul Claro/Gelo
  receita: '#B6D1DB',
  despesa: '#B5533C', // terracota funcional
  despesaToggleActive: '#E8B923', // dourado vivo
} as const;

export function accentForModule(module: 'pessoal' | 'empresa'): string {
  return module === 'pessoal' ? colors.accentPessoal : colors.accentEmpresa;
}
