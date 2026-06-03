"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { AuthApi } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { ChangePasswordRequest, LoginRequest } from "@/lib/api/types";
import { useAuthStore } from "@/store/auth-store";

export function useSessionRecovery() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => AuthApi.me()
  });

  useEffect(() => {
    if (query.data) {
      setSession(query.data.user, query.data.csrf_token);
    }
  }, [query.data, setSession]);

  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 401) {
      clearSession();
    }
  }, [clearSession, query.error]);

  return query;
}

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (request: LoginRequest) => AuthApi.login(request),
    onSuccess: (response) => {
      setSession(response.user, response.csrf_token);
      router.replace("/chat");
    },
    onError: () => toast.error("Login failed")
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: () => AuthApi.logout(),
    onSettled: () => {
      clearSession();
      queryClient.clear();
      router.replace("/login");
    }
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (request: ChangePasswordRequest) => AuthApi.changePassword(request),
    onSuccess: () => toast.success("Password changed"),
    onError: () => toast.error("Password change failed")
  });
}
