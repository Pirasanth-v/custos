import { create } from "zustand";

type ThemeStore = {
  isDark: boolean;
  toggle: () => void;
};

// check localStorage first, fall back to system preference
const getInitialTheme = (): boolean => {
  const saved = localStorage.getItem("theme");
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const useThemeStore = create<ThemeStore>((set, get) => ({
  isDark: getInitialTheme(),
  toggle: () => {
    const newValue = !get().isDark;
    set({ isDark: newValue });
    document.documentElement.classList.toggle("dark", newValue);
    localStorage.setItem("theme", newValue ? "dark" : "light");
  },
}));

export default useThemeStore;
