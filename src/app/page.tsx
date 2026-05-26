"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { History, Heart, ArrowRight } from "lucide-react";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { CATEGORIES, TOOLS, Tool } from "@/utils/toolsRegistry";

export default function HomePage() {
  const [recentTools, setRecentTools] = useState<Tool[]>([]);

  useEffect(() => {
    // Load recently used tools from localStorage
    try {
      const stored = localStorage.getItem("recentTools");
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const resolved = ids
          .map((id) => TOOLS.find((t) => t.id === id))
          .filter((t): t is Tool => !!t)
          .slice(0, 4); // Limit to 4
        setRecentTools(resolved);
      }
    } catch (_) {}
  }, []);

  const popularTools = TOOLS.filter((t) => t.isPopular);

  // Group tools by category to count them
  const categoryCounts = TOOLS.reduce((acc, tool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-16 md:space-y-24 py-8">
      {/* 1. RECENTLY USED SECTION (Client-side localStorage) */}
      {recentTools.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Recently Used</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="group p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover-lift flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary/70 tracking-wider">
                    {tool.category}
                  </span>
                  <h3 className="font-bold text-sm md:text-base text-foreground mt-1 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <div className="flex justify-end mt-3 text-primary text-xs font-semibold items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 2. CATEGORY GRID */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Explore Categories</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Select a toolset matching your workflow requirements</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const count = categoryCounts[key] || 0;
            return (
              <div
                key={key}
                className="group relative rounded-3xl p-6 md:p-8 border border-border/70 bg-card shadow-sm hover-lift flex flex-col justify-between min-h-[220px] overflow-hidden"
              >
                {/* Glow accent */}
                <div className={`absolute -right-12 -bottom-12 w-32 h-32 bg-gradient-to-tr ${cat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity pointer-events-none`} />

                <div className="space-y-4">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${cat.color} text-white w-fit shadow-md shadow-primary/10`}>
                    <DynamicIcon name={cat.icon} className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-sm">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {count} Tools Available
                  </span>
                  <Link
                    href={cat.path}
                    className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-primary group-hover:translate-x-1 transition-transform"
                  >
                    Explore Tools <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. POPULAR TOOLS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Popular Tools</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.path}
              className="group p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover-lift flex flex-col justify-between min-h-[140px]"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-primary/70 tracking-wider">
                  {tool.category}
                </span>
                <h3 className="font-bold text-sm md:text-base text-foreground mt-1 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {tool.description}
                </p>
              </div>
              <div className="flex justify-end mt-3 text-primary text-xs font-semibold items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Open Tool <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
