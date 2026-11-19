/**
 * Client-side loader for PDF.js that ensures the worker is initialized properly
 * without interfering with Next.js SSR.
 */

let pdfjsInstance: typeof import("pdfjs-dist") | null = null;

export async function getPdfjs(): Promise<typeof import("pdfjs-dist")> {
  if (typeof window === "undefined") {
    throw new Error("PDF.js can only be loaded in a browser environment.");
  }

  if (pdfjsInstance) {
    return pdfjsInstance;
  }

  const pdfjs = await import("pdfjs-dist");
  // Set local worker path from /public/pdf.worker.min.js
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  pdfjsInstance = pdfjs;

  return pdfjsInstance;
}
