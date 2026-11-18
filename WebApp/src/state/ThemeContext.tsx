import { createContext, useContext } from 'react';
import type { Theme } from './useTheme';

export const ThemeContext = createContext<Theme>('dark');

/** Reads the active theme without prop-drilling — used by anything (like signalColor) that needs
 * to pick a theme-appropriate color at render time. */
export function useCurrentTheme(): Theme {
  return useContext(ThemeContext);
}
