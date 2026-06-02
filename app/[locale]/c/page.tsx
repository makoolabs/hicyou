import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllCategories, getAllBookmarks } from "@/lib/data";
import { CategorySidebar } from "@/components/category-sidebar";
import { TopNav } from "@/components/top-nav";
import { DynamicIcon } from "@/lib/icon-utils";
import { Badge } from "@/components/ui/badge";
import Balancer from "react-wrap-balancer";
import { Grid3x3 } from "lucide-react";

export const metadata: Metadata = {
  title: "All Categories | MossGame",
  description: "Browse all tool categories and find the one that fits your needs",
};

export default async function CategoriesPage() {
  const t = await getTranslations("categories");
  const [categories, bookmarks] = await Promise.all([getAllCategories(), getAllBookmarks()]);
  const categoryCountMap = new Map<number, number>();
  bookmarks.forEach((bookmark) => { if (bookmark.category) { categoryCountMap.set(bookmark.category.id, (categoryCountMap.get(bookmark.category.id) || 0) + 1); } });
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex max-w-[1800px] mx-auto">
        <Suspense fallback={<div className="hidden lg:block w-56 pr-6 border-r">{t("loading")}</div>}>
          <CategorySidebar categories={categories.map(cat => ({ id: cat.id.toString(), name: cat.name, slug: cat.slug, color: cat.color || undefined, icon: cat.icon || undefined }))} bookmarksCount={bookmarks.length} />
        </Suspense>
        <main className="flex-1 max-w-full overflow-x-hidden w-full lg:w-auto">
          <div className="px-4 lg:px-8 py-8">
            <div className="relative mb-12 py-4 md:py-5 text-center overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-background to-primary/5">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
              <div className="relative z-10 px-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-primary/10"><Grid3x3 className="w-6 h-6 text-primary" /></div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight leading-tight"><Balancer>{t("allCategories")}</Balancer></h1>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const count = categoryCountMap.get(cat.id) || 0;
                return (
                  <Link key={cat.id} href={`/c/${cat.slug}`} className="group">
                    <div className="relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
                      <div className="flex items-start justify-between"><div className="flex items-center gap-3"><DynamicIcon name={cat.icon || "Folder"} className="h-6 w-6" style={{ color: cat.color || undefined }} /><div><h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{cat.name}</h3>{cat.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>}</div></div><Badge variant="secondary">{t("toolsCount", { count })}</Badge></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
