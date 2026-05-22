"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, X } from "lucide-react";
import { TOOLS, Tool } from "@/utils/toolsRegistry";

export default function SearchBar({ placeholder = "Search from 50+ tools..." }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = TOOLS.filter((tool) => {
      return (
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        tool.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery)) ||
        tool.category.toLowerCase().includes(lowerQuery)
      );
    }).slice(0, 8); // cap at 8 suggestions for clean sizing

    setResults(filtered);
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (tool: Tool) => {
    setQuery("");
    setIsOpen(false);
    router.push(tool.path);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg mx-auto" onKeyDown={handleKeyDown}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3 rounded-2xl bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all text-sm md:text-base"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-4 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2.5 max-h-80 overflow-y-auto glass-card rounded-2xl border border-border/80 shadow-xl z-50 p-2">
          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5 border-b border-border/40 pb-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Suggestions
          </div>
          {results.map((tool, idx) => (
            <button
              key={tool.id}
              onClick={() => handleSelect(tool)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex flex-col transition-colors ${
                idx === selectedIndex ? "bg-primary/10 text-primary-foreground" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`font-semibold text-sm ${idx === selectedIndex ? "text-primary" : "text-foreground"}`}>
                  {tool.name}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/30">
                  {tool.category}
                </span>
              </div>
              <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {tool.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2.5 glass-card rounded-2xl border border-border/80 shadow-xl z-50 p-6 text-center text-muted-foreground">
          No tools match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
