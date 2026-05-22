"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download } from "lucide-react";

export default function CropImagePage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    recordRecentTool("img-crop");
  }, []);

  const handleFileSelect = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImgWidth(img.naturalWidth);
        setImgHeight(img.naturalHeight);
        setStartX(Math.round(img.naturalWidth * 0.1));
        setStartY(Math.round(img.naturalHeight * 0.1));
        setCropWidth(Math.round(img.naturalWidth * 0.8));
        setCropHeight(Math.round(img.naturalHeight * 0.8));
      };
      setCroppedUrl(null);
    }
  };

  const handleCrop = () => {
    if (!originalUrl || !originalFile || cropWidth <= 0 || cropHeight <= 0) return;

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

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw the cropped region: sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
      ctx.drawImage(img, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      canvas.toBlob((blob) => {
        if (blob) {
          if (croppedUrl) URL.revokeObjectURL(croppedUrl);
          setCroppedUrl(URL.createObjectURL(blob));
        }
        setIsProcessing(false);
      }, originalFile.type);
    };
  };

  useEffect(() => {
    if (originalUrl && cropWidth > 0 && cropHeight > 0) {
      const timer = setTimeout(() => {
        handleCrop();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startX, startY, cropWidth, cropHeight, originalUrl]);

  const faqs = [
    {
      question: "How do I define the cropping area?",
      answer:
        "Adjust the sliders under the control panel: set where the crop begins (Start X and Start Y from the top-left corner), then adjust the crop width and height.",
    },
    {
      question: "Does cropping compress my image quality?",
      answer:
        "No. Cropping only cuts the canvas boundaries and does not apply quality compression, keeping the cropped region at its original pixel resolution.",
    },
  ];

  return (
    <ToolLayout toolId="img-crop">
      <div className="space-y-8">
        {!originalFile ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="image/png,image/jpeg,image/webp"
            maxSizeMB={15}
            label="Upload your PNG, JPG, or WEBP image to crop"
          />
        ) : (
          <div className="space-y-6">
            {/* Cropping Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl bg-muted/30 border border-border/50">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Start X: {startX}px</label>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, imgWidth - cropWidth)}
                  value={startX}
                  onChange={(e) => setStartX(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Start Y: {startY}px</label>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, imgHeight - cropHeight)}
                  value={startY}
                  onChange={(e) => setStartY(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Crop Width: {cropWidth}px</label>
                <input
                  type="range"
                  min="10"
                  max={imgWidth - startX}
                  value={cropWidth}
                  onChange={(e) => setCropWidth(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Crop Height: {cropHeight}px</label>
                <input
                  type="range"
                  min="10"
                  max={imgHeight - startY}
                  value={cropHeight}
                  onChange={(e) => setCropHeight(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Visualizer Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original with highlight overlay */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original (Crop Area)</span>
                <div className="w-full aspect-video rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                  {originalUrl && (
                    <div className="relative max-h-full max-w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={originalUrl} alt="Crop bounding" className="object-contain max-h-56 select-none" />
                      {/* Highlight Box overlay (representative relative bounds) */}
                      <div
                        className="absolute border-2 border-primary bg-primary/10 shadow-lg pointer-events-none"
                        style={{
                          left: `${(startX / imgWidth) * 100}%`,
                          top: `${(startY / imgHeight) * 100}%`,
                          width: `${(cropWidth / imgWidth) * 100}%`,
                          height: `${(cropHeight / imgHeight) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Crop output */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Cropped Output Preview</span>
                <div className="w-full aspect-video rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                  {isProcessing ? (
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : croppedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={croppedUrl} alt="Cropped" className="object-contain max-h-full max-w-full" />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 items-center justify-between border-t border-border/40 pt-6">
              <button
                onClick={() => {
                  setOriginalFile(null);
                  setOriginalUrl(null);
                  setCroppedUrl(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Clear / Upload New
              </button>

              {croppedUrl && originalFile && (
                <a
                  href={croppedUrl}
                  download={`mysofttools-cropped-${cropWidth}x${cropHeight}-${originalFile.name}`}
                  className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Download Cropped Image
                </a>
              )}
            </div>
          </div>
        )}

        <SEOContent
          title="Image Cropper"
          explanation="Crop photos locally in your browser with our responsive image cropper tool. Customize margins and widths using exact coordinates or relative sliders. Ideal for preparing avatar headshots, cropping document files, and formatting social media graphics safely without server risks."
          howToUse={[
            "Upload your JPEG or PNG image to start.",
            "Use the Start X/Y sliders to reposition the starting corner of the cropping box.",
            "Adjust the Crop Width and Crop Height sliders to define the frame dimensions.",
            "Inspect the highlight box showing the crop borders overlaying the original image.",
            "Click 'Download Cropped Image' to save the cut asset."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
