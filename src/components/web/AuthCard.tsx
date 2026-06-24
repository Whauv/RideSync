import type { CSSProperties, PropsWithChildren, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.auth.color;
const spacing = tokens.auth.spacing;
const radius = tokens.auth.radius;
const fontStack = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export function AuthCard({
  children,
  developerWarning,
  isMobile,
  mode,
  subtitle,
  switchLabel,
  title,
  onSwitch
}: PropsWithChildren<{
  developerWarning?: ReactNode;
  isMobile: boolean;
  mode: "sign-in" | "sign-up";
  subtitle: string;
  switchLabel: string;
  title: string;
  onSwitch: () => void;
}>) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 16 }}
      layout
      style={{
        ...cardStyle,
        maxWidth: isMobile ? "none" : spacing.cardWidth,
        width: isMobile ? "calc(100vw - 40px)" : spacing.cardWidth,
        borderRadius: isMobile ? 12 : radius.card,
        padding: isMobile ? "28px 24px" : `${spacing.cardPaddingY}px ${spacing.cardPaddingX}px`
      }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1], layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div style={{ display: "grid", gap: 0 }}>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 8 }}
          style={{ display: "grid", gap: 6 }}
          transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        >
          <h1 style={titleStyle}>{title}</h1>
          <p style={subtitleStyle}>{subtitle}</p>
        </motion.div>

        {developerWarning ? <div style={{ marginTop: 28 }}>{developerWarning}</div> : null}

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={mode}
            layoutId="auth-form-body"
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            style={{ marginTop: 28 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>

        <motion.div
          animate={{ opacity: 0.35 }}
          initial={{ opacity: 0 }}
          style={{ display: "grid", gap: 20 }}
          transition={{ duration: 0.3, delay: 0.8, ease: "easeOut" }}
        >
          <div style={switcherDividerStyle} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <motion.button
              initial="rest"
              onClick={onSwitch}
              style={switcherStyle}
              type="button"
              whileHover="hover"
            >
              <span>{switchLabel}</span>
              <motion.span
                variants={{
                  rest: { x: 0, opacity: 0.35 },
                  hover: { x: 3, opacity: 0.75 }
                }}
              >
                {"\u2192"}
              </motion.span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

const cardStyle: CSSProperties = {
  background: palette.surface,
  border: `1px solid ${palette.border}`,
  boxShadow: `inset 0 1px 0 ${palette.insetHighlight}, 0 24px 48px rgba(0,0,0,0.4)`
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontFamily: fontStack,
  fontSize: 20,
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: palette.textPrimary
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  fontFamily: fontStack,
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 400,
  color: palette.textSecondary
};

const switcherDividerStyle: CSSProperties = {
  width: "100%",
  height: 1,
  background: palette.borderSubtle,
  marginTop: 20
};

const switcherStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  fontFamily: fontStack,
  fontSize: 12,
  lineHeight: 1.4,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 1,
  transition: "opacity 150ms ease"
};
