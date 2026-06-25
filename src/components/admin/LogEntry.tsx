import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { tokens } from "@/design/tokens";
import type { DiagnosticEvent } from "@/types/runtime";

const palette = tokens.admin.color;
const radius = tokens.admin.radius;
const fonts = tokens.admin.font;

export interface DedupedLogEntry extends DiagnosticEvent {
  duplicateCount: number;
}

export function dedupeDiagnosticEntries(events: DiagnosticEvent[]) {
  const result: DedupedLogEntry[] = [];

  for (const event of events) {
    const last = result.at(-1);
    if (last && last.title === event.title) {
      last.duplicateCount += 1;
      if (Date.parse(event.createdAt) > Date.parse(last.createdAt)) {
        last.createdAt = event.createdAt;
        last.detail = event.detail;
        last.level = event.level;
      }
      continue;
    }

    result.push({
      ...event,
      duplicateCount: 1
    });
  }

  return result;
}

export function LogEntry({ entry, timeLabel }: { entry: DedupedLogEntry; timeLabel: string }) {
  const severity = entry.level === "error" ? "ERROR" : entry.level === "warning" ? "WARN" : "INFO";
  const badgeStyle =
    entry.level === "error"
      ? { background: palette.errorBadge, color: palette.danger, border: `1px solid ${palette.dangerSurface}` }
      : entry.level === "warning"
        ? { background: palette.warnBadge, color: palette.warning, border: `1px solid ${palette.warningSurface}` }
        : { background: palette.infoBadge, color: palette.textSecondary, border: `1px solid ${palette.borderDefault}` };

  return (
    <AnimatePresence initial={false}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -6 }}
        style={rowStyle}
        transition={{ duration: 0.22, ease: "easeOut" }}
        whileHover={{ backgroundColor: palette.logHover }}
      >
        <div style={{ ...badgeBaseStyle, ...badgeStyle }}>{severity}</div>
        <div style={centerStyle}>
          <div style={titleLineStyle}>
            <span style={titleStyle}>{entry.title}</span>
            {entry.duplicateCount >= 2 ? <span style={duplicateStyle}>×{entry.duplicateCount}</span> : null}
          </div>
          <div style={detailStyle}>{entry.detail}</div>
        </div>
        <div style={timeStyle}>{timeLabel}</div>
      </motion.div>
    </AnimatePresence>
  );
}

const rowStyle: CSSProperties = {
  minHeight: 44,
  padding: "10px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "40px 1fr auto",
  alignItems: "center",
  gap: 12,
  transition: "background-color 100ms ease",
  cursor: "default"
};

const badgeBaseStyle: CSSProperties = {
  justifySelf: "start",
  padding: "2px 5px",
  borderRadius: radius.badge,
  fontFamily: fonts.body,
  fontSize: 8,
  lineHeight: 1.2,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  whiteSpace: "nowrap"
};

const centerStyle: CSSProperties = {
  minWidth: 0,
  padding: "0 12px 0 0",
  display: "grid",
  gap: 1
};

const titleLineStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  minWidth: 0
};

const titleStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontFamily: fonts.body,
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 500,
  color: palette.textPrimary
};

const duplicateStyle: CSSProperties = {
  marginLeft: 6,
  fontFamily: fonts.mono,
  fontSize: 9,
  lineHeight: 1.2,
  fontWeight: 600,
  color: palette.accent,
  background: "rgba(0,196,154,0.10)",
  borderRadius: 3,
  padding: "1px 5px"
};

const detailStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontFamily: fonts.body,
  fontSize: 10,
  lineHeight: 1.35,
  fontWeight: 400,
  color: palette.textTertiary
};

const timeStyle: CSSProperties = {
  whiteSpace: "nowrap",
  fontFamily: fonts.mono,
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 400,
  color: palette.textQuaternary
};
