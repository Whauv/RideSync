import { useQuery } from "@tanstack/react-query";

import { fetchRoomSnapshot } from "@/services/mockRideService";

export function useRoomSnapshot() {
  return useQuery({
    queryKey: ["room-snapshot"],
    queryFn: fetchRoomSnapshot
  });
}
