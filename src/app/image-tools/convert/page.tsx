"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, RefreshCw } from "lucide-react";

export default function ConvertImagePage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("image/png");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    recordRecentTool("img-convert");
  }, []);

  const handleFileSelect = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setConvertedUrl(null);
    }
  };

  const handleConvert = () => {
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

      // Fill white background for formats that do not support transparency (like JPEG)
      if (targetFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      // SVG Special Wrapper Wrap
      if (targetFormat === "image/svg+xml") {
        const svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
            <image href="${canvas.toDataURL("image/png")}" width="${canvas.width}" height="${canvas.height}" />
          </svg>
        `.trim();
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        if (convertedUrl) URL.revokeObjectURL(convertedUrl);
        setConvertedUrl(URL.createObjectURL(blob));
        setIsProcessing(false);
        return;
      }

      // Standard Formats Convert
      canvas.toBlob((blob) => {
        if (blob) {
          if (convertedUrl) {
            URL.revokeObjectURL(convertedUrl);
          }
          setConvertedUrl(URL.createObjectURL(blob));
        }
        setIsProcessing(false);
      }, targetFormat);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  };

  useEffect(() => {
    if (originalUrl) {
      handleConvert();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetFormat, originalUrl]);

  const getFormatLabel = (mime: string) => {
    switch (mime) {
      case "image/jpeg":
        return "JPEG (.jpg)";
      case "image/png":
        return "PNG (.png)";
      case "image/webp":
        return "WEBP (.webp)";
      case "image/bmp":
        return "BMP (.bmp)";
      case "image/svg+xml":
        return "SVG Vector (.svg)";
      default:
        return "PNG (.png)";
    }
  };

  const getExtension = (mime: string) => {
    switch (mime) {
      case "image/jpeg":
        return "jpg";
      case "image/png":
        return "png";
      case "image/webp":
        return "webp";
      case "image/bmp":
        return "bmp";
      case "image/svg+xml":
        return "svg";
      default:
        return "png";
    }
  };

  const faqs = [
    {
      question: "Will converting a transparent PNG to JPEG keep transparency?",
      answer:
        "No, the JPEG format does not support alpha channels (transparency). When converting transparent images to JPEG, our tool fills transparent areas with a solid white background.",
    },
    {
      question: "Is the converted SVG file fully vectorized?",
      answer:
        "No. To prevent layout breakdowns and ensure high resolution, our tool wraps the high-fidelity raster pixel data in a Base64 string nested inside a scalable vector SVG file wrapper.",
    },
    {
      question: "Is there any charge for format conversions?",
      answer:
        "No. The tool is 100% free with zero files count limits.",
    },
  ];

  return (
    <ToolLayout toolId="img-convert">
      <div className="space-y-8">
        {!originalFile ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
            maxSizeMB={15}
            label="Upload your image to convert its format"
          />
        ) : (
          <div className="space-y-6">
            {/* Format Selection Panel */}
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <span className="text-sm font-bold text-foreground">Select Target Format:</span>
              <div className="flex flex-wrap gap-2">
                {["image/png", "image/jpeg", "image/webp", "image/bmp", "image/svg+xml"].map((format) => (
                  <button
                    key={format}
                    onClick={() => setTargetFormat(format)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      targetFormat === format
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-card hover:bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {getFormatLabel(format)}
                  </button>
                ))}
              </div>
            </div>

            {/* Previews */}
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
                <span className="font-semibold text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                  Format: {originalFile.type ? getFormatLabel(originalFile.type) : "Unknown"}
                </span>
              </div>

              {/* Converted Preview */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-4 relative">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Converted Image Preview</span>
                <div className="w-full aspect-video rounded-xl bg-muted/20 relative flex items-center justify-center overflow-hidden border border-border/40">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                      <span className="text-xs text-muted-foreground">Converting...</span>
                    </div>
                  ) : convertedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={convertedUrl} alt="Converted" className="object-contain max-h-full max-w-full" />
                  ) : null}
                </div>
                <span className="font-semibold text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                  Format: {getFormatLabel(targetFormat)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 items-center justify-between border-t border-border/40 pt-6">
              <button
                onClick={() => {
                  setOriginalFile(null);
                  setOriginalUrl(null);
                  setConvertedUrl(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Clear / Upload New
              </button>

              {convertedUrl && originalFile && (
                <a
                  href={convertedUrl}
                  download={`mysofttools-converted-${originalFile.name.substring(0, originalFile.name.lastIndexOf(".")) || originalFile.name}.${getExtension(targetFormat)}`}
                  className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Download Converted Image
                </a>
              )}
            </div>
          </div>
        )}

        <SEOContent
          title="Image Format Converter"
          explanation="Our free, online image format converter leverages instant local canvas rendering to translate raw graphic arrays into new image mime-types like PNG, JPG, WebP, BMP, and SVG vector wraps. This process occurs securely inside your browser's local sandbox, meaning no servers record your photos or keep logs of your uploads."
          howToUse={[
            "Select and upload the graphic file (JPEG, PNG, WebP, BMP, or GIF) you wish to convert.",
            "Click on your desired output format from the toggle list (e.g., PNG, WEBP, JPEG).",
            "Review the instant preview of the converted image to verify transparency and quality.",
            "Tap 'Download Converted Image' to save the new image format to your device."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
