"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { CATEGORIES, TOOLS } from "@/utils/toolsRegistry";

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, idx) => {
    const url = "/" + segments.slice(0, idx + 1).join("/");
    
    // Check categories registry
    const categoryKey = Object.keys(CATEGORIES).find(
      (key) => CATEGORIES[key as keyof typeof CATEGORIES].path === url
    );
    let name = segment.replace(/-/g, " ");

    if (categoryKey) {
      name = CATEGORIES[categoryKey as keyof typeof CATEGORIES].name;
    } else {
      // Check tools registry
      const toolMatch = TOOLS.find((t) => t.path === url);
      if (toolMatch) {
        name = toolMatch.name;
      }
    }

    // Capitalize words if not found in registries
    if (!categoryKey && !TOOLS.find((t) => t.path === url)) {
      name = name.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    return {
      name,
      url,
      isLast: idx === segments.length - 1,
    };
  });

  return (
    <nav className="flex items-center space-x-1.5 text-xs md:text-sm text-muted-foreground py-3 overflow-x-auto whitespace-nowrap scrollbar-none" aria-label="Breadcrumb">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbs.map((crumb, idx) => (
        <React.Fragment key={crumb.url}>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs" aria-current="page">
              {crumb.name}
            </span>
          ) : (
            <Link
              href={crumb.url}
              className="hover:text-foreground transition-colors truncate max-w-[200px]"
            >
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
