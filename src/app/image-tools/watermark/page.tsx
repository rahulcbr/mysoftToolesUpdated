"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download } from "lucide-react";

export default function WatermarkImagePage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);
  
  const [text, setText] = useState<string>("© MySoftTools");
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(5); // percent of image width
  const [opacity, setOpacity] = useState<number>(40); // 0-100
  const [color, setColor] = useState<string>("#ffffff");
  const [position, setPosition] = useState<string>("center"); // center, topLeft, topRight, bottomLeft, bottomRight, tiled
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    recordRecentTool("img-watermark");
  }, []);

  const handleFileSelect = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setWatermarkedUrl(null);
    }
  };

  const handleWatermark = () => {
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

      // Draw original image original
      ctx.drawImage(img, 0, 0);

      // Configure text styling text
      const calculatedFontSize = Math.max(12, Math.round(canvas.width * (fontSizeRatio / 100)));
      ctx.font = `bold ${calculatedFontSize}px Arial, sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity / 100;
      ctx.textBaseline = "middle";

      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = calculatedFontSize;

      // Draw positions positions
      if (position === "center") {
        ctx.textAlign = "center";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      } else if (position === "topLeft") {
        ctx.textAlign = "left";
        ctx.fillText(text, calculatedFontSize, calculatedFontSize + 10);
      } else if (position === "topRight") {
        ctx.textAlign = "right";
        ctx.fillText(text, canvas.width - calculatedFontSize, calculatedFontSize + 10);
      } else if (position === "bottomLeft") {
        ctx.textAlign = "left";
        ctx.fillText(text, calculatedFontSize, canvas.height - calculatedFontSize - 10);
      } else if (position === "bottomRight") {
        ctx.textAlign = "right";
        ctx.fillText(text, canvas.width - calculatedFontSize, canvas.height - calculatedFontSize - 10);
      } else if (position === "tiled") {
        // Draw recurring grid grid
        ctx.textAlign = "center";
        const gapX = textWidth * 1.5;
        const gapY = textHeight * 3.5;

        // Rotate tiled text slightly for standard watermark look
        ctx.save();
        
        for (let x = calculatedFontSize; x < canvas.width + gapX; x += gapX) {
          for (let y = calculatedFontSize; y < canvas.height + gapY; y += gapY) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 6); // -30 degree slant
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
      }

      canvas.toBlob((blob) => {
        if (blob) {
          if (watermarkedUrl) URL.revokeObjectURL(watermarkedUrl);
          setWatermarkedUrl(URL.createObjectURL(blob));
        }
        setIsProcessing(false);
      }, originalFile.type);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  };

  useEffect(() => {
    if (originalUrl) {
      const timer = setTimeout(() => {
        handleWatermark();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontSizeRatio, opacity, color, position, originalUrl]);

  const faqs = [
    {
      question: "Can I overlay image logos as watermarks?",
      answer:
        "This tool currently supports high-fidelity text watermarks, which are perfect for copyrights, branding, and status labels. An update supporting logo image overlays is coming soon.",
    },
    {
      question: "What is 'Tiled' positioning?",
      answer:
        "Tiled positioning repeats your text watermark across the entire image in a grid pattern. The text is slanted at -30 degrees, making it extremely difficult for others to crop out your copyright label.",
    },
  ];

  return (
    <ToolLayout toolId="img-watermark">
      <div className="space-y-8">
        {!originalFile ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="image/png,image/jpeg,image/webp"
            maxSizeMB={15}
            label="Upload your PNG, JPG, or WEBP image to add a watermark"
          />
        ) : (
          <div className="space-y-6">
            {/* Watermark Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6 rounded-2xl bg-muted/30 border border-border/50">
              {/* Text Input */}
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Watermark Text</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Watermark text..."
                />
              </div>

              {/* Position Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="center">Center</option>
                  <option value="topLeft">Top Left</option>
                  <option value="topRight">Top Right</option>
                  <option value="bottomLeft">Bottom Left</option>
                  <option value="bottomRight">Bottom Right</option>
                  <option value="tiled">Tiled Repeat</option>
                </select>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Opacity: {opacity}%</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Colors and Size */}
              <div className="space-y-1.5 flex gap-4 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Text Size</label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={fontSizeRatio}
                    onChange={(e) => setFontSizeRatio(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="w-12 space-y-1 shrink-0">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-[38px] rounded-xl cursor-pointer border border-border bg-card"
                  />
                </div>
              </div>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Preview */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Image</span>
                <div className="w-full aspect-video rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                  {originalUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={originalUrl} alt="Original" className="object-contain max-h-full max-w-full" />
                  )}
                </div>
              </div>

              {/* Watermarked Preview */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-4 relative">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Watermarked Output</span>
                <div className="w-full aspect-video rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                  {isProcessing ? (
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : watermarkedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={watermarkedUrl} alt="Watermarked" className="object-contain max-h-full max-w-full" />
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
                  setWatermarkedUrl(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Clear / Upload New
              </button>

              {watermarkedUrl && originalFile && (
                <a
                  href={watermarkedUrl}
                  download={`mysofttools-watermarked-${originalFile.name}`}
                  className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Download Watermarked Image
                </a>
              )}
            </div>
          </div>
        )}

        <SEOContent
          title="Image Watermark Stamper"
          explanation="Apply custom text watermarks, copyright labels, or status markers (DRAFT, CONFIDENTIAL) to photos locally in your browser. Restrict unauthorized reuse of your visual property without sending original documents online."
          howToUse={[
            "Select and upload your PNG, JPG, or WEBP image.",
            "Type custom text inside the Watermark Text input.",
            "Choose a placement position (e.g. Center, Top-Left, or Tiled Repeat grid).",
            "Adjust formatting like color boxes, text sizes, and alpha opacity.",
            "Click the download button to export the watermarked image."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
