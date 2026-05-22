"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, RotateCw, ArrowLeftRight } from "lucide-react";

export default function RotateImagePage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [rotatedUrl, setRotatedUrl] = useState<string | null>(null);
  
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    recordRecentTool("img-rotate");
  }, []);

  const handleFileSelect = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setRotatedUrl(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    }
  };

  const handleRotate = () => {
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

      const angle = (rotation * Math.PI) / 180;
      const is90or270 = rotation === 90 || rotation === 270;

      // Determine dimensions dimensions
      canvas.width = is90or270 ? img.naturalHeight : img.naturalWidth;
      canvas.height = is90or270 ? img.naturalWidth : img.naturalHeight;

      // Translate context to center center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle);

      // Apply flip scale scale
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Draw centering centering
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob((blob) => {
        if (blob) {
          if (rotatedUrl) URL.revokeObjectURL(rotatedUrl);
          setRotatedUrl(URL.createObjectURL(blob));
        }
        setIsProcessing(false);
      }, originalFile.type);
    };
  };

  useEffect(() => {
    if (originalUrl) {
      handleRotate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotation, flipH, flipV, originalUrl]);

  const faqs = [
    {
      question: "How do I rotate an image 90 degrees?",
      answer:
        "Upload your image and click the '+90°' button. Each click rotates the image 90 degrees clockwise.",
    },
    {
      question: "What is the difference between horizontal and vertical flip?",
      answer:
        "Horizontal flip mirrors the image from left to right (like a mirror reflections). Vertical flip flips the image upside down from top to bottom.",
    },
  ];

  return (
    <ToolLayout toolId="img-rotate">
      <div className="space-y-8">
        {!originalFile ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="image/png,image/jpeg,image/webp"
            maxSizeMB={15}
            label="Upload your PNG, JPG, or WEBP image to rotate and flip"
          />
        ) : (
          <div className="space-y-6">
            {/* Control Panel */}
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCw className="w-4 h-4 text-primary" /> Rotate 90° Clockwise
                </button>
                <button
                  onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold transition-colors"
                >
                  Rotate 90° Counter-Clockwise
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    flipH ? "bg-primary/10 border-primary/30 text-primary" : "bg-card border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" /> Flip Horizontal
                </button>
                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    flipV ? "bg-primary/10 border-primary/30 text-primary" : "bg-card border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  Flip Vertical
                </button>
              </div>
            </div>

            {/* Previews */}
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
                <span className="text-xs text-muted-foreground">
                  Normal layout orientation
                </span>
              </div>

              {/* Rotated Preview */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-4 relative">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Transformed Preview</span>
                <div className="w-full aspect-video rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                  {isProcessing ? (
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : rotatedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={rotatedUrl} alt="Transformed" className="object-contain max-h-full max-w-full" />
                  ) : null}
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>Rotation: {rotation}°</span>
                  <span>|</span>
                  <span>Flip: {flipH ? "H" : ""}{flipV ? "V" : ""}{!flipH && !flipV ? "None" : ""}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 items-center justify-between border-t border-border/40 pt-6">
              <button
                onClick={() => {
                  setOriginalFile(null);
                  setOriginalUrl(null);
                  setRotatedUrl(null);
                  setRotation(0);
                  setFlipH(false);
                  setFlipV(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Clear / Upload New
              </button>

              {rotatedUrl && originalFile && (
                <a
                  href={rotatedUrl}
                  download={`mysofttools-rotated-${rotation}deg-${originalFile.name}`}
                  className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Download Transformed Image
                </a>
              )}
            </div>
          </div>
        )}

        <SEOContent
          title="Image Rotate & Flip"
          explanation="Rotate and flip images locally inside your browser using canvas translation transforms. Correct landscape/portrait camera angles, mirror graphics, and flip photos safely. No files are uploaded to servers, meaning absolute data privacy."
          howToUse={[
            "Select and upload your photo (JPG, PNG, or WEBP).",
            "Click the rotate buttons to spin the image in 90-degree steps.",
            "Tether horizontal or vertical mirrors to flip the graphics along their axes.",
            "Verify the alignment in the right transformed preview box.",
            "Click the download button to export the rotated image."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
