import mammoth from "mammoth";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Extracts raw plain text from a DOCX file using mammoth
 */
export async function extractDocxText(
  file: File
): Promise<{ text: string; wordCount: number; charCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value || "";
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return { text, wordCount, charCount };
}

/**
 * Converts a DOCX file to clean HTML using mammoth
 */
export async function convertDocxToHtml(
  file: File
): Promise<{ html: string; messages: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return {
    html: result.value || "",
    messages: result.messages.map((m) => m.message),
  };
}

/**
 * Converts plain text to a formatted, multi-page A4 PDF using pdf-lib
 */
export async function convertTxtToPdfBlob(
  text: string,
  title: string = "Converted Document"
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4 standard width in points
  const pageHeight = 841.89; // A4 standard height in points
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  const fontSize = 11;
  const lineHeight = 16;
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2 - 40) / lineHeight);

  // Split input into paragraphs and wrap lines
  const rawLines = text.split("\n");
  const wrappedLines: string[] = [];

  for (const rawLine of rawLines) {
    if (rawLine.trim().length === 0) {
      wrappedLines.push("");
      continue;
    }

    const words = rawLine.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth <= contentWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) wrappedLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  // Paginate wrapped lines
  let currentLineIndex = 0;
  let pageNum = 1;

  while (currentLineIndex < wrappedLines.length || wrappedLines.length === 0) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    // Header
    page.drawText(title, {
      x: margin,
      y: y,
      size: 13,
      font: fontBold,
      color: rgb(0.09, 0.13, 0.24),
    });

    page.drawLine({
      start: { x: margin, y: y - 8 },
      end: { x: pageWidth - margin, y: y - 8 },
      thickness: 0.8,
      color: rgb(0.85, 0.88, 0.92),
    });

    y -= 30;

    let linesOnThisPage = 0;
    while (
      currentLineIndex < wrappedLines.length &&
      linesOnThisPage < maxLinesPerPage
    ) {
      const line = wrappedLines[currentLineIndex];
      if (line) {
        page.drawText(line, {
          x: margin,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0.12, 0.16, 0.22),
        });
      }
      y -= lineHeight;
      linesOnThisPage++;
      currentLineIndex++;
    }

    // Footer Page Number
    page.drawText(`Page ${pageNum}`, {
      x: pageWidth - margin - 40,
      y: margin - 15,
      size: 9,
      font: font,
      color: rgb(0.55, 0.6, 0.68),
    });

    pageNum++;
    if (wrappedLines.length === 0) break;
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
