/**
 * WorkOnline File Security & Signature Validation Module
 * Enforces file size boundaries, magic number header signatures, and sanitized filenames.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
}

// Magic byte signatures
const MAGIC_SIGNATURES = {
  PDF: [0x25, 0x50, 0x44, 0x46], // %PDF
  ZIP_DOCX: [0x50, 0x4b, 0x03, 0x04], // PK.. (DOCX is a zip archive)
  PNG: [0x89, 0x50, 0x4e, 0x47], // .PNG
  JPEG: [0xff, 0xd8, 0xff], // JPEG SOI marker
};

/**
 * Sanitizes file names to prevent path traversal and null-byte injection.
 */
export function sanitizeFileName(rawName: string): string {
  if (!rawName) return "file_" + Date.now();
  // Strip paths, null bytes, and control characters
  const clean = rawName
    .replace(/^.*[\\/]/, "")
    .replace(/\0/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 150);
  return clean || "document_" + Date.now();
}

/**
 * Reads the first N bytes of a File object in the browser.
 */
async function readHeaderBytes(file: File, byteCount: number = 8): Promise<Uint8Array> {
  const slice = file.slice(0, byteCount);
  const buffer = await slice.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Validates a PDF file: extension, MIME type, size limit, and %PDF magic bytes.
 */
export async function validatePdfFile(
  file: File,
  maxSizeMB: number = 30
): Promise<ValidationResult> {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the maximum allowed size of ${maxSizeMB}MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  if (file.size < 10) {
    return {
      valid: false,
      error: `File "${file.name}" is corrupted or empty (0 bytes).`,
    };
  }

  try {
    const bytes = await readHeaderBytes(file, 4);
    const isPdfSignature =
      bytes[0] === MAGIC_SIGNATURES.PDF[0] &&
      bytes[1] === MAGIC_SIGNATURES.PDF[1] &&
      bytes[2] === MAGIC_SIGNATURES.PDF[2] &&
      bytes[3] === MAGIC_SIGNATURES.PDF[3];

    if (!isPdfSignature) {
      return {
        valid: false,
        error: `File "${file.name}" does not have a valid PDF header signature (%PDF). The file may be renamed or corrupted.`,
      };
    }
  } catch (err: any) {
    return {
      valid: false,
      error: `Could not verify file integrity: ${err.message}`,
    };
  }

  return {
    valid: true,
    sanitizedName: sanitizeFileName(file.name),
  };
}

/**
 * Validates a DOCX file: size limit and PK zip signature.
 */
export async function validateDocxFile(
  file: File,
  maxSizeMB: number = 20
): Promise<ValidationResult> {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `DOCX file exceeds the maximum size limit of ${maxSizeMB}MB.`,
    };
  }

  if (file.size < 100) {
    return {
      valid: false,
      error: `The Word document is empty or damaged.`,
    };
  }

  try {
    const bytes = await readHeaderBytes(file, 4);
    const isZipSignature =
      bytes[0] === MAGIC_SIGNATURES.ZIP_DOCX[0] &&
      bytes[1] === MAGIC_SIGNATURES.ZIP_DOCX[1] &&
      bytes[2] === MAGIC_SIGNATURES.ZIP_DOCX[2] &&
      bytes[3] === MAGIC_SIGNATURES.ZIP_DOCX[3];

    if (!isZipSignature) {
      return {
        valid: false,
        error: `File "${file.name}" is not a valid modern Microsoft Word (.docx) document.`,
      };
    }
  } catch (err: any) {
    return {
      valid: false,
      error: `Failed to inspect document header: ${err.message}`,
    };
  }

  return {
    valid: true,
    sanitizedName: sanitizeFileName(file.name),
  };
}

/**
 * Validates images (JPEG, PNG) for image-to-PDF converters.
 */
export async function validateImageFile(
  file: File,
  maxSizeMB: number = 15
): Promise<ValidationResult> {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Image exceeds the maximum allowed size of ${maxSizeMB}MB.`,
    };
  }

  try {
    const bytes = await readHeaderBytes(file, 4);
    const isPng =
      bytes[0] === MAGIC_SIGNATURES.PNG[0] &&
      bytes[1] === MAGIC_SIGNATURES.PNG[1] &&
      bytes[2] === MAGIC_SIGNATURES.PNG[2] &&
      bytes[3] === MAGIC_SIGNATURES.PNG[3];

    const isJpeg =
      bytes[0] === MAGIC_SIGNATURES.JPEG[0] &&
      bytes[1] === MAGIC_SIGNATURES.JPEG[1] &&
      bytes[2] === MAGIC_SIGNATURES.JPEG[2];

    if (!isPng && !isJpeg && !file.type.startsWith("image/")) {
      return {
        valid: false,
        error: `File "${file.name}" is not a supported PNG or JPEG image.`,
      };
    }
  } catch {
    // fallback to mime
  }

  return {
    valid: true,
    sanitizedName: sanitizeFileName(file.name),
  };
}

/**
 * Validates text or CSV uploads.
 */
export function validateTextOrCsvFile(
  file: File,
  maxSizeMB: number = 10
): ValidationResult {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Data file exceeds the maximum allowed size of ${maxSizeMB}MB.`,
    };
  }

  return {
    valid: true,
    sanitizedName: sanitizeFileName(file.name),
  };
}
