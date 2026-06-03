"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SettingsApi } from "@/lib/api/client";
import type { SystemSettings, UserSettingsUpdate } from "@/lib/api/types";

export function useUserSettings() {
  return useQuery({
    queryKey: ["settings", "me"],
    queryFn: () => SettingsApi.me()
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UserSettingsUpdate) => SettingsApi.updateMe(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "me"] });
      toast.success("Settings saved");
    },
    onError: () => toast.error("Settings could not be saved")
  });
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ["settings", "system"],
    queryFn: () => SettingsApi.system()
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SystemSettings) => SettingsApi.updateSystem(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "system"] });
      toast.success("System settings saved");
    },
    onError: () => toast.error("System settings could not be saved")
  });
}
