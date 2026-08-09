import { useCallback, useEffect, useRef, useState } from "react";

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutter

/**
 * Holder styr paa, om admin-omraadet er laast op, og laaser automatisk
 * igen efter inaktivitet. Dette er et demo-sikkerhedsniveau - se advarslen
 * vist i admin-UI'et.
 */
export function useAdminLock() {
  const [unlocked, setUnlocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lock = useCallback(() => {
    setUnlocked(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(lock, INACTIVITY_TIMEOUT_MS);
  }, [lock]);

  const unlock = useCallback(() => {
    setUnlocked(true);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!unlocked) return;
    const events = ["pointerdown", "keydown", "touchstart"];
    const handler = () => resetTimer();
    events.forEach((e) => window.addEventListener(e, handler));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [unlocked, resetTimer]);

  return { unlocked, unlock, lock };
}
