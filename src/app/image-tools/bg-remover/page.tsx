"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, Sliders, RotateCcw, MousePointerClick } from "lucide-react";

export default function BackgroundRemoverPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  
  const [tolerance, setTolerance] = useState<number>(30);
  const [keyColor, setKeyColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    recordRecentTool("img-bg-remover");
  }, []);

  const handleFileSelect = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setKeyColor(null);
      setProcessedUrl(null);
    }
  };

  const processImage = () => {
    if (!originalUrl || !keyColor) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = originalUrl;
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const kr = keyColor.r;
      const kg = keyColor.g;
      const kb = keyColor.b;
      const tol = tolerance;

      // Color keying loop
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance in RGB color space
        const distance = Math.sqrt((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2);

        if (distance < tol) {
          data[i + 3] = 0; // Set alpha to transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          if (processedUrl) URL.revokeObjectURL(processedUrl);
          setProcessedUrl(URL.createObjectURL(blob));
        }
        setIsProcessing(false);
      }, "image/png"); // PNG handles transparency
    };
  };

  useEffect(() => {
    if (originalUrl && keyColor) {
      processImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tolerance, keyColor]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !originalUrl) return;

    const rect = canvas.getBoundingClientRect();
    
    // Calculate click coordinates matching native image pixels
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get pixel color
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setKeyColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
  };

  const handleReset = () => {
    setKeyColor(null);
    setProcessedUrl(null);
  };

  const faqs = [
    {
      question: "How does the click-to-remove feature work?",
      answer:
        "Upload your image, then click anywhere on the background color you wish to remove. The tool reads that pixel's RGB color value and removes matching adjacent and similar colors inside the image.",
    },
    {
      question: "What is the Tolerance slider?",
      answer:
        "The Tolerance slider controls color matching range. A low tolerance removes only exact matches. A high tolerance expands matching ranges, helping key out backgrounds with varying shadows, gradients, or slight lighting variations.",
    },
    {
      question: "Will the final download be a JPG?",
      answer:
        "No. Since JPEGs do not support transparency, our background remover automatically converts and downloads the resulting file as a transparent PNG.",
    },
  ];

  return (
    <ToolLayout toolId="img-bg-remover">
      <div className="space-y-8">
        {!originalFile ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="image/png,image/jpeg,image/webp"
            maxSizeMB={10}
            label="Upload your image to remove its background"
          />
        ) : (
          <div className="space-y-6">
            {/* Guide message */}
            <div className="flex items-center gap-2 p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs md:text-sm text-primary">
              <MousePointerClick className="w-5 h-5 shrink-0" />
              <span>
                {!keyColor
                  ? "Click anywhere on the preview image below to select and remove that background color."
                  : "Color selected! Adjust the tolerance slider below to fine-tune transparency."}
              </span>
            </div>

            {/* Controls */}
            {keyColor && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-muted/30 border border-border/50 items-center">
                {/* Tolerance slider */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-foreground flex justify-between">
                    <span>Color Tolerance Threshold</span>
                    <span className="text-primary">{tolerance}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Strict</span>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      value={tolerance}
                      onChange={(e) => setTolerance(Number(e.target.value))}
                      className="flex-1 accent-primary cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground">Loose</span>
                  </div>
                </div>

                {/* Reset button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Select Different Color
                  </button>
                </div>
              </div>
            )}

            {/* Work Area Preview Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interactive workspace (Canvas) */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Interactive Editor (Click background)
                </span>
                <div className="w-full aspect-video rounded-xl bg-muted/10 relative flex items-center justify-center overflow-hidden border border-border/40 cursor-crosshair">
                  {originalUrl && (
                    <>
                      {/* Invisible image to draw initially */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={imageRef}
                        src={originalUrl}
                        alt="Target"
                        className="hidden"
                        onLoad={() => {
                          const canvas = canvasRef.current;
                          if (canvas && imageRef.current) {
                            const ctx = canvas.getContext("2d");
                            if (ctx) {
                              canvas.width = imageRef.current.naturalWidth;
                              canvas.height = imageRef.current.naturalHeight;
                              ctx.drawImage(imageRef.current, 0, 0);
                            }
                          }
                        }}
                      />
                      <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        className="max-h-full max-w-full object-contain"
                      />
                    </>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {keyColor
                    ? `Selected RGB: (${keyColor.r}, ${keyColor.g}, ${keyColor.b})`
                    : "No color selected yet"}
                </span>
              </div>

              {/* Transparent result */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Transparent Output
                </span>
                {/* Checkboard pattern background CSS */}
                <div
                  className="w-full aspect-video rounded-xl relative flex items-center justify-center overflow-hidden border border-border/40"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    backgroundColor: "var(--background)",
                  }}
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-xs text-muted-foreground">Keying out colors...</span>
                    </div>
                  ) : processedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={processedUrl} alt="Output" className="object-contain max-h-full max-w-full" />
                  ) : (
                    <span className="text-xs text-muted-foreground text-center px-4">
                      Click the editor background on the left to see results.
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Format: Transparent PNG
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 items-center justify-between border-t border-border/40 pt-6">
              <button
                onClick={() => {
                  setOriginalFile(null);
                  setOriginalUrl(null);
                  setProcessedUrl(null);
                  setKeyColor(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Clear / Upload New
              </button>

              {processedUrl && originalFile && (
                <a
                  href={processedUrl}
                  download={`mysofttools-transparent-${originalFile.name.substring(0, originalFile.name.lastIndexOf(".")) || originalFile.name}.png`}
                  className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Download Transparent Image
                </a>
              )}
            </div>
          </div>
        )}

        <SEOContent
          title="Background Remover"
          explanation="Our browser-based background remover uses instant chroma key canvas manipulation to remove backdrops in real-time. Instead of uploading sensitive data to web services, you can key out backgrounds of e-commerce products, logos, or passport photos locally. Perfect for converting graphics into transparent PNG overlays."
          howToUse={[
            "Upload your photo (JPG, PNG, or WEBP) to the workspace.",
            "Tap anywhere on the background color in the editor preview. The script will identify the color.",
            "Slide the Tolerance slider to clean up areas containing shadows or varying color tones.",
            "Verify the checkerboard results display transparent layouts on the output panel.",
            "Click 'Download Transparent Image' to export your asset as a transparent PNG."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
