import mammoth from "mammoth";

export interface DocxImportResult {
  html: string;
  messages: Array<{ type: string; message: string }>;
  success: boolean;
  error?: string;
}

/**
 * Extracts clean semantic HTML from an uploaded DOCX file using mammoth.
 */
export async function importDocxFile(file: File): Promise<DocxImportResult> {
  if (!file) {
    return { html: "", messages: [], success: false, error: "No file provided." };
  }

  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".docx")) {
    return {
      html: "",
      messages: [],
      success: false,
      error: `Invalid file format (${file.name}). Please select a standard .docx Word document.`,
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    return {
      html: result.value,
      messages: result.messages,
      success: true,
    };
  } catch (err: any) {
    console.error("DOCX extraction error:", err);
    return {
      html: "",
      messages: [],
      success: false,
      error: "Unable to parse this DOCX file. The document may be corrupted, password-protected, or in legacy binary .doc format.",
    };
  }
}
