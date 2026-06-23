import React from "react";
import renderer from "react-test-renderer";

let mockState = {
  authBootstrapped: false,
  authIdentity: null as null | { uid: string; email: string | null },
  hasSeenOnboarding: false,
  profile: {
    riderName: "",
    bikeName: "",
    avatarInitials: "RS",
    emergencyContact: {
      name: "",
      phone: ""
    },
    preferredUnits: "imperial" as const,
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
  },
  permissions: {
    location: "unknown",
    microphone: "unknown",
    notifications: "unknown",
    audio: "unknown"
  }
};

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    Redirect: ({ href }: { href: string }) => React.createElement("redirect", { href })
  };
});

jest.mock("@/design/ThemeProvider", () => ({
  useTheme: () => ({
    colors: {
      accent: "#0F7D74"
    }
  })
}));

jest.mock("@/store/useAppStore", () => {
  const actual = jest.requireActual("@/store/useAppStore");
  return {
    ...actual,
    useAppStore: (selector: (state: typeof mockState) => unknown) => selector(mockState)
  };
});

import Index from "../index";

describe("root auth gating", () => {
  test("redirects to onboarding when onboarding has not been seen", () => {
    mockState = {
      ...mockState,
      authBootstrapped: true,
      hasSeenOnboarding: false
    };

    const tree = renderer.create(<Index />);
    expect(tree.root.findByProps({ href: "/(auth)" }).props.href).toBe("/(auth)");
  });

  test("redirects to sign-in when auth is missing", () => {
    mockState = {
      ...mockState,
      authBootstrapped: true,
      hasSeenOnboarding: true,
      authIdentity: null
    };

    const tree = renderer.create(<Index />);
    expect(tree.root.findByProps({ href: "/(auth)/sign-in" }).props.href).toBe("/(auth)/sign-in");
  });

  test("redirects to tabs when profile and permissions are ready", () => {
    mockState = {
      ...mockState,
      authBootstrapped: true,
      hasSeenOnboarding: true,
      authIdentity: {
        uid: "user-1",
        email: "rider@example.com"
      },
      profile: {
        ...mockState.profile,
        riderName: "Maya",
        bikeName: "Tenere",
        emergencyContact: {
          name: "Alex",
          phone: "3035551111"
        }
      },
      permissions: {
        location: "granted",
        microphone: "granted",
        notifications: "granted",
        audio: "granted"
      }
    };

    const tree = renderer.create(<Index />);
    expect(tree.root.findByProps({ href: "/(tabs)" }).props.href).toBe("/(tabs)");
  });
});
