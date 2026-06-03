"use client";

import { DragEvent, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import type { Visibility } from "@/lib/api/types";
import { useUploadFiles } from "@/hooks/use-files";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function FileDropzone() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uploadFiles = useUploadFiles();
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    try {
      await uploadFiles(files, visibility);
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      className={cn("flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center transition-colors", dragging && "border-primary bg-primary/5")}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <UploadCloud className="size-6" />
      </div>
      <h2 className="text-base font-semibold">Upload files</h2>
      <p className="mt-1 text-sm text-muted-foreground">PDF, images, DOCX, PPTX, and XLSX</p>
      <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row">
        <Select value={visibility} onValueChange={(value) => setVisibility(value as Visibility)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="workspace">Workspace</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          <UploadCloud className="size-4" />
          Select files
        </Button>
      </div>
    </div>
  );
}
