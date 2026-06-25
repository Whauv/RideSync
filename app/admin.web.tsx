import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "expo-router";
import { AnimatePresence, motion } from "framer-motion";

import { CheckGlyph, EmptyState, RoadGlyph, ShieldCheckGlyph } from "@/components/admin/EmptyState";
import { dedupeDiagnosticEntries, LogEntry } from "@/components/admin/LogEntry";
import { PanelCard } from "@/components/admin/PanelCard";
import { SkeletonLine } from "@/components/admin/SkeletonShimmer";
import { StatCard } from "@/components/admin/StatCard";
import { tokens } from "@/design/tokens";
import { type AdminConsoleOverview, type AdminIncidentSummary, type AdminRoomSummary, getAdminConsoleOverview } from "@/services/admin";

const palette = tokens.admin.color;
const spacing = tokens.admin.spacing;
const fonts = tokens.admin.font;
const ease = [0.16, 1, 0.3, 1] as const;

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function relativeTime(value: string) {
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function roomStatus(room: AdminRoomSummary) {
  if (room.lifecycle === "rolling") {
    return { dot: palette.accent, text: "active", tone: palette.accent };
  }
  if (room.pendingApprovals > 0) {
    return { dot: palette.warning, text: "staging", tone: palette.warning };
  }
  return { dot: palette.neutral, text: "idle", tone: palette.textTertiary };
}

function incidentSeverityTone(severity: AdminIncidentSummary["severity"]) {
  if (severity === "critical" || severity === "high") {
    return { border: palette.danger, badge: palette.dangerSurface, text: palette.danger };
  }
  if (severity === "medium") {
    return { border: palette.warning, badge: palette.warningSurface, text: palette.warning };
  }
  return { border: palette.accent, badge: palette.accentDim, text: palette.accent };
}

function HeaderPulseDot() {
  return (
    <span style={pulseWrapStyle}>
      <motion.span
        animate={{ opacity: [1, 0], scale: [1, 1.5] }}
        style={pulseRingStyle}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
      />
      <span style={pulseDotStyle} />
    </span>
  );
}

function RefreshIcon() {
  return (
    <svg height="16" viewBox="0 0 24 24" width="16">
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      <path d="M19.5 5.5v4h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function RoomStatusMeta({ riderCount }: { riderCount: number }) {
  const active = riderCount > 0;

  return (
    <div style={metaInlineStyle}>
      <span style={pulseWrapStyle}>
        {active ? (
          <motion.span
            animate={{ opacity: [1, 0], scale: [1, 1.5] }}
            style={{ ...pulseRingStyle, background: palette.accent }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
          />
        ) : null}
        <span style={{ ...pulseDotStyle, background: active ? palette.accent : "rgba(255,255,255,0.20)" }} />
      </span>
      <span style={{ ...metaValueStyle, color: active ? palette.accent : palette.textTertiary }}>{riderCount} riders</span>
    </div>
  );
}

function IncidentStatusMeta({ count }: { count: number }) {
  const active = count > 0;

  return (
    <div style={metaInlineStyle}>
      {active ? <HeaderPulseDot /> : <span style={{ ...pulseDotStyle, background: palette.neutral }} />}
      <span style={{ ...metaValueStyle, color: active ? palette.warning : palette.textTertiary }}>{count} active</span>
    </div>
  );
}

function RoomRow({ room }: { room: AdminRoomSummary }) {
  const status = roomStatus(room);

  return (
    <motion.div layout style={roomRowStyle} whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}>
      <div style={{ minWidth: 0 }}>
        <div style={rowTitleStyle}>{room.title}</div>
        <div style={rowSubtitleStyle}>{room.routeTitle ?? "No route title set"}</div>
      </div>
      <div style={rowRightStyle}>
        <span style={rowMonoStyle}>{room.riderCount} riders</span>
        <span style={{ ...statusDotStyle, background: status.dot }} />
      </div>
    </motion.div>
  );
}

function IncidentRow({ incident }: { incident: AdminIncidentSummary }) {
  const tone = incidentSeverityTone(incident.severity);

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      initial={{ opacity: 0, x: -8 }}
      style={{ ...incidentRowStyle, borderLeft: `2px solid ${tone.border}` }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={rowTitleStyle}>{incident.title}</div>
        <div style={rowSubtitleStyle}>{incident.detail}</div>
      </div>
      <div style={rowRightStackStyle}>
        <span style={timeAgoStyle}>{relativeTime(incident.createdAt)}</span>
        <span style={{ ...severityBadgeStyle, color: tone.text, background: tone.badge, borderColor: tone.border }}>{incident.status}</span>
      </div>
    </motion.div>
  );
}

function AbuseRow({ subject, detail, disposition, roomTitle, severity }: { detail: string; disposition: string; roomTitle: string; severity: AdminIncidentSummary["severity"]; subject: string }) {
  const tone = incidentSeverityTone(severity);

  return (
    <motion.div style={{ ...incidentRowStyle, borderLeft: `2px solid ${tone.border}` }} whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}>
      <div style={{ minWidth: 0 }}>
        <div style={rowTitleStyle}>{subject}</div>
        <div style={rowSubtitleStyle}>{roomTitle} · {detail}</div>
      </div>
      <div style={rowRightStackStyle}>
        <span style={{ ...severityBadgeStyle, color: tone.text, background: tone.badge, borderColor: tone.border }}>{disposition}</span>
      </div>
    </motion.div>
  );
}

function RoomRowsSkeleton() {
  return (
    <div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} style={roomSkeletonRowStyle}>
          <div style={{ display: "grid", gap: 8 }}>
            <SkeletonLine height={12} width={120} />
            <SkeletonLine height={10} width={80} />
          </div>
          <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
            <SkeletonLine height={10} width={44} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LogRowsSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} style={logSkeletonRowStyle}>
          <SkeletonLine height={18} width={32} />
          <div style={{ display: "grid", gap: 7 }}>
            <SkeletonLine height={10} width="55%" />
            <SkeletonLine height={10} width="42%" />
          </div>
          <SkeletonLine height={10} width={40} />
        </div>
      ))}
    </div>
  );
}

export default function AdminWebScreen() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminConsoleOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshSpin, setRefreshSpin] = useState(0);
  const [clock, setClock] = useState(() =>
    new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date())
  );
  const [livePulseKey, setLivePulseKey] = useState(0);
  const previousDiagnosticId = useRef<string | null>(null);

  async function loadOverview() {
    setLoading(true);
    try {
      const nextOverview = await getAdminConsoleOverview();
      setOverview(nextOverview);
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

  useEffect(() => {
    const latest = overview?.diagnostics[0]?.id ?? null;
    if (latest && previousDiagnosticId.current && latest !== previousDiagnosticId.current) {
      setLivePulseKey((value) => value + 1);
    }
    previousDiagnosticId.current = latest;
  }, [overview]);

  const stats = useMemo(() => {
    const rooms = overview?.rooms.length ?? 0;
    const incidents = overview?.incidents.filter((item) => item.status !== "resolved").length ?? 0;
    const flags = overview?.abuseReports.length ?? 0;
    const diagnostics = overview?.diagnostics.length ?? 0;
    const max = Math.max(rooms, incidents, flags, diagnostics, 1);

    return [
      { label: "ROOMS", value: rooms, color: "accent" as const, activityRatio: rooms / max },
      { label: "INCIDENTS", value: incidents, color: "warning" as const, activityRatio: incidents / max },
      { label: "FLAGS", value: flags, color: "danger" as const, activityRatio: flags / max },
      { label: "DIAGNOSTICS", value: diagnostics, color: "default" as const, activityRatio: diagnostics / max }
    ];
  }, [overview]);

  const rooms = overview?.rooms ?? [];
  const incidents = overview?.incidents ?? [];
  const abuseReports = overview?.abuseReports ?? [];
  const diagnostics = useMemo(() => dedupeDiagnosticEntries(overview?.diagnostics ?? []), [overview]);
  const totalRiders = rooms.reduce((sum, room) => sum + room.riderCount, 0);
  const activeIncidents = incidents.filter((item) => item.status === "active").length;

  return (
    <div style={pageStyle}>
      <style>{`
        .ridesync-admin-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.09) transparent;
        }
        .ridesync-admin-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .ridesync-admin-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .ridesync-admin-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.09);
          border-radius: 2px;
        }
        .ridesync-admin-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.18);
        }
      `}</style>

      <motion.header
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -4 }}
        style={headerStyle}
        transition={{ duration: 0.35, ease }}
      >
        <div style={shellStyle}>
          <div style={headerInnerStyle}>
            <div style={headerLeftStyle}>
              <div style={headerAccentStyle} />
              <div style={{ display: "grid", gap: 2 }}>
                <div style={headerTitleStyle}>Operations Console</div>
                <div style={headerSublineStyle}>RideSync · Internal moderation, incident triage, and support visibility</div>
              </div>
            </div>

            <div style={headerRightStyle}>
              <div style={metaInlineStyle}>
                <HeaderPulseDot />
                <span style={metaValueStyle}>Operational</span>
              </div>
              <div style={headerDividerStyle} />
              <div style={clockStyle}>{clock}</div>
              <motion.button
                animate={{ rotate: refreshSpin * 360 }}
                onClick={() => {
                  setRefreshSpin((value) => value + 1);
                  void loadOverview();
                }}
                style={refreshButtonStyle}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                whileHover={{ opacity: 0.75 }}
              >
                <RefreshIcon />
              </motion.button>
              <motion.button onClick={() => router.push("/marketing")} style={marketingLinkStyle} whileHover={{ color: palette.textSecondary }}>
                Marketing ↗
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main style={mainStyle}>
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          style={statGridStyle}
          transition={{ duration: 0.4, delay: 0.1, ease }}
        >
          {stats.map((stat, index) => (
            <StatCard key={stat.label} activityRatio={stat.activityRatio} color={stat.color} delay={0.1 + index * 0.07} label={stat.label} loading={loading} value={stat.value} />
          ))}
        </motion.section>

        <section style={contentGridStyle}>
          <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 14 }} style={leftColumnStyle} transition={{ duration: 0.45, delay: 0.25, ease }}>
            <PanelCard
              headerRight={<RoomStatusMeta riderCount={totalRiders} />}
              style={{ minHeight: 180 }}
              subline="Room state and join pressure."
              title="Active rooms"
            >
              {loading ? (
                <RoomRowsSkeleton />
              ) : rooms.length > 0 ? (
                <AnimatePresence initial={false}>
                  <motion.div layout className="ridesync-admin-scroll" style={panelListStyle}>
                    {rooms.map((room) => (
                      <RoomRow key={room.id} room={room} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <EmptyState body="Rooms appear when riders create and stage group rides." heading="No active rooms" icon={<RoadGlyph />} minHeight={180} />
              )}
            </PanelCard>

            <PanelCard
              headerRight={<IncidentStatusMeta count={activeIncidents} />}
              style={{ minHeight: 180 }}
              subline="Severity-ranked signals."
              title="Incidents"
            >
              {loading ? (
                <RoomRowsSkeleton />
              ) : incidents.length > 0 ? (
                <div className="ridesync-admin-scroll" style={panelListStyle}>
                  {incidents.slice(0, 10).map((incident) => (
                    <IncidentRow key={incident.id} incident={incident} />
                  ))}
                </div>
              ) : (
                <EmptyState body="SOS, hazard, fuel, and connectivity issues surface here." heading="No active incidents" icon={<CheckGlyph />} minHeight={180} />
              )}
            </PanelCard>
          </motion.div>

          <motion.div animate={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 14 }} style={rightColumnStyle} transition={{ duration: 0.45, delay: 0.3, ease }}>
            <PanelCard style={{ minHeight: 140 }} subline="Moderation flags for beta operations." title="Abuse review queue">
              {loading ? (
                <RoomRowsSkeleton />
              ) : abuseReports.length > 0 ? (
                <div className="ridesync-admin-scroll" style={panelListStyle}>
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
                <EmptyState body="Flags appear as beta usage grows." heading="Queue clear" icon={<ShieldCheckGlyph />} minHeight={140} />
              )}
            </PanelCard>

            <PanelCard
              contentStyle={{ height: "100%" }}
              headerMeta={
                <div style={metaInlineStyle}>
                  <span style={pulseWrapStyle}>
                    <motion.span
                      animate={{ opacity: [1, 0], scale: [1, 1.4] }}
                      key={livePulseKey}
                      style={pulseRingStyle}
                      transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                    />
                    <span style={pulseDotStyle} />
                  </span>
                  <span style={liveTextStyle}>LIVE</span>
                </div>
              }
              style={{ flex: 1 }}
              subline="Recovery, voice, notification health."
              title="Latest diagnostics"
            >
              <div className="ridesync-admin-scroll" style={logListStyle}>
                {loading ? (
                  <LogRowsSkeleton />
                ) : diagnostics.length > 0 ? (
                  diagnostics.map((entry) => <LogEntry entry={entry} key={`${entry.id}-${entry.createdAt}`} timeLabel={formatTime(entry.createdAt)} />)
                ) : (
                  <EmptyState body="Diagnostic events will accumulate here as rooms and recovery flows are exercised." heading="Diagnostics are quiet" icon={<CheckGlyph />} minHeight={200} />
                )}
              </div>
            </PanelCard>
          </motion.div>
        </section>

        <motion.footer animate={{ opacity: 1 }} initial={{ opacity: 0 }} style={footerStyle} transition={{ duration: 0.3, delay: 0.45, ease }}>
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
  height: "100vh",
  minHeight: "100vh",
  background: palette.background,
  color: palette.textPrimary,
  fontFamily: fonts.body,
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  position: "relative"
};

const shellStyle: CSSProperties = {
  width: "min(1280px, calc(100vw - 40px))",
  margin: "0 auto"
};

const headerStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  height: 52,
  background: "rgba(9,9,11,0.92)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px) saturate(130%)",
  WebkitBackdropFilter: "blur(20px) saturate(130%)"
};

const headerInnerStyle: CSSProperties = {
  height: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20
};

const headerLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

const headerAccentStyle: CSSProperties = {
  width: 2,
  height: 18,
  borderRadius: 1,
  background: palette.accent,
  opacity: 0.85,
  flexShrink: 0
};

const headerTitleStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.1,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: palette.textPrimary
};

const headerSublineStyle: CSSProperties = {
  fontSize: 10,
  lineHeight: 1.25,
  fontWeight: 400,
  color: palette.textQuaternary
};

const headerRightStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16
};

const metaInlineStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8
};

const metaValueStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 400,
  color: palette.textTertiary
};

const pulseWrapStyle: CSSProperties = {
  position: "relative",
  width: 6,
  height: 6,
  display: "inline-flex"
};

const pulseRingStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 999,
  background: palette.accent
};

const pulseDotStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: palette.accent
};

const headerDividerStyle: CSSProperties = {
  width: 1,
  height: 16,
  background: "rgba(255,255,255,0.08)"
};

const clockStyle: CSSProperties = {
  minWidth: 76,
  textAlign: "right",
  fontFamily: fonts.mono,
  fontSize: 13,
  lineHeight: 1,
  fontWeight: 400,
  color: palette.textTertiary,
  fontVariantNumeric: "tabular-nums"
};

const refreshButtonStyle: CSSProperties = {
  width: 28,
  height: 28,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  color: palette.textPrimary,
  opacity: 0.35,
  display: "grid",
  placeItems: "center"
};

const marketingLinkStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  fontFamily: fonts.body,
  fontSize: 12,
  lineHeight: 1.2,
  fontWeight: 400,
  color: palette.textQuaternary,
  transition: "color 130ms ease"
};

const mainStyle: CSSProperties = {
  width: "min(1280px, calc(100vw - 40px))",
  margin: "0 auto",
  padding: "16px 0 32px",
  display: "grid",
  gap: 12
};

const statGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12
};

const contentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 380px",
  gap: 12,
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
  gap: 12
};

const panelListStyle: CSSProperties = {
  maxHeight: 320,
  overflowY: "auto"
};

const roomRowStyle: CSSProperties = {
  height: 44,
  padding: "0 18px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: 12
};

const rowTitleStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.25,
  fontWeight: 500,
  color: palette.textPrimary,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const rowSubtitleStyle: CSSProperties = {
  marginTop: 2,
  fontSize: 10,
  lineHeight: 1.3,
  fontWeight: 400,
  color: palette.textQuaternary,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const rowRightStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8
};

const rowMonoStyle: CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 11,
  lineHeight: 1.2,
  color: palette.textTertiary
};

const statusDotStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999
};

const incidentRowStyle: CSSProperties = {
  minHeight: 44,
  padding: "10px 16px 10px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: 12
};

const rowRightStackStyle: CSSProperties = {
  display: "grid",
  justifyItems: "end",
  gap: 4
};

const timeAgoStyle: CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 11,
  lineHeight: 1.2,
  color: palette.textQuaternary,
  whiteSpace: "nowrap"
};

const severityBadgeStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: 3,
  padding: "2px 6px",
  fontSize: 9,
  lineHeight: 1.2,
  fontWeight: 600,
  textTransform: "uppercase"
};

const liveTextStyle: CSSProperties = {
  fontSize: 9,
  lineHeight: 1,
  fontWeight: 600,
  letterSpacing: "0.08em",
  color: palette.accent
};

const logListStyle: CSSProperties = {
  maxHeight: "calc(100vh - 260px)",
  overflowY: "auto"
};

const roomSkeletonRowStyle: CSSProperties = {
  height: 44,
  padding: "0 18px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: 12
};

const logSkeletonRowStyle: CSSProperties = {
  minHeight: 44,
  padding: "10px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "40px 1fr 40px",
  alignItems: "center",
  gap: 12
};

const footerStyle: CSSProperties = {
  position: "relative",
  height: spacing.footerHeight,
  borderTop: "1px solid rgba(255,255,255,0.05)",
  display: "flex",
  alignItems: "center",
  padding: "0 20px"
};

const footerLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 11,
  lineHeight: 1,
  color: palette.textQuaternary
};

const footerDotStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: palette.accent
};

const footerCenterStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: 11,
  lineHeight: 1,
  color: palette.textQuaternary
};

const footerRightStyle: CSSProperties = {
  marginLeft: "auto",
  fontFamily: fonts.mono,
  fontSize: 11,
  lineHeight: 1,
  color: palette.textQuaternary
};
