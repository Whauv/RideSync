export const colorTokens = {
  neutral: {
    0: "#FFFFFF",
    25: "#FCFCFA",
    50: "#F7F6F2",
    100: "#F0EEE7",
    150: "#E6E2D8",
    200: "#D8D3C8",
    300: "#BBB4A7",
    400: "#8C8578",
    500: "#676155",
    600: "#4A453C",
    700: "#2E2B26",
    800: "#1B1916",
    900: "#101113",
    950: "#090A0C"
  },
  accent: {
    50: "#ECFBF8",
    100: "#D5F5EF",
    200: "#A8E7DB",
    300: "#78D7C7",
    400: "#4EC3B5",
    500: "#169C90",
    600: "#0F7D74",
    700: "#0D625B",
    800: "#0C4944",
    900: "#0B3330"
  },
  success: {
    100: "#DDF7E9",
    500: "#2D9D64",
    700: "#23784D"
  },
  warning: {
    100: "#F8EBCB",
    500: "#B98327",
    700: "#8A631B"
  },
  danger: {
    100: "#F8D9D8",
    500: "#C25454",
    700: "#933636"
  },
  info: {
    100: "#D9E8FB",
    500: "#4E87D8",
    700: "#335F9A"
  }
} as const;

export const spacingTokens = {
  0: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  40: 40,
  48: 48,
  56: 56,
  64: 64
} as const;

export const radiusTokens = {
  xs: 10,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 30,
  xxl: 36,
  full: 999
} as const;

export const borderTokens = {
  hairline: 1,
  default: 1,
  strong: 1.5,
  focus: 2
} as const;

export const iconTokens = {
  xs: 12,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 28,
  xxl: 34
} as const;

export const touchTokens = {
  min: 44,
  comfortable: 48,
  glove: 54,
  hero: 64
} as const;

export const typeTokens = {
  display: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
    fontWeight: "700" as const
  },
  title1: {
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.35,
    fontWeight: "700" as const
  },
  title2: {
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.2,
    fontWeight: "700" as const
  },
  title3: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.1,
    fontWeight: "600" as const
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: "400" as const
  },
  bodyStrong: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: "600" as const
  },
  callout: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    fontWeight: "500" as const
  },
  footnote: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.15,
    fontWeight: "500" as const
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    fontWeight: "700" as const
  },
  metric: {
    fontSize: 34,
    lineHeight: 34,
    letterSpacing: -1,
    fontWeight: "700" as const
  }
} as const;

export const motionTokens = {
  instant: 80,
  quick: 140,
  standard: 220,
  slow: 320
} as const;

export const elevationTokens = {
  none: {
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0
  },
  low: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  medium: {
    shadowColor: "#000000",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7
  },
  high: {
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12
  }
} as const;

export const mapOverlayTokens = {
  rider: 34,
  leader: 38,
  pulse: 56,
  panelOpacity: 0.9,
  scrimOpacity: 0.5
} as const;

export const semanticStateTokens = {
  ok: "success",
  caution: "warning",
  critical: "danger",
  informative: "info"
} as const;

export const tokens = {
  color: colorTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
  border: borderTokens,
  icon: iconTokens,
  touch: touchTokens,
  type: typeTokens,
  motion: motionTokens,
  elevation: elevationTokens,
  mapOverlay: mapOverlayTokens,
  state: semanticStateTokens
} as const;

export type AppThemeMode = "light" | "dark";
