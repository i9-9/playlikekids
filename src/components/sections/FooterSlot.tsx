"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FooterSlotContextValue = {
  center: ReactNode;
  setCenter: (node: ReactNode) => void;
};

const FooterSlotContext = createContext<FooterSlotContextValue | null>(null);

export function FooterSlotProvider({ children }: { children: ReactNode }) {
  const [center, setCenter] = useState<ReactNode>(null);
  const value = useMemo(() => ({ center, setCenter }), [center]);

  return (
    <FooterSlotContext.Provider value={value}>
      {children}
    </FooterSlotContext.Provider>
  );
}

export function useFooterSlot(): FooterSlotContextValue {
  const ctx = useContext(FooterSlotContext);
  if (!ctx) {
    throw new Error("useFooterSlot must be used within FooterSlotProvider");
  }
  return ctx;
}

/**
 * Portals page-specific footer content (e.g. director nav) into the persistent chrome.
 */
export function FooterCenter({ children }: { children: ReactNode }) {
  const { setCenter } = useFooterSlot();

  useLayoutEffect(() => {
    setCenter(children);
    return () => setCenter(null);
  }, [children, setCenter]);

  return null;
}
