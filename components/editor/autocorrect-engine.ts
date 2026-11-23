/**
 * AutoCorrect, AutoFormat As You Type, and Math AutoCorrect Engine
 * Integrates into keystroke processing in the DocuFlow editor.
 */

export interface AutoFormatOptions {
  smartQuotes: boolean;
  hyphensToDashes: boolean;
  fractions: boolean;
  ordinals: boolean;
  horizontalRules: boolean;
  autoHyperlinks: boolean;
  mathAutoCorrect: boolean;
}

export const MATH_AUTOCORRECT_MAP: Record<string, string> = {
  "\\alpha": "\u03B1",
  "\\beta": "\u03B2",
  "\\gamma": "\u03B3",
  "\\delta": "\u03B4",
  "\\epsilon": "\u03B5",
  "\\theta": "\u03B8",
  "\\lambda": "\u03BB",
  "\\mu": "\u03BC",
  "\\pi": "\u03C0",
  "\\sigma": "\u03C3",
  "\\omega": "\u03C9",
  "\\Delta": "\u0394",
  "\\Sigma": "\u03A3",
  "\\Omega": "\u03A9",
  "\\sum": "\u2211",
  "\\infty": "\u221E",
  "\\neq": "\u2260",
  "\\leq": "\u2264",
  "\\geq": "\u2265",
  "\\times": "\u00D7",
  "\\div": "\u00F7",
  "\\approx": "\u2248",
  "\\sqrt": "\u221A",
  "\\pm": "\u00B1",
  "\\cdot": "\u22C5",
  "\\degree": "\u00B0",
};

export const FRACTION_MAP: Record<string, string> = {
  "1/2": "\u00BD",
  "1/4": "\u00BC",
  "3/4": "\u00BE",
  "1/3": "\u2153",
  "2/3": "\u2154",
  "1/8": "\u215B",
  "3/8": "\u215C",
  "5/8": "\u215D",
  "7/8": "\u215E",
};

export const ORDINAL_MAP: Record<string, string> = {
  "1st": "1\u02E2\u1D57",
  "2nd": "2\u207F\u1D48",
  "3rd": "3\u02B3\u1D48",
  "4th": "4\u1D57\u02B0",
  "5th": "5\u1D57\u02B0",
  "6th": "6\u1D57\u02B0",
  "7th": "7\u1D57\u02B0",
  "8th": "8\u1D57\u02B0",
  "9th": "9\u1D57\u02B0",
  "10th": "10\u1D57\u02B0",
};

/**
 * Checks if the last typed sequence at the cursor matches an AutoCorrect or AutoFormat rule.
 * Returns replacement text and how many characters to remove before inserting.
 */
export function processTypingReplacement(
  currentWord: string,
  userRules: { shortcut: string; replacement: string }[],
  options: AutoFormatOptions
): { matched: boolean; replacement: string; lengthToRemove: number } | null {
  if (!currentWord || currentWord.length === 0) return null;

  // 1. User AutoCorrect Rules
  if (userRules && userRules.length > 0) {
    for (const rule of userRules) {
      if (currentWord.endsWith(rule.shortcut)) {
        return {
          matched: true,
          replacement: rule.replacement,
          lengthToRemove: rule.shortcut.length,
        };
      }
    }
  }

  // 2. Math AutoCorrect
  if (options?.mathAutoCorrect && currentWord.startsWith("\\")) {
    for (const [code, symbol] of Object.entries(MATH_AUTOCORRECT_MAP)) {
      if (currentWord.endsWith(code)) {
        return {
          matched: true,
          replacement: symbol,
          lengthToRemove: code.length,
        };
      }
    }
  }

  // 3. Fractions
  if (options?.fractions) {
    for (const [frac, symbol] of Object.entries(FRACTION_MAP)) {
      if (currentWord.endsWith(frac)) {
        return {
          matched: true,
          replacement: symbol,
          lengthToRemove: frac.length,
        };
      }
    }
  }

  // 4. Ordinals
  if (options?.ordinals) {
    for (const [ord, symbol] of Object.entries(ORDINAL_MAP)) {
      if (currentWord.endsWith(ord)) {
        return {
          matched: true,
          replacement: symbol,
          lengthToRemove: ord.length,
        };
      }
    }
  }

  // 5. Hyphens to Dashes
  if (options?.hyphensToDashes) {
    if (currentWord.endsWith("---")) {
      return { matched: true, replacement: "\u2014", lengthToRemove: 3 }; // Em-dash
    }
    if (currentWord.endsWith("--")) {
      return { matched: true, replacement: "\u2013", lengthToRemove: 2 }; // En-dash
    }
  }

  return null;
}

/**
 * Transforms plain quotes into smart curly quotes in a string.
 */
export function applySmartQuotes(text: string): string {
  return text
    .replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018") // open single
    .replace(/'/g, "\u2019") // close single / apostrophe
    .replace(/(^|[-\u2014\s(\[])"/g, "$1\u201C") // open double
    .replace(/"/g, "\u201D"); // close double
}

/**
 * Converts raw URLs and emails to anchor tags if not already linked.
 */
export function linkifyUrlsAndEmails(html: string): string {
  const urlRegex = /(?<!href="|">)(https?:\/\/[^\s<]+)/gi;
  const emailRegex = /(?<!href="mailto:|">)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

  let processed = html.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #0F6CBD; text-decoration: underline;">${url}</a>`;
  });

  processed = processed.replace(emailRegex, (email) => {
    return `<a href="mailto:${email}" style="color: #0F6CBD; text-decoration: underline;">${email}</a>`;
  });

  return processed;
}
