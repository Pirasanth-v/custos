import type { BillFileType } from "@/features/bills/types";

export function getFileType(mimeType: string): BillFileType {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType === "application/pdf") return "pdf";
    return "other";
  }
  
  export function humanSize(bytes: number): string {
    if (!bytes || isNaN(bytes) || bytes < 0) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  }