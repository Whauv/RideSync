import { tokens } from "@/design/tokens";

/** Static copy and data for the marketing page sections. */

const palette = tokens.marketing.color;

export const trustItems = [
  "Hardware-free voice",
  "Works with any Bluetooth headset",
  "Live GPS across the full group",
  "Web-first, mobile-native",
  "No subscription required for beta"
];

export const lifecycleStages = [
  { name: "Plan", description: "Set the route, timing, and stop plan before anyone leaves the garage." },
  { name: "Gather", description: "Approve riders, check readiness, and bring everyone into one room." },
  { name: "Voice", description: "Lock in the live channel so the pack can talk without setup friction." },
  { name: "Ride", description: "Track spacing, heading, and movement with one shared live read." },
  { name: "Handle", description: "Signal hazards, pull-overs, and incidents without breaking focus." },
  { name: "Review", description: "Replay the ride, inspect events, and tighten the next departure." }
];

export const microCallouts = [
  { value: "~1", suffix: "s", label: "LOCATION UPDATE\nINTERVAL" },
  { value: "360", suffix: "°", label: "HEADING\nPER RIDER" },
  { value: "8", suffix: "+", label: "RIDERS\nPER ROOM" },
  { value: "Live", suffix: "", label: "ROUTE\nRECALCULATION" }
];

export const voiceRows = [
  {
    title: "Voice room",
    body: "Talk to the group through your helmet. Any Bluetooth headset, no pairing required between riders.",
    stat: "< 80ms"
  },
  {
    title: "Quick signals",
    body: "Pull over, fuel stop, hazard, all good. One tap, everyone informed, nobody distracted.",
    stat: "8 signals"
  },
  {
    title: "Group music",
    body: "Leader queues the soundtrack. Every rider hears it through their own audio channel.",
    stat: "sync'd"
  }
];

export const safetyCells = [
  {
    label: "CRASH DETECTION",
    heading: "Impact events trigger a 30-second countdown",
    body: "Riders cancel if they're fine. Group gets notified automatically if they don't.",
    color: palette.accent
  },
  {
    label: "STRAGGLER ALERT",
    heading: "Group leader notified when a rider falls behind",
    body: "Configurable distance threshold. Auto-ping before the gap becomes a safety issue.",
    color: palette.stateCaution
  },
  {
    label: "FUEL COORDINATION",
    heading: "Shortest range in the group sets the stop",
    body: "Everyone enters their tank level. The app finds the stop before someone runs out.",
    color: palette.accent
  },
  {
    label: "SOS ESCALATION",
    heading: "One button, group alert, emergency contacts notified",
    body: "Countdown to cancel. If unanswered, location is sent to pre-set emergency contacts.",
    color: palette.stateEmergency
  },
  {
    label: "RECONNECT LOGIC",
    heading: "Dropped signal doesn't drop the rider",
    body: "Auto-rejoin to voice, location, and room state. Last known position stays visible to the group.",
    color: palette.stateSync
  },
  {
    label: "BATTERY AWARE",
    heading: "GPS cadence adapts to save power on long rides",
    body: "Switchable from 1-second to 5-second updates. Keeps the group visible without draining the phone.",
    color: palette.accent
  }
];

export const planningCapabilities = [
  "Pre-ride route briefing and waypoints",
  "Lobby staging with rider approval",
  "Desktop live map monitoring",
  "Incident and SOS moderation console",
  "Post-ride diagnostics and replay"
];

export const sectionIds = ["product", "lifecycle", "map", "voice", "safety", "planning"] as const;
export type SectionId = (typeof sectionIds)[number];
