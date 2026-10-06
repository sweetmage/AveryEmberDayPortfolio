'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Finger-swipe / mouse-drag gesture for a horizontal slide deck.
 *
 * Shared by the Projects-page stage and the lightbox so the two feel identical.
 * Replaces the hand-rolled pointer handling in the deleted
 * `public/scripts/history-of-mistrust-slideshow.js`, which had three defects
 * this hook exists to avoid:
 *
 *  1. A fixed 80px commit threshold — 22% of a 360px phone but 7% of a 1080px
 *     desktop frame, so the same gesture meant different things per device.
 *     Replaced by a width fraction OR a flick velocity.
 *  2. No tap/drag discriminator, so any drag ending over the viewer also fired
 *     the click that opens the lightbox.
 *  3. A `pointerleave -> pointerup` binding, which under `setPointerCapture`
 *     fires spuriously and commits half-finished drags.
 *
 * The consumer MUST set `touch-action: pan-y` on the bound element. That, not
 * `preventDefault`, is what lets a vertical flick scroll the page while a
 * horizontal one drives the deck — and it keeps the move handler cheap enough
 * to stay passive.
 */

/** Horizontal travel before the gesture is treated as a swipe rather than a tap. */
const ENGAGE_PX = 8;
/** Commit if dragged past this fraction of the element's width. */
const COMMIT_FRACTION = 0.2;
/** ...or if released at this speed, in px/ms. */
const FLICK_VELOCITY = 0.4;
/** Drag multiplier past the first/last slide, so the end of a set is felt, not frozen. */
const EDGE_RESISTANCE = 0.35;
/** A press that moves less than this, for less than TAP_MAX_MS, is a tap. */
const TAP_MAX_PX = 8;
const TAP_MAX_MS = 300;
/** Velocity is measured over the tail of the gesture, not its whole length. */
const VELOCITY_WINDOW_MS = 100;

/** What committed a move — drives which easing the consumer animates with. */
export type SwipeSource = 'pointer' | 'key';

export type SwipeDeckOptions = {
  /** Total slides in the deck. */
  count: number;
  /** Current 0-based index. */
  index: number;
  /**
   * Called with the new index when a gesture or key commits a move. `source`
   * lets the consumer pick easing: a drag release wants ease-out (overshoot
   * after direct manipulation reads as a bug), a keypress wants the same spring
   * the buttons use.
   */
  onCommit: (next: number, source: SwipeSource) => void;
  /** Called when the press was a tap, not a drag. Optional. */
  onTap?: () => void;
  /** Freeze the deck (e.g. the stage while the lightbox is open). */
  disabled?: boolean;
};

type Sample = { x: number; t: number };

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * `prefers-reduced-motion: reduce`. Starts false so SSR and the first client
 * paint agree; the effect corrects it before any gesture can run.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

export function useSwipeDeck({ count, index, onCommit, onTap, disabled = false }: SwipeDeckOptions) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const pointerId = useRef<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startT = useRef(0);
  const samples = useRef<Sample[]>([]);
  /** Horizontal intent confirmed — we own the gesture from here. */
  const engaged = useRef(false);
  /** Vertical intent won the axis race; the page scrolls and we stay out of it. */
  const abandoned = useRef(false);
  /** Set on any engaged gesture, read by the click guard, cleared after. */
  const didDrag = useRef(false);

  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  /* An externally driven index change (button, filmstrip, set switch) must not
     leave a stale drag offset behind. */
  useEffect(() => {
    setDragPx(0);
  }, [index]);

  const reset = useCallback(() => {
    pointerId.current = null;
    samples.current = [];
    engaged.current = false;
    abandoned.current = false;
    setDragPx(0);
    setIsDragging(false);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      /* A second finger is a pinch, not a swipe. */
      if (pointerId.current !== null) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      /* Overlaid controls own their own clicks. */
      if ((e.target as HTMLElement).closest('button, a')) return;

      pointerId.current = e.pointerId;
      startX.current = e.clientX;
      startY.current = e.clientY;
      startT.current = e.timeStamp;
      samples.current = [{ x: e.clientX, t: e.timeStamp }];
      engaged.current = false;
      abandoned.current = false;
    },
    [disabled]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pointerId.current !== e.pointerId || abandoned.current) return;

      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      if (!engaged.current) {
        /* Axis race. Whichever direction clears the threshold first wins the
           gesture outright — without this, a vertical flick that starts on the
           stage feels sticky, which is the most common swipe-carousel defect. */
        if (Math.abs(dy) > ENGAGE_PX && Math.abs(dy) >= Math.abs(dx)) {
          abandoned.current = true;
          return;
        }
        if (Math.abs(dx) <= ENGAGE_PX || Math.abs(dx) <= Math.abs(dy)) return;

        engaged.current = true;
        didDrag.current = true;
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }

      samples.current.push({ x: e.clientX, t: e.timeStamp });
      const cutoff = e.timeStamp - VELOCITY_WINDOW_MS;
      while (samples.current.length > 2 && samples.current[0].t < cutoff) {
        samples.current.shift();
      }

      const atStart = index === 0 && dx > 0;
      const atEnd = index === count - 1 && dx < 0;
      setDragPx(atStart || atEnd ? dx * EDGE_RESISTANCE : dx);
    },
    [count, index]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pointerId.current !== e.pointerId) return;

      const wasEngaged = engaged.current;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      const width = elRef.current?.clientWidth || 1;

      if (wasEngaged && e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      if (wasEngaged) {
        /* Velocity over the tail of the gesture: a fast short flick and a slow
           long drag should both advance, a slow short drag should not. */
        const tail = samples.current;
        const first = tail[0];
        const last = tail[tail.length - 1];
        const elapsed = last.t - first.t;
        const velocity = elapsed > 0 ? (last.x - first.x) / elapsed : 0;

        const passedDistance = Math.abs(dx) > COMMIT_FRACTION * width;
        const passedFlick = Math.abs(velocity) > FLICK_VELOCITY && Math.abs(dx) > ENGAGE_PX;

        if (passedDistance || passedFlick) {
          const direction = dx < 0 ? 1 : -1;
          const next = clamp(index + direction, 0, count - 1);
          if (next !== index) onCommit(next, 'pointer');
        }
      } else if (
        !abandoned.current &&
        Math.hypot(dx, dy) < TAP_MAX_PX &&
        e.timeStamp - startT.current < TAP_MAX_MS
      ) {
        onTap?.();
      }

      reset();
    },
    [count, index, onCommit, onTap, reset]
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pointerId.current !== e.pointerId) return;
      if (engaged.current && e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      reset();
    },
    [reset]
  );

  /* The synthetic click that follows a drag must not reach whatever the stage
     does on tap. Capture phase, so it is stopped before any child handler. */
  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!didDrag.current) return;
    didDrag.current = false;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      let next = index;
      if (e.key === 'ArrowLeft') next = index - 1;
      else if (e.key === 'ArrowRight') next = index + 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = count - 1;
      else return;

      e.preventDefault();
      next = clamp(next, 0, count - 1);
      if (next !== index) onCommit(next, 'key');
    },
    [count, disabled, index, onCommit]
  );

  return {
    /** Live drag offset in px, already edge-damped. 0 when not dragging. */
    dragPx,
    /** True only once horizontal intent is confirmed — use it to kill the transition. */
    isDragging,
    /** Spread onto the swipeable element. It must also carry `touch-action: pan-y`. */
    bind: {
      ref: elRef,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
      onKeyDown,
    },
  };
}
