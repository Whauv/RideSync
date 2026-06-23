const mockAsyncStorageState = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async (key: string) => mockAsyncStorageState.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockAsyncStorageState.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockAsyncStorageState.delete(key);
  }),
  clear: jest.fn(async () => {
    mockAsyncStorageState.clear();
  })
}));

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("notification-id"),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, status: "granted", canAskAgain: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, status: "granted", canAskAgain: true }),
  AndroidNotificationPriority: { MAX: "max" },
  AndroidImportance: { MAX: 5, HIGH: 4 },
  AndroidNotificationVisibility: { PUBLIC: 1 }
}));

jest.mock("expo-constants", () => ({
  expoConfig: {
    version: "0.1.0",
    extra: {}
  }
}));

jest.mock("expo-linking", () => ({
  createURL: jest.fn((path: string, options?: { queryParams?: Record<string, string> }) => {
    const code = options?.queryParams?.code ? `?code=${options.queryParams.code}` : "";
    return `ridesync://${path}${code}`;
  })
}));
