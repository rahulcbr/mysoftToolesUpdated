"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, Link2, Link2Off } from "lucide-react";

export default function ResizeImagePage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    recordRecentTool("img-resize");
  }, []);

  const handleFileSelect = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);

      // Load image to get original dimensions
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setOriginalWidth(img.naturalWidth);
        setOriginalHeight(img.naturalHeight);
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      };
      setResizedUrl(null);
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspectRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainAspectRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const handleResize = () => {
    if (!originalUrl || !originalFile || width <= 0 || height <= 0) return;

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

      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          if (resizedUrl) {
            URL.revokeObjectURL(resizedUrl);
          }
          setResizedUrl(URL.createObjectURL(blob));
        }
        setIsProcessing(false);
      }, originalFile.type);
    };
  };

  useEffect(() => {
    if (originalUrl && width > 0 && height > 0) {
      const timer = setTimeout(() => {
        handleResize();
      }, 300); // debounce canvas drawing for smoother inputs
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, originalUrl]);

  const faqs = [
    {
      question: "Will resizing my image distort its appearance?",
      answer:
        "If you keep 'Maintain Aspect Ratio' checked, the proportions of your image will remain locked, preventing stretching or distortion. If you uncheck it, you can input arbitrary widths and heights, which may distort the image.",
    },
    {
      question: "Can I increase an image's size to make it higher resolution?",
      answer:
        "Yes, you can increase dimensions, but stretching a small image to a larger size will cause pixelation. Resizing is best for scaling down high-resolution photos for web layouts.",
    },
    {
      question: "Is there a maximum image resolution allowed?",
      answer:
        "We support images up to 8000x8000 pixels. Larger canvas resolutions depend on your browser's memory capabilities.",
    },
  ];

  return (
    <ToolLayout toolId="img-resize">
      <div className="space-y-8">
        {!originalFile ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="image/png,image/jpeg,image/webp"
            maxSizeMB={15}
            label="Upload your PNG, JPG, or WEBP image to resize"
          />
        ) : (
          <div className="space-y-6">
            {/* Control Box */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-muted/30 border border-border/50 items-center">
              {/* Width Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Width (px)</label>
                <input
                  type="number"
                  value={width || ""}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Aspect Ratio Lock Lock */}
              <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                <button
                  onClick={() => {
                    setMaintainAspectRatio(!maintainAspectRatio);
                    if (!maintainAspectRatio) {
                      // re-sync with aspect ratio
                      const ratio = originalHeight / originalWidth;
                      setHeight(Math.round(width * ratio));
                    }
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${
                    maintainAspectRatio
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted/50 border-border text-muted-foreground"
                  }`}
                  title={maintainAspectRatio ? "Lock aspect ratio enabled" : "Lock aspect ratio disabled"}
                >
                  {maintainAspectRatio ? (
                    <>
                      <Link2 className="w-4 h-4" /> Locked Aspect Ratio
                    </>
                  ) : (
                    <>
                      <Link2Off className="w-4 h-4" /> Custom Proportions
                    </>
                  )}
                </button>
              </div>

              {/* Height Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Height (px)</label>
                <input
                  type="number"
                  value={height || ""}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Presets dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Preset Scaling</label>
                <select
                  onChange={(e) => {
                    const factor = Number(e.target.value);
                    if (factor > 0) {
                      handleWidthChange(Math.round(originalWidth * factor));
                    }
                  }}
                  defaultValue=""
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="" disabled>Choose scale...</option>
                  <option value="0.25">25% of Original</option>
                  <option value="0.50">50% of Original</option>
                  <option value="0.75">75% of Original</option>
                  <option value="1.5">150% of Original</option>
                  <option value="2.0">200% of Original</option>
                </select>
              </div>
            </div>

            {/* Preview Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Preview */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Dimensions</span>
                <div className="w-full aspect-video rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                  {originalUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={originalUrl} alt="Original" className="object-contain max-h-full max-w-full" />
                  )}
                </div>
                <span className="font-semibold text-sm text-foreground">
                  Size: {originalWidth} &times; {originalHeight} px
                </span>
              </div>

              {/* Resized Preview */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-4 relative">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Resized Dimensions</span>
                <div className="w-full aspect-video rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-xs text-muted-foreground">Resizing...</span>
                    </div>
                  ) : resizedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resizedUrl} alt="Resized" className="object-contain max-h-full max-w-full" />
                  ) : null}
                </div>
                <span className="font-semibold text-sm text-foreground">
                  Size: {width} &times; {height} px
                </span>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex gap-4 items-center justify-between border-t border-border/40 pt-6">
              <button
                onClick={() => {
                  setOriginalFile(null);
                  setOriginalUrl(null);
                  setResizedUrl(null);
                  setWidth(0);
                  setHeight(0);
                }}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Clear / Upload New
              </button>

              {resizedUrl && originalFile && (
                <a
                  href={resizedUrl}
                  download={`mysofttools-resized-${width}x${height}-${originalFile.name}`}
                  className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Download Resized Image
                </a>
              )}
            </div>
          </div>
        )}

        <SEOContent
          title="Image Resizer"
          explanation="Our client-side image resizer processes pixel scaling using bicubic filtering inside standard HTML5 Canvas vectors. You can lock proportions, scale by presets (50%, 75%), or input custom pixel heights and widths. Files remain 100% secure on your computer, meaning bank statements, passport photos, and custom graphic mockups are never uploaded to our servers."
          howToUse={[
            "Upload your PNG, JPG, or WEBP photo into the drop zone.",
            "Make sure 'Locked Aspect Ratio' is enabled if you want to scale down without visual distortion.",
            "Input custom widths or heights, or select a preset multiplier (e.g., 50% scale) to shrink pixels.",
            "Wait a moment for the canvas renderer to refresh the resized image preview.",
            "Click the download button to export the resized file in its original format."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
