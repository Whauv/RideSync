import { RideMessage, RideRoom, RiderPresence } from "@/types/domain";

const riders: RiderPresence[] = [
  {
    id: "r1",
    name: "Maya",
    role: "leader",
    bike: "BMW R 1250 GS",
    speedMph: 68,
    headingDeg: 102,
    status: "rolling",
    isTalking: true,
    hasMusicSync: true,
    batteryPct: 76,
    lat: 39.7392,
    lng: -104.9903
  },
  {
    id: "r2",
    name: "Jon",
    role: "tail",
    bike: "Yamaha Tenere 700",
    speedMph: 64,
    headingDeg: 104,
    status: "rolling",
    isTalking: false,
    hasMusicSync: true,
    batteryPct: 52,
    lat: 39.7298,
    lng: -104.9725
  },
  {
    id: "r3",
    name: "Priya",
    role: "rider",
    bike: "Honda Africa Twin",
    speedMph: 66,
    headingDeg: 99,
    status: "fuel",
    isTalking: false,
    hasMusicSync: false,
    batteryPct: 61,
    lat: 39.7457,
    lng: -104.9647
  }
];

const room: RideRoom = {
  id: "room-1",
  code: "A7Q9K",
  title: "Front Range Run",
  destination: "Nederland Loop",
  leaderId: "r1",
  startedAt: "06:15",
  riderCount: 12,
  voiceProvider: "livekit",
  musicTrack: "Northern Pass",
  etaMinutes: 42
};

const messages: RideMessage[] = [
  {
    id: "m1",
    senderId: "r1",
    senderName: "Maya",
    sentAt: "08:12",
    kind: "system",
    body: "Leader shifted regroup point to mile marker 18."
  },
  {
    id: "m2",
    senderId: "r2",
    senderName: "Jon",
    sentAt: "08:14",
    kind: "ping",
    body: "Tail confirms full pack is rolling."
  },
  {
    id: "m3",
    senderId: "r3",
    senderName: "Priya",
    sentAt: "08:15",
    kind: "message",
    body: "Fuel light on. Good for 28 miles."
  }
];

export async function fetchRoomSnapshot() {
  return {
    room,
    riders,
    messages
  };
}
