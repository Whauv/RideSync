export const tokens = {
  radius: {
    xs: 10,
    sm: 14,
    md: 18,
    lg: 24,
    xl: 30,
    pill: 999
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32
  },
  type: {
    caption: 12,
    body: 14,
    bodyLg: 16,
    title: 20,
    titleLg: 28,
    metric: 32
  },
  motion: {
    quick: 160,
    standard: 240
  }
} as const;

export type AppThemeMode = "light" | "dark";
