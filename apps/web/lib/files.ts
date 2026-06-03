export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function fileIconLabel(contentType: string, extension?: string) {
  if (contentType.includes("pdf") || extension === "pdf") return "PDF";
  if (contentType.startsWith("image/")) return "IMG";
  if (extension) return extension.toUpperCase();
  return "FILE";
}
