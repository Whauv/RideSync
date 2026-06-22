import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";

import { AppTheme, createNavigationTheme, getAppTheme } from "@/design/theme";
import { useAppStore } from "@/store/useAppStore";

const ThemeContext = createContext<AppTheme>(getAppTheme("dark"));

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme() ?? "dark";
  const preferredMode = useAppStore((state) => state.themeMode);
  const resolvedMode = preferredMode === "system" ? systemMode : preferredMode;
  const theme = useMemo(() => getAppTheme(resolvedMode), [resolvedMode]);
  const navigationTheme = useMemo(() => createNavigationTheme(theme), [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
