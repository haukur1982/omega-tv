'use client';

/**
 * Tiny typed event bus for coordinating the sermon player with sibling
 * client components (chapter list, transcript scroller, etc.) without
 * prop-drilling or a full context provider.
 *
 * Two events flow here:
 *
 *   seek        — a UI element requests a jump to timestamp `t` seconds.
 *                 The SermonPlayer consumes these: if the player is
 *                 already live, it calls Player.js `setCurrentTime`; if
 *                 the video hasn't started yet, it bakes the timestamp
 *                 into the Bunny iframe URL via `?t=` and starts playing.
 *
 *   timeupdate  — the SermonPlayer (Player.js timeupdate) broadcasts the
 *                 current playback position. ChapterList uses this to
 *                 highlight the currently-active chapter so the viewer
 *                 always knows where they are in a long sermon — a
 *                 disproportionately useful cue for the 50+ audience.
 */

export type PlayerEvent =
    | { type: 'seek'; t: number }
    | { type: 'timeupdate'; t: number; duration?: number }
    | { type: 'ready' };

type Listener = (e: PlayerEvent) => void;

const listeners = new Set<Listener>();

export function onPlayerEvent(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function emitPlayerEvent(event: PlayerEvent): void {
    listeners.forEach((l) => {
        try {
            l(event);
        } catch (err) {
            // Don't let one bad listener crash the others.
            console.error('playerBus listener failed:', err);
        }
    });
}
