"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function extractUnitId(pathname: string): string | null {
  const match = pathname.match(/^\/unit\/(.+)$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

async function sendPresence(currentUnitId: string | null) {
  try {
    await fetch("/api/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentUnitId }),
      keepalive: true,
    });
  } catch {
    // ignore network hiccups for heartbeat
  }
}

export function PresenceHeartbeat() {
  const pathname = usePathname();

  useEffect(() => {
    const unitId = extractUnitId(pathname);
    void sendPresence(unitId);

    const id = setInterval(() => {
      void sendPresence(unitId);
    }, 30_000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void sendPresence(extractUnitId(pathname));
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);

  return null;
}
