"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
}

export default function UploadZone({
  onFileSelect,
  accept,
  multiple = false,
  maxSizeMB = 10,
  label = "Drag & drop files here, or click to browse",
}: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const acceptedTypes = accept.split(",").map((type) => type.trim());

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Type validation
      const fileType = file.type;
      const fileName = file.name;
      const fileExtension = "." + fileName.split(".").pop()?.toLowerCase();

      const matchesType = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return fileExtension === type.toLowerCase();
        }
        if (type.endsWith("/*")) {
          const prefix = type.replace("/*", "");
          return fileType.startsWith(prefix);
        }
        return fileType === type;
      });

      if (!matchesType) {
        setError(`Invalid file type: ${fileName}. Accepted types: ${accept}`);
        return [];
      }

      // Size validation
      if (file.size > maxSizeBytes) {
        setError(`File is too large: ${fileName}. Max size limit is ${maxSizeMB}MB.`);
        return [];
      }

      validFiles.push(file);
    }

    setError(null);
    return validFiles;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length > 0) {
        onFileSelect(multiple ? validFiles : [validFiles[0]]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(e.target.files);
      if (validFiles.length > 0) {
        onFileSelect(multiple ? validFiles : [validFiles[0]]);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`w-full border-2 border-dashed rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
          isDragActive
            ? "border-primary bg-primary/5 scale-[0.99] shadow-inner"
            : "border-border hover:border-primary/60 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Dynamic Glow Accents */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors pointer-events-none" />

        <div className="p-4 rounded-2xl bg-muted/80 border border-border/50 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-350 shadow-sm relative z-10">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>

        <h3 className="font-bold text-base md:text-lg text-foreground mt-4 relative z-10">
          {label}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-xs relative z-10">
          Max file size: <span className="font-medium">{maxSizeMB}MB</span>. Supported: <span className="font-medium text-foreground">{accept.replace(/,/g, ", ")}</span>
        </p>

        {error && (
          <div className="mt-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 flex items-center gap-2 relative z-10 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
