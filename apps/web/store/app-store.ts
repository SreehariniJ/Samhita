"use client";

import { create } from "zustand";
import type { Citation } from "@/lib/api/types";

type AppState = {
  sidebarOpen: boolean;
  citationDrawerOpen: boolean;
  activeCitation: Citation | null;
  setSidebarOpen: (open: boolean) => void;
  openCitation: (citation: Citation) => void;
  closeCitation: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  citationDrawerOpen: false,
  activeCitation: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openCitation: (citation) => set({ activeCitation: citation, citationDrawerOpen: true }),
  closeCitation: () => set({ citationDrawerOpen: false })
}));
