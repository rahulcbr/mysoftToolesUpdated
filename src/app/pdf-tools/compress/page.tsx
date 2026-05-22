"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileText, Settings, Sparkles, Loader2, Sliders, ArrowRight } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function PdfCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<"extreme" | "recommended" | "low">("recommended");
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const workerInitialized = useRef(false);

  useEffect(() => {
    recordRecentTool("pdf-compress");
  }, []);

  const handleFileSelect = (files: File[]) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      setCompressedUrl(null);
      setCompressedSize(null);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: 0 });

    try {
      // 1. Dynamic imports of rendering engines
      const pdfjs = await import("pdfjs-dist");
      if (!workerInitialized.current) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        workerInitialized.current = true;
      }

      // 2. Determine scaling parameters based on selection
      let quality = 0.6;
      let scale = 1.5;

      if (compressionLevel === "extreme") {
        quality = 0.35;
        scale = 1.0;
      } else if (compressionLevel === "low") {
        quality = 0.85;
        scale = 2.0;
      }

      const fileBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: fileBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      setProgress({ current: 0, total: totalPages });

      const newPdf = await PDFDocument.create();

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
          
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => {
                if (b) resolve(b);
                else reject(new Error("Canvas render failed"));
              },
              "image/jpeg",
              quality
            );
          });

          const imgBytes = await blob.arrayBuffer();
          const embeddedImg = await newPdf.embedJpg(imgBytes);

          const newPage = newPdf.addPage([viewport.width, viewport.height]);
          newPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
          });
        }
        setProgress((prev) => ({ ...prev, current: i }));
      }

      const compressedBytes = await newPdf.save();
      const compressedBlob = new Blob([compressedBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (compressedUrl) {
        URL.revokeObjectURL(compressedUrl);
      }

      setCompressedUrl(URL.createObjectURL(compressedBlob));
      setCompressedSize(compressedBlob.size);
    } catch (error) {
      console.error("PDF compression error:", error);
      alert("Error occurred during client-side PDF compression.");
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

  const savingsPercent =
    file && compressedSize
      ? Math.round(((file.size - compressedSize) / file.size) * 100)
      : 0;

  const faqs = [
    {
      question: "How does local PDF compression work?",
      answer: "Our optimizer parses each page of your PDF, renders the layouts onto high-fidelity canvases, encodes the frames as compressed JPEG files, and packs them into a brand-new PDF. This shrinks the overall byte size while maintaining readable text.",
    },
    {
      question: "Will the texts remain searchable after compression?",
      answer: "Since pages are re-rendered onto canvases and stored as images, the resulting PDF consists of high-resolution images. Searchable text layers are flattened. This is perfect for scanning documents, drafts, or layout proofs.",
    },
    {
      question: "Are my files safe?",
      answer: "Yes. All compression computations happen inside your browser using standard client-side JS arrays. Your sensitive PDF contents never hit any remote web hosts.",
    },
  ];

  return (
    <ToolLayout toolId="pdf-compress">
      <div className="space-y-8">
        {!file ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            multiple={false}
            maxSizeMB={25}
            label="Upload your PDF file to compress"
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
                    Original Size: {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setCompressedUrl(null);
                  setCompressedSize(null);
                  setProgress({ current: 0, total: 0 });
                }}
                className="text-xs text-muted-foreground hover:text-red-500 font-semibold"
              >
                Clear
              </button>
            </div>

            {/* Settings & Controls */}
            {!compressedUrl && (
              <div className="glass-card p-6 border border-border/60 rounded-2xl space-y-6">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" /> Compression Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Extreme */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between gap-1 transition-all ${
                      compressionLevel === "extreme"
                        ? "border-primary bg-primary/5 shadow-inner"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="compression"
                      value="extreme"
                      checked={compressionLevel === "extreme"}
                      onChange={() => setCompressionLevel("extreme")}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Extreme Shrink</span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Max compression, lower quality images.
                    </span>
                  </label>

                  {/* Recommended */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between gap-1 transition-all ${
                      compressionLevel === "recommended"
                        ? "border-primary bg-primary/5 shadow-inner"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="compression"
                      value="recommended"
                      checked={compressionLevel === "recommended"}
                      onChange={() => setCompressionLevel("recommended")}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Recommended</span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Good compression, clear readable images.
                    </span>
                  </label>

                  {/* Low */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between gap-1 transition-all ${
                      compressionLevel === "low"
                        ? "border-primary bg-primary/5 shadow-inner"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="compression"
                      value="low"
                      checked={compressionLevel === "low"}
                      onChange={() => setCompressionLevel("low")}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Low Compression</span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Excellent quality, larger file sizes.
                    </span>
                  </label>
                </div>

                {isProcessing ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                      <span>Compressing pages...</span>
                      <span>
                        {progress.current} / {progress.total}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/40">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{
                          width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleCompress}
                    className="w-full py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Optimize File Size
                  </button>
                )}
              </div>
            )}

            {/* Results Output */}
            {compressedUrl && (
              <div className="p-6 border border-emerald-500/25 bg-emerald-500/5 rounded-2xl space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <span className="inline-block p-3 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 animate-bounce">
                    <FileText className="w-6 h-6" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">PDF Compressed Successfully!</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      File optimized locally in browser RAM memory.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto p-4 rounded-xl bg-card border border-border text-center text-sm font-semibold">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase">Original Size</span>
                    <p className="text-foreground">{formatSize(file.size)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-primary uppercase">Optimized Size</span>
                    <p className="text-primary">{formatSize(compressedSize || 0)}</p>
                  </div>
                  {savingsPercent > 0 && (
                    <div className="sm:col-span-2 text-emerald-500 text-xs border-t border-border pt-3 mt-1">
                      Saved <span className="font-extrabold">{savingsPercent}%</span> of disk space!
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setCompressedUrl(null);
                      setCompressedSize(null);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
                  >
                    Compress Again
                  </button>
                  <a
                    href={compressedUrl}
                    download={`mysofttools-compressed-${file.name}`}
                    className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/20"
                  >
                    <Download className="w-4 h-4" /> Download Compressed PDF
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <SEOContent
          title="PDF Compressor"
          explanation="Our free online PDF Compressor scales page resolutions and compresses internal image bytes to shrink document footprints locally. Designed strictly in browser client space, your documents are never uploaded, keeping your banking sheets, tax reports, or personal IDs highly confidential. Select between Extreme, Recommended, or Low settings for the perfect print ratio."
          howToUse={[
            "Select and upload the PDF file you wish to optimize.",
            "Choose a compression preset: 'Extreme' for maximum size saving (great for email attachments), 'Recommended' for standard web use, or 'Low' to prioritize image sharpness.",
            "Click 'Optimize File Size' to start the canvas re-rendering pipeline.",
            "Review the file metrics showcasing original size, new size, and saved disk percentage.",
            "Tap 'Download Compressed PDF' to save your file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
