import { THEME } from "@/context/themeContext";

export type THEME_DATA = {
  id: number;
  name: THEME;
  title: string;
  description: string;
  background: string;
  "board-light": string;
  "board-dark": string;
  accent: string;
};

export const THEMES_DATA: THEME_DATA[] = [
  {
    id: 1,
    name: "cyber",
    title: "Cyberpunk Violet",
    description: "High-contrast dark obsidian with electric neon violet accents",
    background: "#0b0d19",
    "board-light": "#e0e7ff",
    "board-dark": "#6366f1",
    accent: "#818cf8"
  },
  {
    id: 2,
    name: "default",
    title: "Tournament Emerald",
    description: "Classic tournament green with warm ivory squares",
    background: "#0c1512",
    "board-light": "#ebecd0",
    "board-dark": "#739552",
    accent: "#10b981"
  },
  {
    id: 3,
    name: "midnight",
    title: "Midnight Sapphire",
    description: "Deep oceanic blue and crisp polar white contrast",
    background: "#080e1e",
    "board-light": "#e2e8f0",
    "board-dark": "#2563eb",
    accent: "#38bdf8"
  },
  {
    id: 4,
    name: "pink",
    title: "Neon Sakura",
    description: "Vibrant synthwave pink with soft quartz white",
    background: "#180d19",
    "board-light": "#fff1f2",
    "board-dark": "#e11d48",
    accent: "#f43f5e"
  },
  {
    id: 5,
    name: "classic",
    title: "Grandmaster Walnut",
    description: "Warm traditional birch and rich stained walnut",
    background: "#14110d",
    "board-light": "#f0d9b5",
    "board-dark": "#b58863",
    accent: "#f59e0b"
  }
];
