"use client";

import { create } from "zustand";
import { setApiCsrfToken } from "@/lib/api/session";
import type { User } from "@/lib/api/types";

type AuthState = {
  user: User | null;
  csrfToken: string | null;
  hydrated: boolean;
  setSession: (user: User | null, csrfToken: string | null) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  csrfToken: null,
  hydrated: false,
  setSession: (user, csrfToken) => {
    setApiCsrfToken(csrfToken);
    set({ user, csrfToken, hydrated: true });
  },
  clearSession: () => {
    setApiCsrfToken(null);
    set({ user: null, csrfToken: null, hydrated: true });
  }
}));
