"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Filter, Info } from "lucide-react";
import Breadcrumbs from "../ui/Breadcrumbs";
import DynamicIcon from "../ui/DynamicIcon";
import SEOContent, { FAQItem } from "./SEOContent";
import { CATEGORIES, TOOLS, Tool } from "@/utils/toolsRegistry";

interface CategoryPageProps {
  categoryKey: "image" | "pdf" | "text" | "calculator";
  aboutText: string;
  howToUse: string[];
  faqs: FAQItem[];
}

export default function CategoryPage({
  categoryKey,
  aboutText,
  howToUse,
  faqs,
}: CategoryPageProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const category = CATEGORIES[categoryKey];
  const allCategoryTools = TOOLS.filter((t) => t.category === categoryKey);

  const filteredTools = allCategoryTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      tool.keywords.some((kw) => kw.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="space-y-12">
      {/* Top Breadcrumb */}
      <Breadcrumbs />

      {/* Category Header */}
      <div className="space-y-4 max-w-3xl">
        <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${category.color} text-white w-fit shadow-md`}>
          <DynamicIcon name={category.icon} className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          {category.name}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Filter and Tool List Grid */}
      <div className="space-y-6">
        {/* Filter Input */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground shrink-0">
            <Filter className="w-4 h-4 text-primary" /> Filter Category ({filteredTools.length} of {allCategoryTools.length})
          </div>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Type to filter tools..."
            className="w-full sm:max-w-xs px-4 py-2 text-sm rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="group relative p-6 rounded-3xl border border-border/80 bg-card hover:border-primary/40 hover:bg-muted/10 hover-lift flex flex-col justify-between min-h-[170px] overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-extrabold text-sm md:text-base text-foreground group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    {tool.isPopular && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                    {tool.description}
                  </p>
                </div>
                <div className="flex justify-end mt-4 pt-2 border-t border-border/20 text-xs font-bold text-primary items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground glass-card rounded-3xl border border-border flex flex-col items-center justify-center gap-3">
            <Info className="w-8 h-8 text-primary" />
            <span>No tools match your filter. Try searching for a different keyword.</span>
          </div>
        )}
      </div>

      {/* SEO Explanations and Accordions */}
      <SEOContent
        title={category.name}
        explanation={aboutText}
        howToUse={howToUse}
        faqs={faqs}
      />
    </div>
  );
}
