import { SkeletonLine } from "@/components/admin/SkeletonShimmer";

import { logSkeletonRowStyle, roomSkeletonRowStyle } from "./adminConsoleStyles";

export function RoomRowsSkeleton() {
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

export function LogRowsSkeleton() {
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
