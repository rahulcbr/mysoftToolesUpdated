"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileText, Settings, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function PdfSplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitUrl, setSplitUrl] = useState<string | null>(null);
  const [splitSize, setSplitSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recordRecentTool("pdf-split");
  }, []);

  const handleFileSelect = async (files: File[]) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setSplitUrl(null);
      setSplitSize(null);
      setError(null);
      
      setIsProcessing(true);
      try {
        const fileBytes = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBytes);
        setPageCount(pdfDoc.getPageCount());
        setRangeInput(`1-${Math.min(pdfDoc.getPageCount(), 3)}`);
      } catch (err) {
        console.error(err);
        alert("Failed to read PDF document. Verify it is not encrypted.");
        setFile(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const parseRanges = (input: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const tokens = input.replace(/\s+/g, "").split(",");

    for (const token of tokens) {
      if (!token) continue;
      
      if (token.includes("-")) {
        const parts = token.split("-");
        if (parts.length !== 2) throw new Error(`Invalid range format: ${token}`);
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);

        if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > maxPages || end > maxPages) {
          throw new Error(`Out of bounds or invalid range: ${token}`);
        }
        
        const rStart = Math.min(start, end);
        const rEnd = Math.max(start, end);
        for (let i = rStart; i <= rEnd; i++) {
          pages.add(i - 1); // 0-indexed internally
        }
      } else {
        const val = parseInt(token, 10);
        if (isNaN(val) || val < 1 || val > maxPages) {
          throw new Error(`Invalid page index: ${token}`);
        }
        pages.add(val - 1);
      }
    }

    if (pages.size === 0) throw new Error("No pages specified");
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !rangeInput) return;
    setIsProcessing(true);
    setError(null);

    try {
      const pageIndices = parseRanges(rangeInput, pageCount);
      const fileBytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(fileBytes);
      const newDoc = await PDFDocument.create();

      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const splitBytes = await newDoc.save();
      const splitBlob = new Blob([splitBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (splitUrl) {
        URL.revokeObjectURL(splitUrl);
      }

      setSplitUrl(URL.createObjectURL(splitBlob));
      setSplitSize(splitBlob.size);
    } catch (err: any) {
      setError(err.message || "Failed to split PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const faqs = [
    {
      question: "How do I specify pages and ranges?",
      answer: "You can write single pages separated by commas, or ranges using hyphens. For example, '1, 3, 5-8' extracts pages 1, 3, 5, 6, 7, and 8 into a new PDF document.",
    },
    {
      question: "Are my files stored anywhere when I split them?",
      answer: "No. Your PDF document never touches any server. The splitting processes run entirely in your local browser sandbox, securing high-confidentiality files.",
    },
    {
      question: "Can I split a PDF with password locks?",
      answer: "No. Security permissions prevent locked documents from being split. Decrypt the password lock first using our PDF Password Unlocker before trying to split it.",
    },
  ];

  return (
    <ToolLayout toolId="pdf-split">
      <div className="space-y-8">
        {!file ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            multiple={false}
            maxSizeMB={25}
            label="Upload your PDF file to split pages"
          />
        ) : (
          <div className="space-y-6">
            {/* File metadata card */}
            <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                    {file.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Original Pages: {pageCount} | Size: {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setSplitUrl(null);
                  setSplitSize(null);
                  setPageCount(0);
                  setError(null);
                }}
                className="text-xs text-muted-foreground hover:text-red-500 font-semibold"
              >
                Clear
              </button>
            </div>

            {/* Split Settings */}
            {!splitUrl && (
              <form onSubmit={handleSplit} className="glass-card p-6 border border-border/60 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" /> Extraction Configuration
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>Page Ranges to Extract</span>
                    <span className="text-primary font-mono text-[10px]">Max: {pageCount} pages</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g. 1, 3-5, 7"
                    className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Use commas for separate pages (e.g. 1,3) and hyphens for page spreads (e.g. 2-5).
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Splitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Extract PDF Pages
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Success Output */}
            {splitUrl && (
              <div className="p-6 border border-emerald-500/25 bg-emerald-500/5 rounded-2xl text-center space-y-4">
                <span className="inline-block p-3 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                  <FileText className="w-6 h-6" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Split PDF Compiled!</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your custom pages have been extracted successfully.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setSplitUrl(null);
                      setSplitSize(null);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
                  >
                    Adjust Ranges
                  </button>
                  <a
                    href={splitUrl}
                    download={`mysofttools-split-${file.name}`}
                    className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/20"
                  >
                    <Download className="w-4 h-4" /> Download PDF ({splitSize ? formatSize(splitSize) : ""})
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <SEOContent
          title="PDF Splitter"
          explanation="Our client-side PDF Splitter lets you extract target page ranges from any PDF document without sending any data over the internet. Built using robust local JavaScript structures, this browser-based utility loads the document layout into temporary browser memory, copies the chosen vector buffers, and outputs a new isolated PDF file in real-time."
          howToUse={[
            "Select and upload the PDF file you want to split.",
            "Review the page count details listed on the file card.",
            "Write your target extraction parameters in the page ranges input (e.g. '1, 3-4' to extract page 1, page 3, and page 4).",
            "Click 'Extract PDF Pages' to run the client-side splitter.",
            "Click 'Download PDF' to save your new file instantly."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
