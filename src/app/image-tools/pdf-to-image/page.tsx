"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileImage, FileText, Image as ImageIcon, Loader2 } from "lucide-react";

export default function PdfToImagePage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState<{ pageNumber: number; url: string }[]>([]);
  const [exportFormat, setExportFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [scale, setScale] = useState<number>(2); // 2x scale for clear images
  
  const workerInitialized = useRef(false);

  useEffect(() => {
    recordRecentTool("pdf-to-image");
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
      // Dynamically import pdfjs to avoid server-side build issues
      const pdfjs = await import("pdfjs-dist");
      
      if (!workerInitialized.current) {
        // Set worker CDN path matching version
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
          
          const url = canvas.toDataURL(exportFormat, 0.95);
          renderedPages.push({
            pageNumber: i,
            url,
          });
        }
      }

      setPages(renderedPages);
    } catch (error) {
      console.error("PDF to Image rendering error:", error);
      alert("Error occurred during client-side PDF rendering. Verify the document is not password locked.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-render pages if quality scale or format changes
  useEffect(() => {
    if (pdfFile) {
      renderPdfPages(pdfFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportFormat, scale]);

  const handleDownloadAll = () => {
    pages.forEach((page, index) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = page.url;
        const ext = exportFormat === "image/jpeg" ? "jpg" : "png";
        a.download = `page-${page.pageNumber}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 200); // Small stagger to allow sequential downloads in browser
    });
  };

  const faqs = [
    {
      question: "Will my PDF files remain secure and private?",
      answer: "Absolutely. The conversion occurs entirely in your browser's memory using PDF.js by Mozilla. No server APIs or external services are contacted, keeping sensitive data 100% confidential.",
    },
    {
      question: "Which resolution scale should I choose?",
      answer: "The default 2.0x scale offers high-resolution outputs suitable for print and presentations. You can select 1.5x for a smaller file footprint, or 3.0x for sharp, pixel-perfect rendering of small vector elements.",
    },
    {
      question: "Why did the rendering fail on my PDF?",
      answer: "The rendering usually fails if the PDF is password-protected or has security restrictions. Try removing the password lock using our PDF Password Unlocker before converting pages to images.",
    },
  ];

  return (
    <ToolLayout toolId="pdf-to-image">
      <div className="space-y-8">
        {!pdfFile ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            multiple={false}
            maxSizeMB={25}
            label="Upload your PDF file to extract pages as images"
          />
        ) : (
          <div className="space-y-6">
            {/* Control Dashboard Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-muted/30 border border-border/50 items-center">
              {/* Format selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Output Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="image/jpeg">JPEG (.jpg)</option>
                  <option value="image/png">PNG (.png)</option>
                </select>
              </div>

              {/* Rendering Scale/Quality */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Rendering Scale</label>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value={1}>1.0x (Standard Resolution)</option>
                  <option value={1.5}>1.5x (Medium Resolution)</option>
                  <option value={2}>2.0x (High Resolution - Crisp)</option>
                  <option value={3}>3.0x (Ultra Resolution - Vector Details)</option>
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
                  Reset / Upload New
                </button>
              </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-semibold">
                  Parsing PDF pages and drawing canvas frames...
                </p>
              </div>
            )}

            {/* Results Grid */}
            {!isProcessing && pages.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    Rendered Slides ({pages.length})
                  </h3>
                  <button
                    onClick={handleDownloadAll}
                    className="px-4 py-2 rounded-xl grad-primary text-white text-xs font-semibold hover-lift flex items-center gap-1.5 shadow-md shadow-primary/10"
                  >
                    <Download className="w-3.5 h-3.5" /> Download All Pages
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {pages.map((page) => (
                    <div
                      key={page.pageNumber}
                      className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-3 shadow-sm group hover:border-primary/40 transition-colors"
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
                          download={`mysofttools-page-${page.pageNumber}.${exportFormat === "image/jpeg" ? "jpg" : "png"}`}
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
          title="PDF to Image Converter"
          explanation="Our client-side PDF to Image utility renders pages from dynamic PDF files and lets you save them as standalone JPG or PNG images. Built on Mozilla's PDF.js library, all PDF page layout parses, vector transformations, and image downloads run in the browser's sandbox. Perfect for web developers uploading presentation slides, teachers building image packages, or digital signoffs."
          howToUse={[
            "Upload your PDF document into the drop zone container.",
            "Choose your target format: JPEG (compressed, smaller file footprint) or PNG (lossless background support).",
            "Adjust rendering scale quality (e.g. 2.0x for crisp pages or 3.0x for vector outlines).",
            "Review generated page thumbnail grids.",
            "Click the download symbol on any page card to save it individually, or hit 'Download All Pages' to automatically trigger staggered browser page downloads."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
