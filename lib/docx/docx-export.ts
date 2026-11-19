import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  Packer,
  WidthType,
  BorderStyle,
} from "docx";

/**
 * Parses an HTML string (from editor or notes) into docx Paragraphs and Tables.
 */
export function htmlToDocxElements(html: string): (Paragraph | Table)[] {
  if (typeof window === "undefined") {
    return [new Paragraph({ children: [new TextRun(html.replace(/<[^>]*>?/gm, ""))] })];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const container = doc.body.firstElementChild || doc.body;

  const elements: (Paragraph | Table)[] = [];

  function parseTextRuns(node: Node, currentStyles: { bold?: boolean; italics?: boolean; underline?: boolean; strike?: boolean; color?: string } = {}): TextRun[] {
    const runs: TextRun[] = [];

    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || "";
        if (text) {
          runs.push(
            new TextRun({
              text,
              bold: currentStyles.bold,
              italics: currentStyles.italics,
              underline: currentStyles.underline ? {} : undefined,
              strike: currentStyles.strike,
              color: currentStyles.color ? currentStyles.color.replace("#", "") : undefined,
            })
          );
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();

        const newStyles = { ...currentStyles };
        if (tag === "b" || tag === "strong") newStyles.bold = true;
        if (tag === "i" || tag === "em") newStyles.italics = true;
        if (tag === "u") newStyles.underline = true;
        if (tag === "s" || tag === "strike") newStyles.strike = true;

        if (el.style.color) {
          newStyles.color = el.style.color;
        }

        runs.push(...parseTextRuns(el, newStyles));
      }
    });

    return runs;
  }

  container.childNodes.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // Headings
      if (tag === "h1") {
        elements.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: parseTextRuns(el, { bold: true }),
          })
        );
      } else if (tag === "h2") {
        elements.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: parseTextRuns(el, { bold: true }),
          })
        );
      } else if (tag === "h3") {
        elements.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 },
            children: parseTextRuns(el, { bold: true }),
          })
        );
      } else if (tag === "table") {
        // Table support
        const rows: TableRow[] = [];
        const trs = el.querySelectorAll("tr");

        trs.forEach((tr) => {
          const cells: TableCell[] = [];
          const tds = tr.querySelectorAll("td, th");
          tds.forEach((td) => {
            const isHeader = td.tagName.toLowerCase() === "th";
            cells.push(
              new TableCell({
                width: { size: Math.floor(100 / (tds.length || 1)), type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: parseTextRuns(td, { bold: isHeader }),
                  }),
                ],
              })
            );
          });
          if (cells.length > 0) {
            rows.push(new TableRow({ children: cells }));
          }
        });

        if (rows.length > 0) {
          elements.push(
            new Table({
              rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
        }
      } else if (tag === "ul") {
        const lis = el.querySelectorAll("li");
        lis.forEach((li) => {
          elements.push(
            new Paragraph({
              bullet: { level: 0 },
              children: parseTextRuns(li),
            })
          );
        });
      } else if (tag === "ol") {
        const lis = el.querySelectorAll("li");
        lis.forEach((li, idx) => {
          elements.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${idx + 1}. `, bold: true }),
                ...parseTextRuns(li),
              ],
            })
          );
        });
      } else if (tag === "hr") {
        elements.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "cbd5e1" },
            },
            spacing: { before: 160, after: 160 },
          })
        );
      } else {
        // Standard paragraph
        let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;
        if (el.style.textAlign === "center") alignment = AlignmentType.CENTER;
        else if (el.style.textAlign === "right") alignment = AlignmentType.RIGHT;
        else if (el.style.textAlign === "justify") alignment = AlignmentType.JUSTIFIED;

        elements.push(
          new Paragraph({
            alignment,
            spacing: { after: 120 },
            children: parseTextRuns(el),
          })
        );
      }
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim();
      if (text) {
        elements.push(
          new Paragraph({
            children: [new TextRun(text)],
            spacing: { after: 120 },
          })
        );
      }
    }
  });

  if (elements.length === 0) {
    elements.push(new Paragraph({ children: [new TextRun("Empty Document")] }));
  }

  return elements;
}

/**
 * Generates a valid .docx Blob from HTML content.
 */
export async function exportHtmlToDocxBlob(
  htmlContent: string,
  title: string = "Document"
): Promise<Blob> {
  const elements = htmlToDocxElements(htmlContent);

  const doc = new Document({
    title,
    sections: [
      {
        properties: {},
        children: elements,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
