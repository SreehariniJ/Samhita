import { FilePreviewPage } from "@/components/files/file-preview-page";

export default async function FilePage({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  return <FilePreviewPage fileId={fileId} />;
}
