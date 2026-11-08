"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "local-storage-state";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Boolean preference persisted in localStorage (per browser), hydration-safe:
 * the server snapshot is `fallback`, the client reads storage after hydration.
 */
export function useLocalStorageBoolean(key: string, fallback = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const handler = (e: Event) => {
        if (e instanceof StorageEvent ? e.key === key : (e as CustomEvent).detail === key) onChange();
      };
      window.addEventListener("storage", handler);
      window.addEventListener(EVENT, handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(EVENT, handler);
      };
    },
    [key]
  );

  const value = useSyncExternalStore(
    subscribe,
    () => {
      const raw = read(key);
      return raw === null ? fallback : raw === "1";
    },
    () => fallback
  );

  const setValue = useCallback(
    (next: boolean) => {
      try {
        window.localStorage.setItem(key, next ? "1" : "0");
      } catch {
        /* storage unavailable: preference just won't persist */
      }
      window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
    },
    [key]
  );

  return [value, setValue] as const;
}
