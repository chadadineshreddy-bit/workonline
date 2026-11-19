/**
 * WorkOnline PDF Utilities & Validation
 * Provides robust file signature checks, validation, and safe helpers.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  isPasswordProtected?: boolean;
}

/**
 * Validates a PDF file by checking extension, MIME type, size limit,
 * and binary file signature (%PDF- magic bytes).
 */
export async function validatePdfFile(
  file: File,
  maxSizeMB: number = 50
): Promise<ValidationResult> {
  // 1. Check file existence
  if (!file) {
    return { valid: false, error: "No file was selected." };
  }

  // 2. Extension check
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".pdf")) {
    return {
      valid: false,
      error: `Invalid file extension. Expected a .pdf document, received "${file.name}".`,
    };
  }

  // 3. MIME type check
  if (file.type && file.type !== "application/pdf" && file.type !== "application/x-pdf") {
    return {
      valid: false,
      error: "Invalid file type. Please upload a genuine PDF file.",
    };
  }

  // 4. File size check
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds the ${maxSizeMB}MB safety limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "The uploaded file is empty (0 bytes)." };
  }

  // 5. Binary header signature check (%PDF-)
  try {
    const slice = file.slice(0, 10);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const header = new TextDecoder().decode(bytes);

    if (!header.includes("%PDF-")) {
      return {
        valid: false,
        error: "File signature validation failed. This file is not a valid PDF or has been corrupted.",
      };
    }
  } catch (err) {
    return {
      valid: false,
      error: "Unable to read file binary signature. File may be damaged.",
    };
  }

  return { valid: true };
}

/**
 * Validates an image file (for JPG to PDF tool).
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 25
): { valid: boolean; error?: string } {
  if (!file) return { valid: false, error: "No file selected." };

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const lowerName = file.name.toLowerCase();
  const validExts = [".jpg", ".jpeg", ".png", ".webp"];

  const hasValidExt = validExts.some((ext) => lowerName.endsWith(ext));
  if (!hasValidExt || (!validTypes.includes(file.type) && file.type)) {
    return {
      valid: false,
      error: `Unsupported image format (${file.name}). Please upload JPG, PNG, or WebP images.`,
    };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `Image ${file.name} exceeds ${maxSizeMB}MB limit.`,
    };
  }

  return { valid: true };
}

/**
 * Generates a clean, safe filename with a custom suffix or extension.
 */
export function getSafeFileName(
  originalName: string,
  suffix: string,
  extension: string = ".pdf"
): string {
  const base = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return `${base}-${suffix}${ext}`;
}

/**
 * Triggers a browser download for a Blob object and revokes the URL after downloading.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Parses page ranges string into 0-indexed page numbers.
 * Examples: "1-3, 5, 8-10" => [0, 1, 2, 4, 7, 8, 9]
 */
export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr.trim()) return [];

  const pagesSet = new Set<number>();
  const parts = rangeStr.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          pagesSet.add(i - 1); // 0-indexed
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pagesSet.add(pageNum - 1);
      }
    }
  }

  return Array.from(pagesSet).sort((a, b) => a - b);
}
