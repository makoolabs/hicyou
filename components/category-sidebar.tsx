"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Home, Plus, User, ChevronRight } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DynamicIcon } from "@/lib/icon-utils";
import { directory } from "@/directory.config";

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  parentId?: number | null;
  defaultExpanded?: boolean;
  children?: Category[];
}

interface CategorySidebarProps {
  categories: Category[];
  bookmarksCount?: number;
  currentCategorySlug?: string;
}

const SEARCH_DEBOUNCE_MS = 300;

export const CategorySidebar = ({ categories, bookmarksCount = 0, currentCategorySlug }: CategorySidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleCategoryClick = (categorySlug: string | null) => {
    startTransition(() => {
      if (categorySlug === null) {
        // Navigate to home with search params if any
        const params = new URLSearchParams(searchParams);
        params.delete("category");
        const searchParam = params.get("search");
        if (searchParam) {
          router.push(`/?search=${searchParam}`);
        } else {
          router.push('/');
        }
      } else {
        // Navigate to category page with search params if any
        const searchParam = searchParams.get("search");
        if (searchParam) {
          router.push(`/c/${categorySlug}?search=${searchParam}`);
        } else {
          router.push(`/c/${categorySlug}`);
        }
      }
    });
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    startTransition(() => {
      if (currentCategorySlug) {
        // On category page
        if (term) {
          router.push(`/c/${currentCategorySlug}?search=${term}`);
        } else {
          router.push(`/c/${currentCategorySlug}`);
        }
      } else {
        // On home page
        if (term) {
          router.push(`/?search=${term}`);
        } else {
          router.push('/');
        }
      }
    });
  }, SEARCH_DEBOUNCE_MS);

  // Build tree + init expand state from defaultExpanded
  const tree = useMemo(() => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];
    for (const c of categories) {
      map.set(c.id, { ...c, children: [] });
    }
    for (const c of categories) {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(String(c.parentId))) {
        const parent = map.get(String(c.parentId))!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }, [categories]);

  // Track which category IDs are expanded (by slug)
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(() => {
    const init = new Set<string>();
    const walk = (cats: Category[]) => {
      for (const c of cats) {
        if (c.defaultExpanded) init.add(c.slug);
        if (c.children) walk(c.children);
      }
    };
    walk(tree);
    return init;
  });

  const toggleExpand = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigating to category page
    setExpandedSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  // Recursively render a category item and its children
  const renderCategoryItem = (cat: Category, depth: number): React.ReactNode => {
    const isActive = currentCategorySlug === cat.slug;
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedSlugs.has(cat.slug);
    const paddingLeft = 12 + depth * 16;

    return (
      <React.Fragment key={cat.id}>
        <div className="flex w-full">
          {/* Chevron toggle for parents */}
          {hasChildren ? (
            <button
              onClick={(e) => toggleExpand(cat.slug, e)}
              className="flex items-center justify-center w-5 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              style={{ paddingLeft: `${paddingLeft - 4}px` }}
              aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
          ) : (
            <span style={{ width: `${paddingLeft + 8}px` }} className="flex-shrink-0" />
          )}
          {/* Category button */}
          <button
            onClick={() => handleCategoryClick(cat.slug)}
            className={cn(
              "flex-1 flex items-center gap-2.5 py-1.5 rounded-md text-sm font-medium transition-colors text-left",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/50 text-foreground"
            )}
            style={{ paddingRight: "8px" }}
            aria-pressed={isActive}
          >
            {cat.icon ? (
              <DynamicIcon
                name={cat.icon}
                className="h-4 w-4 flex-shrink-0"
                aria-label={cat.name}
              />
            ) : (
              <span className="w-4 flex-shrink-0" />
            )}
            <span className="flex-1 truncate">{cat.name}</span>
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {cat.children!.map(child => renderCategoryItem(child, depth + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <aside className="hidden lg:block w-56 flex-shrink-0 space-y-6 pr-6 border-r min-h-screen sticky top-0 py-6">
      {/* Site Name */}
      <div className="px-3">
        <Link href="/" className="text-lg font-bold hover:text-primary transition-colors">
          {directory.name}
        </Link>
      </div>

      {/* Search */}
      <div className="relative px-3">
        <Search
          className="absolute left-6 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="text"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search..."
          className="pl-8 h-9 text-sm bg-muted/50"
          aria-label="Search tools"
        />
        {isPending && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <div
              className="h-3 w-3 animate-spin rounded-full border-b-2 border-foreground"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Categories */}
      <nav className="space-y-0.5 px-2" role="navigation" aria-label="Category navigation">
        {/* All */}
        <button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors text-left",
            !currentCategorySlug
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/50 text-foreground"
          )}
          aria-pressed={!currentCategorySlug}
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">All</span>
        </button>

        {/* Category Tree */}
        {tree.map((cat) => renderCategoryItem(cat, 0))}
      </nav>

      {/* Submit Button */}
      <div className="pt-2 px-3 border-t space-y-2">
        <Link href="/submit" className="block mt-4">
          <Button className="w-full gap-2 h-9 text-sm" variant="outline">
            <Plus className="h-3.5 w-3.5" />
            Submit Tool
          </Button>
        </Link>
        <Link href="/account" className="block">
          <Button className="w-full gap-2 h-9 text-sm" variant="outline">
            <User className="h-3.5 w-3.5" />
            User Center
          </Button>
        </Link>
      </div>
    </aside>
  );
};

