export const COLORS = {
  // Backgrounds
  bgPrimary: '#020617',
  bgSecondary: '#1E293B',
  bgCard: 'rgba(30, 41, 59, 0.4)',
  bgGlass: 'rgba(30, 41, 59, 0.6)',

  // Accents
  purple500: '#A855F7',
  purple400: '#C084FC',
  purple300: '#D8B4FE',
  blue500: '#3B82F6',
  blue400: '#60A5FA',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#475569',

  // Borders
  borderSubtle: 'rgba(168, 85, 247, 0.2)',
  borderActive: 'rgba(168, 85, 247, 0.5)',
  borderStrong: '#A855F7',

  // Functional
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Gradients
  gradientPrimary: ['#A855F7', '#3B82F6'] as const,
  gradientBackground: ['#020617', '#1E293B'] as const,
  gradientSubtle: ['rgba(168, 85, 247, 0.2)', 'rgba(59, 130, 246, 0.2)'] as const,
};

export type ColorPalette = typeof COLORS;
