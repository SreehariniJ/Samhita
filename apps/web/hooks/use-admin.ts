"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminApi, HealthApi, ModelsApi } from "@/lib/api/client";
import type { CreateUserRequest, UpdateUserRequest } from "@/lib/api/types";

export function useMetricsSummary() {
  return useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => AdminApi.metrics()
  });
}

export function useModelStatus() {
  return useQuery({
    queryKey: ["models"],
    queryFn: () => ModelsApi.list()
  });
}

export function useReadiness() {
  return useQuery({
    queryKey: ["health", "ready"],
    queryFn: () => HealthApi.ready(),
    refetchInterval: 5000
  });
}

export function useAuditEvents(params: { event_type?: string; actor_user_id?: string; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "audit", params],
    queryFn: () => AdminApi.auditEvents(params)
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => AdminApi.users()
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateUserRequest) => AdminApi.createUser(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User created");
    },
    onError: () => toast.error("User could not be created")
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, request }: { userId: string; request: UpdateUserRequest }) => AdminApi.updateUser(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated");
    },
    onError: () => toast.error("User could not be updated")
  });
}
