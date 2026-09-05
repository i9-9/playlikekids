"use client";

import { createContext, useContext } from "react";

export const CLOSE_DIRECTOR_PLAYER_EVENT = "playlikekids:close-director-player";

type DirectorPlayerChrome = {
  setPlayerOpen: (open: boolean) => void;
};

const DirectorPlayerChromeContext = createContext<DirectorPlayerChrome | null>(
  null,
);

export const DirectorPlayerChromeProvider = DirectorPlayerChromeContext.Provider;

export function useDirectorPlayerChrome() {
  return useContext(DirectorPlayerChromeContext);
}
