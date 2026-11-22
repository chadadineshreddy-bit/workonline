import { getPdfjs } from "./pdfjs-init";

export interface PdfToWordResult {
  success: boolean;
  html: string;
  pageCount: number;
  title: string;
  error?: string;
}

/**
 * Converts a PDF file into semantic, editable HTML for the Word Editor.
 * Reconstructs headings, bullet points, paragraphs, and page breaks.
 */
export async function convertPdfToWordHtml(file: File): Promise<PdfToWordResult> {
  if (!file) {
    return { success: false, html: "", pageCount: 0, title: "", error: "No file provided." };
  }

  try {
    const pdfjs = await getPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    const documentSections: string[] = [];
    const docTitle = file.name.replace(/\.[^/.]+$/, "");

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Collect text items
      interface TextLine {
        text: string;
        fontSize: number;
        y: number;
        x: number;
      }

      const items = textContent.items as any[];
      if (!items || items.length === 0) {
        documentSections.push(`<p><em>[Page ${pageNum} is blank or an image-only scan]</em></p>`);
        continue;
      }

      // Group items roughly by vertical position (lines)
      const lineMap = new Map<number, { text: string; fontSize: number; x: number }[]>();
      for (const item of items) {
        if (!item.str || !item.str.trim()) continue;
        const y = Math.round(item.transform[5]);
        const x = Math.round(item.transform[4]);
        const fontSize = Math.round(item.transform[0]) || 12;

        let foundY = false;
        for (const existingY of Array.from(lineMap.keys())) {
          if (Math.abs(existingY - y) <= 3) {
            lineMap.get(existingY)!.push({ text: item.str, fontSize, x });
            foundY = true;
            break;
          }
        }
        if (!foundY) {
          lineMap.set(y, [{ text: item.str, fontSize, x }]);
        }
      }

      // Sort lines top to bottom (higher Y in PDF is higher on the page)
      const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);

      const pageLines: { text: string; maxFontSize: number }[] = [];
      for (const y of sortedYs) {
        const lineItems = lineMap.get(y)!;
        lineItems.sort((a, b) => a.x - b.x);
        const fullLine = lineItems.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim();
        const maxFont = Math.max(...lineItems.map((i) => i.fontSize), 12);
        if (fullLine) {
          pageLines.push({ text: fullLine, maxFontSize: maxFont });
        }
      }

      // Format page lines into semantic HTML
      let pageHtml = "";
      let inList = false;

      for (let i = 0; i < pageLines.length; i++) {
        const line = pageLines[i];
        const trimmed = line.text.trim();

        // Check if line is a bullet item
        const isBullet = /^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/.test(trimmed);
        const isNumbered = /^\d+[\.\)]\s+/.test(trimmed);

        if (isBullet || isNumbered) {
          if (!inList) {
            pageHtml += `<ul style="margin: 6px 0; padding-left: 24px;">`;
            inList = true;
          }
          const cleanedText = trimmed.replace(/^[•\-\*\u2022\u2023\u25E6\u2043\u2219\d+[\.\)]]\s*/, "");
          pageHtml += `<li style="margin-bottom: 4px;">${escapeHtml(cleanedText)}</li>`;
          continue;
        } else if (inList) {
          pageHtml += `</ul>`;
          inList = false;
        }

        // Check if line looks like a major Heading
        const isAllUpper = trimmed.length > 3 && trimmed.length < 50 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
        const isBigFont = line.maxFontSize >= 16;
        const isCommonHeading = /^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATES|WORK EXPERIENCE|PROFILE|ABOUT ME|OBJECTIVE|AWARDS|LANGUAGES|CONTACT)/i.test(trimmed);

        if (isBigFont || (isAllUpper && isCommonHeading)) {
          pageHtml += `<h2 style="color: #2F5597; font-size: 16pt; font-weight: bold; margin-top: 18px; margin-bottom: 8px; border-bottom: 1px solid #D1D5DB; padding-bottom: 4px;">${escapeHtml(trimmed)}</h2>`;
        } else if (trimmed.length < 40 && (isAllUpper || isCommonHeading)) {
          pageHtml += `<h3 style="color: #1F3864; font-size: 13pt; font-weight: bold; margin-top: 14px; margin-bottom: 6px;">${escapeHtml(trimmed)}</h3>`;
        } else {
          // Standard Paragraph
          pageHtml += `<p style="margin-bottom: 8px; line-height: 1.35; color: #000000;">${escapeHtml(trimmed)}</p>`;
        }
      }

      if (inList) {
        pageHtml += `</ul>`;
      }

      // Add page break between pages
      if (pageNum > 1) {
        documentSections.push(
          `<div class="page-break" style="page-break-after: always; border-bottom: 2px dashed #94a3b8; margin: 36px 0; text-align: center;">` +
          `<span style="background: #e2e8f0; color: #475569; font-size: 10px; font-weight: bold; padding: 3px 12px; border-radius: 4px; letter-spacing: 0.05em;">PAGE BREAK — PAGE ${pageNum}</span>` +
          `</div>`
        );
      }

      documentSections.push(pageHtml);
    }

    const fullHtml = documentSections.join("\n");
    return {
      success: true,
      html: fullHtml || "<p>Document imported, but no readable text was detected.</p>",
      pageCount: numPages,
      title: docTitle,
    };
  } catch (err: any) {
    console.error("PDF to Word conversion failed:", err);
    return {
      success: false,
      html: "",
      pageCount: 0,
      title: "",
      error: err.message || "Failed to convert PDF to Word document.",
    };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
