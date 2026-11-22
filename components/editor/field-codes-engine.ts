/**
 * Field Codes Engine for Microsoft Word Web (DocuFlow)
 * Evaluates, parses, and formats dynamic field codes:
 * { PAGE }, { NUMPAGES }, { DATE \@ "..." }, { AUTHOR }, { FILENAME }, { STYLEREF }, { SEQ }, { IF }
 */

export interface FieldContext {
  pageNumber: number;
  totalPageCount: number;
  author: string;
  filename: string;
  activeHeading?: string;
  figureSequence?: number;
}

export function evaluateFieldExpression(fieldCodeRaw: string, context: FieldContext): string {
  const code = fieldCodeRaw.trim();
  const upper = code.toUpperCase();

  // { PAGE }
  if (upper === "PAGE" || upper === "{ PAGE }") {
    return String(context.pageNumber || 1);
  }

  // { NUMPAGES }
  if (upper === "NUMPAGES" || upper === "{ NUMPAGES }") {
    return String(context.totalPageCount || 1);
  }

  // { AUTHOR }
  if (upper === "AUTHOR" || upper === "{ AUTHOR }") {
    return context.author || "Dinesh Reddy Chada";
  }

  // { FILENAME } or { FILENAME \p }
  if (upper.startsWith("FILENAME")) {
    return context.filename || "Document1.docx";
  }

  // { DATE \@ "dd-MM-yyyy" } or { DATE }
  if (upper.startsWith("DATE")) {
    const now = new Date();
    if (code.includes('\\@ "dd-MM-yyyy"') || code.includes('\\@ "DD-MM-YYYY"')) {
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    if (code.includes('\\@ "MMMM d, yyyy"')) {
      return now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
    return now.toLocaleDateString();
  }

  // { STYLEREF "Heading 1" }
  if (upper.startsWith("STYLEREF")) {
    return context.activeHeading || "Introduction";
  }

  // { SEQ Figure }
  if (upper.startsWith("SEQ")) {
    return `Figure ${context.figureSequence || 1}`;
  }

  // { IF { PAGE } = 1 "" "Page { PAGE }" }
  if (upper.startsWith("IF")) {
    const isFirstPage = (context.pageNumber || 1) === 1;
    if (code.includes("PAGE") && (code.includes("= 1") || code.includes("== 1"))) {
      return isFirstPage ? "" : `Page ${context.pageNumber}`;
    }
    return `Page ${context.pageNumber}`;
  }

  return `{ ${code} }`;
}

/**
 * Replaces or toggles field representations in document HTML.
 * When showRawCodes is true, renders editable raw syntax with Word-style brackets.
 * When showRawCodes is false, renders the computed value.
 */
export function processFieldCodesInHtml(
  html: string,
  context: FieldContext,
  showRawCodes: boolean
): string {
  // Pattern matching field code span tags
  // <span class="ms-field-code" data-field-raw="PAGE">...</span>
  return html.replace(
    /<span([^>]*?)class="([^"]*?)ms-field-code([^"]*?)"([^>]*?)data-field-code="([^"]+)"([^>]*)>(.*?)<\/span>/gi,
    (match, p1, p2, p3, p4, fieldCode, p6, currentContent) => {
      const evaluated = evaluateFieldExpression(fieldCode, context);
      const displayContent = showRawCodes ? `{ ${fieldCode} }` : evaluated;
      return `<span${p1}class="${p2}ms-field-code${p3}"${p4}data-field-code="${fieldCode}"${p6} style="${
        showRawCodes ? "background-color: #E2E8F0; padding: 0 4px; border: 1px dashed #94A3B8; font-family: monospace;" : ""
      }">${displayContent}</span>`;
    }
  );
}
