// React + Next Imports
import React from "react";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

// Database Imports
import { getAllBookmarks, getAllCategories, getFeaturedBookmarks, getLatestBookmarks, getRecommendedBookmarks, getAllCollections } from "@/lib/data";

// Component Imports
import { BookmarkCard } from "@/components/bookmark-card";
import { BookmarkGrid } from "@/components/bookmark-grid";
import { CategorySidebar } from "@/components/category-sidebar";
import { TopNav } from "@/components/top-nav";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import Balancer from "react-wrap-balancer";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  // 如果有搜索参数，不加载 featured 和 latest
  const showDefaultView = !searchParams.search;

  const [bookmarks, categories, featuredTools, latestTools, recommendedTools, allCollections] = await Promise.all([
    getAllBookmarks(),
    getAllCategories(),
    showDefaultView ? getFeaturedBookmarks(4) : Promise.resolve([]),
    showDefaultView ? getLatestBookmarks(28) : Promise.resolve([]),
    showDefaultView ? getRecommendedBookmarks(8) : Promise.resolve([]),
    showDefaultView ? getAllCollections() : Promise.resolve([]),
  ]);

  // Fetch items for each collection (for homepage display)
  const collectionsWithItems = showDefaultView ? await Promise.all(
    allCollections.map(async (col) => {
      const { items } = await import("@/lib/data").then(m => m.getCollectionBySlug(col.slug));
      return { ...col, items };
    })
  ) : [];

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    if (!searchParams.search) return true;
    const searchTerm = searchParams.search.toLowerCase();
    return (
      bookmark.title.toLowerCase().includes(searchTerm) ||
      bookmark.description?.toLowerCase().includes(searchTerm) ||
      bookmark.category?.name.toLowerCase().includes(searchTerm) ||
      bookmark.notes?.toLowerCase().includes(searchTerm) ||
      bookmark.overview?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex max-w-[1800px] mx-auto">
        {/* Left Sidebar */}
        <Suspense fallback={<div className="hidden lg:block w-56 pr-6 border-r">Loading...</div>}>
          <CategorySidebar
            categories={categories.map((cat) => ({
              id: cat.id.toString(),
              name: cat.name,
              slug: cat.slug,
              color: cat.color || undefined,
              icon: cat.icon || undefined,
              parentId: cat.parentId,
              defaultExpanded: cat.defaultExpanded,
            }))}
            bookmarksCount={bookmarks.length}
          />
        </Suspense>

        {/* Main Content */}
        <main className="flex-1 max-w-full overflow-x-hidden w-full lg:w-auto">

          <div className="px-4 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="relative mb-12 py-20 text-center overflow-hidden rounded-3xl">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5"></div>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border bg-background/50 backdrop-blur-sm text-xs font-medium text-muted-foreground">
                  👋 {tc("siteName")}
                </div>

                <h1 className="text-5xl font-bold mb-4 tracking-tight leading-tight">
                  <Balancer>
                    {t("heroTitle")}
                  </Balancer>
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto mt-8">
                  <Balancer>
                    {t("heroDescription", { count: bookmarks.length })}
                  </Balancer>
                </p>

                <div className="flex items-center justify-center gap-4">
                  <Button asChild size="lg" className="gap-2 shadow-lg">
                    <Link href="/submit">
                      {tc("submitYourTool")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* 显示默认视图（Featured + Latest + CTA） */}
            {showDefaultView ? (
              <>
                {/* Featured Tools Section */}
                {featuredTools.length > 0 && (
                  <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center">{t("featuredTools")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {featuredTools.map((tool) => (
                        <Link
                          key={tool.id}
                          href={`/${tool.slug}`}
                          className="group block"
                        >
                          <div className="relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/50">
                            {/* Cover Image */}
                            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                              {tool.ogImage ? (
                                <Image
                                  src={tool.ogImage}
                                  alt={tool.title}
                                  fill
                                  className="object-cover transition-transform group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                  <span className="text-4xl font-bold text-primary/20">
                                    {tool.title.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Title */}
                            <div className="p-4">
                              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                {tool.title}
                              </h3>
                              {tool.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {tool.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest Tools Section */}
                <div className="mb-16">
                  <h2 className="text-3xl font-bold mb-8 text-center">{t("latestToolsTitle")}</h2>
                  <BookmarkGrid>
                    {latestTools.map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={{
                          id: bookmark.id,
                          url: bookmark.url,
                          title: bookmark.title,
                          description: bookmark.description,
                          category: bookmark.category
                            ? {
                              id: bookmark.category.id.toString(),
                              name: bookmark.category.name,
                              slug: bookmark.category.slug,
                              color: bookmark.category.color || undefined,
                              icon: bookmark.category.icon || undefined,
                            }
                            : undefined,
                          favicon: bookmark.favicon,
                          overview: bookmark.overview,
                          ogImage: bookmark.ogImage,
                          isArchived: bookmark.isArchived,
                          isFavorite: bookmark.isFavorite,
                          isDofollow: bookmark.isDofollow,
                          pricingType: bookmark.pricingType,
                          slug: bookmark.slug,
                        }}
                      />
                    ))}
                  </BookmarkGrid>
                </div>

                {/* 推荐项目 Section — HiCyou-style: multi-column collection cards */}
                {collectionsWithItems.length > 0 && (
                  <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center">{t("recommendedTools")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {collectionsWithItems.map((col) => (
                        <div key={col.id} className="rounded-xl border bg-card p-5 hover:border-primary/30 transition-colors">
                          <h3 className="font-semibold text-base">{col.title}</h3>
                          {col.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {col.description}
                            </p>
                          )}
                          {col.items && col.items.length > 0 && (
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-2.5 text-sm">
                              {col.items.map((item, idx) => (
                                <span key={item.id} className="inline-flex items-center">
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-medium"
                                  >
                                    {item.title}
                                  </a>
                                  {idx < col.items!.length - 1 && (
                                    <span className="text-muted-foreground ml-1.5">|</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-3">
                            <Link
                              href={`/collections/${col.slug}`}
                              className="text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              {t("viewCollection")}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* How to Get Dofollow Links CTA */}
                <Card className="border-primary/20 bg-primary/5 mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl text-center">{t("howToGetDofollow")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center text-lg text-muted-foreground">
                      {t("badgeInstruction")}
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center space-y-3">
                        <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                          <span className="text-2xl font-bold text-primary">1</span>
                        </div>
                        <h3 className="font-semibold">{t("step1Title")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("step1Desc")}
                        </p>
                      </div>

                      <div className="text-center space-y-3">
                        <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                          <span className="text-2xl font-bold text-primary">2</span>
                        </div>
                        <h3 className="font-semibold">{t("step2Title")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("step2Desc")}
                        </p>
                      </div>

                      <div className="text-center space-y-3">
                        <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                          <span className="text-2xl font-bold text-primary">3</span>
                        </div>
                        <h3 className="font-semibold">{t("step3Title")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("step3Desc")}
                        </p>
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <Link href="/legal/badges">
                        <Button size="lg" className="gap-2">
                          {t("viewBadgeOptions")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* 搜索结果视图 */
              <>
                <BookmarkGrid>
                  {filteredBookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={{
                        id: bookmark.id,
                        url: bookmark.url,
                        title: bookmark.title,
                        description: bookmark.description,
                        category: bookmark.category
                          ? {
                            id: bookmark.category.id.toString(),
                            name: bookmark.category.name,
                            slug: bookmark.category.slug,
                            color: bookmark.category.color || undefined,
                            icon: bookmark.category.icon || undefined,
                          }
                          : undefined,
                        favicon: bookmark.favicon,
                        overview: bookmark.overview,
                        ogImage: bookmark.ogImage,
                        isArchived: bookmark.isArchived,
                        isFavorite: bookmark.isFavorite,
                        isDofollow: bookmark.isDofollow,
                        pricingType: bookmark.pricingType,
                        slug: bookmark.slug,
                      }}
                    />
                  ))}
                </BookmarkGrid>

                {filteredBookmarks.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-muted-foreground">
                      No bookmarks found
                      {searchParams.search && ` matching "${searchParams.search}"`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
