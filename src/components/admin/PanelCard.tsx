import type { CSSProperties, PropsWithChildren, ReactNode } from "react";

import { tokens } from "@/design/tokens";

const palette = tokens.admin.color;
const spacing = tokens.admin.spacing;
const radius = tokens.admin.radius;
const fonts = tokens.admin.font;

export function PanelCard({
  children,
  contentStyle,
  headerMeta,
  headerRight,
  style,
  subline,
  title
}: PropsWithChildren<{
  contentStyle?: CSSProperties;
  headerMeta?: ReactNode;
  headerRight?: ReactNode;
  style?: CSSProperties;
  subline?: string;
  title: string;
}>) {
  return (
    <section style={{ ...panelStyle, ...style }}>
      <div style={headerStyle}>
        <div style={{ display: "grid", gap: 2 }}>
          <div style={titleStyle}>{title}</div>
          {subline ? <div style={sublineStyle}>{subline}</div> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {headerMeta}
          {headerRight}
        </div>
      </div>
      <div style={{ ...contentBaseStyle, ...contentStyle }}>{children}</div>
    </section>
  );
}

const panelStyle: CSSProperties = {
  background: palette.panel,
  border: `1px solid ${palette.borderDefault}`,
  borderRadius: radius.panel,
  overflow: "hidden"
};

const headerStyle: CSSProperties = {
  minHeight: spacing.panelHeaderHeight,
  padding: "0 18px",
  borderBottom: `1px solid rgba(255,255,255,0.06)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16
};

const titleStyle: CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 13,
  lineHeight: 1.3,
  fontWeight: 600,
  color: palette.textPrimary
};

const sublineStyle: CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 10,
  lineHeight: 1.3,
  fontWeight: 400,
  color: palette.textQuaternary
};

const contentBaseStyle: CSSProperties = {
  padding: 0
};
