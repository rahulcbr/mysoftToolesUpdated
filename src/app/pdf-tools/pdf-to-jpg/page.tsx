"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileText, Image as ImageIcon, Loader2 } from "lucide-react";

export default function PdfToJpgPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState<{ pageNumber: number; url: string }[]>([]);
  const [scale, setScale] = useState<number>(2);
  
  const workerInitialized = useRef(false);

  useEffect(() => {
    recordRecentTool("pdf-to-jpg");
  }, []);

  const handleFileSelect = async (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setPdfFile(file);
      setPages([]);
      renderPdfPages(file);
    }
  };

  const renderPdfPages = async (file: File) => {
    setIsProcessing(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      
      if (!workerInitialized.current) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        workerInitialized.current = true;
      }

      const fileBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: fileBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      const renderedPages: { pageNumber: number; url: string }[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        
        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
          } as any).promise;
          
          const url = canvas.toDataURL("image/jpeg", 0.95);
          renderedPages.push({
            pageNumber: i,
            url,
          });
        }
      }

      setPages(renderedPages);
    } catch (error) {
      console.error("PDF to JPG rendering error:", error);
      alert("Error occurred during client-side PDF rendering.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (pdfFile) {
      renderPdfPages(pdfFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  const handleDownloadAll = () => {
    pages.forEach((page, index) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = page.url;
        a.download = `page-${page.pageNumber}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 200);
    });
  };

  const faqs = [
    {
      question: "Are my files safe?",
      answer: "Yes, completely. All rendering occurs locally inside your browser memory cache. Nothing is uploaded to any remote storage servers.",
    },
    {
      question: "What resolution are the extracted JPEGs?",
      answer: "The default resolution is 2.0x scale (offering high resolution, crisp details). You can choose 1.0x for standard presentation sizes, or up to 3.0x for high quality print layouts.",
    },
  ];

  return (
    <ToolLayout toolId="pdf-to-jpg">
      <div className="space-y-8">
        {!pdfFile ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            multiple={false}
            maxSizeMB={25}
            label="Upload your PDF file to convert to JPG format"
          />
        ) : (
          <div className="space-y-6">
            {/* Options Dashboard panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-muted/30 border border-border/50 items-center">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Output Scale</label>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value={1}>1.0x (Standard Resolution)</option>
                  <option value={1.5}>1.5x (Medium Resolution)</option>
                  <option value={2}>2.0x (High Resolution)</option>
                  <option value={3}>3.0x (Ultra Sharp)</option>
                </select>
              </div>

              <div className="flex flex-col justify-end h-full">
                <button
                  onClick={() => {
                    setPdfFile(null);
                    setPages([]);
                  }}
                  className="w-full px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
                >
                  Clear / Upload New
                </button>
              </div>
            </div>

            {isProcessing && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-semibold">
                  Drawing canvas frames for PDF pages...
                </p>
              </div>
            )}

            {!isProcessing && pages.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    Converted JPG Slides ({pages.length})
                  </h3>
                  <button
                    onClick={handleDownloadAll}
                    className="px-4 py-2 rounded-xl grad-primary text-white text-xs font-semibold hover-lift flex items-center gap-1.5 shadow-md shadow-primary/10"
                  >
                    <Download className="w-3.5 h-3.5" /> Download All JPGs
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {pages.map((page) => (
                    <div
                      key={page.pageNumber}
                      className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-3 shadow-sm hover:border-primary/45 transition-colors"
                    >
                      <div className="w-full aspect-[3/4] rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={page.url} alt={`Page ${page.pageNumber}`} className="object-contain max-h-full max-w-full" />
                      </div>
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">
                          Page {page.pageNumber}
                        </span>
                        <a
                          href={page.url}
                          download={`mysofttools-page-${page.pageNumber}.jpg`}
                          className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title={`Download Page ${page.pageNumber}`}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <SEOContent
          title="PDF to JPG Converter"
          explanation="Our free online PDF to JPG converter extracts and outputs high-fidelity JPEG slide files from any PDF. Executed entirely inside your browser's local sandbox using JavaScript rendering APIs, this privacy-first document utility ensures zero risk of data leakage. Perfect for developers, graphic designers, and office managers."
          howToUse={[
            "Select and upload the PDF file you wish to convert.",
            "Choose your quality scale factor (2.0x is standard high resolution).",
            "Review generated page thumbnail grids.",
            "Download individual JPG page files, or click 'Download All JPGs' to trigger sequential browser file downloads."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
