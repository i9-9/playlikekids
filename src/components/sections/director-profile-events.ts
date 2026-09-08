"use client";

import { createContext, useContext } from "react";

export const CLOSE_DIRECTOR_PLAYER_EVENT = "playlikekids:close-director-player";
export const CYCLE_DIRECTOR_FILM_EVENT = "playlikekids:cycle-director-film";

export type CycleDirectorFilmDirection = -1 | 1;

export function cycleDirectorFilm(direction: CycleDirectorFilmDirection) {
  window.dispatchEvent(
    new CustomEvent(CYCLE_DIRECTOR_FILM_EVENT, { detail: { direction } }),
  );
}

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
