import { hasCorePermissions, deriveInitials, isProfileComplete } from "@/store/useAppStore";

describe("store helpers", () => {
  test("derives initials from multi-part names", () => {
    expect(deriveInitials("Maya Chen")).toBe("MC");
    expect(deriveInitials(" rider ")).toBe("R");
  });

  test("checks profile completeness with medical profile present", () => {
    expect(
      isProfileComplete({
        riderName: "Maya",
        bikeName: "Tenere",
        avatarInitials: "MC",
        emergencyContact: {
          name: "Alex",
          phone: "3035551212"
        },
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
      })
    ).toBe(true);
  });

  test("requires location, mic, and audio permissions", () => {
    expect(
      hasCorePermissions({
        location: "granted",
        microphone: "granted",
        notifications: "denied",
        audio: "granted"
      })
    ).toBe(true);

    expect(
      hasCorePermissions({
        location: "denied",
        microphone: "granted",
        notifications: "granted",
        audio: "granted"
      })
    ).toBe(false);
  });
});
