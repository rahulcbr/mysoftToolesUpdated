"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileText, RotateCw, RotateCcw, RefreshCw, Sparkles, Loader2, Grid } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";

interface PageRotation {
  [pageIndex: number]: number; // 0, 90, 180, 270 degrees
}

export default function PdfRotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRotations, setPageRotations] = useState<PageRotation>({});
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [rotatedUrl, setRotatedUrl] = useState<string | null>(null);
  const [rotatedSize, setRotatedSize] = useState<number | null>(null);
  const [renderProgress, setRenderProgress] = useState({ current: 0, total: 0 });

  const workerInitialized = useRef(false);

  useEffect(() => {
    recordRecentTool("pdf-rotate");
  }, []);

  const handleFileSelect = async (files: File[]) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setRotatedUrl(null);
      setRotatedSize(null);
      setPageRotations({});
      setThumbnails([]);
      
      setIsLoadingPreviews(true);
      try {
        const fileBuffer = await selectedFile.arrayBuffer();
        
        // 1. Dynamic imports of rendering engines
        const pdfjs = await import("pdfjs-dist");
        if (!workerInitialized.current) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
          workerInitialized.current = true;
        }

        const loadingTask = pdfjs.getDocument({ data: fileBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        setTotalPages(numPages);
        setRenderProgress({ current: 0, total: numPages });

        // Initialize default rotations to 0
        const initialRotations: PageRotation = {};
        for (let i = 0; i < numPages; i++) {
          initialRotations[i] = 0;
        }
        setPageRotations(initialRotations);

        // Generate thumbnails for pages (up to 24 pages to prevent memory issues)
        const maxPreviews = Math.min(numPages, 24);
        const thumbs: string[] = [];

        for (let i = 1; i <= maxPreviews; i++) {
          const page = await pdf.getPage(i);
          // Render at lower scale for thumbnail
          const viewport = page.getViewport({ scale: 0.4 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d");

          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport,
            } as any).promise;
            
            thumbs.push(canvas.toDataURL("image/jpeg", 0.7));
          }
          setRenderProgress((prev) => ({ ...prev, current: i }));
        }
        setThumbnails(thumbs);
      } catch (error) {
        console.error("PDF preview generation failed:", error);
        alert("Failed to render PDF previews. The file might be encrypted.");
        setFile(null);
      } finally {
        setIsLoadingPreviews(false);
      }
    }
  };

  const rotatePage = (index: number, direction: "cw" | "ccw") => {
    setPageRotations((prev) => {
      const current = prev[index] || 0;
      let next = current + (direction === "cw" ? 90 : -90);
      if (next < 0) next = 270;
      if (next >= 360) next = 0;
      return { ...prev, [index]: next };
    });
    setRotatedUrl(null);
  };

  const rotateAll = (deg: number) => {
    setPageRotations((prev) => {
      const updated = { ...prev };
      for (let i = 0; i < totalPages; i++) {
        let next = (updated[i] || 0) + deg;
        if (next < 0) next = 270;
        if (next >= 360) next = next % 360;
        updated[i] = next;
      }
      return updated;
    });
    setRotatedUrl(null);
  };

  const resetAll = () => {
    setPageRotations((prev) => {
      const updated = { ...prev };
      for (let i = 0; i < totalPages; i++) {
        updated[i] = 0;
      }
      return updated;
    });
    setRotatedUrl(null);
  };

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const fileBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const addedRotation = pageRotations[i] || 0;
        if (addedRotation === 0) continue;

        const page = pages[i];
        let currentRotation = 0;
        try {
          const rot = page.getRotation();
          currentRotation = rot.angle || 0;
        } catch (_) {}

        const newAngle = (currentRotation + addedRotation) % 360;
        page.setRotation(degrees(newAngle));
      }

      const rotatedBytes = await pdfDoc.save();
      const rotatedBlob = new Blob([rotatedBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (rotatedUrl) {
        URL.revokeObjectURL(rotatedUrl);
      }

      setRotatedUrl(URL.createObjectURL(rotatedBlob));
      setRotatedSize(rotatedBlob.size);
    } catch (error) {
      console.error("PDF rotation failed:", error);
      alert("Error occurred while saving rotated PDF.");
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
      question: "Will rotating a PDF modify its text and searchability?",
      answer: "No. Rotating pages via `pdf-lib` changes the viewport layout orientation matrix in the document metadata. All texts, links, vectors, and embedded fonts remain intact, selectable, and fully searchable.",
    },
    {
      question: "Can I rotate only specific pages in a PDF?",
      answer: "Yes. Our visual layout editor lists page cards with clockwise and counter-clockwise rotate buttons. You can spin individual pages independently, or apply batch rotations to all pages simultaneously.",
    },
    {
      question: "Is there a limit to the PDF page count?",
      answer: "No hard limits, but for performance, visual thumbnails are generated only for the first 24 pages. Global rotation adjustments (like Rotate All Clockwise) will still apply to every single page in the document, even if they are not previewed visually.",
    },
  ];

  return (
    <ToolLayout toolId="pdf-rotate">
      <div className="space-y-8">
        {!file ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            multiple={false}
            maxSizeMB={25}
            label="Upload your PDF file to rotate pages"
          />
        ) : (
          <div className="space-y-6">
            {/* File info card */}
            <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                    {file.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pages: {totalPages} | Size: {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setRotatedUrl(null);
                  setRotatedSize(null);
                  setPageRotations({});
                  setThumbnails([]);
                }}
                className="text-xs text-muted-foreground hover:text-red-500 font-semibold"
              >
                Clear
              </button>
            </div>

            {/* Quick Actions Panel */}
            {!rotatedUrl && !isLoadingPreviews && (
              <div className="p-4 rounded-2xl border border-border bg-muted/30 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">Batch Operations</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => rotateAll(90)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotate All +90°
                  </button>
                  <button
                    onClick={() => rotateAll(270)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Rotate All -90°
                  </button>
                  <button
                    onClick={() => rotateAll(180)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-reverse" /> Rotate All 180°
                  </button>
                  <button
                    onClick={resetAll}
                    className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs font-semibold text-red-500"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            )}

            {/* Thumbnail preview list loader */}
            {isLoadingPreviews && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 border border-dashed border-border rounded-3xl bg-muted/10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-foreground">Generating page previews...</p>
                  <p className="text-xs text-muted-foreground">
                    Rendered page {renderProgress.current} of {renderProgress.total}
                  </p>
                </div>
              </div>
            )}

            {/* Thumbnail page cards grid */}
            {!rotatedUrl && thumbnails.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold px-1">
                  <span>Visual Page Grid {totalPages > 24 && "(showing first 24 pages)"}</span>
                  <span>Click controls on cards to adjust</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {thumbnails.map((thumb, idx) => {
                    const rot = pageRotations[idx] || 0;
                    return (
                      <div
                        key={idx}
                        className="group relative rounded-xl border border-border bg-card overflow-hidden p-2 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors"
                      >
                        {/* Render Page Image Container */}
                        <div className="relative w-full aspect-[3/4] bg-muted/40 rounded-lg flex items-center justify-center overflow-hidden border border-border/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb}
                            alt={`Page ${idx + 1}`}
                            className="max-h-full max-w-full object-contain transition-transform duration-300 shadow-sm"
                            style={{ transform: `rotate(${rot}deg)` }}
                          />
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-foreground/80 text-background text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          {rot !== 0 && (
                            <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-bold">
                              {rot}°
                            </span>
                          )}
                        </div>

                        {/* Page specific controls */}
                        <div className="flex gap-1 w-full mt-1">
                          <button
                            onClick={() => rotatePage(idx, "ccw")}
                            className="flex-1 py-1 rounded bg-muted hover:bg-primary/15 hover:text-primary transition-colors text-muted-foreground flex items-center justify-center"
                            title="Rotate -90°"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => rotatePage(idx, "cw")}
                            className="flex-1 py-1 rounded bg-muted hover:bg-primary/15 hover:text-primary transition-colors text-muted-foreground flex items-center justify-center"
                            title="Rotate +90°"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If page count > previews, note about remainder pages */}
            {!rotatedUrl && totalPages > 24 && !isLoadingPreviews && (
              <p className="text-[11px] text-center text-muted-foreground italic border-t border-border/40 pt-4">
                * PDF contains {totalPages} pages. Only the first 24 pages are rendered as previews, but rotations will apply to all remaining pages if configured.
              </p>
            )}

            {/* Action buttons / Results Output */}
            {!rotatedUrl && !isLoadingPreviews && (
              <div className="flex justify-end pt-4 border-t border-border/40">
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Save Rotated PDF
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Success Download Card */}
            {rotatedUrl && (
              <div className="p-6 border border-emerald-500/25 bg-emerald-500/5 rounded-2xl text-center space-y-4">
                <span className="inline-block p-3 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                  <RotateCw className="w-6 h-6" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">PDF Rotated Successfully!</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your adjusted pages have been compiled into a new layout structure.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setRotatedUrl(null);
                      setRotatedSize(null);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
                  >
                    Rotate Again
                  </button>
                  <a
                    href={rotatedUrl}
                    download={`mysofttools-rotated-${file.name}`}
                    className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/25"
                  >
                    <Download className="w-4 h-4" /> Download PDF ({rotatedSize ? formatSize(rotatedSize) : ""})
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <SEOContent
          title="PDF Page Rotator"
          explanation="Our browser-based PDF Page Rotator enables you to fix upside-down or sideways pages in your documents. You can select individual pages to rotate 90, 180, or 270 degrees, or flip the layout orientation of all pages at once. The entire execution runs client-side using JavaScript, ensuring your secure banking statements, legal contracts, or identity forms remain private and are never uploaded."
          howToUse={[
            "Select and upload the PDF file you wish to adjust.",
            "Wait for the local previews to render. You'll see cards with thumbnails for each page.",
            "Use the Rotate buttons on individual page cards to rotate them clockwise or counter-clockwise.",
            "Alternatively, use the batch control bar at the top to apply standard 90° or 180° rotations to all pages.",
            "Click 'Save Rotated PDF' to write orientation parameters into document metadata.",
            "Tap 'Download PDF' to save your updated file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
