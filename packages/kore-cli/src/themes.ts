import type { ThemeDefinition } from "kore-core";

export const DARK_THEME: ThemeDefinition = {
  name: "dark",
  colors: {
    bg: "#0a0a0f",
    bgPanel: "#0f0f1a",
    border: "#1e1e2e",
    borderFocused: "#00ff88",
    textPrimary: "#e0e0e0",
    textDim: "#444466",
    label: "#00ff88",
    barFilled: "#00ff88",
    barWarn: "#ffcc00",
    barAlert: "#ff4444",
    barEmpty: "#1a1a2e",
    sparkline: "#00cc66",
    headerBg: "#0f0f1a",
    headerText: "#00ff88",
  },
  characters: { upChar: "▲", downChar: "▼" },
};

export const NORD_THEME: ThemeDefinition = {
  name: "nord",
  colors: {
    bg: "#2e3440",
    bgPanel: "#3b4252",
    border: "#4c566a",
    borderFocused: "#88c0d0",
    textPrimary: "#eceff4",
    textDim: "#4c566a",
    label: "#88c0d0",
    barFilled: "#a3be8c",
    barWarn: "#ebcb8b",
    barAlert: "#bf616a",
    barEmpty: "#3b4252",
    sparkline: "#8fbcbb",
    headerBg: "#3b4252",
    headerText: "#88c0d0",
  },
  characters: { upChar: "▲", downChar: "▼" },
};

export const MATRIX_THEME: ThemeDefinition = {
  name: "matrix",
  colors: {
    bg: "#000000",
    bgPanel: "#001a00",
    border: "#003300",
    borderFocused: "#00ff00",
    textPrimary: "#00ff00",
    textDim: "#003300",
    label: "#00ff00",
    barFilled: "#00ff00",
    barWarn: "#88ff00",
    barAlert: "#ffff00",
    barEmpty: "#001a00",
    sparkline: "#00cc00",
    headerBg: "#001a00",
    headerText: "#00ff00",
  },
  characters: { upChar: "▲", downChar: "▼" },
};

export const THEMES: Record<string, ThemeDefinition> = {
  dark: DARK_THEME,
  nord: NORD_THEME,
  matrix: MATRIX_THEME,
};

export const DEFAULT_THEME = "dark";

export function getTheme(name: string): ThemeDefinition {
  return THEMES[name] ?? THEMES[DEFAULT_THEME]!;
}

export function getThemeNames(): string[] {
  return Object.keys(THEMES);
}

export function getNextTheme(currentTheme: string): string {
  const names = getThemeNames();
  const currentIndex = names.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % names.length;
  return names[nextIndex]!;
}
