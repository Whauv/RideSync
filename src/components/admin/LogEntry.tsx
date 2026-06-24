import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { tokens } from "@/design/tokens";
import type { DiagnosticEvent } from "@/types/runtime";

const palette = tokens.admin.color;
const radius = tokens.admin.radius;
const fontStack = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

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

export function LogEntry({ entry, index, timeLabel }: { entry: DedupedLogEntry; index: number; timeLabel: string }) {
  const severity = entry.level === "error" ? "ERROR" : entry.level === "warning" ? "WARN" : "INFO";
  const badgeStyle =
    entry.level === "error"
      ? { background: palette.errorBadge, color: "rgba(224,84,84,0.85)", border: "1px solid rgba(224,84,84,0.20)" }
      : entry.level === "warning"
        ? { background: palette.warnBadge, color: "rgba(224,154,0,0.85)", border: "1px solid rgba(224,154,0,0.20)" }
        : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.10)" };

  return (
    <AnimatePresence initial={false}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -6 }}
        style={rowStyle}
        transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
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
  minHeight: 40,
  padding: "10px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  alignItems: "start",
  gap: 12,
  transition: "background-color 120ms ease",
  cursor: "default"
};

const badgeBaseStyle: CSSProperties = {
  padding: "2px 6px",
  borderRadius: radius.badge,
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  fontSize: 9,
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
  flexShrink: 0
};

const centerStyle: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 4
};

const titleLineStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 0,
  minWidth: 0
};

const titleStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontFamily: fontStack,
  fontSize: 12,
  lineHeight: 1.3,
  fontWeight: 500,
  color: palette.textPrimary,
  opacity: 0.75
};

const duplicateStyle: CSSProperties = {
  marginLeft: 6,
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  fontSize: 9,
  lineHeight: 1.2,
  fontWeight: 600,
  color: palette.accent,
  background: "rgba(0,196,154,0.12)",
  borderRadius: 4,
  padding: "1px 5px"
};

const detailStyle: CSSProperties = {
  fontFamily: fontStack,
  fontSize: 11,
  lineHeight: 1.4,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.35,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
};

const timeStyle: CSSProperties = {
  whiteSpace: "nowrap",
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  fontSize: 11,
  lineHeight: 1.3,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.22
};
