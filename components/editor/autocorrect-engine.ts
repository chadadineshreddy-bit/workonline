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
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\epsilon": "ε",
  "\\theta": "θ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\pi": "π",
  "\\sigma": "σ",
  "\\omega": "ω",
  "\\Delta": "Δ",
  "\\Sigma": "Σ",
  "\\Omega": "Ω",
  "\\sum": "∑",
  "\\infty": "∞",
  "\\neq": "≠",
  "\\leq": "≤",
  "\\geq": "≥",
  "\\times": "×",
  "\\div": "÷",
  "\\approx": "≈",
  "\\sqrt": "√",
  "\\pm": "±",
  "\\cdot": "·",
  "\\degree": "°",
};

export const FRACTION_MAP: Record<string, string> = {
  "1/2": "½",
  "1/4": "¼",
  "3/4": "¾",
  "1/3": "⅓",
  "2/3": "⅔",
  "1/8": "⅛",
  "3/8": "⅜",
  "5/8": "⅝",
  "7/8": "⅞",
};

export const ORDINAL_MAP: Record<string, string> = {
  "1st": "1ˢᵗ",
  "2nd": "2ⁿᵈ",
  "3rd": "3ʳᵈ",
  "4th": "4ᵗʰ",
  "5th": "5ᵗʰ",
  "6th": "6ᵗʰ",
  "7th": "7ᵗʰ",
  "8th": "8ᵗʰ",
  "9th": "9ᵗʰ",
  "10th": "10ᵗʰ",
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
  for (const rule of userRules) {
    if (currentWord.endsWith(rule.shortcut)) {
      return {
        matched: true,
        replacement: rule.replacement,
        lengthToRemove: rule.shortcut.length,
      };
    }
  }

  // 2. Math AutoCorrect
  if (options.mathAutoCorrect && currentWord.startsWith("\\")) {
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
  if (options.fractions) {
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
  if (options.ordinals) {
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
  if (options.hyphensToDashes) {
    if (currentWord.endsWith("---")) {
      return { matched: true, replacement: "—", lengthToRemove: 3 }; // Em-dash
    }
    if (currentWord.endsWith("--")) {
      return { matched: true, replacement: "–", lengthToRemove: 2 }; // En-dash
    }
  }

  return null;
}

/**
 * Transforms plain quotes into smart curly quotes in a string.
 */
export function applySmartQuotes(text: string): string {
  return text
    .replace(/(^|[-\u2014\s(\["])'/g, "$1‘") // open single
    .replace(/'/g, "’") // close single / apostrophe
    .replace(/(^|[-\u2014\s(\[])"/g, "$1“") // open double
    .replace(/"/g, "”"); // close double
}

/**
 * Converts raw URLs and emails to anchor tags if not already linked.
 */
export function linkifyUrlsAndEmails(html: string): string {
  // Simple non-destructive linkify for paragraphs
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
