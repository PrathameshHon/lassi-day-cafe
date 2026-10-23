"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current epoch ms and re-renders every `intervalMs`.
 *
 * Hydration-safe: state is initialised to 0 and updates only start from
 * async callbacks (timeout/interval), so server render and the first client
 * render always match. Consumers MUST treat `0` as "not mounted yet".
 */
export function useTick(intervalMs = 1000): number {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const update = () => setNow(Date.now());
    // First tick is deferred to a macrotask so no state update ever happens
    // synchronously inside the effect (cascade-free renders).
    const initial = setTimeout(update, 0);
    const id = setInterval(update, intervalMs);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [intervalMs]);

  return now;
}
