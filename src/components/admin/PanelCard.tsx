import type { CSSProperties, PropsWithChildren, ReactNode } from "react";
import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.admin.color;
const spacing = tokens.admin.spacing;
const radius = tokens.admin.radius;
const fontStack = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export function PanelCard({
  children,
  contentStyle,
  delay = 0,
  headerMeta,
  headerRight,
  style,
  subline,
  title
}: PropsWithChildren<{
  contentStyle?: CSSProperties;
  delay?: number;
  headerMeta?: ReactNode;
  headerRight?: ReactNode;
  style?: CSSProperties;
  subline?: string;
  title: string;
}>) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 16 }}
      style={{ ...panelStyle, ...style }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover="hover"
    >
      <div style={headerStyle}>
        <div style={{ display: "grid", gap: 2 }}>
          <motion.div
            style={titleStyle}
            variants={{
              hover: { opacity: 1 }
            }}
          >
            {title}
          </motion.div>
          {subline ? <div style={sublineStyle}>{subline}</div> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {headerMeta}
          {headerRight}
        </div>
      </div>
      <div style={{ ...contentBaseStyle, ...contentStyle }}>{children}</div>
    </motion.section>
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
  padding: "0 20px",
  borderBottom: `1px solid ${palette.borderSubtle}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16
};

const titleStyle: CSSProperties = {
  fontFamily: fontStack,
  fontSize: 13,
  lineHeight: 1.3,
  fontWeight: 600,
  color: palette.textPrimary,
  opacity: 0.85,
  transition: "opacity 120ms ease"
};

const sublineStyle: CSSProperties = {
  fontFamily: fontStack,
  fontSize: 11,
  lineHeight: 1.4,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.28
};

const contentBaseStyle: CSSProperties = {
  padding: 0
};
