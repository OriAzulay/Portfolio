"use client";

import { useEffect } from "react";
import { api } from "@/lib/api-client";

/** Records one (hashed-IP) visit per page load. Renders nothing. */
export function VisitTracker() {
  useEffect(() => {
    api.trackVisit().catch(() => {});
  }, []);
  return null;
}
