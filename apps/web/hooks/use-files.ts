"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FilesApi, IngestionApi } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { FileUploadResponse, Visibility } from "@/lib/api/types";
import { useUploadStore } from "@/store/upload-store";

export function useFiles() {
  return useQuery({
    queryKey: ["files"],
    queryFn: () => FilesApi.list({ limit: 100 })
  });
}

export function useFile(fileId: string) {
  return useQuery({
    queryKey: ["file", fileId],
    queryFn: () => FilesApi.get(fileId)
  });
}

export function useFilePreview(fileId: string) {
  return useQuery({
    queryKey: ["file-preview", fileId],
    queryFn: () => FilesApi.preview(fileId)
  });
}

export function useIngestionJob(jobId?: string) {
  return useQuery({
    queryKey: ["ingestion-job", jobId],
    queryFn: () => IngestionApi.get(jobId as string),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "queued" || status === "running" ? 1500 : false;
    }
  });
}

export function useRetryIngestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => IngestionApi.retry(jobId),
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: ["ingestion-job", job.id] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: () => toast.error("Ingestion retry failed")
  });
}

export function useRemoveFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => FilesApi.remove(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("File deleted");
    },
    onError: () => toast.error("File could not be deleted")
  });
}

export function useUploadFiles() {
  const queryClient = useQueryClient();
  const enqueue = useUploadStore((state) => state.enqueue);
  const update = useUploadStore((state) => state.update);

  return async (files: File[], visibility: Visibility): Promise<FileUploadResponse[]> => {
    const items = files.map((file) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      size: file.size,
      progress: 0,
      status: "queued" as const,
      visibility
    }));
    enqueue(items);

    return Promise.all(
      files.map(async (file, index) => {
        const item = items[index];
        update(item.id, { status: "uploading" });
        try {
          const response = await FilesApi.upload(file, visibility, (progress) => update(item.id, { progress }));
          update(item.id, {
            status: response.ingestion_job.status === "succeeded" ? "ready" : "ingesting",
            progress: 100,
            file: response.file,
            job: response.ingestion_job
          });
          queryClient.invalidateQueries({ queryKey: ["files"] });
          return response;
        } catch (error) {
          update(item.id, {
            status: "failed",
            error: getErrorMessage(error)
          });
          throw error;
        }
      })
    );
  };
}
