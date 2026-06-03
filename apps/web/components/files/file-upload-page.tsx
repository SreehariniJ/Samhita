"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteFrame } from "@/components/states/route-frame";
import { FileDropzone } from "./file-dropzone";
import { UploadQueue } from "./upload-queue";

export function FileUploadPage() {
  return (
    <RouteFrame
      title="Upload"
      description="Add local documents to the workspace"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/files">
            <ArrowLeft className="size-4" />
            Files
          </Link>
        </Button>
      }
    >
      <div className="grid gap-5">
        <FileDropzone />
        <UploadQueue />
      </div>
    </RouteFrame>
  );
}
