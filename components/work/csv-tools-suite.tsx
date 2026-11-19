"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Upload,
  Download,
  Search,
  ArrowUpDown,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Filter,
  FileCode,
  FileText
} from "lucide-react";
import * as XLSX from "xlsx";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

const SAMPLE_CSV_DATA = `EmployeeID,Name,Department,Role,Salary,Location,Status
EMP-101,Jonathan Doe,Engineering,Senior Full Stack Engineer,145000,San Francisco,Active
EMP-102,Sarah Jenkins,Engineering,Director of Engineering,185000,New York,Active
EMP-103,Michael Chen,Architecture,Principal Cloud Architect,165000,Austin,Active
EMP-104,Emily Davis,Design,Lead Product Designer,135000,San Francisco,Active
EMP-105,David Kumar,Product,Senior Product Manager,140000,Chicago,Active
EMP-106,Jessica Taylor,Marketing,Content Strategist,95000,Remote,Active
EMP-107,Robert Wilson,Sales,Enterprise Account Executive,130000,Austin,On Leave
EMP-108,Amanda Martinez,Finance,Senior Financial Analyst,115000,New York,Active`;

export function CsvToolsSuite() {
  const [data, setData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("sample-employees.csv");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColIndex, setSortColIndex] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Initialize with sample data on mount
  React.useEffect(() => {
    loadCsvString(SAMPLE_CSV_DATA, "sample-employees.csv");
  }, []);

  const loadCsvString = (csvStr: string, name: string) => {
    try {
      const workbook = XLSX.read(csvStr, { type: "string" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: string[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      if (rows.length > 0) {
        setHeaders(rows[0].map(String));
        setData(rows.slice(1).filter((r) => r.length > 0));
        setFileName(name);
        setErrorMessage("");
        setCurrentPage(1);
      }
    } catch (err: any) {
      setErrorMessage("Failed to parse CSV string: " + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".csv") && !lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
      setErrorMessage("Please upload a valid .csv or .xlsx spreadsheet file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: string[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (rows.length > 0) {
          setHeaders(rows[0].map(String));
          setData(rows.slice(1).filter((r) => r.length > 0));
          setFileName(file.name);
          setErrorMessage("");
          setCurrentPage(1);
        } else {
          setErrorMessage("The uploaded file contains no data rows.");
        }
      } catch (err: any) {
        setErrorMessage("Spreadsheet parsing error: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSort = (colIndex: number) => {
    if (sortColIndex === colIndex) {
      setSortAsc(!sortAsc);
    } else {
      setSortColIndex(colIndex);
      setSortAsc(true);
    }
  };

  // Filter & sort
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        row.some((cell) => String(cell || "").toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortColIndex !== null) {
      result.sort((a, b) => {
        const valA = a[sortColIndex] ?? "";
        const valB = b[sortColIndex] ?? "";

        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAsc ? numA - numB : numB - numA;
        }

        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [data, searchQuery, sortColIndex, sortAsc]);

  // Paginated data
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Export conversions
  const handleExportXlsx = () => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...processedData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const outName = fileName.replace(/\.[^/.]+$/, "") + "-converted.xlsx";
    XLSX.writeFile(wb, outName);
  };

  const handleExportCsv = () => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...processedData]);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const outName = fileName.replace(/\.[^/.]+$/, "") + "-converted.csv";
    triggerBlobDownload(blob, outName);
  };

  const handleExportJson = () => {
    const objList = processedData.map((row) => {
      const item: Record<string, any> = {};
      headers.forEach((h, i) => {
        item[h] = row[i] ?? "";
      });
      return item;
    });
    const blob = new Blob([JSON.stringify(objList, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const outName = fileName.replace(/\.[^/.]+$/, "") + ".json";
    triggerBlobDownload(blob, outName);
  };

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
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                CSV & Spreadsheet Converter
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#777777]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-[#777777]" />
              <span>JSON</span>
            </button>
            <button
              onClick={handleExportXlsx}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Convert to XLSX</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            CSV & XLSX Spreadsheet Tools
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Upload CSV or Excel workbooks, search rows, sort columns, and convert between CSV, XLSX, and JSON directly in your browser.
          </p>
        </div>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-white/80 hover:border-blue-500 bg-white rounded-2xl p-6 text-center transition-colors shadow-xs">
          <Upload className="w-8 h-8 text-[#F04452] mx-auto mb-2" />
          <p className="text-xs font-bold text-[#202124]">
            Current File: <span className="text-[#F04452] font-mono">{fileName}</span>
          </p>
          <p className="text-[11px] text-[#777777] mt-1">
            Drag & drop or browse to upload any .csv or .xlsx spreadsheet file (up to 50MB)
          </p>
          <label className="inline-block mt-3 px-4 py-2 liquid-btn-primary rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
            <span>Browse Spreadsheet</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Table Container */}
        {headers.length > 0 && (
          <div className="liquid-glass-card rounded-2xl shadow-md overflow-hidden space-y-4 p-5">
            {/* Filter and stats row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search table rows..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-[#777777]">
                <span>
                  Showing <strong>{processedData.length}</strong> of <strong>{data.length}</strong> rows
                </span>

                <div className="flex items-center gap-1">
                  <span>Page Size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value, 10));
                      setCurrentPage(1);
                    }}
                    className="text-xs px-2 py-1 rounded border border-white/80 bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Interactive Data Table */}
            <div className="overflow-x-auto border border-white/80 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/20 border-b border-white/80 text-[#777777] font-bold uppercase tracking-wider select-none">
                  <tr>
                    {headers.map((h, idx) => (
                      <th
                        key={idx}
                        onClick={() => handleSort(idx)}
                        className="py-2.5 px-3.5 cursor-pointer hover:bg-white/30 transition-colors whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{h}</span>
                          <ArrowUpDown className="w-3 h-3 text-[#777777]" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/20/70 transition-colors">
                      {headers.map((_, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3.5 text-[#202124] whitespace-nowrap">
                          {row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]) : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 text-xs text-[#777777]">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border border-white/80 bg-white hover:bg-white/20 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded border border-white/80 bg-white hover:bg-white/20 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
