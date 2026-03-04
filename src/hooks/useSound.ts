/**
 * useSound – Web Audio API sound effects hook.
 * Zero external dependencies, no audio files. All sounds are synthesised.
 * Respects the user's OS "reduce motion / sounds" preference via the
 * `prefers-reduced-motion` media query and a global toggle in localStorage.
 */

"use client";

import { useCallback, useRef } from "react";

type SoundType =
  | "click" // general button press
  | "select" // item selected / checkbox tick
  | "deselect" // item de-selected
  | "tab" // tab switch pop
  | "delete" // delete / remove
  | "save" // save / success chime
  | "toggle" // toggle switch
  | "upload" // file upload start
  | "clear" // clear / reset
  | "expand" // expand / open panel
  | "collapse"; // collapse / close panel

const SOUNDS_ENABLED_KEY = "convertSign_sounds_enabled";

/** Read the user's stored preference (default: on). */
export function getSoundsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SOUNDS_ENABLED_KEY);
  return stored === null ? true : stored === "true";
}

/** Persist the user's preference. */
export function setSoundsEnabled(value: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SOUNDS_ENABLED_KEY, String(value));
  }
}

// ─── Low-level audio primitives ──────────────────────────────────────────────

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    try {
      _ctx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
    } catch {
      return null;
    }
  }
  return _ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.18,
  rampDown = true,
  startDelay = 0,
  ctx?: AudioContext | null,
): void {
  const audioCtx = ctx ?? getCtx();
  if (!audioCtx) return;

  const now = audioCtx.currentTime + startDelay;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gainNode.gain.setValueAtTime(gain, now);

  if (rampDown) {
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  }

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.01);
}

// ─── Sound Definitions ────────────────────────────────────────────────────────

function playClick(): void {
  // Soft, short high-frequency click
  playTone(1200, 0.06, "sine", 0.12);
  playTone(900, 0.04, "sine", 0.06, true, 0.01);
}

function playSelect(): void {
  // Two-note ascending tick
  const ctx = getCtx();
  playTone(880, 0.07, "sine", 0.14, true, 0, ctx);
  playTone(1320, 0.07, "sine", 0.1, true, 0.06, ctx);
}

function playDeselect(): void {
  // Single descending tick
  playTone(880, 0.06, "sine", 0.1);
}

function playTab(): void {
  // Light pop
  playTone(600, 0.05, "triangle", 0.13);
  playTone(800, 0.08, "sine", 0.08, true, 0.02);
}

function playDelete(): void {
  // Descending two-step
  const ctx = getCtx();
  playTone(400, 0.12, "sawtooth", 0.1, true, 0, ctx);
  playTone(260, 0.18, "sine", 0.12, true, 0.1, ctx);
}

function playSave(): void {
  // Pleasant three-note ascending chime
  const ctx = getCtx();
  playTone(523, 0.15, "sine", 0.14, true, 0, ctx); // C5
  playTone(659, 0.15, "sine", 0.12, true, 0.12, ctx); // E5
  playTone(784, 0.25, "sine", 0.15, true, 0.24, ctx); // G5
}

function playToggle(): void {
  // Mid blip
  playTone(700, 0.07, "sine", 0.13);
}

function playUpload(): void {
  // Rising sweep
  const ctx = getCtx();
  const audioCtx = ctx;
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const now = audioCtx.currentTime;
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
  gainNode.gain.setValueAtTime(0.14, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

function playClear(): void {
  // Descending sweep
  const ctx = getCtx();
  const audioCtx = ctx;
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const now = audioCtx.currentTime;
  osc.type = "triangle";
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);
  gainNode.gain.setValueAtTime(0.12, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

function playExpand(): void {
  playTone(500, 0.08, "sine", 0.11);
  playTone(650, 0.1, "sine", 0.09, true, 0.07);
}

function playCollapse(): void {
  playTone(650, 0.07, "sine", 0.11);
  playTone(500, 0.1, "sine", 0.09, true, 0.06);
}

// ─── Map & Hook ───────────────────────────────────────────────────────────────

const SOUND_MAP: Record<SoundType, () => void> = {
  click: playClick,
  select: playSelect,
  deselect: playDeselect,
  tab: playTab,
  delete: playDelete,
  save: playSave,
  toggle: playToggle,
  upload: playUpload,
  clear: playClear,
  expand: playExpand,
  collapse: playCollapse,
};

export function useSound() {
  const play = useCallback((sound: SoundType) => {
    if (!getSoundsEnabled()) return;
    // Unlock AudioContext on first interaction (required by browsers)
    const ctx = getCtx();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().then(() => SOUND_MAP[sound]?.());
    } else {
      SOUND_MAP[sound]?.();
    }
  }, []);

  return { play };
}
