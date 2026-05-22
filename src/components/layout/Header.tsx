"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wrench, Menu, X, Image, FileText, Type, Calculator, BookOpen, Info, MessageSquare } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import SearchBar from "../ui/SearchBar";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="p-2 rounded-xl grad-primary text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
              <Wrench className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-extrabold text-lg md:text-xl tracking-tight text-foreground">
              MySoft<span className="grad-text">Tools</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-muted-foreground">
            <Link href="/image-tools" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Image className="w-4 h-4 text-blue-500" /> Image Tools
            </Link>
            <Link href="/pdf-tools" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-red-500" /> PDF Tools
            </Link>
            <Link href="/text-tools" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Type className="w-4 h-4 text-emerald-500" /> Text Tools
            </Link>
            <Link href="/calculators" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-500" /> Calculators
            </Link>
            <Link href="/blog" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-500" /> Blog
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3 shrink-0">
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-muted/50 border border-border hover:bg-muted text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 glass border-b border-border shadow-2xl z-50 transition-all duration-300 p-4 space-y-4">
          <div className="md:hidden">
            <SearchBar placeholder="Search tools..." />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
            <Link
              href="/image-tools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-muted/50 text-foreground transition-colors border border-border/30"
            >
              <Image className="w-4 h-4 text-blue-500" /> Image Tools
            </Link>
            <Link
              href="/pdf-tools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-muted/50 text-foreground transition-colors border border-border/30"
            >
              <FileText className="w-4 h-4 text-red-500" /> PDF Tools
            </Link>
            <Link
              href="/text-tools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-muted/50 text-foreground transition-colors border border-border/30"
            >
              <Type className="w-4 h-4 text-emerald-500" /> Text Tools
            </Link>
            <Link
              href="/calculators"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-muted/50 text-foreground transition-colors border border-border/30"
            >
              <Calculator className="w-4 h-4 text-amber-500" /> Calculators
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-muted/50 text-foreground transition-colors border border-border/30"
            >
              <BookOpen className="w-4 h-4 text-purple-500" /> Blog
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-muted/50 text-foreground transition-colors border border-border/30"
            >
              <Info className="w-4 h-4 text-gray-500" /> About
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-muted/50 text-foreground transition-colors border border-border/30"
            >
              <MessageSquare className="w-4 h-4 text-pink-500" /> Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
