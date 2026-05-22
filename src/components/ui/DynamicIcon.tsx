"use client";

import React from "react";
import * as Icons from "lucide-react";

interface DynamicIconProps {
  name: string;
  className?: string;
}

export default function DynamicIcon({ name, className }: DynamicIconProps) {
  // Safe lookup for Lucide icons
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    // Default fallback
    return <Icons.HelpCircle className={className} />;
  }

  return <IconComponent className={className} />;
}
