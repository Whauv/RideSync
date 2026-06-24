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
    fontSize: 21,
    lineHeight: 25,
    letterSpacing: -0.3,
    fontWeight: "700" as const
  },
  title2: {
    fontSize: 17,
    lineHeight: 21,
    letterSpacing: -0.18,
    fontWeight: "700" as const
  },
  title3: {
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: -0.08,
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
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: -0.9,
    fontWeight: "700" as const
  }
} as const;

export const motionTokens = {
  instant: 80,
  quick: 140,
  standard: 220,
  slow: 320
} as const;

export const marketingTokens = {
  color: {
    background: "#0C0C0E",
    backgroundElevated: "#0A0A0C",
    surface1: "#141416",
    surface2: "#1A1A1E",
    borderSubtle: "rgba(255,255,255,0.06)",
    borderDefault: "rgba(255,255,255,0.10)",
    textPrimary: "#F0F0F2",
    textSecondary: "rgba(240,240,242,0.60)",
    textTertiary: "rgba(240,240,242,0.40)",
    textQuiet: "rgba(240,240,242,0.30)",
    accent: "#00C49A",
    accentMuted: "rgba(0,196,154,0.12)",
    road: "rgba(0,196,154,0.15)",
    roadCenter: "rgba(0,196,154,0.40)"
  },
  type: {
    micro: 10,
    footnote: 11,
    caption: 12,
    ui: 13,
    body: 15,
    subhead: 16,
    statement: 18,
    section: 28,
    display: 38,
    hero: 64
  },
  spacing: {
    navHeight: 56,
    sectionGap: 120,
    sectionGapLarge: 160,
    subsectionGap: 64,
    elementGap: 32
  },
  radius: {
    control: 6,
    button: 8,
    panel: 24
  }
} as const;

export const authTokens = {
  color: {
    background: "#0C0C0E",
    backgroundAside: "#0A0A0C",
    surface: "#161618",
    border: "rgba(255,255,255,0.10)",
    borderMuted: "rgba(255,255,255,0.10)",
    borderSubtle: "rgba(255,255,255,0.06)",
    divider: "rgba(255,255,255,0.05)",
    insetHighlight: "rgba(255,255,255,0.07)",
    textPrimary: "#F0F0F2",
    textSecondary: "rgba(240,240,242,0.32)",
    textTertiary: "rgba(240,240,242,0.30)",
    accent: "#00C49A",
    buttonAccent: "#00B088",
    warningText: "rgba(255,180,0,0.7)",
    warningBorder: "rgba(255,180,0,0.2)",
    warningSurface: "rgba(255,180,0,0.04)",
    dangerSurface: "rgba(224,84,84,0.20)",
    successSurface: "rgba(45,157,100,0.24)"
  },
  spacing: {
    cardWidth: 420,
    cardPaddingX: 36,
    cardPaddingY: 40,
    mobileCardPadding: 24
  },
  radius: {
    card: 16,
    button: 8,
    warning: 10
  }
} as const;

export const adminTokens = {
  color: {
    background: "#0E0E10",
    panel: "#131315",
    stat: "#141416",
    borderSubtle: "rgba(255,255,255,0.06)",
    borderDefault: "rgba(255,255,255,0.07)",
    borderStrong: "rgba(255,255,255,0.10)",
    rowHover: "rgba(255,255,255,0.03)",
    logHover: "rgba(255,255,255,0.025)",
    textPrimary: "#F0F0F2",
    textPanel: "rgba(240,240,242,0.85)",
    textSecondary: "rgba(240,240,242,0.35)",
    textTertiary: "rgba(240,240,242,0.28)",
    textMeta: "rgba(240,240,242,0.22)",
    accent: "#00C49A",
    warning: "#E09A00",
    danger: "#E05454",
    success: "#2D9D64",
    infoBadge: "rgba(255,255,255,0.06)",
    warnBadge: "rgba(224,154,0,0.12)",
    errorBadge: "rgba(224,84,84,0.12)",
    divider: "rgba(255,255,255,0.05)"
  },
  spacing: {
    headerHeight: 64,
    panelHeaderHeight: 48,
    footerHeight: 40
  },
  radius: {
    stat: 10,
    panel: 12,
    pill: 10,
    badge: 3
  }
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
  marketing: marketingTokens,
  auth: authTokens,
  admin: adminTokens,
  elevation: elevationTokens,
  mapOverlay: mapOverlayTokens,
  state: semanticStateTokens
} as const;

export type AppThemeMode = "light" | "dark";
