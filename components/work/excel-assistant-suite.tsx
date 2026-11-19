"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  Search,
  Copy,
  Check,
  ChevronRight,
  BookOpen,
  Sliders,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight
} from "lucide-react";

export type ExcelCategory =
  | "All"
  | "Lookup & Reference"
  | "Logical"
  | "Math & Basic"
  | "Text"
  | "Date & Time"
  | "Statistical";

interface ExcelFormulaItem {
  name: string;
  category: ExcelCategory;
  syntax: string;
  shortDesc: string;
  example: string;
  explanation: string;
}

const FORMULA_LIBRARY: ExcelFormulaItem[] = [
  // Lookup
  {
    name: "XLOOKUP",
    category: "Lookup & Reference",
    syntax: "=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode])",
    shortDesc: "Modern replacement for VLOOKUP and HLOOKUP that searches in any direction.",
    example: '=XLOOKUP(E2, A2:A100, C2:C100, "Not Found")',
    explanation: "Searches A2:A100 for the value in E2 and returns the corresponding value from column C. Doesn't break when columns are reordered.",
  },
  {
    name: "VLOOKUP",
    category: "Lookup & Reference",
    syntax: "=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])",
    shortDesc: "Searches for a value in the leftmost column of a table and returns a value in the same row from a specified column.",
    example: "=VLOOKUP(A2, Products!A1:D500, 3, FALSE)",
    explanation: "Searches for key A2 in the first column of range A1:D500, and returns the value from the 3rd column with exact match (FALSE).",
  },
  {
    name: "INDEX",
    category: "Lookup & Reference",
    syntax: "=INDEX(array, row_num, [column_num])",
    shortDesc: "Returns the value of an element in a table or array selected by the row and column number indexes.",
    example: "=INDEX(B2:D20, 5, 2)",
    explanation: "Extracts the cell value at row 5 and column 2 within range B2:D20.",
  },
  {
    name: "MATCH",
    category: "Lookup & Reference",
    syntax: "=MATCH(lookup_value, lookup_array, [match_type])",
    shortDesc: "Returns the relative position of an item in an array that matches a specified value.",
    example: '=MATCH("Widget A", A1:A50, 0)',
    explanation: "Finds the row index where 'Widget A' exactly matches in A1:A50. Commonly paired with INDEX as INDEX/MATCH.",
  },

  // Logical
  {
    name: "IF",
    category: "Logical",
    syntax: "=IF(logical_test, [value_if_true], [value_if_false])",
    shortDesc: "Checks whether a condition is met, and returns one value if TRUE, and another value if FALSE.",
    example: '=IF(B2>=75, "Pass", "Fail")',
    explanation: "If student score in B2 is 75 or greater, outputs 'Pass'; otherwise outputs 'Fail'.",
  },
  {
    name: "IFS",
    category: "Logical",
    syntax: "=IFS(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...)",
    shortDesc: "Evaluates multiple conditions and returns a value corresponding to the first TRUE condition.",
    example: '=IFS(A2>=90, "A", A2>=80, "B", A2>=70, "C", TRUE, "F")',
    explanation: "Checks grades top-to-bottom and assigns letter grade without requiring nested IF statements.",
  },

  // Math & Basic
  {
    name: "SUM",
    category: "Math & Basic",
    syntax: "=SUM(number1, [number2], ...)",
    shortDesc: "Adds all the numbers in a range of cells.",
    example: "=SUM(C2:C50)",
    explanation: "Calculates the total mathematical sum of cells C2 through C50.",
  },
  {
    name: "SUMIF",
    category: "Math & Basic",
    syntax: "=SUMIF(range, criteria, [sum_range])",
    shortDesc: "Adds the cells specified by a given condition or criteria.",
    example: '=SUMIF(A2:A100, "West", C2:C100)',
    explanation: "Adds values in column C only if the corresponding cell in column A equals 'West'.",
  },
  {
    name: "SUMIFS",
    category: "Math & Basic",
    syntax: "=SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)",
    shortDesc: "Adds the cells in a range that meet multiple conditions.",
    example: '=SUMIFS(D2:D100, A2:A100, "Q4", B2:B100, ">500")',
    explanation: "Sums revenue in D2:D100 where quarter is 'Q4' AND deal size exceeds 500.",
  },
  {
    name: "ROUND",
    category: "Math & Basic",
    syntax: "=ROUND(number, num_digits)",
    shortDesc: "Rounds a number to a specified number of digits.",
    example: "=ROUND(A1 * 1.085, 2)",
    explanation: "Rounds calculated total tax to 2 decimal places.",
  },
  {
    name: "MAX",
    category: "Math & Basic",
    syntax: "=MAX(number1, [number2], ...)",
    shortDesc: "Returns the largest value in a set of values.",
    example: "=MAX(E2:E500)",
    explanation: "Finds the peak transaction value in column E.",
  },
  {
    name: "MIN",
    category: "Math & Basic",
    syntax: "=MIN(number1, [number2], ...)",
    shortDesc: "Returns the smallest number in a set of values.",
    example: "=MIN(E2:E500)",
    explanation: "Finds the minimum transaction or test score.",
  },

  // Statistical
  {
    name: "AVERAGE",
    category: "Statistical",
    syntax: "=AVERAGE(number1, [number2], ...)",
    shortDesc: "Returns the arithmetic mean of its arguments.",
    example: "=AVERAGE(D2:D80)",
    explanation: "Calculates the average metric score across 80 entries.",
  },
  {
    name: "COUNT",
    category: "Statistical",
    syntax: "=COUNT(value1, [value2], ...)",
    shortDesc: "Counts the number of cells in a range that contain numbers.",
    example: "=COUNT(B2:B100)",
    explanation: "Counts how many numeric entries are present in column B, ignoring blank and text cells.",
  },
  {
    name: "COUNTA",
    category: "Statistical",
    syntax: "=COUNTA(value1, [value2], ...)",
    shortDesc: "Counts the number of cells in a range that are not empty (both numbers and text).",
    example: "=COUNTA(A2:A100)",
    explanation: "Counts all non-empty rows regardless of whether they contain strings or numbers.",
  },
  {
    name: "COUNTIF",
    category: "Statistical",
    syntax: "=COUNTIF(range, criteria)",
    shortDesc: "Counts the number of cells within a range that meet the given condition.",
    example: '=COUNTIF(C2:C100, "Completed")',
    explanation: "Counts how many tasks have the status 'Completed'.",
  },
  {
    name: "COUNTIFS",
    category: "Statistical",
    syntax: "=COUNTIFS(criteria_range1, criteria1, [criteria_range2, criteria2], ...)",
    shortDesc: "Counts the number of cells specified by a given set of conditions or criteria.",
    example: '=COUNTIFS(A2:A100, "Engineering", D2:D100, "Remote")',
    explanation: "Counts team members who are in Engineering department AND working remote.",
  },

  // Text
  {
    name: "CONCAT",
    category: "Text",
    syntax: "=CONCAT(text1, [text2], ...)",
    shortDesc: "Combines the text from multiple ranges and/or strings.",
    example: '=CONCAT(A2, " ", B2)',
    explanation: "Combines First Name in A2 and Last Name in B2 with a space.",
  },
  {
    name: "TEXTJOIN",
    category: "Text",
    syntax: "=TEXTJOIN(delimiter, ignore_empty, text1, [text2], ...)",
    shortDesc: "Combines text from multiple ranges with a specified delimiter.",
    example: '=TEXTJOIN(", ", TRUE, A2:A10)',
    explanation: "Joins all names in A2:A10 into a comma-separated string, ignoring empty cells.",
  },
  {
    name: "TRIM",
    category: "Text",
    syntax: "=TRIM(text)",
    shortDesc: "Removes all spaces from text except for single spaces between words.",
    example: "=TRIM(A2)",
    explanation: "Cleans up messy copy-pasted data by stripping leading and trailing spaces.",
  },
  {
    name: "LEN",
    category: "Text",
    syntax: "=LEN(text)",
    shortDesc: "Returns the number of characters in a text string.",
    example: "=LEN(C2)",
    explanation: "Checks string character length, useful for validating postal codes or phone numbers.",
  },
  {
    name: "LEFT",
    category: "Text",
    syntax: "=LEFT(text, [num_chars])",
    shortDesc: "Returns the first character or characters in a text string from the left.",
    example: "=LEFT(A2, 3)",
    explanation: "Extracts the 3-letter department code from an ID string like 'ENG-2026'.",
  },
  {
    name: "RIGHT",
    category: "Text",
    syntax: "=RIGHT(text, [num_chars])",
    shortDesc: "Returns the last character or characters in a text string from the right.",
    example: "=RIGHT(B2, 4)",
    explanation: "Extracts the 4-digit year from an employee ID.",
  },
  {
    name: "MID",
    category: "Text",
    syntax: "=MID(text, start_num, num_chars)",
    shortDesc: "Returns a specific number of characters from a text string, starting at the position you specify.",
    example: "=MID(A2, 5, 4)",
    explanation: "Extracts 4 characters starting from character position 5.",
  },

  // Date & Time
  {
    name: "TODAY",
    category: "Date & Time",
    syntax: "=TODAY()",
    shortDesc: "Returns the current date formatted as a date.",
    example: "=TODAY() - A2",
    explanation: "Calculates the number of days elapsed since the invoice date in A2.",
  },
  {
    name: "NOW",
    category: "Date & Time",
    syntax: "=NOW()",
    shortDesc: "Returns the current date and time formatted as date and time.",
    example: "=NOW()",
    explanation: "Inserts a live volatile timestamp of the current moment.",
  },
];

export function ExcelAssistantSuite() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ExcelCategory>("All");
  const [copiedName, setCopiedName] = useState<string | null>(null);

  // Explainer / Parser input
  const [userFormula, setUserFormula] = useState('=VLOOKUP(A2, Data!A:E, 3, FALSE)');

  const filteredFormulas = useMemo(() => {
    return FORMULA_LIBRARY.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.syntax.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = async (example: string, name: string) => {
    try {
      await navigator.clipboard.writeText(example);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 2000);
    } catch {
      alert("Failed to copy formula.");
    }
  };

  // Rule-based formula explainer parser
  const formulaExplanation = useMemo(() => {
    const raw = userFormula.trim().replace(/^=/, "");
    const match = raw.match(/^([A-Z0-9_]+)\((.*)\)$/i);

    if (!match) {
      return {
        isValid: false,
        message: "Please enter a valid Excel formula beginning with function name and parentheses, e.g. =SUM(A1:A10)",
      };
    }

    const funcName = match[1].toUpperCase();
    const argsRaw = match[2];

    // Split args taking commas into account (naive split for demo)
    const args = argsRaw.split(",").map((s) => s.trim());
    const libraryEntry = FORMULA_LIBRARY.find((f) => f.name === funcName);

    return {
      isValid: true,
      funcName,
      args,
      libraryEntry,
      argsCount: args.length,
    };
  }, [userFormula]);

  return (
    <div className="text-white space-y-8">
      {/* Top Banner */}
      <div className="liquid-glass-pill p-3 px-6 mb-6 flex items-center justify-between print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/work-zone"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Work Zone <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Excel Formula Library & Assistant
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/work-zone/csv-tools"
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>CSV & XLSX Converter →</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Excel & Spreadsheet Formula Assistant
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Quick reference guide for common Excel and Google Sheets formulas with copyable syntax, real-world examples, and step-by-step formula breakdown.
          </p>
        </div>

        {/* Section 1: Interactive Formula Explainer */}
        <div className="liquid-glass-card rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Formula Syntax Explainer
              </h3>
              <p className="text-xs text-[#777777]">
                Type or paste any Excel formula to break down its functions and parameters
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={userFormula}
              onChange={(e) => setUserFormula(e.target.value)}
              placeholder="e.g. =XLOOKUP(A2, B:B, C:C)"
              className="flex-1 text-xs sm:text-sm font-mono px-3.5 py-2.5 rounded-xl border border-white/80 bg-white/20 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
            />
          </div>

          {/* Explanation Output */}
          <div className="p-4 rounded-xl bg-white/20 border border-white/80 text-xs space-y-2">
            {formulaExplanation.isValid ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#202124]">Function Identified:</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {formulaExplanation.funcName}
                  </span>
                  <span className="text-[#777777]">({formulaExplanation.argsCount} arguments provided)</span>
                </div>

                {formulaExplanation.libraryEntry ? (
                  <p className="text-[#202124] leading-relaxed">
                    {formulaExplanation.libraryEntry.shortDesc}
                  </p>
                ) : (
                  <p className="text-[#777777] italic">
                    Custom or composite Excel function.
                  </p>
                )}

                <div className="pt-2 border-t border-white/80 space-y-1">
                  <span className="font-semibold text-[#202124] block text-[11px] uppercase tracking-wider">
                    Argument Breakdown:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    {formulaExplanation.args?.map((arg, idx) => (
                      <div key={idx} className="p-2 rounded liquid-glass-card">
                        <span className="text-[#777777] mr-2">Arg #{idx + 1}:</span>
                        <strong className="text-[#F04452]">{arg}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[#777777] text-xs italic">
                {formulaExplanation.message}
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Formula Library Search & Directory */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Excel formulas (e.g. XLOOKUP, SUMIF, TRIM)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-white/80 bg-white focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {[
                "All",
                "Lookup & Reference",
                "Logical",
                "Math & Basic",
                "Text",
                "Date & Time",
                "Statistical",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as ExcelCategory)}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white font-bold"
                      : "liquid-glass-card text-[#777777] hover:bg-white/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFormulas.map((item) => (
              <div
                key={item.name}
                className="liquid-glass-card rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-white/80 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-black text-[#202124] font-mono">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/30 text-[#777777]">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-[#777777] leading-relaxed mb-3">
                    {item.shortDesc}
                  </p>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                      Syntax
                    </span>
                    <div className="p-2 rounded-lg bg-white/20 border border-white/60 font-mono text-[11px] text-[#202124] break-all">
                      {item.syntax}
                    </div>

                    <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block pt-1">
                      Example
                    </span>
                    <div className="p-2 rounded-lg bg-red-500/10/50 border border-[#F04452]/20 font-mono text-[11px] text-[#202124] break-all flex items-center justify-between">
                      <span>{item.example}</span>
                      <button
                        onClick={() => handleCopy(item.example, item.name)}
                        className="text-[#F04452] hover:text-[#D72638] p-0.5 shrink-0 ml-2"
                        title="Copy formula example"
                      >
                        {copiedName === item.name ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/60 text-[11px] text-[#777777] leading-relaxed">
                  {item.explanation}
                </div>
              </div>
            ))}

            {filteredFormulas.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-[#777777] liquid-glass-card rounded-2xl">
                No formulas found matching &quot;{searchQuery}&quot;.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
