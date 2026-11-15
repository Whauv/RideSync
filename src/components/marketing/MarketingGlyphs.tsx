import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;

export function VoiceGlyph() {
  return (
    <svg height="28" viewBox="0 0 40 28" width="40">
      <path d="M10 10C10 6 13 4 16 4C19 4 22 6 22 10V14C22 18 19 20 16 20C13 20 10 18 10 14V10Z" fill="none" stroke={palette.textSecondary} strokeWidth="1.2" />
      <path d="M26 8C29 10 30 13 30 16C30 19 29 22 26 24" fill="none" stroke={palette.textSecondary} strokeWidth="1.2" />
    </svg>
  );
}

export function SignalGlyph() {
  return (
    <svg height="28" viewBox="0 0 40 28" width="40">
      <path d="M6 22L16 10L24 16L34 6" fill="none" stroke={palette.textSecondary} strokeWidth="1.2" />
      <circle cx="6" cy="22" fill={palette.accent} r="2.5" />
      <circle cx="24" cy="16" fill={palette.textSecondary} r="2.5" />
    </svg>
  );
}

export function MusicGlyph() {
  return (
    <svg height="28" viewBox="0 0 40 28" width="40">
      <path d="M14 8V20" fill="none" stroke={palette.textSecondary} strokeWidth="1.2" />
      <path d="M14 8L28 5V17" fill="none" stroke={palette.textSecondary} strokeWidth="1.2" />
      <circle cx="14" cy="22" fill={palette.accent} r="2.6" />
      <circle cx="28" cy="19" fill={palette.textSecondary} r="2.6" />
    </svg>
  );
}

export function VoiceRowIcon({ title }: { title: string }) {
  if (title === "Voice room") {
    return <VoiceGlyph />;
  }

  if (title === "Quick signals") {
    return <SignalGlyph />;
  }

  return <MusicGlyph />;
}
