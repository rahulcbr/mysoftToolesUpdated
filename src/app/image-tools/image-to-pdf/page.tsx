"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileText, Trash2, ArrowUp, ArrowDown, Settings, Sparkles, Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface ImageItem {
  id: string;
  file: File;
  url: string;
  size: number;
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("fit");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState<"none" | "small" | "large">("none");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState<number | null>(null);

  useEffect(() => {
    recordRecentTool("img-to-pdf");
  }, []);

  const handleFileSelect = (files: File[]) => {
    const newItems: ImageItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      url: URL.createObjectURL(file),
      size: file.size,
    }));
    setImages((prev) => [...prev, ...newItems]);
    setPdfUrl(null);
    setPdfSize(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((img) => img.id !== id);
    });
    setPdfUrl(null);
    setPdfSize(null);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === images.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setImages(newImages);
    setPdfUrl(null);
    setPdfSize(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const imgItem of images) {
        // Load image into an HTML image object to get its natural dimensions
        const img = new Image();
        img.src = imgItem.url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Draw image onto a canvas to compile into standard JPG bytes
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not acquire canvas 2D context");
        ctx.drawImage(img, 0, 0);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error("Canvas conversion to blob failed"));
            },
            "image/jpeg",
            0.9
          );
        });

        const imgBytes = await blob.arrayBuffer();
        const embeddedImg = await pdfDoc.embedJpg(imgBytes);

        // Determine PDF page width and height (in points)
        let pageWidth = img.naturalWidth;
        let pageHeight = img.naturalHeight;

        if (pageSize === "a4") {
          pageWidth = 595.27; // A4 width in pt
          pageHeight = 841.89; // A4 height in pt
          if (orientation === "landscape") {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
          }
        } else if (pageSize === "letter") {
          pageWidth = 612; // Letter width in pt
          pageHeight = 792; // Letter height in pt
          if (orientation === "landscape") {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
          }
        }

        // Apply page margin settings
        let m = 0;
        if (margin === "small") m = 20;
        else if (margin === "large") m = 40;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Fit image dimensions within available canvas space
        const availableWidth = pageWidth - 2 * m;
        const availableHeight = pageHeight - 2 * m;
        const imgWidth = embeddedImg.width;
        const imgHeight = embeddedImg.height;

        const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
        const width = imgWidth * scale;
        const height = imgHeight * scale;

        const x = m + (availableWidth - width) / 2;
        const y = m + (availableHeight - height) / 2;

        page.drawImage(embeddedImg, {
          x,
          y,
          width,
          height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(URL.createObjectURL(pdfBlob));
      setPdfSize(pdfBlob.size);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("An error occurred during client-side PDF construction.");
    } finally {
      setIsProcessing(false);
    }
  };

  const faqs = [
    {
      question: "Are my uploaded images secure?",
      answer: "Yes, completely. All image rendering and PDF compiling is executed locally inside your browser using JavaScript and Canvas APIs. No data is sent to external servers, guaranteeing 100% security.",
    },
    {
      question: "Can I merge different image sizes into one PDF?",
      answer: "Absolutely. By selecting the default 'Fit Image' setting in Page Size, each PDF page matches the exact shape of your original graphic. If you select A4 or US Letter, each image is automatically scaled to fit the page without distortions.",
    },
    {
      question: "How do I reorder the images?",
      answer: "Once you upload images, they appear in a list below the drop zone. Simply use the Up and Down arrow buttons next to each image thumbnail to reorder them before clicking 'Generate PDF'.",
    },
  ];

  return (
    <ToolLayout toolId="img-to-pdf">
      <div className="space-y-8">
        <UploadZone
          onFileSelect={handleFileSelect}
          accept="image/png,image/jpeg,image/webp"
          multiple={true}
          maxSizeMB={15}
          label="Upload PNG, JPG, or WEBP images to convert to PDF"
        />

        {images.length > 0 && (
          <div className="space-y-6">
            {/* Settings Card */}
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" /> PDF Page Configuration
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Page Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Page Size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="fit">Fit Image Dimensions</option>
                    <option value="a4">A4 (Standard Document)</option>
                    <option value="letter">US Letter (Standard Office)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Orientation</label>
                  <select
                    value={orientation}
                    disabled={pageSize === "fit"}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-55"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                {/* Page Margin */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Page Margins</label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="none">No Margin (0 pt)</option>
                    <option value="small">Small Margin (20 pt)</option>
                    <option value="large">Large Margin (40 pt)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Images List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                Images Queue ({images.length})
              </h3>
              <div className="max-h-[350px] overflow-y-auto pr-1 border border-border/40 rounded-2xl p-2 space-y-2 bg-card/50">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-sm hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted/40 relative flex items-center justify-center overflow-hidden border border-border/40 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="Queue item" className="object-cover w-full h-full" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[150px] sm:max-w-[280px]">
                          {img.file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Size: {formatSize(img.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => moveImage(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveImage(index, "down")}
                        disabled={index === images.length - 1}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeImage(img.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-500"
                        title="Remove Image"
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
                  images.forEach((img) => URL.revokeObjectURL(img.url));
                  setImages([]);
                  setPdfUrl(null);
                  setPdfSize(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Clear All Queue
              </button>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleGeneratePdf}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-primary hover:bg-primary/5 text-primary text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Compiling...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Compile PDF
                    </>
                  )}
                </button>

                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    download="mysofttools-compiled.pdf"
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                  >
                    <Download className="w-4 h-4" /> Download PDF ({pdfSize ? formatSize(pdfSize) : ""})
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <SEOContent
          title="Image to PDF Converter"
          explanation="Our free online Image to PDF tool bundles multiple image formats (JPG, PNG, WEBP) into a single, high-fidelity PDF document. This client-side utility does not upload anything to external servers, executing standard image-to-canvas and PDF generation scripts in your local browser sandbox. Ideal for creating scanned digital forms, e-books, receipts, or portfolios."
          howToUse={[
            "Upload one or more image files (JPG, PNG, or WEBP) into the drop zone.",
            "Confirm the order of pages in the Images Queue list. Use the Up/Down arrows to shift positions or Delete to remove files.",
            "Configure Page Setup dimensions: 'Fit Image' page dimensions match the original graphics, or standard paper models like A4 and Letter can be forced with custom orientation.",
            "Optionally select small or large margins to add border buffers.",
            "Click 'Compile PDF' to launch the client-side compiler.",
            "Once processed, hit 'Download PDF' to save your file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
