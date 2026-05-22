"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileText, Trash2, ArrowUp, ArrowDown, Sparkles, Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export default function PdfMergePage() {
  const [files, setFiles] = useState<PdfItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedSize, setMergedSize] = useState<number | null>(null);

  useEffect(() => {
    recordRecentTool("pdf-merge");
  }, []);

  const handleFileSelect = async (newFiles: File[]) => {
    setIsProcessing(true);
    const loadedItems: PdfItem[] = [];

    for (const file of newFiles) {
      try {
        const fileBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBytes);
        const pageCount = pdfDoc.getPageCount();

        loadedItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          size: file.size,
          pageCount,
        });
      } catch (err) {
        console.error(`Failed to parse PDF file ${file.name}:`, err);
        alert(`Could not load "${file.name}". Is it password encrypted?`);
      }
    }

    setFiles((prev) => [...prev, ...loadedItems]);
    setMergedUrl(null);
    setMergedSize(null);
    setIsProcessing(false);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
    setMergedUrl(null);
    setMergedSize(null);
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === files.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIndex];
    newFiles[targetIndex] = temp;

    setFiles(newFiles);
    setMergedUrl(null);
    setMergedSize(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleMerge = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const fileBytes = await item.file.arrayBuffer();
        const srcPdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(
          srcPdf,
          srcPdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const mergedBlob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (mergedUrl) {
        URL.revokeObjectURL(mergedUrl);
      }

      setMergedUrl(URL.createObjectURL(mergedBlob));
      setMergedSize(mergedBlob.size);
    } catch (error) {
      console.error("PDF Merging error:", error);
      alert("Error occurred during client-side PDF merging.");
    } finally {
      setIsProcessing(false);
    }
  };

  const faqs = [
    {
      question: "Is there a limit on how many PDFs I can merge?",
      answer: "No strict limits. However, since the merging process runs entirely inside your browser's local RAM sandbox, merging very large or dozens of PDFs might consume significant system memory on your device.",
    },
    {
      question: "Will the merge preserve forms, outline bookmarks, or annotations?",
      answer: "Standard pages, graphics, layouts, and annotations are fully preserved. Specialized interactive features (like form fields or custom bookmarks) may need re-association depending on the PDF's internal structure.",
    },
    {
      question: "Why can't I upload some of my PDFs?",
      answer: "If a PDF file is encrypted or password-protected, the browser is unable to read its pages to perform a merge. You must first decrypt it using our PDF Password Unlocker tool.",
    },
  ];

  return (
    <ToolLayout toolId="pdf-merge">
      <div className="space-y-8">
        <UploadZone
          onFileSelect={handleFileSelect}
          accept="application/pdf"
          multiple={true}
          maxSizeMB={20}
          label="Upload multiple PDF files to merge"
        />

        {isProcessing && files.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-sm font-semibold text-muted-foreground">Analyzing PDF pages...</span>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-6">
            {/* List queue */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                Documents Queue ({files.length})
              </h3>
              <div className="max-h-[350px] overflow-y-auto pr-1 border border-border/40 rounded-2xl p-2 space-y-2 bg-card/50">
                {files.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-sm hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[150px] sm:max-w-[280px]">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Pages: {item.pageCount} | Size: {formatSize(item.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => moveFile(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveFile(index, "down")}
                        disabled={index === files.length - 1}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFile(item.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-500"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions / Output */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-border/40 pt-6">
              <button
                onClick={() => {
                  setFiles([]);
                  setMergedUrl(null);
                  setMergedSize(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Clear Queue
              </button>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleMerge}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-primary hover:bg-primary/5 text-primary text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Merging...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Merge Documents
                    </>
                  )}
                </button>

                {mergedUrl && (
                  <a
                    href={mergedUrl}
                    download="mysofttools-merged.pdf"
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                  >
                    <Download className="w-4 h-4" /> Download PDF ({mergedSize ? formatSize(mergedSize) : ""})
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <SEOContent
          title="PDF Merger"
          explanation="Our free online PDF Merger enables you to combine multiple PDF documents into a single consolidated file directly in your browser. Since our pipeline runs 100% locally via clientside Web APIs, your files are never uploaded to any remote web hosting, guaranteeing complete data security. Drag and drop document blocks to customize page layouts before compiling."
          howToUse={[
            "Click on the upload component to select multiple PDF files, or upload them one by one.",
            "Inspect the list of documents and reorder them using the Up/Down arrow keys.",
            "If any file is incorrect, remove it from the pipeline using the Trash button.",
            "Click 'Merge Documents' to launch the client-side compilation.",
            "Once successfully built, click 'Download PDF' to save your merged file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
