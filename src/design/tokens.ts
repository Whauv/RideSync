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
  font: {
    display: '"Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Geist Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace'
  },
  color: {
    background: "#080809",
    shell: "#0E0F11",
    backgroundElevated: "#0E0F11",
    surface1: "#141519",
    surface2: "rgba(20,21,25,0.85)",
    surface3: "#1A1C21",
    warmGraphite: "#17171A",
    metalSlate: "#13151A",
    smokedIvory: "rgba(242,238,230,0.03)",
    mutedAsphalt: "#0F1014",
    borderSubtle: "rgba(255,255,255,0.055)",
    borderDefault: "rgba(255,255,255,0.09)",
    borderStrong: "rgba(255,255,255,0.15)",
    textPrimary: "#F2F3F5",
    textSecondary: "rgba(242,243,245,0.60)",
    textTertiary: "rgba(242,243,245,0.35)",
    textQuiet: "rgba(242,243,245,0.20)",
    textQuaternary: "rgba(242,243,245,0.20)",
    accent: "#00C49A",
    accentDim: "rgba(0,196,154,0.10)",
    accentBorder: "rgba(0,196,154,0.25)",
    accentMuted: "rgba(0,196,154,0.10)",
    road: "rgba(0,196,154,0.20)",
    roadCenter: "rgba(0,196,154,0.30)",
    stateLive: "#00C49A",
    stateCaution: "rgba(224,164,0,0.90)",
    stateCautionSurface: "rgba(224,164,0,0.08)",
    stateEmergency: "rgba(224,84,84,0.90)",
    stateEmergencySurface: "rgba(224,84,84,0.08)",
    stateSync: "rgba(100,160,255,0.90)",
    stateSyncSurface: "rgba(100,160,255,0.08)"
  },
  type: {
    displayXL: 56,
    displayL: 40,
    displayM: 28,
    heading: 20,
    subheading: 15,
    bodyL: 16,
    bodyM: 14,
    bodyS: 13,
    label: 11,
    micro: 10,
    data: 13,
    metric: 32,
    footnote: 11,
    caption: 12,
    ui: 13,
    body: 15,
    subhead: 16,
    statement: 18,
    section: 28,
    display: 40,
    hero: 56
  },
  spacing: {
    navHeight: 56,
    sectionGap: 128,
    sectionGapLarge: 200,
    subsectionGap: 64,
    elementGap: 32,
    shellInset: 48
  },
  radius: {
    control: 6,
    button: 8,
    panel: 14,
    cell: 10
  },
  elevation: {
    panel: "0 18px 48px rgba(0,0,0,0.34)",
    float: "0 24px 56px rgba(0,0,0,0.28)"
  },
  blur: {
    glass: "blur(20px) saturate(120%)",
    nav: "blur(16px) saturate(110%)"
  },
  motion: {
    sectionEase: [0.16, 1, 0.3, 1] as const,
    durationFast: 0.4,
    durationBase: 0.5,
    durationPanel: 0.6,
    durationRoute: 2.5,
    stagger: 0.06
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
  font: {
    body: 'system-ui, -apple-system, "Geist", sans-serif',
    mono: '"Geist Mono", "SF Mono", monospace'
  },
  color: {
    background: "#09090B",
    shell: "#0E0F12",
    panel: "#131418",
    panelHover: "#161820",
    stat: "#131418",
    borderHairline: "rgba(255,255,255,0.05)",
    borderSubtle: "rgba(255,255,255,0.05)",
    borderDefault: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.13)",
    rowHover: "rgba(255,255,255,0.03)",
    logHover: "rgba(255,255,255,0.025)",
    textPrimary: "#EEEEF0",
    textPanel: "#EEEEF0",
    textSecondary: "rgba(238,238,240,0.58)",
    textTertiary: "rgba(238,238,240,0.32)",
    textMeta: "rgba(238,238,240,0.18)",
    textQuaternary: "rgba(238,238,240,0.18)",
    accent: "#00C49A",
    accentDim: "rgba(0,196,154,0.08)",
    accentBorder: "rgba(0,196,154,0.22)",
    warning: "rgba(230,160,0,0.88)",
    warningSurface: "rgba(230,160,0,0.07)",
    danger: "rgba(220,80,80,0.88)",
    dangerSurface: "rgba(220,80,80,0.07)",
    success: "#00C49A",
    neutral: "rgba(238,238,240,0.35)",
    infoBadge: "rgba(255,255,255,0.07)",
    warnBadge: "rgba(230,160,0,0.10)",
    errorBadge: "rgba(220,80,80,0.10)",
    divider: "rgba(255,255,255,0.05)"
  },
  spacing: {
    headerHeight: 52,
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
