"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, Sliders, Image as ImageIcon, ArrowRight } from "lucide-react";

export default function CompressImagePage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<string>("image/jpeg");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    recordRecentTool("img-compress");
  }, []);

  const handleFileSelect = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setCompressedUrl(null);
      setCompressedSize(null);
    }
  };

  const handleCompress = () => {
    if (!originalUrl || !originalFile) return;

    setIsProcessing(true);
    const img = new Image();
    img.src = originalUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      // Convert to blob with compression quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (compressedUrl) {
              URL.revokeObjectURL(compressedUrl);
            }
            setCompressedUrl(URL.createObjectURL(blob));
            setCompressedSize(blob.size);
          }
          setIsProcessing(false);
        },
        format,
        quality / 100
      );
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  };

  useEffect(() => {
    if (originalUrl) {
      handleCompress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, format, originalUrl]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const reductionPercentage =
    originalFile && compressedSize
      ? Math.round(((originalFile.size - compressedSize) / originalFile.size) * 100)
      : 0;

  const faqs = [
    {
      question: "Will compressing my image reduce its physical resolution (dimensions)?",
      answer:
        "No. Our compression tool reduces file size by optimizing pixel colors and metadata encoding without changing the width or height of the image, unless you explicitly resize it.",
    },
    {
      question: "Which format is better for compression: JPEG or WEBP?",
      answer:
        "WEBP generally offers much better compression ratios (up to 30% smaller than JPEG at similar qualities) and supports transparency, making it the recommended choice for websites.",
    },
    {
      question: "Are my files secure?",
      answer:
        "Yes, absolutely. The compression algorithm is written in client-side JavaScript. The image is loaded directly into your browser's canvas memory and compressed locally. Nothing is uploaded to our servers.",
    },
  ];

  return (
    <ToolLayout toolId="img-compress">
      <div className="space-y-8">
        {!originalFile ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="image/png,image/jpeg,image/webp"
            maxSizeMB={15}
            label="Upload your PNG, JPG, or WEBP image to compress"
          />
        ) : (
          <div className="space-y-6">
            {/* Control Panel Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-muted/30 border border-border/50 items-center">
              {/* Quality Slider */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-foreground flex justify-between">
                  <span>Compression Quality</span>
                  <span className="text-primary">{quality}%</span>
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Max Shrink</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="flex-1 accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">Max Quality</span>
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Output Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="image/jpeg">JPEG (.jpg)</option>
                  <option value="image/webp">WEBP (.webp)</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Preview */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original File</span>
                <div className="w-full aspect-video rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                  {originalUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={originalUrl} alt="Original" className="object-contain max-h-full max-w-full" />
                  )}
                </div>
                <span className="font-semibold text-sm text-foreground">
                  Size: {formatSize(originalFile.size)}
                </span>
              </div>

              {/* Compressed Preview */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-4 relative">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Compressed File</span>
                <div className="w-full aspect-video rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-xs text-muted-foreground">Compressing...</span>
                    </div>
                  ) : compressedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={compressedUrl} alt="Compressed" className="object-contain max-h-full max-w-full" />
                  ) : null}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold text-sm text-foreground">
                    Size: {compressedSize ? formatSize(compressedSize) : "Processing..."}
                  </span>
                  {reductionPercentage > 0 && (
                    <span className="text-xs font-bold text-emerald-500">
                      Saved {reductionPercentage}% of file size!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-4 items-center justify-between border-t border-border/40 pt-6">
              <button
                onClick={() => {
                  setOriginalFile(null);
                  setOriginalUrl(null);
                  setCompressedUrl(null);
                  setCompressedSize(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Clear / Upload New
              </button>
              
              {compressedUrl && (
                <a
                  href={compressedUrl}
                  download={`mysofttools-compressed-${originalFile.name.substring(0, originalFile.name.lastIndexOf(".")) || originalFile.name}.${format === "image/jpeg" ? "jpg" : "webp"}`}
                  className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Download Compressed Image
                </a>
              )}
            </div>
          </div>
        )}

        <SEOContent
          title="Image Compressor"
          explanation="Our online image compressor uses standard browser canvas optimization models to strip metadata and compress picture bytes without distorting visual details. We support PNG to JPG, JPG to WEBP, and WEBP quality adjustments. Perfect for bloggers, developers, and designers who need to optimize visual media for fast page speeds."
          howToUse={[
            "Click on the upload container to select your image file (JPEG, PNG, or WEBP).",
            "Change the output format to either JPEG or WebP depending on your web layout targets.",
            "Use the quality percentage slider to adjust the compression factor. Lower values reduce the bytes but slightly lower the image quality; 80% is the optimal balance.",
            "Inspect the preview boxes to compare physical sizes and visual artifacts.",
            "Tap 'Download Compressed Image' to save the optimized file instantly."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
