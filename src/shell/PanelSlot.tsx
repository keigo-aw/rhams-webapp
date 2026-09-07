import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const PanelSlotContext = createContext<HTMLDivElement | null>(null);
export const PanelSlotProvider = PanelSlotContext.Provider;

/** Renders its children into the right panel's mount point, wherever in the tree it's used. */
export function PanelPortal({ children }: { children: ReactNode }) {
  const node = useContext(PanelSlotContext);
  if (!node) return null;
  return createPortal(children, node);
}
