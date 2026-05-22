"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import Breadcrumbs from "../ui/Breadcrumbs";
import { CATEGORIES, TOOLS, Tool } from "@/utils/toolsRegistry";

interface ToolLayoutProps {
  toolId: string;
  children: React.ReactNode;
}

export default function ToolLayout({ toolId, children }: ToolLayoutProps) {
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) return <div className="p-8">Tool not found</div>;

  const category = CATEGORIES[tool.category];
  
  // Find related tools in the same category
  const relatedTools = TOOLS.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/40 pb-2">
        <Breadcrumbs />
        <Link
          href={category.path}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {category.name}
        </Link>
      </div>

      {/* Hero Header */}
      <div className="space-y-2 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
            {category.name}
          </span>
          {tool.isTrending && (
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Trending
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
          {tool.name}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Tool Workspace Workspace */}
        <div className="lg:col-span-3 space-y-8">
          {/* Ad Container Above Tool */}
          <div className="w-full h-20 border border-dashed border-border/80 rounded-2xl bg-muted/20 flex items-center justify-center text-xs text-muted-foreground" aria-hidden="true">
            <span className="font-semibold uppercase tracking-wider text-[10px] mr-2">Advertisement</span>
            <span>Premium responsive banner area</span>
          </div>

          <div className="w-full glass-card rounded-3xl p-6 md:p-8 border border-border/60 shadow-lg relative overflow-hidden">
            {children}
          </div>

          {/* Ad Container Below Tool */}
          <div className="w-full h-20 border border-dashed border-border/80 rounded-2xl bg-muted/20 flex items-center justify-center text-xs text-muted-foreground" aria-hidden="true">
            <span className="font-semibold uppercase tracking-wider text-[10px] mr-2">Advertisement</span>
            <span>Premium responsive banner area</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Ad Container Sidebar */}
          <div className="w-full min-h-[250px] border border-dashed border-border/80 rounded-2xl bg-muted/20 flex flex-col items-center justify-center text-center p-4 text-xs text-muted-foreground" aria-hidden="true">
            <span className="font-semibold uppercase tracking-wider text-[10px] mb-2">Advertisement</span>
            <span>Sticky rectangle placement</span>
          </div>

          {/* Related Tools */}
          <div className="glass-card rounded-2xl p-5 border border-border/60">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> Other {category.name}
            </h3>
            <ul className="space-y-3">
              {relatedTools.map((t) => (
                <li key={t.id}>
                  <Link
                    href={t.path}
                    className="group block p-2.5 rounded-xl hover:bg-muted/60 transition-colors border border-transparent hover:border-border/40"
                  >
                    <span className="block font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                      {t.name}
                    </span>
                    <span className="block text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {t.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
