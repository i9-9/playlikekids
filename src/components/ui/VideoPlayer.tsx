"use client";

import Player from "@vimeo/player";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { toVimeoEmbedUrl } from "@/lib/vimeo/thumbnail";

const EASE = [0.76, 0, 0.24, 1] as const;
const IDLE_MS = 2400;
const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const SEEK_STEP = 5;
const SEEK_STEP_LONG = 10;

type DocPiP = {
  requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
};

function getDocPiP(): DocPiP | null {
  return (
    (window as Window & { documentPictureInPicture?: DocPiP }).documentPictureInPicture ??
    null
  );
}

function copyStylesTo(target: Document) {
  for (const node of document.querySelectorAll("link[rel='stylesheet'], style")) {
    target.head.appendChild(node.cloneNode(true));
  }
  try {
    target.adoptedStyleSheets = [...document.adoptedStyleSheets];
  } catch {
    /* ignore */
  }
}

type VideoPlayerProps = {
  videoId: string;
  privacyHash?: string | null;
  thumbnailUrl: string;
  title?: string;
  autoplay?: boolean;
  playable?: boolean;
  overlay?: ReactNode;
  sizes?: string;
  className: string;
  layoutId?: string;
  layoutTransition?: Transition;
  onLayoutAnimationComplete?: () => void;
};

export function VideoPlayer({
  videoId,
  privacyHash,
  thumbnailUrl,
  title,
  autoplay = false,
  playable = false,
  overlay,
  sizes = "(max-width: 768px) 100vw, 70vw",
  className,
  layoutId,
  layoutTransition,
  onLayoutAnimationComplete,
}: VideoPlayerProps) {
  const reduced = useReducedMotion();
  const fadeDuration = reduced ? 0 : 0.28;
  const posterHoldMs = reduced ? 0 : 200;
  const label = title ?? "Film";

  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const idleRef = useRef<number>(0);
  const clickTimerRef = useRef<number>(0);
  const scrubbingRef = useRef(false);

  const [started, setStarted] = useState(autoplay);
  const [posterVisible, setPosterVisible] = useState(true);
  const [paused, setPaused] = useState(!autoplay);
  const [ended, setEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(autoplay);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [pip, setPip] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [hideVolume, setHideVolume] = useState(false);

  const playing = started && !paused && !ended;
  const showChrome = started && (chrome || paused || ended || speedOpen);

  const begin = useCallback(() => {
    if (started) return;
    setStarted(true);
  }, [started]);

  useEffect(() => {
    setStarted(autoplay);
    setPaused(!autoplay);
    setMuted(autoplay);
    setEnded(false);
    setCurrentTime(0);
    setDuration(0);
    setBufferedEnd(0);
    setRate(1);
    setSpeedOpen(false);
    setPosterVisible(true);
    setChrome(true);
    pipWindowRef.current?.close();
    pipWindowRef.current = null;
    setPip(false);
  }, [videoId, autoplay]);

  useEffect(() => {
    setPosterVisible(true);
    if (!started) return;
    const id = window.setTimeout(() => setPosterVisible(false), posterHoldMs);
    return () => window.clearTimeout(id);
  }, [started, videoId, posterHoldMs]);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const iOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setHideVolume(coarse || iOS);
  }, []);

  useLayoutEffect(() => {
    if (!started || !iframeRef.current) return;

    const player = new Player(iframeRef.current);
    playerRef.current = player;
    let cancelled = false;

    const onPlay = () => {
      setPaused(false);
      setEnded(false);
    };
    const onPause = () => setPaused(true);
    const onEnded = () => {
      setEnded(true);
      setPaused(true);
      setChrome(true);
    };
    const onTime = (data: { seconds: number; duration: number }) => {
      if (scrubbingRef.current) return;
      setCurrentTime(data.seconds);
      if (data.duration) setDuration(data.duration);
    };
    const onProgress = (data: { seconds: number }) => setBufferedEnd(data.seconds);
    const onVolume = (data: { volume: number; muted: boolean }) => {
      setVolume(data.volume);
      setMuted(data.muted);
    };
    const onRate = (data: { playbackRate: number }) => setRate(data.playbackRate);
    const onFsChange = (data: { fullscreen: boolean }) =>
      setFullscreen(data.fullscreen);

    player.on("play", onPlay);
    player.on("pause", onPause);
    player.on("ended", onEnded);
    player.on("timeupdate", onTime);
    player.on("progress", onProgress);
    player.on("volumechange", onVolume);
    player.on("playbackratechange", onRate);
    player.on("fullscreenchange", onFsChange);

    void player.ready().then(async () => {
      if (cancelled) return;
      try {
        await player.setMuted(true);
        if (await player.getPaused()) await player.play();
      } catch {
        if (!cancelled) setPaused(true);
      }
      if (cancelled) return;
      const [nextDuration, nextPaused, nextMuted, nextVolume, nextRate] =
        await Promise.all([
          player.getDuration(),
          player.getPaused(),
          player.getMuted(),
          player.getVolume(),
          player.getPlaybackRate(),
        ]);
      if (cancelled) return;
      setDuration(nextDuration);
      setPaused(nextPaused);
      setMuted(nextMuted);
      setVolume(nextVolume);
      setRate(nextRate);
    });

    return () => {
      cancelled = true;
      player.off("play", onPlay);
      player.off("pause", onPause);
      player.off("ended", onEnded);
      player.off("timeupdate", onTime);
      player.off("progress", onProgress);
      player.off("volumechange", onVolume);
      player.off("playbackratechange", onRate);
      player.off("fullscreenchange", onFsChange);
      playerRef.current = null;
      const iframe = iframeRef.current;
      window.setTimeout(() => {
        // destroy() removes the iframe from the DOM. Skip it while React
        // still owns that node (Strict Mode remounts in the same tick).
        if (iframeRef.current === iframe && iframe?.isConnected) return;
        void player.destroy().catch(() => undefined);
      }, 0);
    };
  }, [started, videoId]);

  const bumpChrome = useCallback(() => {
    setChrome(true);
    window.clearTimeout(idleRef.current);
    idleRef.current = window.setTimeout(() => {
      if (scrubbingRef.current) return;
      setSpeedOpen(false);
      setChrome(false);
    }, IDLE_MS);
  }, []);

  useEffect(() => {
    if (!started || paused || ended || speedOpen) {
      window.clearTimeout(idleRef.current);
      setChrome(true);
      return;
    }
    bumpChrome();
    return () => window.clearTimeout(idleRef.current);
  }, [started, paused, ended, speedOpen, bumpChrome]);

  useEffect(() => {
    const onFs = () =>
      setFullscreen(Boolean(document.fullscreenElement === rootRef.current));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(idleRef.current);
      window.clearTimeout(clickTimerRef.current);
      pipWindowRef.current?.close();
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;

    const pipWindow = pipWindowRef.current;
    if (pipWindow && !pipWindow.closed) {
      if (root.parentNode !== pipWindow.document.body) {
        pipWindow.document.body.appendChild(root);
      }
      return;
    }

    if (pip) {
      if (root.parentNode !== document.body) {
        document.body.appendChild(root);
      }
      return;
    }

    if (root.parentNode !== host) {
      host.appendChild(root);
    }
  }, [pip]);

  const togglePlay = useCallback(async () => {
    const player = playerRef.current;
    if (!player) {
      begin();
      return;
    }
    if (ended) {
      await player.setCurrentTime(0);
      await player.play();
      return;
    }
    const isPaused = await player.getPaused();
    if (isPaused) await player.play();
    else await player.pause();
  }, [begin, ended]);

  const seekTo = useCallback(async (seconds: number) => {
    const player = playerRef.current;
    if (!player || !duration) return;
    const next = Math.min(duration, Math.max(0, seconds));
    setCurrentTime(next);
    await player.setCurrentTime(next);
    if (ended && next < duration) setEnded(false);
  }, [duration, ended]);

  const seekBy = useCallback(
    (delta: number) => {
      void seekTo(currentTime + delta);
    },
    [currentTime, seekTo],
  );

  const toggleMute = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;
    await player.setMuted(!muted);
  }, [muted]);

  const changeVolume = useCallback(async (next: number) => {
    const player = playerRef.current;
    if (!player) return;
    const value = Math.min(1, Math.max(0, next));
    setVolume(value);
    if (value > 0 && muted) await player.setMuted(false);
    await player.setVolume(value);
  }, [muted]);

  const changeRate = useCallback(async (next: number) => {
    const player = playerRef.current;
    if (!player) return;
    await player.setPlaybackRate(next);
    setSpeedOpen(false);
  }, []);

  const togglePip = useCallback(() => {
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
      return;
    }
    if (pip) {
      setPip(false);
      return;
    }

    const root = rootRef.current;
    const docPip = getDocPiP();
    if (docPip && root) {
      void docPip
        .requestWindow({
          width: Math.max(400, Math.round(root.clientWidth)),
          height: Math.max(225, Math.round(root.clientHeight)),
        })
        .then((pipWindow) => {
          copyStylesTo(pipWindow.document);
          pipWindow.document.documentElement.style.height = "100%";
          pipWindow.document.body.style.margin = "0";
          pipWindow.document.body.style.height = "100%";
          pipWindow.document.body.style.background = "#000";
          pipWindow.document.body.appendChild(root);
          pipWindowRef.current = pipWindow;
          pipWindow.addEventListener("pagehide", () => {
            pipWindowRef.current = null;
            const host = hostRef.current;
            if (host && rootRef.current && rootRef.current.parentNode !== host) {
              host.appendChild(rootRef.current);
            }
            setPip(false);
          });
          setPip(true);
        })
        .catch(() => setPip(true));
      return;
    }

    setPip(true);
  }, [pip]);

  const toggleFullscreen = useCallback(async () => {
    const root = rootRef.current;
    const player = playerRef.current;
    if (!root) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await root.requestFullscreen();
    } catch {
      if (!player) return;
      const active = await player.getFullscreen();
      if (active) await player.exitFullscreen();
      else await player.requestFullscreen();
    }
  }, []);

  const onStageClick = () => {
    if (!started) {
      if (playable) begin();
      return;
    }
    bumpChrome();
    if (speedOpen) {
      setSpeedOpen(false);
      return;
    }
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = 0;
      void toggleFullscreen();
      return;
    }
    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = 0;
      if (!showChrome && playing) {
        setChrome(true);
        return;
      }
      void togglePlay();
    }, 220);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!started && (event.key === " " || event.key === "Enter" || event.key === "k")) {
      event.preventDefault();
      begin();
      return;
    }
    if (!started) return;

    const key = event.key;
    if (key === " " || key === "k" || key === "K") {
      event.preventDefault();
      void togglePlay();
    } else if (key === "ArrowLeft") {
      event.preventDefault();
      seekBy(-SEEK_STEP);
    } else if (key === "ArrowRight") {
      event.preventDefault();
      seekBy(SEEK_STEP);
    } else if (key === "j" || key === "J") {
      seekBy(-SEEK_STEP_LONG);
    } else if (key === "l" || key === "L") {
      seekBy(SEEK_STEP_LONG);
    } else if (key === "ArrowUp") {
      event.preventDefault();
      void changeVolume(volume + 0.05);
    } else if (key === "ArrowDown") {
      event.preventDefault();
      void changeVolume(volume - 0.05);
    } else if (key === "m" || key === "M") {
      void toggleMute();
    } else if (key === "f" || key === "F") {
      void toggleFullscreen();
    } else if (key === "Home") {
      event.preventDefault();
      void seekTo(0);
    } else if (key === "End") {
      event.preventDefault();
      void seekTo(duration);
    } else if (/^[0-9]$/.test(key) && duration) {
      void seekTo((Number(key) / 10) * duration);
    } else if (key === "Escape") {
      setSpeedOpen(false);
    }
    bumpChrome();
  };

  const remaining = Math.max(0, duration - currentTime);
  const progress = duration ? currentTime / duration : 0;
  const buffered = duration ? bufferedEnd / duration : 0;
  const volumeLevel = muted ? 0 : volume;

  const onScrubPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bar = event.currentTarget;
    bar.setPointerCapture(event.pointerId);
    scrubbingRef.current = true;
    const update = (clientX: number) => {
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      setCurrentTime(ratio * duration);
    };
    update(event.clientX);

    const onMove = (move: PointerEvent) => update(move.clientX);
    const onUp = (up: PointerEvent) => {
      bar.releasePointerCapture(up.pointerId);
      scrubbingRef.current = false;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (up.clientX - rect.left) / rect.width));
      void seekTo(ratio * duration);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      bumpChrome();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onVolumePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const bar = event.currentTarget;
    bar.setPointerCapture(event.pointerId);
    const pad = 5;
    const apply = (clientX: number) => {
      const rect = bar.getBoundingClientRect();
      const usable = Math.max(1, rect.width - pad * 2);
      void changeVolume((clientX - rect.left - pad) / usable);
    };
    apply(event.clientX);

    const onMove = (move: PointerEvent) => apply(move.clientX);
    const onUp = (up: PointerEvent) => {
      bar.releasePointerCapture(up.pointerId);
      apply(up.clientX);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      bumpChrome();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const poster = (
    <AnimatePresence mode="sync" initial={false}>
      {posterVisible ? (
        <motion.div
          key={videoId || thumbnailUrl}
          className="pointer-events-none absolute inset-0 z-[2]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeDuration, ease: EASE }}
        >
          <Image
            src={thumbnailUrl}
            alt={label}
            fill
            sizes={sizes}
            className="object-cover"
            unoptimized
          />
          {overlay}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const windowPip = Boolean(pipWindowRef.current && !pipWindowRef.current.closed);
  const floatPip = pip && !windowPip;

  return (
    <div ref={hostRef} className={pip ? className : undefined}>
    <motion.div
      ref={rootRef}
      layoutId={layoutId}
      transition={layoutTransition}
      onLayoutAnimationComplete={onLayoutAnimationComplete}
      className={`${className} group/player bg-black outline-none ${
        !started && playable ? "cursor-pointer" : ""
      } ${started && !showChrome && playing ? "cursor-none" : ""}`}
      style={
        windowPip
          ? { width: "100%", height: "100%", aspectRatio: "auto" }
          : floatPip
            ? {
                position: "fixed",
                right: 16,
                bottom: 16,
                zIndex: 80,
                width: "min(22rem, calc(100vw - 2rem))",
                aspectRatio: "16 / 9",
              }
            : undefined
      }
      tabIndex={0}
      role="region"
      aria-label={label}
      onKeyDown={onKeyDown}
      onMouseMove={bumpChrome}
      onPointerDown={bumpChrome}
    >
      {started ? (
        <iframe
          ref={iframeRef}
          key={videoId}
          src={toVimeoEmbedUrl(videoId, privacyHash, {
            autoplay: true,
            controls: false,
          })}
          title={label}
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : null}

      <button
        type="button"
        className="absolute inset-0 z-[1] cursor-inherit"
        aria-label={
          !started ? `Play ${label}` : paused ? `Play ${label}` : `Pause ${label}`
        }
        onClick={onStageClick}
      />

      {started ? (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-black/75 via-black/25 to-transparent pt-16 transition-opacity duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            showChrome ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={!showChrome}
        >
        <div
          className={`pointer-events-auto flex items-center gap-2 px-3 pb-2.5 md:gap-3 md:px-4 md:pb-3 ${
            showChrome ? "" : "pointer-events-none"
          }`}
        >
          <ControlButton
            label={ended ? "Replay" : paused ? "Play" : "Pause"}
            onClick={() => void togglePlay()}
          >
            {paused || ended ? <PlayIcon /> : <PauseIcon />}
          </ControlButton>

          <Time>{formatTime(currentTime)}</Time>

          <div
            className="group/bar relative mx-1 flex h-7 min-w-0 flex-1 cursor-pointer items-center"
            onPointerDown={onScrubPointer}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={currentTime}
            aria-valuetext={formatTime(currentTime)}
            tabIndex={0}
          >
            <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="absolute inset-y-0 left-0 bg-white/35"
                style={{ width: `${buffered * 100}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-white"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-sm transition-opacity duration-150 group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100"
              style={{ left: `${progress * 100}%` }}
            />
          </div>

          <Time>−{formatTime(remaining)}</Time>

          {hideVolume ? null : (
            <div className="group/vol flex h-8 items-center">
              <ControlButton
                label={muted || volume === 0 ? "Unmute" : "Mute"}
                onClick={() => void toggleMute()}
              >
                {muted || volume === 0 ? (
                  <SpeakerOffIcon />
                ) : volume < 0.5 ? (
                  <SpeakerLowIcon />
                ) : (
                  <SpeakerIcon />
                )}
              </ControlButton>
              <div className="w-0 overflow-hidden opacity-0 transition-[width,opacity] duration-200 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/vol:w-[3.25rem] group-hover/vol:opacity-100 group-focus-within/vol:w-[3.25rem] group-focus-within/vol:opacity-100">
                <div
                  className="relative ml-1 h-8 w-12 cursor-pointer"
                  onPointerDown={onVolumePointer}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                      event.preventDefault();
                      event.stopPropagation();
                      void changeVolume(volume - 0.05);
                    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                      event.preventDefault();
                      event.stopPropagation();
                      void changeVolume(volume + 0.05);
                    }
                  }}
                  role="slider"
                  aria-label="Volume"
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={volumeLevel}
                  aria-valuetext={`${Math.round(volumeLevel * 100)}%`}
                  tabIndex={0}
                >
                  <div className="absolute inset-x-[5px] top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/25">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      style={{ width: `${volumeLevel * 100}%` }}
                    />
                  </div>
                  <div
                    className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                    style={{
                      left: `calc(5px + ${volumeLevel} * (100% - 10px))`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <ControlButton
              label="Playback speed"
              onClick={() => setSpeedOpen((open) => !open)}
            >
              <span className="min-w-[1.75rem] text-center font-roboto text-[11px] font-medium tabular-nums tracking-wide">
                {formatRate(rate)}
              </span>
            </ControlButton>
            {speedOpen ? (
              <div
                role="menu"
                aria-label="Playback speed"
                className="absolute bottom-[calc(100%+0.4rem)] right-0 flex flex-col overflow-hidden rounded-md bg-black/80 py-1 shadow-[0_8px_30px_rgba(0,0,0,0.28)] backdrop-blur-md"
              >
                {RATES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={value === rate}
                    onClick={() => void changeRate(value)}
                    className={`px-3 py-1.5 text-left font-roboto text-[11px] tabular-nums tracking-wide text-white transition-opacity ${
                      value === rate ? "opacity-100" : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    {formatRate(value)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <ControlButton
            label={pip ? "Exit picture in picture" : "Picture in picture"}
            onClick={togglePip}
          >
            <PipIcon />
          </ControlButton>

          <ControlButton
            label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={() => void toggleFullscreen()}
          >
            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </ControlButton>
        </div>
        </div>
      ) : null}

      {poster}
    </motion.div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 shrink-0 items-center justify-center text-white/90 transition-opacity duration-200 hover:text-white ${className}`}
    >
      {children}
    </button>
  );
}

function Time({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 font-roboto text-[11px] font-medium tabular-nums tracking-wide text-white/90">
      {children}
    </span>
  );
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

function formatRate(rate: number): string {
  return rate === 1 ? "1×" : `${String(rate).replace(/\.0$/, "")}×`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] fill-current" aria-hidden>
      <path d="M8.2 5.4v13.2L19.4 12 8.2 5.4z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] fill-current" aria-hidden>
      <rect x="6.5" y="5.5" width="4" height="13" rx="0.6" />
      <rect x="13.5" y="5.5" width="4" height="13" rx="0.6" />
    </svg>
  );
}

function SpeakerGlyph({
  waves = 2,
  muted = false,
}: {
  waves?: 0 | 1 | 2;
  muted?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path
        d="M4.4 9.15h3L11.5 5.9v12.2l-4.1-3.25H4.4V9.15z"
        className="fill-current stroke-current"
        strokeWidth="0.9"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {muted ? (
        <path
          d="M14.55 8.55 20.45 15.45M20.45 8.55 14.55 15.45"
          className="fill-none stroke-current"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <>
          {waves >= 1 ? (
            <path
              d="M14.35 9.2q2.7 2.8 0 5.6"
              className="fill-none stroke-current"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ) : null}
          {waves >= 2 ? (
            <path
              d="M17.15 6.9q4.55 5.1 0 10.2"
              className="fill-none stroke-current"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ) : null}
        </>
      )}
    </svg>
  );
}

function SpeakerIcon() {
  return <SpeakerGlyph waves={2} />;
}

function SpeakerLowIcon() {
  return <SpeakerGlyph waves={1} />;
}

function SpeakerOffIcon() {
  return <SpeakerGlyph muted />;
}

function PipIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.4" strokeWidth="1.5" />
      <rect x="12" y="11.2" width="6.8" height="5.2" rx="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current" aria-hidden>
      <path d="M8 5.5H5.5V8M16 5.5h2.5V8M8 18.5H5.5V16M16 18.5h2.5V16" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

function FullscreenExitIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current" aria-hidden>
      <path d="M8 8H5.5M8 8V5.5M16 8h2.5M16 8V5.5M8 16H5.5M8 16v2.5M16 16h2.5M16 16v2.5" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
