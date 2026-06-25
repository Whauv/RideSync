import type { CSSProperties } from "react";

const noiseSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.9"/>
      </feComponentTransfer>
    </filter>
    <rect width="240" height="240" filter="url(#n)" opacity="0.9"/>
  </svg>
`);

export function NoiseOverlay({ opacity = 0.022 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        opacity,
        backgroundImage: `url("data:image/svg+xml,${noiseSvg}")`,
        backgroundSize: "240px 240px",
        mixBlendMode: "screen"
      }}
    />
  );
}

export const sectionContentStyle: CSSProperties = {
  position: "relative",
  zIndex: 2
};
