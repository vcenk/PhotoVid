import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Download a file from a URL
 * @param url - The URL of the file to download
 * @param filename - Optional filename (defaults to timestamp-based name)
 * @param extension - File extension (default: 'jpg')
 */
export async function downloadFile(
  url: string,
  filename?: string,
  extension: string = 'jpg'
): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || `download-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download failed:', err);
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
}
