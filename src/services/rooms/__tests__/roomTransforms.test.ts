import { buildMember, parseJoinValue, sortMembers } from "@/services/rooms/roomTransforms";
import { AuthIdentity, RiderProfile } from "@/types/auth";
import { RoomMember } from "@/types/domain";

const identity: AuthIdentity = {
  uid: "user-1",
  email: "rider@example.com"
};

const profile: RiderProfile = {
  riderName: "Rider One",
  bikeName: "Scout",
  avatarInitials: "R1",
  emergencyContact: { name: "Alex", phone: "3035550000" },
  preferredUnits: "imperial",
  bikeBrand: "",
  intercomBrand: "",
  medicalProfile: {
    bloodType: "",
    allergies: "",
    conditions: "",
    medications: "",
    notes: "",
    shareWithRideLeaders: true
  }
};

describe("parseJoinValue", () => {
  test("extracts a code from an invite link query string", () => {
    expect(parseJoinValue("https://ridesync.app/join?code=ab12c")).toBe("AB12C");
  });

  test("normalizes a bare code and strips punctuation", () => {
    expect(parseJoinValue("  ab-12c ")).toBe("AB12C");
  });

  test("returns an empty string for blank input", () => {
    expect(parseJoinValue("   ")).toBe("");
  });
});

describe("buildMember", () => {
  test("marks leaders ready and going, riders in review and pending", () => {
    const leader = buildMember(identity, profile, "leader", "approved");
    const rider = buildMember(identity, profile, "rider", "pending");

    expect(leader.readiness).toBe("ready");
    expect(leader.rsvpStatus).toBe("going");
    expect(rider.readiness).toBe("review");
    expect(rider.rsvpStatus).toBe("pending");
    expect(rider.approvalStatus).toBe("pending");
  });
});

describe("sortMembers", () => {
  test("orders leader first, then pending, then approved alphabetically", () => {
    const members = [
      { id: "1", riderName: "Zoe", role: "rider", approvalStatus: "approved" },
      { id: "2", riderName: "Mia", role: "leader", approvalStatus: "approved" },
      { id: "3", riderName: "Ben", role: "rider", approvalStatus: "pending" },
      { id: "4", riderName: "Ada", role: "rider", approvalStatus: "approved" }
    ] as unknown as RoomMember[];

    const sorted = sortMembers(members).map((member) => member.riderName);
    expect(sorted).toEqual(["Mia", "Ben", "Ada", "Zoe"]);
  });
});
