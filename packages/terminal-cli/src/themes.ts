export interface ThemeColors {
  background: string;
  foreground: string;
  border: string;
  tabActive: string;
  tabInactive: string;
  cursor: string;
  selection: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
}

const themes: Record<string, Theme> = {
  dark: {
    name: "dark",
    colors: {
      background: "#1a1a1a",
      foreground: "#e0e0e0",
      border: "#3a3a3a",
      tabActive: "#4a90e2",
      tabInactive: "#2a2a2a",
      cursor: "#00ff00",
      selection: "#3a5a7a",
    },
  },
  nord: {
    name: "nord",
    colors: {
      background: "#2e3440",
      foreground: "#d8dee9",
      border: "#4c566a",
      tabActive: "#88c0d0",
      tabInactive: "#3b4252",
      cursor: "#88c0d0",
      selection: "#434c5e",
    },
  },
  matrix: {
    name: "matrix",
    colors: {
      background: "#000000",
      foreground: "#00ff00",
      border: "#00aa00",
      tabActive: "#00ff00",
      tabInactive: "#003300",
      cursor: "#00ff00",
      selection: "#004400",
    },
  },
  dracula: {
    name: "dracula",
    colors: {
      background: "#282a36",
      foreground: "#f8f8f2",
      border: "#6272a4",
      tabActive: "#bd93f9",
      tabInactive: "#44475a",
      cursor: "#ff79c6",
      selection: "#44475a",
    },
  },
};

export function getTheme(name: string): Theme {
  return themes[name] ?? themes["dark"]!;
}

export function getThemeNames(): string[] {
  return Object.keys(themes);
}

export function getNextTheme(currentName: string): string {
  const names = getThemeNames();
  const currentIndex = names.indexOf(currentName);
  const nextIndex = (currentIndex + 1) % names.length;
  return names[nextIndex]!;
}
