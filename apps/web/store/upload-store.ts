"use client";

import { create } from "zustand";
import type { FileRecord, IngestionJob, Visibility } from "@/lib/api/types";

export type UploadQueueItem = {
  id: string;
  fileName: string;
  size: number;
  progress: number;
  status: "queued" | "uploading" | "uploaded" | "ingesting" | "ready" | "failed";
  visibility: Visibility;
  file?: FileRecord;
  job?: IngestionJob;
  error?: string;
};

type UploadState = {
  queue: UploadQueueItem[];
  enqueue: (items: UploadQueueItem[]) => void;
  update: (id: string, patch: Partial<UploadQueueItem>) => void;
  remove: (id: string) => void;
  clearCompleted: () => void;
};

export const useUploadStore = create<UploadState>((set) => ({
  queue: [],
  enqueue: (items) => set((state) => ({ queue: [...items, ...state.queue] })),
  update: (id, patch) => set((state) => ({ queue: state.queue.map((item) => (item.id === id ? { ...item, ...patch } : item)) })),
  remove: (id) => set((state) => ({ queue: state.queue.filter((item) => item.id !== id) })),
  clearCompleted: () => set((state) => ({ queue: state.queue.filter((item) => !["ready", "failed"].includes(item.status)) }))
}));
