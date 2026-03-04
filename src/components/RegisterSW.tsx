"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(reg => {
          console.log("[SW] Registered:", reg.scope);
        })
        .catch(err => {
          console.warn("[SW] Registration failed:", err);
        });
    }
  }, []);

  return null;
}
