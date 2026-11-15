import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { AnimatePresence, motion } from "framer-motion";

import { AdminEmptyState, CheckGlyph, RoadGlyph, ShieldCheckGlyph } from "@/components/admin/AdminEmptyState";
import { AdminConsoleFooter } from "@/components/admin/AdminConsoleFooter";
import { AdminConsoleHeader } from "@/components/admin/AdminConsoleHeader";
import { IncidentStatusMeta, RoomStatusMeta } from "@/components/admin/AdminConsoleIndicators";
import { AbuseRow, IncidentRow, RoomRow } from "@/components/admin/AdminConsoleRows";
import { LogRowsSkeleton, RoomRowsSkeleton } from "@/components/admin/AdminConsoleSkeletons";
import { formatTime } from "@/components/admin/adminConsoleFormatters";
import {
  contentGridStyle,
  ease,
  leftColumnStyle,
  liveTextStyle,
  logListStyle,
  mainStyle,
  metaInlineStyle,
  pageStyle,
  panelListStyle,
  pulseDotStyle,
  pulseRingStyle,
  pulseWrapStyle,
  rightColumnStyle,
  statGridStyle
} from "@/components/admin/adminConsoleStyles";
import { dedupeDiagnosticEntries, LogEntry } from "@/components/admin/LogEntry";
import { PanelCard } from "@/components/admin/PanelCard";
import { StatCard } from "@/components/admin/StatCard";
import { type AdminConsoleOverview, getAdminConsoleOverview } from "@/services/admin";

function formatClock() {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date());
}

export default function AdminWebScreen() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminConsoleOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshSpin, setRefreshSpin] = useState(0);
  const [clock, setClock] = useState(() => formatClock());
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
      setClock(formatClock());
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

      <AdminConsoleHeader
        clock={clock}
        onNavigateMarketing={() => router.push("/marketing")}
        onRefresh={() => {
          setRefreshSpin((value) => value + 1);
          void loadOverview();
        }}
        refreshSpin={refreshSpin}
      />

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
                <AdminEmptyState body="Rooms appear when riders create and stage group rides." heading="No active rooms" icon={<RoadGlyph />} minHeight={180} />
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
                <AdminEmptyState body="SOS, hazard, fuel, and connectivity issues surface here." heading="No active incidents" icon={<CheckGlyph />} minHeight={180} />
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
                <AdminEmptyState body="Flags appear as beta usage grows." heading="Queue clear" icon={<ShieldCheckGlyph />} minHeight={140} />
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
                  <AdminEmptyState body="Diagnostic events will accumulate here as rooms and recovery flows are exercised." heading="Diagnostics are quiet" icon={<CheckGlyph />} minHeight={200} />
                )}
              </div>
            </PanelCard>
          </motion.div>
        </section>

        <AdminConsoleFooter />
      </main>
    </div>
  );
}
