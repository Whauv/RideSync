import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "expo-router";
import { motion } from "framer-motion";

import { CheckGlyph, EmptyState, RoadGlyph, ShieldCheckGlyph } from "@/components/admin/EmptyState";
import { dedupeDiagnosticEntries, LogEntry } from "@/components/admin/LogEntry";
import { PanelCard } from "@/components/admin/PanelCard";
import { SkeletonLine } from "@/components/admin/SkeletonShimmer";
import { StatCard } from "@/components/admin/StatCard";
import { tokens } from "@/design/tokens";
import { type AdminConsoleOverview, type AdminIncidentSummary, type AdminRoomSummary, getAdminConsoleOverview } from "@/services/admin";

const palette = tokens.admin.color;
const spacing = tokens.admin.spacing;
const radius = tokens.admin.radius;
const fontStack = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const monoStack = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';
const ease = [0.16, 1, 0.3, 1] as const;

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function statusTone(severity: AdminIncidentSummary["severity"]) {
  if (severity === "critical" || severity === "high") return palette.warning;
  if (severity === "medium") return palette.accent;
  return "rgba(240,240,242,0.45)";
}

function rowStatusColor(room: AdminRoomSummary) {
  if (room.activeAlertKind) return palette.danger;
  if (room.lifecycle === "rolling") return palette.success;
  if (room.pendingApprovals > 0) return palette.warning;
  return "rgba(240,240,242,0.32)";
}

function StatusPill({ count, tone = "neutral", pulse = false, text }: { count?: number; pulse?: boolean; text: string; tone?: "accent" | "neutral" | "warning" }) {
  const borderColor = tone === "accent" ? palette.accent : tone === "warning" ? palette.warning : "rgba(255,255,255,0.08)";
  const color = tone === "accent" ? palette.accent : tone === "warning" ? palette.warning : "rgba(255,255,255,0.30)";

  return (
    <div style={{ ...pillStyle, borderColor, color }}>
      {pulse ? (
        <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
          <motion.span
            animate={{ opacity: [1, 0], scale: [1, 1.4] }}
            style={{ position: "absolute", inset: 0, borderRadius: 999, background: borderColor }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
          />
          <span style={{ width: 8, height: 8, borderRadius: 999, background: borderColor }} />
        </span>
      ) : null}
      <span>{count !== undefined ? `${count} ${text}` : text}</span>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg height="14" viewBox="0 0 24 24" width="14">
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      <path d="M19.5 5.5v4h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function MarketingLink({ onClick }: { onClick: () => void }) {
  return (
    <motion.button onClick={onClick} style={marketingLinkStyle} whileHover={{ opacity: 0.8 }}>
      Marketing {"\u2197"}
    </motion.button>
  );
}

function PanelRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div style={skeletonListStyle}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} style={skeletonRowStyle}>
          <div style={{ display: "grid", gap: 8, minWidth: 0, flex: 1 }}>
            <SkeletonLine height={12} width={`${58 + ((index % 3) + 1) * 12}%`} />
            <SkeletonLine height={10} width={`${42 + ((index % 2) + 1) * 10}%`} />
          </div>
          <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
            <SkeletonLine height={24} width={74} />
            <SkeletonLine height={10} width={56} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LogRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div style={skeletonListStyle}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} style={logSkeletonRowStyle}>
          <SkeletonLine height={18} width={32} />
          <SkeletonLine height={12} width="60%" />
          <SkeletonLine height={10} width={48} />
        </div>
      ))}
    </div>
  );
}

function RoomRow({ room }: { room: AdminRoomSummary }) {
  const [open, setOpen] = useState(false);
  const statusColor = rowStatusColor(room);

  return (
    <div>
      <motion.button
        onClick={() => setOpen((current) => !current)}
        style={roomRowStyle}
        whileHover={{ backgroundColor: palette.rowHover }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={rowTitleStyle}>{room.title}</div>
          <div style={rowSubtitleStyle}>{room.routeTitle ?? "No route title set"}</div>
        </div>
        <div style={rowMetaStyle}>
          <div style={riderChipStyle}>{room.riderCount} riders</div>
          <span style={{ ...statusDotStyle, background: statusColor }} />
        </div>
      </motion.button>
      <motion.div
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        initial={false}
        style={roomDetailWrapStyle}
        transition={{ duration: 0.24, ease }}
      >
        <div style={roomDetailInnerStyle}>
          <div style={detailLineStyle}>Code {room.code} · {room.pendingApprovals} pending approvals</div>
          <div style={detailLineStyle}>{room.connectedRiders} connected · {room.reconnectingRiders} reconnecting · {room.offlineRiders} offline</div>
          <div style={detailLineStyle}>{room.locked ? "Room locked" : "Room open"} · {room.privacyMode.replaceAll("_", " ")}</div>
        </div>
      </motion.div>
    </div>
  );
}

function IncidentRow({ incident }: { incident: AdminIncidentSummary }) {
  const color = incident.status === "active" ? palette.warning : incident.status === "watch" ? palette.accent : "rgba(240,240,242,0.36)";

  return (
    <motion.div style={incidentRowStyle} whileHover={{ backgroundColor: palette.rowHover }}>
      <div style={{ minWidth: 0 }}>
        <div style={rowTitleStyle}>{incident.title}</div>
        <div style={rowSubtitleStyle}>{incident.roomTitle} · {incident.detail}</div>
      </div>
      <div style={rowMetaStyle}>
        <div style={{ ...riderChipStyle, borderColor: color, color, opacity: incident.status === "resolved" ? 0.6 : 1 }}>{incident.status}</div>
        <div style={timestampStyle}>{formatDateTime(incident.createdAt)}</div>
      </div>
    </motion.div>
  );
}

function AbuseRow({ subject, detail, disposition, roomTitle, severity }: { detail: string; disposition: string; roomTitle: string; severity: AdminIncidentSummary["severity"]; subject: string }) {
  return (
    <motion.div style={incidentRowStyle} whileHover={{ backgroundColor: palette.rowHover }}>
      <div style={{ minWidth: 0 }}>
        <div style={rowTitleStyle}>{subject}</div>
        <div style={rowSubtitleStyle}>{roomTitle} · {detail}</div>
      </div>
      <div style={rowMetaStyle}>
        <div style={{ ...riderChipStyle, borderColor: statusTone(severity), color: statusTone(severity) }}>{disposition}</div>
      </div>
    </motion.div>
  );
}

export default function AdminWebScreen() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminConsoleOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [clock, setClock] = useState(() =>
    new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date())
  );

  async function loadOverview() {
    setLoading(true);
    try {
      setOverview(await getAdminConsoleOverview());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const rooms = overview?.rooms.length ?? 0;
    const incidents = overview?.incidents.filter((item) => item.status !== "resolved").length ?? 0;
    const flags = overview?.abuseReports.length ?? 0;
    const diagnostics = overview?.diagnostics.filter((item) => item.level !== "info").length ?? 0;
    const max = Math.max(rooms, incidents, flags, diagnostics, 1);

    return [
      { label: "ROOMS", value: rooms, color: "accent" as const, activityRatio: rooms / max },
      { label: "INCIDENTS", value: incidents, color: "warning" as const, activityRatio: incidents / max },
      { label: "FLAGS", value: flags, color: "danger" as const, activityRatio: flags / max },
      { label: "DIAGNOSTICS", value: diagnostics, color: "default" as const, activityRatio: diagnostics / max }
    ];
  }, [overview]);

  const diagnostics = useMemo(() => dedupeDiagnosticEntries(overview?.diagnostics ?? []), [overview]);
  const connectedRiders = overview?.rooms.reduce((sum, room) => sum + room.connectedRiders, 0) ?? 0;
  const activeIncidents = overview?.incidents.filter((item) => item.status === "active").length ?? 0;
  const latestDiagnosticId = overview?.diagnostics[0]?.id ?? "none";
  const rooms = overview?.rooms ?? [];
  const incidents = overview?.incidents ?? [];
  const abuseReports = overview?.abuseReports ?? [];

  return (
    <div style={pageStyle}>
      <style>{`
        .ridesync-admin-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.10) transparent;
        }
        .ridesync-admin-scroll::-webkit-scrollbar {
          width: 2px;
        }
        .ridesync-admin-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .ridesync-admin-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.10);
          border-radius: 1px;
        }
        .ridesync-admin-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.20);
        }
      `}</style>
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -8 }}
        style={headerStyle}
        transition={{ duration: 0.4, ease }}
      >
        <div style={headerInnerStyle}>
          <div style={headerLeftStyle}>
            <div style={headerAccentStyle} />
            <div style={{ display: "grid", gap: 2 }}>
              <div style={headerTitleStyle}>Operations Console</div>
              <div style={headerSublineStyle}>RideSync · Internal moderation, incident triage, and support visibility</div>
            </div>
          </div>
          <div style={headerRightStyle}>
            <div style={clockStyle}>{clock}</div>
            <motion.button
              animate={loading ? { opacity: [0.4, 0.8, 0.4], rotate: 360 } : { opacity: 0.4, rotate: refreshTick * 360 }}
              onClick={() => {
                setRefreshTick((current) => current + 1);
                void loadOverview();
              }}
              style={refreshButtonStyle}
              transition={loading ? { opacity: { duration: 1, repeat: Number.POSITIVE_INFINITY }, rotate: { duration: 0.5, ease: "easeInOut" } } : { duration: 0.5, ease: "easeInOut" }}
              whileHover={{ opacity: 0.9 }}
            >
              <RefreshIcon />
            </motion.button>
            <MarketingLink onClick={() => router.push("/marketing")} />
          </div>
        </div>
      </motion.header>

      <main style={mainStyle}>
        <section style={statGridStyle}>
          {stats.map((stat, index) => (
            <StatCard key={stat.label} activityRatio={stat.activityRatio} color={stat.color} delay={0.15 + index * 0.08} label={stat.label} loading={loading} value={stat.value} />
          ))}
        </section>

        <section style={contentGridStyle}>
          <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }} style={leftColumnStyle} transition={{ duration: 0.45, delay: 0.3, ease }}>
            <PanelCard
              delay={0}
              headerRight={<StatusPill count={connectedRiders} pulse={connectedRiders > 0} text="riders connected" tone={connectedRiders > 0 ? "accent" : "neutral"} />}
              style={{ minHeight: 200 }}
              subline="Room state, join pressure, and operational readiness."
              title="Active rooms"
            >
              {loading ? (
                <PanelRowsSkeleton rows={4} />
              ) : rooms.length > 0 ? (
                <div className="ridesync-admin-scroll" style={panelScrollStyle}>
                  {rooms.map((room) => <RoomRow key={room.id} room={room} />)}
                </div>
              ) : (
                <EmptyState body="Rooms appear here when riders create and stage group rides." heading="No active rooms" icon={<RoadGlyph />} />
              )}
            </PanelCard>

            <PanelCard
              delay={0}
              headerRight={<StatusPill count={activeIncidents} pulse={activeIncidents > 0} text="active" tone={activeIncidents > 0 ? "warning" : "neutral"} />}
              style={{ minHeight: 180 }}
              subline="Severity-ranked signals keep operators focused on actual risk."
              title="Incidents"
            >
              {loading ? (
                <PanelRowsSkeleton rows={4} />
              ) : incidents.length > 0 ? (
                <div className="ridesync-admin-scroll" style={panelScrollStyle}>
                  {incidents.slice(0, 10).map((incident) => <IncidentRow key={incident.id} incident={incident} />)}
                </div>
              ) : (
                <EmptyState body="SOS, hazard, fuel, and connectivity issues will surface here." heading="No active incidents" icon={<CheckGlyph />} />
              )}
            </PanelCard>
          </motion.div>

          <motion.div animate={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 16 }} style={rightColumnStyle} transition={{ duration: 0.45, delay: 0.35, ease }}>
            <PanelCard delay={0} style={{ minHeight: 160 }} subline="Moderation flags will appear here as beta usage grows." title="Abuse review queue">
              {loading ? (
                <PanelRowsSkeleton rows={3} />
              ) : abuseReports.length > 0 ? (
                <div className="ridesync-admin-scroll" style={panelScrollStyle}>
                  {abuseReports.map((report) => (
                    <AbuseRow
                      key={report.id}
                      detail={report.detail}
                      disposition={report.disposition}
                      roomTitle={report.roomTitle}
                      severity={report.severity}
                      subject={report.subject}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState body="Moderation flags will appear here as beta usage grows." heading="Queue clear" icon={<ShieldCheckGlyph />} tight />
              )}
            </PanelCard>

            <PanelCard
              contentStyle={{ height: "100%" }}
              delay={0}
              headerMeta={
                <div style={liveMetaStyle}>
                  <span style={liveDotBaseStyle}>
                    <motion.span
                      animate={{ opacity: [1, 0], scale: [1, 1.4] }}
                      key={latestDiagnosticId}
                      style={liveDotPulseStyle}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                    />
                    <span style={liveDotStyle} />
                  </span>
                  <span style={liveTextStyle}>LIVE</span>
                </div>
              }
              style={{ flex: 1, maxHeight: "calc(100vh - 280px)" }}
              subline="Recovery, voice, and notification health."
              title="Latest diagnostics"
            >
              <div className="ridesync-admin-scroll" style={logListStyle}>
                {loading ? (
                  <LogRowsSkeleton rows={4} />
                ) : diagnostics.length > 0 ? (
                  diagnostics.map((entry, index) => <LogEntry entry={entry} index={index} key={`${entry.id}-${index}`} timeLabel={formatTime(entry.createdAt)} />)
                ) : (
                  <EmptyState body="Diagnostic events will accumulate here as rooms and recovery flows are exercised." heading="Diagnostics are quiet" icon={<CheckGlyph />} tight />
                )}
              </div>
            </PanelCard>
          </motion.div>
        </section>

        <motion.footer animate={{ opacity: 1 }} initial={{ opacity: 0 }} style={footerStyle} transition={{ duration: 0.3, delay: 0.5, ease }}>
          <div style={footerLeftStyle}>
            <span style={footerDotStyle} />
            <span>System · All services operational</span>
          </div>
          <div style={footerCenterStyle}>RideSync Operations Console · Internal use only</div>
          <div style={footerRightStyle}>build beta-web-01</div>
        </motion.footer>
      </main>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: palette.background,
  color: palette.textPrimary,
  fontFamily: fontStack
};

const headerStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  height: spacing.headerHeight,
  background: palette.background,
  borderBottom: `1px solid ${palette.borderSubtle}`
};

const headerInnerStyle: CSSProperties = {
  width: "min(1280px, calc(100vw - 48px))",
  height: "100%",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20
};

const headerLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12
};

const headerAccentStyle: CSSProperties = {
  width: 2,
  height: 20,
  borderRadius: 1,
  background: palette.accent,
  flexShrink: 0,
  alignSelf: "center"
};

const headerTitleStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.1,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: palette.textPrimary
};

const headerSublineStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: 1.3,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.35
};

const headerRightStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16
};

const clockStyle: CSSProperties = {
  minWidth: 64,
  textAlign: "right",
  fontFamily: monoStack,
  fontSize: 12,
  lineHeight: 1,
  fontWeight: 400,
  fontVariantNumeric: "tabular-nums",
  color: palette.textPrimary,
  opacity: 0.3
};

const refreshButtonStyle: CSSProperties = {
  width: 28,
  height: 28,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  color: palette.textPrimary
};

const marketingLinkStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  fontFamily: fontStack,
  fontSize: 12,
  lineHeight: 1.2,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.4
};

const mainStyle: CSSProperties = {
  width: "min(1280px, calc(100vw - 48px))",
  margin: "0 auto",
  padding: "20px 0 40px",
  display: "grid",
  gap: 20
};

const statGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12
};

const contentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 400px",
  gap: 16,
  alignItems: "start"
};

const leftColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const rightColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  alignSelf: "stretch",
  minHeight: "100%"
};

const pillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid",
  borderRadius: radius.pill,
  padding: "10px 10px",
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 400
};

const roomRowStyle: CSSProperties = {
  minHeight: 48,
  width: "100%",
  padding: "10px 16px 10px 20px",
  border: "none",
  background: "transparent",
  borderBottom: `1px solid ${palette.divider}`,
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: 12,
  textAlign: "left",
  cursor: "pointer",
  transition: "background-color 150ms ease"
};

const incidentRowStyle: CSSProperties = {
  minHeight: 48,
  padding: "10px 16px 10px 20px",
  borderBottom: `1px solid ${palette.divider}`,
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: 12,
  transition: "background-color 150ms ease"
};

const rowTitleStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.3,
  fontWeight: 500,
  color: palette.textPrimary,
  opacity: 0.75
};

const rowSubtitleStyle: CSSProperties = {
  marginTop: 2,
  fontSize: 11,
  lineHeight: 1.4,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.35
};

const rowMetaStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

const riderChipStyle: CSSProperties = {
  border: `1px solid ${palette.borderStrong}`,
  borderRadius: radius.pill,
  padding: "6px 8px",
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.5
};

const statusDotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999
};

const roomDetailWrapStyle: CSSProperties = {
  overflow: "hidden"
};

const roomDetailInnerStyle: CSSProperties = {
  padding: "0 20px 12px",
  borderBottom: `1px solid ${palette.divider}`,
  display: "grid",
  gap: 4
};

const detailLineStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: 1.4,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.35
};

const timestampStyle: CSSProperties = {
  fontFamily: monoStack,
  fontSize: 11,
  lineHeight: 1.3,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.22,
  whiteSpace: "nowrap"
};

const liveMetaStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8
};

const liveDotBaseStyle: CSSProperties = {
  position: "relative",
  width: 6,
  height: 6,
  display: "inline-flex"
};

const liveDotPulseStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 999,
  background: palette.accent
};

const liveDotStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: palette.accent
};

const liveTextStyle: CSSProperties = {
  fontSize: 10,
  lineHeight: 1,
  fontWeight: 500,
  letterSpacing: "0.08em",
  color: palette.textPrimary,
  opacity: 0.38
};

const logListStyle: CSSProperties = {
  maxHeight: "calc(100vh - 280px)",
  overflowY: "auto",
  scrollbarWidth: "thin"
};

const panelScrollStyle: CSSProperties = {
  maxHeight: 320,
  overflowY: "auto"
};

const footerStyle: CSSProperties = {
  position: "relative",
  height: spacing.footerHeight,
  borderTop: `1px solid ${palette.divider}`,
  display: "flex",
  alignItems: "center",
  gap: 16
};

const footerLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.25
};

const footerDotStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: palette.success
};

const footerCenterStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.15
};

const footerRightStyle: CSSProperties = {
  marginLeft: "auto",
  fontFamily: monoStack,
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.15
};

const skeletonListStyle: CSSProperties = {
  display: "grid"
};

const skeletonRowStyle: CSSProperties = {
  minHeight: 48,
  padding: "10px 16px 10px 20px",
  borderBottom: `1px solid ${palette.divider}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12
};

const logSkeletonRowStyle: CSSProperties = {
  minHeight: 40,
  padding: "10px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "32px 1fr 48px",
  alignItems: "center",
  gap: 12
};
