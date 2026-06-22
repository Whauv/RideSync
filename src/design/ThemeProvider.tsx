import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { Appearance } from "react-native";

import { AppTheme, darkTheme, lightTheme } from "@/design/theme";
import { useAppStore } from "@/store/useAppStore";

const ThemeContext = createContext<AppTheme>(darkTheme);

export function ThemeProvider({ children }: PropsWithChildren) {
  const preferredMode = useAppStore((state) => state.themeMode);
  const systemMode = Appearance.getColorScheme() ?? "dark";
  const theme = useMemo(() => {
    const resolvedMode = preferredMode === "system" ? systemMode : preferredMode;
    return resolvedMode === "light" ? lightTheme : darkTheme;
  }, [preferredMode, systemMode]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
