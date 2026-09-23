import { useEffect, useRef } from 'react';
import Hammer from 'hammerjs';

export interface GestureHandlers {
  onTap?: (e: HammerInput) => void;
  onDoubleTap?: (e: HammerInput) => void;
  onPress?: (e: HammerInput) => void;
  onSwipeUp?: (e: HammerInput) => void;
  onSwipeDown?: (e: HammerInput) => void;
  onSwipeLeft?: (e: HammerInput) => void;
  onSwipeRight?: (e: HammerInput) => void;
  onPan?: (e: HammerInput) => void;
  onPanEnd?: (e: HammerInput) => void;
  onPinch?: (e: HammerInput) => void;
}

export function useHammerGestures<T extends HTMLElement>(
  handlers: GestureHandlers,
  enabled: boolean = true
) {
  const elementRef = useRef<T | null>(null);
  const hammerRef = useRef<HammerManager | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !enabled) return;

    // Initialize Hammer instance
    const mc = new Hammer.Manager(el, {
      touchAction: 'pan-y'
    });

    // Configure recognizers
    const tap = new Hammer.Tap({ event: 'singletap', taps: 1, interval: 250, threshold: 9 });
    const doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, interval: 300, threshold: 9, posThreshold: 20 });
    const press = new Hammer.Press({ event: 'press', time: 350 });
    const swipe = new Hammer.Swipe({ event: 'swipe', direction: Hammer.DIRECTION_ALL, velocity: 0.25, threshold: 10 });
    const pan = new Hammer.Pan({ event: 'pan', direction: Hammer.DIRECTION_ALL, threshold: 8 });

    // Recognize doubletap before singletap
    mc.add([doubleTap, tap, press, swipe, pan]);
    doubleTap.recognizeWith(tap);
    tap.requireFailure(doubleTap);

    // Event bindings
    mc.on('singletap', (e) => handlersRef.current.onTap?.(e));
    mc.on('doubletap', (e) => handlersRef.current.onDoubleTap?.(e));
    mc.on('press', (e) => handlersRef.current.onPress?.(e));
    
    mc.on('swipeup', (e) => handlersRef.current.onSwipeUp?.(e));
    mc.on('swipedown', (e) => handlersRef.current.onSwipeDown?.(e));
    mc.on('swipeleft', (e) => handlersRef.current.onSwipeLeft?.(e));
    mc.on('swiperight', (e) => handlersRef.current.onSwipeRight?.(e));

    mc.on('pan', (e) => handlersRef.current.onPan?.(e));
    mc.on('panend pancancel', (e) => handlersRef.current.onPanEnd?.(e));

    hammerRef.current = mc;

    return () => {
      mc.destroy();
      hammerRef.current = null;
    };
  }, [enabled]);

  return { elementRef, hammerInstance: hammerRef };
}
